// 请求封装
import config from '@/config/index.js'
import { getToken, removeToken, removeUserInfo } from './storage.js'

/**
 * 封装的请求方法
 */
const request = (options = {}) => {
  return new Promise((resolve, reject) => {
    // 获取 token
    const token = getToken()
    
    // 构建请求头
    const header = {
      'Content-Type': 'application/json',
      ...options.header
    }
    
    // 如果有 token，添加到请求头
    if (token) {
      header.Authorization = `Bearer ${token}`
    }
    
    // 发起请求
    uni.request({
      url: config.baseUrl + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header,
      timeout: options.timeout || config.timeout,
      success: (res) => {
        // HTTP 401 未授权
        if (res.statusCode === 401) {
          // 未授权，清除 token 并跳转到登录页
          removeToken()
          removeUserInfo()
          uni.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none',
            duration: 2000
          })
          setTimeout(() => {
            uni.reLaunch({
              url: '/pages/login/login'
            })
          }, 2000)
          reject(res.data)
        } else if (res.statusCode === 200) {
          // HTTP 200 成功，检查业务 code
          if (res.data.code === 200) {
            // 业务成功
            resolve(res.data)
          } else {
            // 业务失败
            uni.showToast({
              title: res.data.msg || '请求失败',
              icon: 'none',
              duration: 2000
            })
            reject(res.data)
          }
        } else {
          // 其他 HTTP 错误
          uni.showToast({
            title: res.data.msg || '请求失败',
            icon: 'none',
            duration: 2000
          })
          reject(res.data)
        }
      },
      fail: (err) => {
        // 请求失败
        console.error('请求失败:', err)
        uni.showToast({
          title: '网络请求失败',
          icon: 'none',
          duration: 2000
        })
        reject(err)
      }
    })
  })
}

/**
 * GET 请求
 */
export const get = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'GET',
    data,
    ...options
  })
}

/**
 * POST 请求
 */
export const post = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  })
}

/**
 * PUT 请求
 */
export const put = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  })
}

/**
 * DELETE 请求
 */
export const del = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  })
}

export default request

