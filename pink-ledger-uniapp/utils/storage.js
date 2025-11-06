// 本地存储工具

/**
 * 存储数据
 */
export const setStorage = (key, data) => {
  try {
    uni.setStorageSync(key, JSON.stringify(data))
    return true
  } catch (e) {
    console.error('存储数据失败:', e)
    return false
  }
}

/**
 * 获取数据
 */
export const getStorage = (key) => {
  try {
    const data = uni.getStorageSync(key)
    return data ? JSON.parse(data) : null
  } catch (e) {
    console.error('获取数据失败:', e)
    return null
  }
}

/**
 * 删除数据
 */
export const removeStorage = (key) => {
  try {
    uni.removeStorageSync(key)
    return true
  } catch (e) {
    console.error('删除数据失败:', e)
    return false
  }
}

/**
 * 清空所有数据
 */
export const clearStorage = () => {
  try {
    uni.clearStorageSync()
    return true
  } catch (e) {
    console.error('清空数据失败:', e)
    return false
  }
}

/**
 * 存储 token
 */
export const setToken = (token) => {
  return setStorage('pink_ledger_token', token)
}

/**
 * 获取 token
 */
export const getToken = () => {
  return getStorage('pink_ledger_token')
}

/**
 * 删除 token
 */
export const removeToken = () => {
  return removeStorage('pink_ledger_token')
}

/**
 * 存储用户信息
 */
export const setUserInfo = (userInfo) => {
  return setStorage('pink_ledger_user', userInfo)
}

/**
 * 获取用户信息
 */
export const getUserInfo = () => {
  return getStorage('pink_ledger_user')
}

/**
 * 删除用户信息
 */
export const removeUserInfo = () => {
  return removeStorage('pink_ledger_user')
}

