/**
 * 统一响应格式工具
 */

/**
 * 统一响应方法
 * @param {Object} res - Express response 对象
 * @param {Object} config - 配置对象
 * @param {Number} config.status - HTTP 状态码，默认 200
 * @param {Number} config.code - 业务状态码，默认 200
 * @param {String} config.msg - 提示信息，默认 '操作成功'
 * @param {*} config.data - 返回的数据，默认 null
 * @returns {Object} Express response
 * 
 * @example
 * // 成功响应
 * sendResponse(res, {
 *   code: 200,
 *   msg: '获取成功',
 *   data: { user: userInfo }
 * });
 * 
 * // 错误响应
 * sendResponse(res, {
 *   code: 400,
 *   msg: '参数错误'
 * });
 * 
 * // 未授权（HTTP 401）
 * sendResponse(res, {
 *   status: 401,
 *   code: 401,
 *   msg: '未授权'
 * });
 */
const sendResponse = (res, config = {}) => {
  const {
    status = 200,
    code = 200,
    msg = '操作成功',
    data = null
  } = config;

  return res.status(status).json({
    code,
    msg,
    data
  });
};

module.exports = sendResponse;

