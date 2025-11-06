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
      <text class="currency">¥</text>
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
      <scroll-view class="category-list" scroll-y>
        <view 
          v-for="category in filteredCategories" 
          :key="category.id"
          class="category-item"
          :class="{ active: form.categoryId === category.id }"
          @click="selectCategory(category)"
        >
          <text class="category-icon">{{ category.icon }}</text>
          <text class="category-name">{{ category.name }}</text>
        </view>
      </scroll-view>
    </view>
    
    <!-- 表单项 -->
    <view class="form-section">
      <view class="form-item" @click="showDatePicker = true">
        <text class="form-label">日期</text>
        <text class="form-value">{{ form.date }}</text>
      </view>
      
      <view class="form-item" @click="showAccountPicker = true">
        <text class="form-label">账户</text>
        <text class="form-value">{{ currentAccount.label }}</text>
      </view>
      
      <view class="form-item">
        <text class="form-label">备注</text>
        <input 
          class="form-input" 
          v-model="form.description"
          placeholder="添加备注（可选）"
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
    
    <!-- 日期选择器 -->
    <picker
      v-if="showDatePicker"
      mode="date"
      :value="form.date"
      @change="onDateChange"
      @cancel="showDatePicker = false"
    >
      <view></view>
    </picker>
    
    <!-- 账户选择器 -->
    <picker
      v-if="showAccountPicker"
      mode="selector"
      :range="accountTypes"
      range-key="label"
      @change="onAccountChange"
      @cancel="showAccountPicker = false"
    >
      <view></view>
    </picker>
  </view>
</template>

<script>
import { getCategories, createTransaction } from '@/utils/api.js'
import { getToday } from '@/utils/date.js'
import config from '@/config/index.js'

export default {
  data() {
    return {
      form: {
        type: 'expense',
        amount: '',
        categoryId: null,
        date: getToday(),
        accountType: 'cash',
        description: ''
      },
      categories: [],
      accountTypes: config.accountTypes,
      showDatePicker: false,
      showAccountPicker: false,
      loading: false
    }
  },
  computed: {
    // 根据类型筛选分类
    filteredCategories() {
      return this.categories.filter(cat => cat.type === this.form.type)
    },
    // 当前选中的账户
    currentAccount() {
      return this.accountTypes.find(acc => acc.value === this.form.accountType) || this.accountTypes[0]
    }
  },
  onLoad() {
    this.loadCategories()
  },
  methods: {
    // 加载分类
    async loadCategories() {
      try {
        const res = await getCategories()
        this.categories = res.data.categories
        
        // 默认选择第一个分类
        if (this.filteredCategories.length > 0) {
          this.form.categoryId = this.filteredCategories[0].id
        }
      } catch (err) {
        console.error('加载分类失败:', err)
      }
    },
    
    // 切换类型
    changeType(type) {
      this.form.type = type
      // 重置分类选择
      if (this.filteredCategories.length > 0) {
        this.form.categoryId = this.filteredCategories[0].id
      }
    },
    
    // 金额输入
    onAmountInput(e) {
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
      this.form.amount = value
    },
    
    // 选择分类
    selectCategory(category) {
      this.form.categoryId = category.id
    },
    
    // 日期改变
    onDateChange(e) {
      this.form.date = e.detail.value
      this.showDatePicker = false
    },
    
    // 账户改变
    onAccountChange(e) {
      this.form.accountType = this.accountTypes[e.detail.value].value
      this.showAccountPicker = false
    },
    
    // 提交
    async handleSubmit() {
      // 验证
      if (!this.form.amount || parseFloat(this.form.amount) <= 0) {
        uni.showToast({
          title: '请输入金额',
          icon: 'none'
        })
        return
      }
      
      if (!this.form.categoryId) {
        uni.showToast({
          title: '请选择分类',
          icon: 'none'
        })
        return
      }
      
      try {
        this.loading = true
        await createTransaction(this.form)
        
        uni.showToast({
          title: '记账成功',
          icon: 'success'
        })
        
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      } catch (err) {
        console.error('记账失败:', err)
      } finally {
        this.loading = false
      }
    }
  }
}
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
  background: linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 100%);
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
  justify-content: center;
  padding: 80rpx 0;
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
  min-width: 200rpx;
  text-align: left;
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
  background: linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 100%);
  transform: scale(1.1);
}

.category-icon {
  width: 80rpx;
  height: 80rpx;
  background: #F5F5F5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-bottom: 10rpx;
  transition: all 0.3s;
}

.category-name {
  font-size: 24rpx;
  color: #666;
  text-align: center;
}

.category-item.active .category-name {
  color: #FF9A9E;
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

.form-value {
  flex: 1;
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
  background: linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 100%);
  color: #fff;
  border: none;
  border-radius: 45rpx;
  font-size: 32rpx;
  font-weight: bold;
}

.submit-btn[loading] {
  opacity: 0.7;
}
</style>

