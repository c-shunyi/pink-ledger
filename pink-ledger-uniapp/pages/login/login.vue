<template>
  <view class="login-container">
    <view class="header">
      <text class="app-name">🌸 Pink Ledger</text>
      <text class="app-desc">优雅记账，轻松理财</text>
    </view>
    
    <view class="form-container">
      <button class="wechat-login-btn" @click="handleWechatLogin" :loading="wechatLoading">
        <text>微信一键登录</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { wechatLogin } from '@/api'
import { setToken, setUserInfo, getToken, getUserInfo } from '@/utils/storage.js'
import { useTheme } from '@/composables/useTheme.js'

// 使用主题
const { themeColors } = useTheme()

// 响应式数据
const wechatLoading = ref(false)

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

// 微信一键登录
const handleWechatLogin = async () => {
  try {
    wechatLoading.value = true
    
    // 1. 获取微信登录凭证
    uni.login({
      provider: 'weixin',
      success: async (loginRes) => {
        console.log('微信登录结果:', loginRes)
        
        if (!loginRes.code) {
          uni.showToast({
            title: '获取微信登录凭证失败',
            icon: 'none'
          })
          wechatLoading.value = false
          return
        }
        
        const code = loginRes.code
        
        // 2. 使用默认用户信息
        // 注意：新版微信小程序无法直接获取头像昵称
        // 用户可以登录后在个人中心编辑资料
        const userInfo = {
          nickname: '微信用户',
          avatar: ''
        }
        
        // 3. 调用后端接口进行登录
        try {
          const res = await wechatLogin({
            code: code,
            nickname: userInfo.nickname,
            avatar: userInfo.avatar
          })
          
          // 存储 token 和用户信息
          setToken(res.data.token)
          setUserInfo(res.data.user)
          
          // 跳转到首页
          uni.switchTab({
            url: '/pages/index/index'
          })
        } catch (err) {
          console.error('后端登录失败:', err)
          uni.showToast({
            title: err.msg || '登录失败',
            icon: 'none'
          })
        } finally {
          wechatLoading.value = false
        }
      },
      fail: (err) => {
        console.error('微信登录调用失败:', err)
        uni.showToast({
          title: '微信登录失败，请重试',
          icon: 'none'
        })
        wechatLoading.value = false
      }
    })
  } catch (err) {
    console.error('微信登录异常:', err)
    uni.showToast({
      title: '登录异常',
      icon: 'none'
    })
    wechatLoading.value = false
  }
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
  background: v-bind('themeColors.gradient');
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
  border-radius: 30rpx;
  padding: 80rpx 50rpx;
  width: 100%;
  max-width: 600rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.welcome-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 80rpx;
}

.welcome-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.welcome-desc {
  font-size: 28rpx;
  color: #999;
}

.wechat-login-btn {
  width: 500rpx;
  height: 96rpx;
  background: #07C160;
  color: #fff;
  border: none;
  border-radius: 48rpx;
  font-size: 34rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(7, 193, 96, 0.3);
  transition: all 0.3s;
}

.wechat-login-btn[loading] {
  opacity: 0.7;
}

.wechat-icon {
  font-size: 40rpx;
  margin-right: 12rpx;
}
</style>

