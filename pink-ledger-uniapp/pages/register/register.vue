<template>
  <view class="register-container">
    <view class="header">
      <text class="title">注册账号</text>
      <text class="subtitle">开始你的记账之旅</text>
    </view>
    
    <view class="form-container">
      <view class="form-item">
        <text class="label">用户名</text>
        <input 
          class="input" 
          v-model="form.username" 
          placeholder="3-50个字符"
          placeholder-class="placeholder"
        />
      </view>
      
      <view class="form-item">
        <text class="label">密码</text>
        <input 
          class="input" 
          v-model="form.password" 
          type="password"
          placeholder="至少6位字符"
          placeholder-class="placeholder"
        />
      </view>
      
      <view class="form-item">
        <text class="label">确认密码</text>
        <input 
          class="input" 
          v-model="form.confirmPassword" 
          type="password"
          placeholder="再次输入密码"
          placeholder-class="placeholder"
        />
      </view>
      
      <view class="form-item">
        <text class="label">昵称（可选）</text>
        <input 
          class="input" 
          v-model="form.nickname" 
          placeholder="请输入昵称"
          placeholder-class="placeholder"
        />
      </view>
      
      <button class="register-btn" @click="handleRegister" :loading="loading">
        注册
      </button>
      
      <view class="footer-links">
        <text class="link" @click="goToLogin">已有账号？立即登录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { register } from '@/api'
import { useTheme } from '@/composables/useTheme.js'

// 使用主题组合式函数
const { themeColors } = useTheme()

// 响应式数据
const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  nickname: ''
})
const loading = ref(false)

// 注册
const handleRegister = async () => {
  // 表单验证
  if (!form.username) {
    uni.showToast({
      title: '请输入用户名',
      icon: 'none'
    })
    return
  }
  
  if (form.username.length < 3 || form.username.length > 50) {
    uni.showToast({
      title: '用户名长度应为3-50个字符',
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
  
  if (form.password !== form.confirmPassword) {
    uni.showToast({
      title: '两次密码输入不一致',
      icon: 'none'
    })
    return
  }
  
  try {
    loading.value = true
    const res = await register({
      username: form.username,
      password: form.password,
      nickname: form.nickname || form.username
    })
    
    uni.showToast({
      title: '注册成功，请登录',
      icon: 'success'
    })
    
    // 跳转到登录页面
    setTimeout(() => {
      uni.redirectTo({
        url: '/pages/login/login'
      })
    }, 1500)
  } catch (err) {
    console.error('注册失败:', err)
  } finally {
    loading.value = false
  }
}

// 跳转到登录页
const goToLogin = () => {
  uni.navigateBack()
}
</script>

<style scoped>
.register-container {
  height: 100vh;
  background: v-bind('themeColors.gradient');
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 30rpx 60rpx;
  box-sizing: border-box;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40rpx;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 20rpx;
}

.subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.form-container {
  background: #fff;
  border-radius: 30rpx;
  padding: 40rpx 40rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600rpx;
}

.form-item {
  margin-bottom: 25rpx;
}

.label {
  display: block;
  font-size: 26rpx;
  color: #333;
  margin-bottom: 15rpx;
  font-weight: 500;
}

.input {
  width: 100%;
  height: 80rpx;
  background: #F5F5F5;
  border-radius: 15rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.placeholder {
  color: #999;
}

.register-btn {
  width: 100%;
  height: 80rpx;
  background: v-bind('themeColors.gradient');
  color: #fff;
  border: none;
  border-radius: 40rpx;
  font-size: 30rpx;
  font-weight: bold;
  margin-top: 15rpx;
}

.register-btn[loading] {
  opacity: 0.7;
}

.footer-links {
  display: flex;
  justify-content: center;
  margin-top: 25rpx;
}

.link {
  font-size: 26rpx;
  color: v-bind('themeColors.primary');
}
</style>

