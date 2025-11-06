// 账单管理相关 API
import { get, post, put, del } from '@/utils/request.js'

/**
 * 获取账单列表
 * @param {Object} params - 查询参数
 * @param {string} params.type - 账单类型
 * @param {string} params.categoryId - 分类ID
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @returns {Promise}
 */
export const getTransactions = (params) => {
  return get('/transactions', params)
}

/**
 * 获取账单详情
 * @param {string} id - 账单ID
 * @returns {Promise}
 */
export const getTransaction = (id) => {
  return get(`/transactions/${id}`)
}

/**
 * 创建账单
 * @param {Object} data - 账单数据
 * @param {string} data.type - 账单类型（income/expense）
 * @param {number} data.amount - 金额
 * @param {string} data.categoryId - 分类ID
 * @param {string} data.date - 日期
 * @param {string} data.remark - 备注
 * @returns {Promise}
 */
export const createTransaction = (data) => {
  return post('/transactions', data)
}

/**
 * 更新账单
 * @param {string} id - 账单ID
 * @param {Object} data - 账单数据
 * @returns {Promise}
 */
export const updateTransaction = (id, data) => {
  return put(`/transactions/${id}`, data)
}

/**
 * 删除账单
 * @param {string} id - 账单ID
 * @returns {Promise}
 */
export const deleteTransaction = (id) => {
  return del(`/transactions/${id}`)
}

/**
 * 获取统计数据
 * @param {Object} params - 查询参数
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @param {string} params.type - 统计类型
 * @returns {Promise}
 */
export const getStatistics = (params) => {
  return get('/transactions/statistics', params)
}

