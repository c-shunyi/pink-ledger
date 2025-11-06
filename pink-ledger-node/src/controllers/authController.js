const jwt = require('jsonwebtoken');
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

