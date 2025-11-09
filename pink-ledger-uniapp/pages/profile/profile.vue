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
      <button class="edit-profile-btn" @click="goToEditProfile">
        编辑资料
      </button>
    </view>
    
    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-item" @click="goToCategory">
        <view class="menu-left">
          <text class="menu-icon">🏷️</text>
          <text class="menu-text">分类管理</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      
      <view class="menu-item" @click="showThemeSelector">
        <view class="menu-left">
          <text class="menu-icon">🎨</text>
          <text class="menu-text">主题设置</text>
        </view>
        <view class="menu-right">
          <text class="current-theme">{{ currentTheme.name }} {{ currentTheme.icon }}</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>
      
      <view class="menu-item" @click="showAbout">
        <view class="menu-left">
          <text class="menu-icon">ℹ️</text>
          <text class="menu-text">关于我们</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
    </view>
    
    <!-- 主题选择弹窗 -->
    <view v-if="showThemeModal" class="theme-modal-overlay" @click="showThemeModal = false">
      <view class="theme-modal" @click.stop>
        <view class="theme-modal-header">
          <text class="theme-modal-title">选择主题</text>
          <text class="theme-modal-close" @click="showThemeModal = false">✕</text>
        </view>
        <view class="theme-list">
          <view 
            v-for="theme in availableThemes" 
            :key="theme.id"
            class="theme-item"
            :class="{ active: currentThemeId === theme.id }"
            @click="selectTheme(theme.id)"
          >
            <view class="theme-preview" :style="{ background: theme.colors.gradient }">
              <text class="theme-icon">{{ theme.icon }}</text>
            </view>
            <view v-if="currentThemeId === theme.id" class="theme-check">✓</view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 退出登录 -->
    <view class="logout-section">
      <button class="logout-btn" @click="handleLogout">
        退出登录
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getUserInfo, removeToken, removeUserInfo } from '@/utils/storage.js'
import { useTheme } from '@/composables/useTheme.js'

// 使用主题组合式函数
const { currentThemeId, currentTheme, themeColors, availableThemes, setTheme } = useTheme()

// 响应式数据
const userInfo = ref({})
const showThemeModal = ref(false)

// 计算属性：用户名首字母
const userInitial = computed(() => {
  const name = userInfo.value.nickname || userInfo.value.username || ''
  return name.charAt(0).toUpperCase()
})

// 加载用户信息
const loadUserInfo = () => {
  const info = getUserInfo()
  if (info) {
    userInfo.value = info
  }
}

// 编辑资料
const goToEditProfile = () => {
  uni.navigateTo({
    url: '/pages/profile/edit'
  })
}

// 分类管理
const goToCategory = () => {
  uni.navigateTo({
    url: '/pages/category/category'
  })
}

// 显示主题选择器
const showThemeSelector = () => {
  showThemeModal.value = true
}

// 选择主题
const selectTheme = (themeId) => {
  setTheme(themeId)
  showThemeModal.value = false
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
const handleLogout = () => {
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

.menu-text {
  font-size: 30rpx;
  color: #333;
}

.menu-right {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.current-theme {
  font-size: 26rpx;
  color: #666;
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

/* 主题选择弹窗 */
.theme-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.theme-modal {
  background: #fff;
  border-radius: 20rpx;
  width: 600rpx;
  max-height: 70vh;
  overflow: hidden;
}

.theme-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1px solid #f0f0f0;
}

.theme-modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.theme-modal-close {
  font-size: 36rpx;
  color: #999;
  width: 50rpx;
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f5f5f5;
}

.theme-list {
  padding: 30rpx;
  max-height: 500rpx;
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.theme-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  border-radius: 15rpx;
  background: #f8f8f8;
  position: relative;
  transition: all 0.3s;
  width: 120rpx;
  height: 120rpx;
  border: 3rpx solid transparent;
}

.theme-item.active {
  background: #fff;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  border-color: #4cd964;
}

.theme-preview {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-icon {
  font-size: 40rpx;
}

.theme-check {
  position: absolute;
  top: 5rpx;
  right: 5rpx;
  font-size: 28rpx;
  color: #4cd964;
  font-weight: bold;
  background: #fff;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}
</style>

