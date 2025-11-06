<template>
  <view class="container">
    <view class="form-container">
      <view class="form-item">
        <text class="label">用户名</text>
        <text class="value disabled">{{ userInfo.username }}</text>
      </view>
      
      <view class="form-item">
        <text class="label">昵称</text>
        <input 
          class="input" 
          v-model="form.nickname" 
          placeholder="请输入昵称"
          placeholder-class="placeholder"
        />
      </view>
      
      <view class="form-item">
        <text class="label">头像URL</text>
        <input 
          class="input" 
          v-model="form.avatar" 
          placeholder="请输入头像URL（可选）"
          placeholder-class="placeholder"
        />
      </view>
      
      <button class="save-btn" @click="handleSave" :loading="loading">
        保存
      </button>
    </view>
  </view>
</template>

<script>
import { getCurrentUser, updateProfile } from '@/api'
import { getUserInfo, setUserInfo } from '@/utils/storage.js'
import { useTheme } from '@/composables/useTheme.js'

export default {
  data() {
    return {
      userInfo: {},
      form: {
        nickname: '',
        avatar: ''
      },
      loading: false
    }
  },
  setup() {
    const { currentThemeId, currentTheme, themeColors, availableThemes, setTheme } = useTheme()
    
    return {
      currentThemeId,
      currentTheme,
      themeColors,
      availableThemes,
      setTheme
    }
  },
  onLoad() {
    this.loadUserInfo()
  },
  methods: {
    // 加载用户信息
    loadUserInfo() {
      const userInfo = getUserInfo()
      if (userInfo) {
        this.userInfo = userInfo
        this.form.nickname = userInfo.nickname || ''
        this.form.avatar = userInfo.avatar || ''
      }
    },
    
    // 保存
    async handleSave() {
      if (!this.form.nickname) {
        uni.showToast({
          title: '请输入昵称',
          icon: 'none'
        })
        return
      }
      
      try {
        this.loading = true
        const res = await updateProfile(this.form)
        
        // 更新本地存储
        setUserInfo(res.data.user)
        
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        })
        
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      } catch (err) {
        console.error('保存失败:', err)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.container {
  background: #F5F5F5;
  padding: 30rpx;
  box-sizing: border-box;
}

.form-container {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
}

.form-item {
  margin-bottom: 40rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
  font-weight: 500;
}

.value {
  display: block;
  font-size: 30rpx;
  color: #333;
  padding: 20rpx 0;
}

.value.disabled {
  color: #999;
}

.tip {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
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

.save-btn {
  width: 100%;
  height: 90rpx;
  background: v-bind('themeColors.gradient');
  color: #fff;
  border: none;
  border-radius: 45rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-top: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.save-btn[loading] {
  opacity: 0.7;
}
</style>

