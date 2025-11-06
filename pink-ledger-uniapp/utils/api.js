// API 接口管理
import { get, post, put, del } from './request.js'

/**
 * ========== 用户认证相关 ==========
 */

// 用户注册
export const register = (data) => {
  return post('/auth/register', data)
}

// 用户登录
export const login = (data) => {
  return post('/auth/login', data)
}

// 获取当前用户信息
export const getCurrentUser = () => {
  return get('/auth/me')
}

// 更新用户信息
export const updateProfile = (data) => {
  return put('/auth/profile', data)
}

/**
 * ========== 分类管理相关 ==========
 */

// 获取分类列表
export const getCategories = (params) => {
  return get('/categories', params)
}

// 创建分类
export const createCategory = (data) => {
  return post('/categories', data)
}

// 更新分类
export const updateCategory = (id, data) => {
  return put(`/categories/${id}`, data)
}

// 删除分类
export const deleteCategory = (id) => {
  return del(`/categories/${id}`)
}

/**
 * ========== 账单管理相关 ==========
 */

// 获取账单列表
export const getTransactions = (params) => {
  return get('/transactions', params)
}

// 获取账单详情
export const getTransaction = (id) => {
  return get(`/transactions/${id}`)
}

// 创建账单
export const createTransaction = (data) => {
  return post('/transactions', data)
}

// 更新账单
export const updateTransaction = (id, data) => {
  return put(`/transactions/${id}`, data)
}

// 删除账单
export const deleteTransaction = (id) => {
  return del(`/transactions/${id}`)
}

// 获取统计数据
export const getStatistics = (params) => {
  return get('/transactions/statistics', params)
}

