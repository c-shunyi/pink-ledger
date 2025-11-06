<template>
  <view class="login-container">
    <view class="header">
      <text class="app-name">🌸 Pink Ledger</text>
      <text class="app-desc">优雅记账，轻松理财</text>
    </view>
    
    <view class="form-container">
      <view class="form-item">
        <text class="label">用户名</text>
        <input 
          class="input" 
          v-model="form.username" 
          placeholder="请输入用户名"
          placeholder-class="placeholder"
        />
      </view>
      
      <view class="form-item">
        <text class="label">密码</text>
        <input 
          class="input" 
          v-model="form.password" 
          type="password"
          placeholder="请输入密码"
          placeholder-class="placeholder"
        />
      </view>
      
      <button class="login-btn" @click="handleLogin" :loading="loading">
        登录
      </button>
      
      <view class="footer-links">
        <text class="link" @click="goToRegister">还没有账号？立即注册</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { login } from '@/utils/api.js'
import { setToken, setUserInfo, getToken, getUserInfo } from '@/utils/storage.js'

// 响应式数据
const form = reactive({
  username: '',
  password: ''
})
const loading = ref(false)

// 检查自动登录
const checkAutoLogin = () => {
  const token = getToken()
  const userInfo = getUserInfo()
  
  if (token && userInfo) {
    console.log('检测到已有登录信息，自动跳转到首页')
    uni.showToast({
      title: '已自动登录',
      icon: 'success',
      duration: 1500
    })
    
    // 跳转到首页
    setTimeout(() => {
      uni.switchTab({
        url: '/pages/index/index'
      })
    }, 1500)
  }
}

// 登录
const handleLogin = async () => {
  // 表单验证
  if (!form.username) {
    uni.showToast({
      title: '请输入用户名',
      icon: 'none'
    })
    return
  }
  
  if (!form.password) {
    uni.showToast({
      title: '请输入密码',
      icon: 'none'
    })
    return
  }
  
  if (form.password.length < 6) {
    uni.showToast({
      title: '密码长度不能少于6位',
      icon: 'none'
    })
    return
  }
  
  try {
    loading.value = true
    const res = await login(form)
    
    // 存储 token 和用户信息
    setToken(res.data.token)
    setUserInfo(res.data.user)
    
    uni.showToast({
      title: '登录成功',
      icon: 'success'
    })
    
    // 跳转到首页
    setTimeout(() => {
      uni.switchTab({
        url: '/pages/index/index'
      })
    }, 1500)
  } catch (err) {
    console.error('登录失败:', err)
  } finally {
    loading.value = false
  }
}

// 跳转到注册页
const goToRegister = () => {
  uni.navigateTo({
    url: '/pages/register/register'
  })
}

// 生命周期钩子
onLoad(() => {
  // 检查是否已经登录
  checkAutoLogin()
})
</script>

<style scoped>
.login-container {
  height: 100vh;
  background: linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40rpx 60rpx;
  box-sizing: border-box;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60rpx;
}

.app-name {
  font-size: 56rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 20rpx;
}

.app-desc {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.form-container {
  background: #fff;
  border-radius: 30rpx;
  padding: 50rpx 40rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
  font-weight: 500;
}

.input {
  width: 100%;
  height: 90rpx;
  background: #F5F5F5;
  border-radius: 15rpx;
  padding: 0 30rpx;
  font-size: 30rpx;
  box-sizing: border-box;
}

.placeholder {
  color: #999;
}

.login-btn {
  width: 100%;
  height: 90rpx;
  background: linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 100%);
  color: #fff;
  border: none;
  border-radius: 45rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-top: 20rpx;
}

.login-btn[loading] {
  opacity: 0.7;
}

.footer-links {
  display: flex;
  justify-content: center;
  margin-top: 30rpx;
}

.link {
  font-size: 26rpx;
  color: #FF9A9E;
}
</style>

