const jwt = require('jsonwebtoken');
const { User } = require('../models');
const sendResponse = require('../utils/response');

// JWT 认证中间件
const authenticate = async (req, res, next) => {
  try {
    // 从请求头获取 token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendResponse(res, {
        status: 401,
        code: 401,
        msg: '未提供认证令牌'
      });
    }

    const token = authHeader.substring(7); // 移除 "Bearer " 前缀

    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 查找用户
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return sendResponse(res, {
        status: 401,
        code: 401,
        msg: '用户不存在'
      });
    }

    // 将用户信息附加到请求对象
    req.user = user;
    req.userId = user.id;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return sendResponse(res, {
        status: 401,
        code: 401,
        msg: '无效的认证令牌'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return sendResponse(res, {
        status: 401,
        code: 401,
        msg: '认证令牌已过期'
      });
    }
    
    return sendResponse(res, {
      code: 500,
      msg: '认证失败'
    });
  }
};

module.exports = { authenticate };

