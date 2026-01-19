<template>
  <view class="container">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="user-info">
        <view class="avatar">
          <text class="avatar-text">{{ userInitial }}</text>
        </view>
        <view class="user-text">
          <text class="username">{{ userInfo.nickname || userInfo.username }}</text>
          <text class="user-id">ID: {{ userInfo.id }}</text>
        </view>
      </view>
      <button v-if="isLoggedIn" class="edit-profile-btn" @click="goToEditProfile">
        编辑资料
      </button>
    </view>
    
    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-item" @click="goToCategory">
        <view class="menu-left">
          <image class="menu-icon-img" src="/static/icon/category.png" mode="aspectFit"></image>
          <text class="menu-text">分类管理</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      
      <view class="menu-item" @click="showAbout">
        <view class="menu-left">
          <image class="menu-icon-img" src="/static/icon/about.png" mode="aspectFit"></image>
          <text class="menu-text">关于我们</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-section">
      <button class="logout-btn" @click="handleAuthAction">
        {{ isLoggedIn ? '退出登录' : '去登录' }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getToken, getUserInfo, removeToken, removeUserInfo } from '@/utils/storage.js'
import { useTheme } from '@/composables/useTheme.js'

// 使用主题组合式函数
const { themeColors } = useTheme()

// 响应式数据
const userInfo = ref({})
const isLoggedIn = ref(false)

// 计算属性：用户名首字母
const userInitial = computed(() => {
  const name = userInfo.value.nickname || userInfo.value.username || ''
  return name.charAt(0).toUpperCase()
})

// 加载用户信息
const loadUserInfo = () => {
  const token = getToken()
  const info = getUserInfo()
  const loggedIn = !!token && !!info
  isLoggedIn.value = loggedIn
  userInfo.value = loggedIn ? info : {}
}

// 编辑资料
const goToEditProfile = () => {
  uni.navigateTo({
    url: '/pages/profile/edit'
  })
}

// 分类管理
const goToCategory = () => {
  if (!isLoggedIn.value) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }

  uni.navigateTo({
    url: '/pages/category/category'
  })
}

// 关于我们
const showAbout = () => {
  uni.showModal({
    title: '关于 Pink Ledger',
    content: '🌸 Pink Ledger\n\n优雅记账，轻松理财\n\n版本：1.0.0',
    showCancel: false
  })
}

// 退出登录
const handleAuthAction = () => {
  if (!isLoggedIn.value) {
    uni.navigateTo({
      url: '/pages/login/login'
    })
    return
  }

  uni.showModal({
    title: '退出登录',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        removeToken()
        removeUserInfo()
        uni.reLaunch({
          url: '/pages/login/login'
        })
      }
    }
  })
}

// 生命周期钩子
onLoad(() => {
  loadUserInfo()
})

onShow(() => {
  loadUserInfo()
})
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #F5F5F5;
}

/* 用户信息卡片 */
.user-card {
  background: v-bind('themeColors.gradient');
  padding: 60rpx 40rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.5);
}

.avatar-text {
  font-size: 50rpx;
  font-weight: bold;
  color: #fff;
}

.user-text {
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 10rpx;
}

.user-id {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
}

.edit-profile-btn {
  padding: 15rpx 30rpx;
  background: rgba(255, 255, 255, 0.3);
  color: #fff;
  border: 2rpx solid rgba(255, 255, 255, 0.5);
  border-radius: 50rpx;
  font-size: 26rpx;
  margin: 0;
}

/* 功能菜单 */
.menu-section {
  background: #fff;
  margin: 20rpx;
  border-radius: 20rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 35rpx 30rpx;
  border-bottom: 1px solid #F5F5F5;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-left {
  display: flex;
  align-items: center;
}

.menu-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.menu-icon-img {
  width: 40rpx;
  height: 40rpx;
  margin-right: 20rpx;
}

.menu-text {
  font-size: 30rpx;
  color: #333;
}

.menu-arrow {
  font-size: 50rpx;
  color: #ccc;
  line-height: 1;
}

/* 退出登录 */
.logout-section {
  padding: 40rpx 20rpx;
}

.logout-btn {
  width: 100%;
  height: 90rpx;
  background: #fff;
  color: v-bind('themeColors.text');
  border: 2rpx solid v-bind('themeColors.text');
  border-radius: 45rpx;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

