/**
 * 认证相关的组合式函数
 */
import { ref, reactive } from 'vue'
import { getToken, getUserInfo, setToken, setUserInfo, removeToken, removeUserInfo } from '@/utils/storage.js'
import { login as apiLogin, register as apiRegister } from '@/utils/api.js'

export function useAuth() {
  const loading = ref(false)
  const isLoggedIn = ref(false)
  const userInfo = reactive({})

  // 检查登录状态
  const checkAuthStatus = () => {
    const token = getToken()
    const user = getUserInfo()
    
    if (token && user) {
      isLoggedIn.value = true
      Object.assign(userInfo, user)
      return true
    }
    
    isLoggedIn.value = false
    Object.keys(userInfo).forEach(key => delete userInfo[key])
    return false
  }

  // 登录
  const login = async (loginForm) => {
    loading.value = true
    try {
      const res = await apiLogin(loginForm)
      
      // 存储token和用户信息
      setToken(res.data.token)
      setUserInfo(res.data.user)
      
      // 更新状态
      isLoggedIn.value = true
      Object.assign(userInfo, res.data.user)
      
      return res
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 注册
  const register = async (registerForm) => {
    loading.value = true
    try {
      const res = await apiRegister(registerForm)
      
      // 注册成功后自动登录
      if (res.data.token) {
        setToken(res.data.token)
        setUserInfo(res.data.user)
        isLoggedIn.value = true
        Object.assign(userInfo, res.data.user)
      }
      
      return res
    } catch (error) {
      console.error('注册失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 登出
  const logout = () => {
    removeToken()
    removeUserInfo()
    isLoggedIn.value = false
    Object.keys(userInfo).forEach(key => delete userInfo[key])
  }

  // 初始化检查
  checkAuthStatus()

  return {
    loading,
    isLoggedIn,
    userInfo,
    login,
    register,
    logout,
    checkAuthStatus
  }
}
