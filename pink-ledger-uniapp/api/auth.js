// 用户认证相关 API
import { get, post, put } from '@/utils/request.js'

/**
 * 用户注册
 * @param {Object} data - 注册数据
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @param {string} data.email - 邮箱
 * @returns {Promise}
 */
export const register = (data) => {
  return post('/auth/register', data)
}

/**
 * 用户登录
 * @param {Object} data - 登录数据
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @returns {Promise}
 */
export const login = (data) => {
  return post('/auth/login', data)
}

/**
 * 获取当前用户信息
 * @returns {Promise}
 */
export const getCurrentUser = () => {
  return get('/auth/me')
}

/**
 * 更新用户信息
 * @param {Object} data - 用户信息
 * @returns {Promise}
 */
export const updateProfile = (data) => {
  return put('/auth/profile', data)
}

/**
 * 微信一键登录
 * @param {Object} data - 微信登录数据
 * @param {string} data.code - 微信登录凭证
 * @param {string} data.nickname - 用户昵称
 * @param {string} data.avatar - 用户头像
 * @returns {Promise}
 */
export const wechatLogin = (data) => {
  return post('/auth/wechat-login', data)
}

