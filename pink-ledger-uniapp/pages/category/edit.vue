<template>
  <view class="container">
    <view class="form-container">
      <view class="form-item">
        <text class="label">分类名称</text>
        <input 
          class="input" 
          v-model="form.name" 
          placeholder="请输入分类名称"
          placeholder-class="placeholder"
        />
      </view>
      
      <view class="form-item">
        <text class="label">类型</text>
        <text class="value disabled">{{ form.type === 'expense' ? '支出' : '收入' }}</text>
      </view>
      
      <view class="form-item">
        <text class="label">图标（Emoji）</text>
        <input 
          class="input" 
          v-model="form.icon" 
          placeholder="请输入图标"
          placeholder-class="placeholder"
        />
      </view>
      
      <view class="form-item">
        <text class="label">颜色</text>
        <input 
          class="input" 
          v-model="form.color" 
          placeholder="例如：#FF6B6B"
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
import { createCategory, updateCategory } from '@/api'

// 响应式数据
const id = ref(null)
const form = reactive({
  name: '',
  type: 'expense',
  icon: '',
  color: ''
})
const loading = ref(false)

// 保存
const handleSave = async () => {
  if (!form.name) {
    uni.showToast({
      title: '请输入分类名称',
      icon: 'none'
    })
    return
  }
  
  try {
    loading.value = true
    
    if (id.value) {
      // 编辑
      await updateCategory(id.value, {
        name: form.name,
        icon: form.icon,
        color: form.color
      })
    } else {
      // 新增
      await createCategory(form)
    }
    
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
onLoad((options) => {
  if (options.type) {
    form.type = options.type
  }
  if (options.id) {
    id.value = options.id
    // 这里可以加载分类详情，暂时省略
  }
})
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #F5F5F5;
  padding: 30rpx;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

