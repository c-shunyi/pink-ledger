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
      
      <view class="menu-item" @click="showAbout">
        <view class="menu-left">
          <text class="menu-icon">ℹ️</text>
          <text class="menu-text">关于我们</text>
        </view>
        <text class="menu-arrow">›</text>
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

<script>
import { getUserInfo, removeToken, removeUserInfo } from '@/utils/storage.js'

export default {
  data() {
    return {
      userInfo: {}
    }
  },
  computed: {
    // 用户名首字母
    userInitial() {
      const name = this.userInfo.nickname || this.userInfo.username || ''
      return name.charAt(0).toUpperCase()
    }
  },
  onLoad() {
    this.loadUserInfo()
  },
  onShow() {
    this.loadUserInfo()
  },
  methods: {
    // 加载用户信息
    loadUserInfo() {
      const userInfo = getUserInfo()
      if (userInfo) {
        this.userInfo = userInfo
      }
    },
    
    // 编辑资料
    goToEditProfile() {
      uni.navigateTo({
        url: '/pages/profile/edit'
      })
    },
    
    // 分类管理
    goToCategory() {
      uni.navigateTo({
        url: '/pages/category/category'
      })
    },
    
    // 关于我们
    showAbout() {
      uni.showModal({
        title: '关于 Pink Ledger',
        content: '🌸 Pink Ledger\n\n优雅记账，轻松理财\n\n版本：1.0.0',
        showCancel: false
      })
    },
    
    // 退出登录
    handleLogout() {
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
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 20rpx;
}

/* 用户信息卡片 */
.user-card {
  background: linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 100%);
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

.menu-arrow {
  font-size: 50rpx;
  color: #ccc;
}

/* 退出登录 */
.logout-section {
  padding: 40rpx 20rpx;
}

.logout-btn {
  width: 100%;
  height: 90rpx;
  background: #fff;
  color: #FF6B6B;
  border: 2rpx solid #FF6B6B;
  border-radius: 45rpx;
  font-size: 32rpx;
  font-weight: bold;
}
</style>

