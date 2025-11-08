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

<script setup>
import { ref, reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getCurrentUser, updateProfile } from '@/api'
import { getUserInfo, setUserInfo } from '@/utils/storage.js'
import { useTheme } from '@/composables/useTheme.js'

// 使用主题组合式函数
const { themeColors } = useTheme()

// 响应式数据
const userInfo = ref({})
const form = reactive({
  nickname: '',
  avatar: ''
})
const loading = ref(false)

// 加载用户信息
const loadUserInfo = () => {
  const info = getUserInfo()
  if (info) {
    userInfo.value = info
    form.nickname = info.nickname || ''
    form.avatar = info.avatar || ''
  }
}

// 保存
const handleSave = async () => {
  if (!form.nickname) {
    uni.showToast({
      title: '请输入昵称',
      icon: 'none'
    })
    return
  }
  
  try {
    loading.value = true
    const res = await updateProfile(form)
    
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
    loading.value = false
  }
}

// 生命周期钩子
onLoad(() => {
  loadUserInfo()
})
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

