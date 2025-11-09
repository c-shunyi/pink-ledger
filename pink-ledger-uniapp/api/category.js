// 分类管理相关 API
import { get, post, put, del } from '@/utils/request.js'

/**
 * 获取分类列表
 * @param {Object} params - 查询参数
 * @param {string} params.type - 分类类型
 * @returns {Promise}
 */
export const getCategories = (params) => {
  return get('/categories', params)
}

/**
 * 创建分类
 * @param {Object} data - 分类数据
 * @param {string} data.name - 分类名称
 * @param {string} data.type - 分类类型
 * @param {string} data.icon - 图标
 * @param {string} data.color - 颜色
 * @returns {Promise}
 */
export const createCategory = (data) => {
  return post('/categories', data)
}

/**
 * 更新分类
 * @param {string} id - 分类ID
 * @param {Object} data - 分类数据
 * @returns {Promise}
 */
export const updateCategory = (id, data) => {
  return put(`/categories/${id}`, data)
}

/**
 * 删除分类
 * @param {string} id - 分类ID
 * @returns {Promise}
 */
export const deleteCategory = (id) => {
  return del(`/categories/${id}`)
}

/**
 * 更新分类排序
 * @param {Array<number>} categoryIds - 分类ID数组（按新顺序排列）
 * @returns {Promise}
 */
export const updateCategoryOrder = (categoryIds) => {
  return post('/categories/order', { categoryIds })
}

