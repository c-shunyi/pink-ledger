<template>
  <view class="container">
    <!-- 类型切换 -->
    <view class="type-tabs">
      <view 
        class="type-tab" 
        :class="{ active: form.type === 'expense' }"
        @click="changeType('expense')"
      >
        <text class="tab-text">支出</text>
      </view>
      <view 
        class="type-tab" 
        :class="{ active: form.type === 'income' }"
        @click="changeType('income')"
      >
        <text class="tab-text">收入</text>
      </view>
    </view>
    
    <!-- 金额输入 -->
    <view class="amount-section">
      <text class="currency"></text>
      <input 
        class="amount-input" 
        v-model="form.amount"
        type="digit"
        placeholder="0.00"
        @input="onAmountInput"
      />
    </view>
    
    <!-- 分类选择 -->
    <view class="category-section">
      <text class="section-title">选择分类</text>
      <view class="category-list">
        <view 
          v-for="category in filteredCategories" 
          :key="category.id"
          class="category-item"
          :class="{ active: form.categoryId === category.id }"
          @click="selectCategory(category)"
        >
          <view class="category-icon" :style="{ background: category.color || '#F5F5F5' }">
            <text class="icon-text">{{ category.icon }}</text>
          </view>
          <text class="category-name">{{ category.name }}</text>
        </view>
      </view>
    </view>
    
    <!-- 表单项 -->
    <view class="form-section">
      <!-- 日期选择器 -->
      <picker
        mode="date"
        :value="form.date"
        @change="onDateChange"
      >
        <view class="form-item">
          <text class="form-label">日期</text>
          <view class="form-value-wrapper">
            <text class="form-value">{{ form.date }}</text>
            <uni-icons type="right" size="18" color="#999"></uni-icons>
          </view>
        </view>
      </picker>
      
      <view class="form-item">
        <text class="form-label">备注</text>
        <input 
          class="form-input" 
          v-model="form.description"
          placeholder="添加备注"
          placeholder-class="placeholder"
        />
      </view>
    </view>
    
    <!-- 提交按钮 -->
    <view class="submit-section">
      <button class="submit-btn" @click="handleSubmit" :loading="loading">
        完成
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useCategories } from '@/composables/useCategories.js'
import { useTransactions } from '@/composables/useTransactions.js'
import { useTheme } from '@/composables/useTheme.js'
import { getToday } from '@/utils/date.js'
import config from '@/config/index.js'

// 使用组合式函数
const { categories, loadCategories } = useCategories()
const { addTransaction } = useTransactions()
const { themeColors } = useTheme()

// 表单数据
const form = reactive({
  type: 'expense',
  amount: '',
  categoryId: null,
  date: getToday(),
  description: ''
})

// 其他响应式数据
const loading = ref(false)

// 计算属性：根据类型筛选分类
const filteredCategories = computed(() => {
  return categories.value.filter(cat => cat.type === form.type)
})

// 监听类型变化，自动选择第一个分类
watch(() => form.type, () => {
  if (filteredCategories.value.length > 0) {
    form.categoryId = filteredCategories.value[0].id
  }
})

// 监听分类加载完成，设置默认分类
watch(categories, () => {
  if (filteredCategories.value.length > 0 && !form.categoryId) {
    form.categoryId = filteredCategories.value[0].id
  }
}, { immediate: true })

// 切换类型
const changeType = (type) => {
  form.type = type
  // 重置分类选择在watch中处理
}

// 金额输入处理
const onAmountInput = (e) => {
  let value = e.detail.value
  // 只保留数字和一个小数点
  value = value.replace(/[^\d.]/g, '')
  // 只保留一个小数点
  const dotIndex = value.indexOf('.')
  if (dotIndex !== -1) {
    value = value.substring(0, dotIndex + 1) + value.substring(dotIndex + 1).replace(/\./g, '')
    // 只保留两位小数
    if (value.split('.')[1] && value.split('.')[1].length > 2) {
      value = parseFloat(value).toFixed(2)
    }
  }
  form.amount = value
}

// 选择分类
const selectCategory = (category) => {
  form.categoryId = category.id
}

// 日期改变
const onDateChange = (e) => {
  form.date = e.detail.value
}

// 提交表单
const handleSubmit = async () => {
  // 表单验证
  if (!form.amount || parseFloat(form.amount) <= 0) {
    uni.showToast({
      title: '请输入金额',
      icon: 'none'
    })
    return
  }
  
  if (!form.categoryId) {
    uni.showToast({
      title: '请选择分类',
      icon: 'none'
    })
    return
  }
  
  try {
    loading.value = true
    uni.showLoading({
      title: '保存中...',
      mask: true
    })
    
    await addTransaction(form)
    
    uni.hideLoading()
    uni.navigateBack()
  } catch (err) {
    console.error('记账失败:', err)
    uni.hideLoading()
  } finally {
    loading.value = false
  }
}

// 生命周期钩子
onLoad(() => {
  loadCategories()
})
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #F5F5F5;
}

/* 类型切换 */
.type-tabs {
  display: flex;
  background: #fff;
  padding: 20rpx;
}

.type-tab {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  border-radius: 15rpx;
  transition: all 0.3s;
}

.type-tab.active {
  background: v-bind('themeColors.gradient');
}

.tab-text {
  font-size: 30rpx;
  color: #666;
}

.type-tab.active .tab-text {
  color: #fff;
  font-weight: bold;
}

/* 金额输入 */
.amount-section {
  display: flex;
  align-items: center;
  padding: 50rpx;
  background: #fff;
  margin-bottom: 20rpx;
}

.currency {
  font-size: 60rpx;
  color: #333;
  font-weight: bold;
  margin-right: 10rpx;
}

.amount-input {
  font-size: 80rpx;
  color: #333;
  font-weight: bold;
  flex: 1;
  text-align: left;
  max-width: 500rpx;
  height: 100rpx;
  line-height: 100rpx;
}

/* 分类选择 */
.category-section {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}

.category-list {
  display: flex;
  flex-wrap: wrap;
}

.category-item {
  width: 20%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0;
  margin-bottom: 20rpx;
}

.category-item.active .category-icon {
  transform: scale(1.15);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.category-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10rpx;
  transition: all 0.3s;
}

.icon-text {
  font-size: 40rpx;
}

.category-name {
  font-size: 24rpx;
  color: #666;
  text-align: center;
}

.category-item.active .category-name {
  color: v-bind('themeColors.primary');
  font-weight: bold;
}

/* 表单项 */
.form-section {
  background: #fff;
  padding: 0 30rpx;
  margin-bottom: 40rpx;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1px solid #F5F5F5;
}

.form-item:last-child {
  border-bottom: none;
}

.form-label {
  width: 120rpx;
  font-size: 28rpx;
  color: #333;
}

.form-value-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10rpx;
}

.form-value {
  font-size: 28rpx;
  color: #666;
  text-align: right;
}

.form-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  text-align: right;
}

.placeholder {
  color: #999;
}

/* 提交按钮 */
.submit-section {
  padding: 0 30rpx;
}

.submit-btn {
  width: 100%;
  height: 90rpx;
  background: v-bind('themeColors.gradient');
  color: #fff;
  border: none;
  border-radius: 45rpx;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: normal;
}

.submit-btn::after {
  border: none;
}

.submit-btn[loading] {
  opacity: 0.7;
}
</style>

