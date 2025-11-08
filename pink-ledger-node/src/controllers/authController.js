const jwt = require('jsonwebtoken');
const axios = require('axios');
const { User } = require('../models');
const sendResponse = require('../utils/response');

// 生成 JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// 用户注册
exports.register = async (req, res) => {
  try {
    const { username, password, nickname } = req.body;

    // 验证必填字段
    if (!username || !password) {
      return sendResponse(res, {
        code: 400,
        msg: '用户名和密码不能为空'
      });
    }

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return sendResponse(res, {
        code: 400,
        msg: '用户名已存在'
      });
    }

    // 创建用户
    const user = await User.create({
      username,
      password,
      nickname: nickname || username
    });

    // 生成 token
    const token = generateToken(user.id);

    return sendResponse(res, {
      code: 200,
      msg: '注册成功',
      data: {
        user: user.toSafeObject(),
        token
      }
    });
  } catch (error) {
    console.error('注册失败:', error);
    return sendResponse(res, {
      code: 500,
      msg: '注册失败'
    });
  }
};

// 用户登录
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 验证必填字段
    if (!username || !password) {
      return sendResponse(res, {
        code: 400,
        msg: '用户名和密码不能为空'
      });
    }

    // 查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return sendResponse(res, {
        code: 401,
        msg: '用户名或密码错误'
      });
    }

    // 验证密码
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return sendResponse(res, {
        code: 401,
        msg: '用户名或密码错误'
      });
    }

    // 生成 token
    const token = generateToken(user.id);

    return sendResponse(res, {
      code: 200,
      msg: '登录成功',
      data: {
        user: user.toSafeObject(),
        token
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    return sendResponse(res, {
      code: 500,
      msg: '登录失败'
    });
  }
};

// 获取当前用户信息
exports.getCurrentUser = async (req, res) => {
  try {
    return sendResponse(res, {
      code: 200,
      msg: '获取成功',
      data: {
        user: req.user.toSafeObject()
      }
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return sendResponse(res, {
      code: 500,
      msg: '获取用户信息失败'
    });
  }
};

// 更新用户信息
exports.updateProfile = async (req, res) => {
  try {
    const { nickname, avatar } = req.body;
    const user = req.user;

    if (nickname) user.nickname = nickname;
    if (avatar) user.avatar = avatar;

    await user.save();

    return sendResponse(res, {
      code: 200,
      msg: '更新成功',
      data: {
        user: user.toSafeObject()
      }
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    return sendResponse(res, {
      code: 500,
      msg: '更新失败'
    });
  }
};

// 微信一键登录
exports.wechatLogin = async (req, res) => {
  try {
    const { code, nickname, avatar } = req.body;

    // 验证必填字段
    if (!code) {
      return sendResponse(res, {
        code: 400,
        msg: '微信登录凭证不能为空'
      });
    }

    // 从环境变量获取微信小程序配置
    const appId = process.env.WECHAT_APPID;
    const appSecret = process.env.WECHAT_APP_SECRET;

    if (!appId || !appSecret) {
      console.error('微信小程序配置未设置');
      return sendResponse(res, {
        code: 500,
        msg: '服务器配置错误'
      });
    }

    // 调用微信接口获取 openid 和 session_key
    const wxLoginUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;
    
    let wxResponse;
    try {
      wxResponse = await axios.get(wxLoginUrl);
    } catch (error) {
      console.error('调用微信接口失败:', error);
      return sendResponse(res, {
        code: 500,
        msg: '微信登录失败'
      });
    }

    const { openid, session_key, unionid, errcode, errmsg } = wxResponse.data;

    if (errcode) {
      console.error('微信接口返回错误:', errcode, errmsg);
      return sendResponse(res, {
        code: 400,
        msg: `微信登录失败: ${errmsg}`
      });
    }

    if (!openid) {
      return sendResponse(res, {
        code: 400,
        msg: '获取微信用户信息失败'
      });
    }

    // 查找或创建用户
    let user = await User.findOne({ where: { wechat_openid: openid } });

    if (!user) {
      // 创建新用户
      user = await User.create({
        wechat_openid: openid,
        wechat_unionid: unionid || null,
        wechat_session_key: session_key,
        nickname: nickname || '微信用户',
        avatar: avatar || '',
        username: `wx_${openid.substring(0, 10)}` // 生成一个默认用户名
      });
    } else {
      // 更新用户信息
      user.wechat_session_key = session_key;
      if (unionid) user.wechat_unionid = unionid;
      if (nickname) user.nickname = nickname;
      if (avatar) user.avatar = avatar;
      await user.save();
    }

    // 生成 token
    const token = generateToken(user.id);

    return sendResponse(res, {
      code: 200,
      msg: '登录成功',
      data: {
        user: user.toSafeObject(),
        token
      }
    });
  } catch (error) {
    console.error('微信登录失败:', error);
    return sendResponse(res, {
      code: 500,
      msg: '登录失败'
    });
  }
};

