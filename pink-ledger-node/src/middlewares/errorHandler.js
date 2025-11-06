const sendResponse = require('../utils/response');

// 全局错误处理中间件
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Sequelize 验证错误
  if (err.name === 'SequelizeValidationError') {
    return sendResponse(res, {
      code: 400,
      msg: '数据验证失败',
      data: {
        errors: err.errors.map(e => ({
          field: e.path,
          message: e.message
        }))
      }
    });
  }

  // Sequelize 唯一约束错误
  if (err.name === 'SequelizeUniqueConstraintError') {
    return sendResponse(res, {
      code: 400,
      msg: '数据已存在',
      data: {
        errors: err.errors.map(e => ({
          field: e.path,
          message: e.message
        }))
      }
    });
  }

  // 默认错误
  return sendResponse(res, {
    code: err.status || 500,
    msg: err.message || '服务器内部错误'
  });
};

// 404 错误处理
const notFoundHandler = (req, res) => {
  return sendResponse(res, {
    code: 404,
    msg: '请求的资源不存在'
  });
};

module.exports = { errorHandler, notFoundHandler };

