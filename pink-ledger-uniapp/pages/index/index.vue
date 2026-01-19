<template>
  <view class="container"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <!-- 头部统计卡片 -->
    <view class="header-card">
      <view class="header-content">
        <!-- 左侧时间选择 -->
        <view class="time-section" @click="showDatePicker = true">
          <text class="year-text">{{ currentYear }}年</text>
          <view class="month-wrapper">
            <text class="month-num">{{ currentMonthNum }}</text>
            <text class="month-unit">月</text>
            <uni-icons type="down" size="16" color="rgba(255, 255, 255, 0.9)"></uni-icons>
          </view>
        </view>
        
        <!-- 中间支出 -->
        <view class="summary-section">
          <text class="summary-label">支出</text>
          <text class="summary-value expense">{{ summary.totalExpense }}</text>
        </view>
        
        <!-- 右侧收入 -->
        <view class="summary-section">
          <text class="summary-label">收入</text>
          <text class="summary-value income">{{ summary.totalIncome }}</text>
        </view>
      </view>
    </view>
    
    <!-- 年月选择弹框 -->
    <view v-if="showDatePicker" class="date-picker-overlay" @click="showDatePicker = false">
      <view class="date-picker-modal" @click.stop>
        <view class="picker-header">
          <text class="picker-title">选择年月</text>
          <view class="picker-close" @click="showDatePicker = false">
            <uni-icons type="closeempty" size="20" color="#999"></uni-icons>
          </view>
        </view>
        <view class="picker-content">
          <picker-view 
            :value="pickerValue" 
            @change="onPickerChange"
            class="picker-view"
          >
            <picker-view-column>
              <view v-for="(year, index) in yearList" :key="index" class="picker-item">
                {{ year }}年
              </view>
            </picker-view-column>
            <picker-view-column>
              <view v-for="(month, index) in monthList" :key="index" class="picker-item">
                {{ month }}月
              </view>
            </picker-view-column>
          </picker-view>
        </view>
        <view class="picker-footer">
          <view class="picker-btn cancel" @click="showDatePicker = false">取消</view>
          <view class="picker-btn confirm" @click="confirmDateChange">确定</view>
        </view>
      </view>
    </view>
    
    <!-- 筛选条件 -->
    <view class="filter-bar">
      <!-- 滑块背景 -->
      <view class="filter-slider" :style="sliderStyle"></view>
      
      <view class="filter-item" 
        :class="{ active: filterType === 'all' }" 
        @click="changeFilter('all')">
        全部
      </view>
      <view class="filter-item" 
        :class="{ active: filterType === 'expense' }" 
        @click="changeFilter('expense')">
        支出
      </view>
      <view class="filter-item" 
        :class="{ active: filterType === 'income' }" 
        @click="changeFilter('income')">
        收入
      </view>
    </view>
    
    <!-- 账单列表容器 -->
    <view class="list-container">
      <scroll-view 
        class="transaction-list" 
        scroll-y 
        @scrolltolower="loadMore"
        refresher-enabled
        :refresher-triggered="refreshing"
        @refresherrefresh="onRefresh"
        :show-scrollbar="false"
        enhanced
      >
      <view v-if="groupedTransactions.length > 0">
        <view v-for="group in groupedTransactions" :key="group.date" class="date-group">
          <view class="date-header">
            <text class="date-text">{{ group.dateText }}</text>
            <text class="date-total">
              支出 {{ group.expenseTotal }} | 收入 {{ group.incomeTotal }}
            </text>
          </view>
          
          <view 
            v-for="item in group.transactions" 
            :key="item.id" 
            class="transaction-item"
            @click="goToDetail(item.id)"
          >
            <view class="transaction-icon" :style="{ background: item.category.color || '#F5F5F5' }">
              <image v-if="item.category.icon && item.category.icon.startsWith('/static/')" class="icon-img" :src="item.category.icon" mode="aspectFit"></image>
              <text v-else class="icon-text">{{ item.category.icon }}</text>
            </view>
            <view class="transaction-info">
              <text class="category-name">{{ item.description || item.category.name }}</text>
            </view>
            <view class="transaction-amount">
              <text 
                class="amount" 
                :class="item.type"
              >
                {{ item.type === 'income' ? '+' : '-' }}{{ item.amount }}
              </text>
            </view>
          </view>
        </view>
        
        <view v-if="!hasMore" class="no-more">没有更多了</view>
      </view>
      
      <view v-else class="empty">
        <text class="empty-icon">📝</text>
        <text class="empty-text">暂无账单记录</text>
        <text class="empty-tip">点击下方 + 号开始记账吧</text>
      </view>
      </scroll-view>
    </view>
    
    <!-- 添加按钮 -->
    <view class="float-actions">
      <view class="ai-btn" @click="showAIModal">
        <text class="ai-btn-text">AI 记账</text>
      </view>
      <view class="add-btn" @click="goToAdd">
        <uni-icons type="plusempty" size="26" color="#fff"></uni-icons>
      </view>
    </view>

    <AIBillingModal
      :visible="aiModalVisible"
      @close="aiModalVisible = false"
      @submit="handleAISubmit"
    />
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useAuth } from '@/composables/useAuth.js'
import { useTransactions } from '@/composables/useTransactions.js'
import { useTheme } from '@/composables/useTheme.js'
import { parseSmartBilling, createTransaction } from '@/api'
import AIBillingModal from '@/components/AIBillingModal.vue'

// 使用组合式函数
const { isLoggedIn } = useAuth()
const {
  groupedTransactions,
  summary,
  loading,
  hasMore,
  refreshData,
  loadMore: loadMoreTransactions
} = useTransactions()
const { themeColors } = useTheme()

// 本页面特有的响应式数据
const filterType = ref('all') // all, expense, income
const currentMonth = ref('')
const currentYear = ref('')
const currentMonthNum = ref('')
const refreshing = ref(false)
const aiModalVisible = ref(false)

// 日期选择相关
const showDatePicker = ref(false)
const pickerValue = ref([0, 0])
const yearList = ref([])
const monthList = ref([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
const tempPickerValue = ref([0, 0])
const currentDate = ref({ year: 0, month: 0 }) // 存储当前年月，用于限制选择

// 记录上一次的滑块位置，用于计算旋转方向
const previousFilterIndex = ref(0)
// 记录是否使用旋转效果（1:1比例随机）
const useRotateEffect = ref(false)

// 触摸滑动相关
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchMoveX = ref(0)
const touchMoveTime = ref(0) // 节流控制

// 计算滑块位置
const sliderStyle = computed(() => {
  const filterMap = {
    'all': 0,
    'expense': 1,
    'income': 2
  }
  const index = filterMap[filterType.value]
  
  // 正确计算：左padding(30rpx) + 内容区域宽度(100% - 60rpx) * index / 3
  const leftPosition = index === 0 
    ? '30rpx' 
    : `calc(30rpx + (100% - 60rpx) * ${index} / 3)`
  
  // 如果使用旋转效果，添加Z轴旋转
  if (useRotateEffect.value) {
    const rotateDirection = index > previousFilterIndex.value ? 1 : -1
    const rotateAngle = rotateDirection * 180
    
    return {
      left: leftPosition,
      transform: `rotateZ(${rotateAngle}deg)`
    }
  }
  
  // 否则仅使用平移效果
  return {
    left: leftPosition,
    transform: 'rotateZ(0deg)'
  }
})

// 初始化当前月份
const initCurrentMonth = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  
  // 保存当前年月，用于限制选择
  currentDate.value = { year, month }
  
  currentYear.value = year
  currentMonthNum.value = month
  currentMonth.value = `${year}年${month}月`
  
  // 生成年份列表（只到当前年，不包含未来年份）
  yearList.value = []
  for (let i = year - 5; i <= year; i++) {
    yearList.value.push(i)
  }
  
  // 设置默认选择器值
  const yearIndex = yearList.value.findIndex(y => y === year)
  const monthIndex = month - 1
  pickerValue.value = [yearIndex, monthIndex]
  tempPickerValue.value = [yearIndex, monthIndex]
  
  // 初始化月份列表（当前年只显示到当前月）
  updateMonthList(year)
}

// 根据选择的年份更新月份列表
const updateMonthList = (selectedYear) => {
  const { year: currentYear, month: currentMonth } = currentDate.value
  
  if (selectedYear === currentYear) {
    // 如果是当前年，只显示到当前月
    monthList.value = []
    for (let i = 1; i <= currentMonth; i++) {
      monthList.value.push(i)
    }
  } else {
    // 如果是过去的年份，显示1-12月
    monthList.value = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  }
}

// 加载数据（根据筛选条件）
const loadData = async () => {
  const params = {
    year: currentYear.value,
    month: currentMonthNum.value
  }
  
  if (filterType.value !== 'all') {
    params.type = filterType.value
  }
  
  try {
    await refreshData(params)
  } catch (err) {
    console.error('加载数据失败:', err)
  } finally {
    refreshing.value = false
  }
}

const showAIModal = () => {
  aiModalVisible.value = true
}

const handleAISubmit = async (text, setLoading) => {
  setLoading(true)

  try {
    const parseRes = await parseSmartBilling(text)
    const bills = parseRes.data?.bills || []

    if (bills.length === 0) {
      uni.showToast({
        title: parseRes.msg || 'AI 未能识别账单',
        icon: 'none'
      })
      return
    }

    const createPromises = bills.map((bill) => {
      return createTransaction({
        categoryId: bill.categoryId,
        type: bill.type,
        amount: bill.amount,
        date: bill.date,
        description: bill.description
      })
    })

    const results = await Promise.allSettled(createPromises)
    const successCount = results.filter((result) => result.status === 'fulfilled').length
    const failCount = results.length - successCount

    if (successCount > 0) {
      aiModalVisible.value = false
      uni.showToast({
        title: `成功创建 ${successCount} 笔账单${failCount > 0 ? `，${failCount} 笔失败` : ''}`,
        icon: 'success'
      })
      await loadData()
    } else {
      uni.showToast({
        title: '创建账单失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('AI 记账失败:', error)
    uni.showToast({
      title: '操作失败，请重试',
      icon: 'none'
    })
  } finally {
    setLoading(false)
  }
}

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true
  loadData()
}

// 加载更多
const loadMore = () => {
  const params = {
    year: currentYear.value,
    month: currentMonthNum.value
  }
  
  if (filterType.value !== 'all') {
    params.type = filterType.value
  }
  
  loadMoreTransactions(params)
}

// 切换筛选类型
const changeFilter = (type) => {
  if (filterType.value === type) return
  
  // 记录切换前的位置
  const filterMap = {
    'all': 0,
    'expense': 1,
    'income': 2
  }
  previousFilterIndex.value = filterMap[filterType.value]
  
  // 1:1比例随机决定是否使用旋转效果
  useRotateEffect.value = Math.random() < 0.5
  
  filterType.value = type
  loadData()
}

// 跳转到添加页面
const goToAdd = () => {
  uni.navigateTo({
    url: '/pages/transaction/add'
  })
}

// 跳转到详情页面
const goToDetail = (id) => {
  uni.navigateTo({
    url: `/pages/transaction/detail?id=${id}`
  })
}

// 触摸事件处理
const onTouchStart = (e) => {
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
  // 重要：初始化移动位置为起始位置，避免使用上次的残留值
  touchMoveX.value = e.touches[0].clientX
}

const onTouchMove = (e) => {
  // 节流：每50ms最多触发一次
  const now = Date.now()
  if (now - touchMoveTime.value < 50) {
    return
  }
  touchMoveTime.value = now
  touchMoveX.value = e.touches[0].clientX
}

const onTouchEnd = (e) => {
  const deltaX = touchMoveX.value - touchStartX.value
  const endY = e.changedTouches?.[0]?.clientY || touchStartY.value
  const deltaY = Math.abs(endY - touchStartY.value)
  
  // 更严格的判断条件：
  // 1. 水平滑动距离至少50px
  // 2. 水平滑动距离必须是垂直滑动距离的2倍以上
  // 3. 垂直滑动距离不能超过50px
  if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > deltaY * 2 && deltaY < 50) {
    const filterTypes = ['all', 'expense', 'income']
    const currentIndex = filterTypes.indexOf(filterType.value)
    
    if (deltaX > 0) {
      // 向右滑动，切换到前一个tab
      if (currentIndex > 0) {
        changeFilter(filterTypes[currentIndex - 1])
      }
    } else {
      // 向左滑动，切换到后一个tab
      if (currentIndex < filterTypes.length - 1) {
        changeFilter(filterTypes[currentIndex + 1])
      }
    }
  }
  
  // 重置触摸位置
  touchStartX.value = 0
  touchStartY.value = 0
  touchMoveX.value = 0
}

// 日期选择器相关方法
const onPickerChange = (e) => {
  const [yearIndex, monthIndex] = e.detail.value
  tempPickerValue.value = [yearIndex, monthIndex]
  
  // 当年份改变时，更新月份列表
  if (yearIndex >= 0 && yearIndex < yearList.value.length) {
    const selectedYear = yearList.value[yearIndex]
    updateMonthList(selectedYear)
    
    // 如果当前选择的月份超出了新的月份列表范围，自动调整到最大月份
    if (monthIndex >= monthList.value.length) {
      tempPickerValue.value = [yearIndex, monthList.value.length - 1]
    }
  }
}

const confirmDateChange = () => {
  const yearIndex = tempPickerValue.value[0]
  const monthIndex = tempPickerValue.value[1]
  
  if (yearIndex >= 0 && yearIndex < yearList.value.length && 
      monthIndex >= 0 && monthIndex < monthList.value.length) {
    const selectedYear = yearList.value[yearIndex]
    const selectedMonth = monthList.value[monthIndex]
    const { year: maxYear, month: maxMonth } = currentDate.value
    
    // 验证选择的日期不能超过当前年月
    if (selectedYear > maxYear || 
        (selectedYear === maxYear && selectedMonth > maxMonth)) {
      uni.showToast({
        title: '不能选择未来的日期',
        icon: 'none'
      })
      return
    }
    
    currentYear.value = selectedYear
    currentMonthNum.value = selectedMonth
    currentMonth.value = `${selectedYear}年${selectedMonth}月`
    
    pickerValue.value = [...tempPickerValue.value]
    showDatePicker.value = false
    
    // 重新加载数据
    loadData()
  }
}

// 监听日期选择器打开，确保月份列表正确
watch(showDatePicker, (newVal) => {
  if (newVal) {
    // 打开选择器时，根据当前选择的年份更新月份列表
    const yearIndex = pickerValue.value[0]
    if (yearIndex >= 0 && yearIndex < yearList.value.length) {
      const selectedYear = yearList.value[yearIndex]
      updateMonthList(selectedYear)
    }
  }
})

// 生命周期钩子
onLoad(() => {
  // 检查登录状态
  if (!isLoggedIn.value) {
    uni.reLaunch({
      url: '/pages/login/login'
    })
    return
  }
  
  initCurrentMonth()
  loadData()
})

onShow(() => {
  // 每次显示页面时刷新数据
  if (isLoggedIn.value) {
    loadData()
  }
})
</script>

<style scoped>
/* 全局隐藏滚动条样式 */
::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  color: transparent !important;
}

::-webkit-scrollbar-track {
  display: none !important;
}

::-webkit-scrollbar-thumb {
  display: none !important;
}

.container {
  height: 100vh;
  background: #F5F5F5;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

/* 头部统计卡片 */
.header-card {
  background: v-bind('themeColors.gradient');
  padding: 60rpx 40rpx 40rpx;
  border-radius: 0 0 20rpx 20rpx;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 左侧时间选择区域 */
.time-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

.year-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 5rpx;
}

.month-wrapper {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8rpx;
}

.month-num {
  font-size: 54rpx;
  font-weight: bold;
  color: #fff;
}

.month-unit {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

/* 中间支出和右侧收入 */
.summary-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.summary-label {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 10rpx;
}

.summary-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
}

/* 日期选择弹框样式 */
.date-picker-overlay {
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

.date-picker-modal {
  background: #fff;
  border-radius: 20rpx;
  width: 600rpx;
  max-height: 80vh;
  overflow: hidden;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1px solid #f0f0f0;
}

.picker-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.picker-close {
  font-size: 36rpx;
  color: #999;
  width: 50rpx;
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f5f5f5;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

.picker-content {
  height: 400rpx;
}

.picker-view {
  width: 100%;
  height: 100%;
}

.picker-item {
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  font-size: 28rpx;
  color: #333;
}

.picker-footer {
  display: flex;
  border-top: 1px solid #f0f0f0;
}

.picker-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  font-size: 28rpx;
  border-right: 1px solid #f0f0f0;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

.picker-btn:last-child {
  border-right: none;
}

.picker-btn.cancel {
  color: #999;
}

.picker-btn.confirm {
  color: v-bind('themeColors.text');
  font-weight: bold;
}

/* 筛选条件 */
.filter-bar {
  position: relative;
  display: flex;
  padding: 20rpx 30rpx;
  background: #fff;
  margin: 20rpx 30rpx;
  border-radius: 20rpx;
}

.filter-slider {
  position: absolute;
  top: 20rpx;
  width: calc((100% - 60rpx) / 3);
  height: calc(100% - 40rpx);
  background: v-bind('themeColors.gradient');
  border-radius: 10rpx;
  transition: all 0.4s cubic-bezier(0.1, 0.7, 0.3, 0.9);
  transform-origin: center center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.filter-item {
  position: relative;
  flex: 1;
  text-align: center;
  padding: 15rpx 0;
  font-size: 28rpx;
  color: #666;
  border-radius: 10rpx;
  transition: color 0.3s;
  z-index: 2;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

.filter-item.active {
  color: #fff;
  font-weight: bold;
}

/* 账单列表容器 */
.list-container {
  flex: 1;
  overflow: hidden;
}

/* 账单列表 */
.transaction-list {
  box-sizing: border-box;
  padding: 0 30rpx 20rpx;
  /* 占满父容器高度 */
  height: 100%;
  /* 隐藏滚动条 - 多种方法组合 */
  -ms-overflow-style: none; /* IE和Edge */
  scrollbar-width: none; /* Firefox */
  overflow: -moz-scrollbars-none; /* Firefox旧版本 */
}

/* 隐藏webkit系滚动条 */
.transaction-list::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  color: transparent !important;
}

.transaction-list::-webkit-scrollbar-track {
  display: none !important;
}

.transaction-list::-webkit-scrollbar-thumb {
  display: none !important;
}

.date-group {
  margin-bottom: 30rpx;
}

.date-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
}

.date-text {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.date-total {
  font-size: 24rpx;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.transaction-item {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 30rpx;
  border-radius: 20rpx;
  margin-bottom: 15rpx;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

.transaction-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.icon-text {
  font-size: 40rpx;
}

.icon-img {
  width: 50rpx;
  height: 50rpx;
}

.transaction-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.category-name {
  font-size: 30rpx;
  color: #333;
  margin-bottom: 5rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.description {
  font-size: 24rpx;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.transaction-amount {
  display: flex;
  align-items: center;
}

.amount {
  font-size: 36rpx;
  font-weight: bold;
}

.amount.expense {
  color: #FF6B6B;
}

.amount.income {
  color: #06D6A0;
}

/* 空状态 */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 150rpx 0;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #666;
  margin-bottom: 15rpx;
}

.empty-tip {
  font-size: 26rpx;
  color: #999;
}

.no-more {
  text-align: center;
  padding: 40rpx 0;
  font-size: 26rpx;
  color: #999;
}

/* 悬浮操作区 */
.float-actions {
  position: fixed;
  right: 40rpx;
  bottom: 120rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  z-index: 999;
}

.ai-btn {
  height: 72rpx;
  padding: 0 24rpx;
  border-radius: 36rpx;
  background: v-bind('themeColors.gradientReverse');
  box-shadow: 0 8rpx 24rpx v-bind('themeColors.shadow');
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

.ai-btn-text {
  font-size: 26rpx;
  color: #fff;
  font-weight: 500;
}

/* 添加按钮 */
.add-btn {
  width: 120rpx;
  height: 120rpx;
  background: v-bind('themeColors.gradient');
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 30rpx v-bind('themeColors.shadow');
  cursor: pointer;
  transition: transform 0.2s;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

.add-btn:active {
  transform: scale(0.95);
}
</style>
