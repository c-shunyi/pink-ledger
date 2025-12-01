<template>
  <view class="container">
    <!-- 时间范围选择 -->
    <view class="time-selector">
      <view class="time-slider" :style="timeSliderStyle"></view>
      <view 
        class="time-tab"
        :class="{ active: timeRange === 'month' }"
        @click="changeTimeRange('month')"
      >
        月
      </view>
      <view 
        class="time-tab"
        :class="{ active: timeRange === 'year' }"
        @click="changeTimeRange('year')"
      >
        年
      </view>
    </view>

    <scroll-view 
      class="content-scroll"
      scroll-y
      :show-scrollbar="false"
    >
      <!-- 时间范围信息 -->
      <view 
        class="range-info"
        @touchstart="handleRangeTouchStart"
        @touchend="handleRangeTouchEnd"
      >
        <uni-icons 
          class="range-arrow" 
          type="left" 
          size="22" 
          color="#666"
          @click.stop="changePeriod('prev')"
        ></uni-icons>
        <view class="range-center">
          <view class="range-dates">
            <text class="range-label">{{ rangeLabel }}</text>
            <text class="range-value">{{ currentRange.startDate }} ~ {{ currentRange.endDate }}</text>
          </view>
          <!-- <text class="range-days" v-if="rangeDays">共{{ rangeDays }}天</text> -->
        </view>
        <uni-icons 
          class="range-arrow" 
          type="right" 
          size="22" 
          color="#666"
          @click.stop="changePeriod('next')"
        ></uni-icons>
      </view>
      
      <!-- 总览卡片 -->
      <view class="summary-card">
        <view class="summary-item">
          <text class="summary-label">总收入</text>
          <text class="summary-value income">¥{{ formatAmount(summary.totalIncome) }}</text>
        </view>
        <view class="summary-divider"></view>
        <view class="summary-item">
          <text class="summary-label">总支出</text>
          <text class="summary-value expense">¥{{ formatAmount(summary.totalExpense) }}</text>
        </view>
      </view>

      <!-- 数据洞察 -->
      <view class="insight-card">
        <view 
          class="insight-item"
          :class="{ clickable: item.clickable }"
          v-for="item in insights"
          :key="item.key"
          @click="handleInsightClick(item)"
      >
        <text class="insight-label">{{ item.label }}</text>
        <text class="insight-value" :class="item.type">{{ item.value }}</text>
        <text class="insight-desc">{{ item.desc }}</text>
        <uni-icons 
          v-if="item.clickable" 
          class="insight-arrow" 
          type="arrowright" 
          size="20" 
          color="rgba(0, 0, 0, 0.3)"
        ></uni-icons>
      </view>
    </view>
      
      <!-- 分类统计 -->
      <view class="category-stats">
        <!-- 支出统计 -->
        <view class="stats-section">
          <view class="stats-header">
            <text class="stats-title">支出分类</text>
            <text class="stats-total">¥{{ formatAmount(summary.totalExpense) }}</text>
          </view>
          <view class="stats-list">
            <view 
              v-for="item in expenseStats" 
              :key="item.categoryId"
              class="stats-item"
            >
              <view class="stats-left">
                <view class="stats-icon">
                  <image v-if="item.category.icon && item.category.icon.startsWith('/static/')" class="icon-img" :src="item.category.icon" mode="aspectFit"></image>
                  <text v-else class="icon-text">{{ item.category.icon }}</text>
                </view>
                <view class="stats-info">
                  <text class="stats-name">{{ item.category.name }}</text>
                  <text class="stats-count">{{ item.count }}笔</text>
                </view>
              </view>
              <view class="stats-right">
                <text class="stats-amount">¥{{ formatAmount(item.total) }}</text>
                <text class="stats-percent">{{ getPercent(item.total, summary.totalExpense) }}%</text>
              </view>
              <view class="stats-bar">
                <view 
                  class="stats-bar-fill expense"
                  :style="{ width: getPercent(item.total, summary.totalExpense) + '%' }"
                ></view>
              </view>
            </view>
            
            <view v-if="expenseStats.length === 0" class="empty-stats">
              <text>暂无支出记录</text>
            </view>
          </view>
        </view>
        
        <!-- 收入统计 -->
        <view class="stats-section">
          <view class="stats-header">
            <text class="stats-title">收入分类</text>
            <text class="stats-total income">¥{{ formatAmount(summary.totalIncome) }}</text>
          </view>
          <view class="stats-list">
            <view 
              v-for="item in incomeStats" 
              :key="item.categoryId"
              class="stats-item"
            >
              <view class="stats-left">
                <view class="stats-icon">
                  <image v-if="item.category.icon && item.category.icon.startsWith('/static/')" class="icon-img" :src="item.category.icon" mode="aspectFit"></image>
                  <text v-else class="icon-text">{{ item.category.icon }}</text>
                </view>
                <view class="stats-info">
                  <text class="stats-name">{{ item.category.name }}</text>
                  <text class="stats-count">{{ item.count }}笔</text>
                </view>
              </view>
              <view class="stats-right">
                <text class="stats-amount">¥{{ formatAmount(item.total) }}</text>
                <text class="stats-percent">{{ getPercent(item.total, summary.totalIncome) }}%</text>
              </view>
              <view class="stats-bar">
                <view 
                  class="stats-bar-fill income"
                  :style="{ width: getPercent(item.total, summary.totalIncome) + '%' }"
                ></view>
              </view>
            </view>
            
            <view v-if="incomeStats.length === 0" class="empty-stats">
              <text>暂无收入记录</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getStatistics } from '@/api'
import { formatDate, getSpecificMonthStart, getSpecificMonthEnd } from '@/utils/date.js'
import { useTheme } from '@/composables/useTheme.js'

// 响应式数据
const timeRange = ref('month') // month, year
const summary = reactive({
  totalIncome: 0,
  totalExpense: 0
})
const categoryStats = ref([])
const currentRange = reactive({
  startDate: '',
  endDate: ''
})
const activeDate = ref(new Date())

// 计算属性：支出统计
const expenseStats = computed(() => {
  return categoryStats.value
    .filter(item => item.type === 'expense')
    .sort((a, b) => parseFloat(b.total) - parseFloat(a.total))
})

// 计算属性：收入统计
const incomeStats = computed(() => {
  return categoryStats.value
    .filter(item => item.type === 'income')
    .sort((a, b) => parseFloat(b.total) - parseFloat(a.total))
})

const { themeColors } = useTheme()

const timeSliderStyle = computed(() => {
  const width = 'calc((100% - 40rpx) / 2)'
  const left = timeRange.value === 'month'
    ? '20rpx'
    : 'calc(20rpx + (100% - 40rpx) / 2)'
  return {
    left,
    width
  }
})

// 日期跨度
const rangeLabel = computed(() => {
  const date = activeDate.value
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return timeRange.value === 'month'
    ? `${year}年${month}月`
    : `${year}年`
})

const rangeDays = computed(() => {
  if (!currentRange.startDate || !currentRange.endDate) return 0
  const start = new Date(currentRange.startDate)
  const end = new Date(currentRange.endDate)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0
  const diff = end.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1
})

// 获取日期参数
const updateRangeByActiveDate = () => {
  const date = activeDate.value
  if (!date) return
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  if (timeRange.value === 'month') {
    currentRange.startDate = getSpecificMonthStart(year, month)
    currentRange.endDate = getSpecificMonthEnd(year, month)
  } else {
    currentRange.startDate = formatDate(new Date(year, 0, 1))
    currentRange.endDate = formatDate(new Date(year, 11, 31))
  }
}

const getDateParams = () => {
  return {
    startDate: currentRange.startDate,
    endDate: currentRange.endDate
  }
}

updateRangeByActiveDate()

// 加载数据
const loadData = async () => {
  try {
    const params = getDateParams()
    currentRange.startDate = params.startDate
    currentRange.endDate = params.endDate
    const res = await getStatistics(params)
    
    summary.totalIncome = Number(res.data.summary.totalIncome) || 0
    summary.totalExpense = Number(res.data.summary.totalExpense) || 0
    
    categoryStats.value = res.data.categoryStats || []
  } catch (err) {
    console.error('加载统计数据失败:', err)
  }
}

// 切换时间范围
const changeTimeRange = (range) => {
  if (timeRange.value === range) return
  timeRange.value = range
  updateRangeByActiveDate()
  loadData()
}

const changePeriod = (direction) => {
  const diff = direction === 'prev' ? -1 : 1
  const current = activeDate.value ? new Date(activeDate.value) : new Date()
  if (timeRange.value === 'month') {
    activeDate.value = new Date(current.getFullYear(), current.getMonth() + diff, 1)
  } else {
    activeDate.value = new Date(current.getFullYear() + diff, current.getMonth(), 1)
  }
  updateRangeByActiveDate()
  loadData()
}

// 计算百分比
const getPercent = (value, total) => {
  if (!total || parseFloat(total) === 0) return 0
  return ((parseFloat(value) / parseFloat(total)) * 100).toFixed(1)
}

const formatAmount = (value) => {
  const num = Number(value) || 0
  return num.toFixed(2)
}

const touchStartX = ref(0)
const touchStartY = ref(0)

const handleRangeTouchStart = (event) => {
  const touch = event.touches?.[0]
  if (!touch) return
  touchStartX.value = touch.clientX
  touchStartY.value = touch.clientY
}

const handleRangeTouchEnd = (event) => {
  const touch = event.changedTouches?.[0]
  if (!touch) return
  const deltaX = touch.clientX - touchStartX.value
  const deltaY = touch.clientY - touchStartY.value
  if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
    changePeriod(deltaX > 0 ? 'prev' : 'next')
  }
}

const insights = computed(() => {
  const days = rangeDays.value
  const expenseTop = expenseStats.value[0]
  const incomeTop = incomeStats.value[0]
  const getCategoryName = (item) => item?.category?.name || '未分类'

  return [
    {
      key: 'top-expense',
      label: '最高支出',
      type: 'expense',
      transactionType: 'expense',
      value: expenseTop ? `¥${formatAmount(expenseTop.total)}` : '--',
      desc: expenseTop 
        ? `${getCategoryName(expenseTop)} · ${getPercent(expenseTop.total, summary.totalExpense)}%`
        : '暂无支出数据',
      clickable: !!expenseTop
    },
    {
      key: 'top-income',
      label: '最高收入',
      type: 'income',
      transactionType: 'income',
      value: incomeTop ? `¥${formatAmount(incomeTop.total)}` : '--',
      desc: incomeTop
        ? `${getCategoryName(incomeTop)} · ${getPercent(incomeTop.total, summary.totalIncome)}%`
        : '暂无收入数据',
      clickable: !!incomeTop
    },
    {
      key: 'avg-expense',
      label: '平均支出',
      type: 'expense',
      value: days ? `¥${formatAmount(summary.totalExpense / days)}` : '--',
      desc: days ? `日均支出 · ${days}天` : '暂无有效日期范围',
      clickable: false
    },
    {
      key: 'avg-income',
      label: '平均收入',
      type: 'income',
      value: days ? `¥${formatAmount(summary.totalIncome / days)}` : '--',
      desc: days ? `日均收入 · ${days}天` : '暂无有效日期范围',
      clickable: false
    }
  ]
})

const handleInsightClick = (item) => {
  if (!item.clickable || !item.transactionType) return
  const query = [
    `type=${item.transactionType}`,
    currentRange.startDate ? `startDate=${currentRange.startDate}` : '',
    currentRange.endDate ? `endDate=${currentRange.endDate}` : '',
    'limit=10'
  ].filter(Boolean).join('&')

  uni.navigateTo({
    url: `/pages/statistics/top-list?${query}`
  })
}

// 生命周期钩子
onLoad(() => {
  loadData()
})

onShow(() => {
  loadData()
})
</script>

<style scoped>
.container {
  min-height: 100vh;
  height: 100vh;
  background: #F5F5F5;
  padding-bottom: 20rpx;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-scroll {
  flex: 1;
  overflow: hidden;
  padding-bottom: 20rpx;
  box-sizing: border-box;
}

/* 时间范围选择 */
.time-selector {
  display: flex;
  background: #fff;
  padding: 20rpx;
  position: relative;
  border-radius: 20rpx;
  overflow: hidden;
}

.time-slider {
  position: absolute;
  top: 20rpx;
  bottom: 20rpx;
  border-radius: 12rpx;
  background: v-bind('themeColors.gradient');
  transition: left 0.3s;
}

.time-tab {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #666;
  border-radius: 12rpx;
  transition: color 0.3s;
  z-index: 1;
}

.time-tab.active {
  color: #fff;
  font-weight: bold;
}

/* 日期信息 */
.range-info {
  background: #fff;
  margin: 0 20rpx 20rpx;
  padding: 20rpx 30rpx;
  border-radius: 15rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  font-size: 26rpx;
  color: #666;
}

.range-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.range-dates {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.range-label {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 6rpx;
}

.range-value {
  font-size: 24rpx;
  color: #999;
}

.range-days {
  font-size: 24rpx;
  color: #999;
}

.range-arrow {
  padding: 10rpx;
}

/* 总览卡片 */
.summary-card {
  background: #fff;
  padding: 40rpx;
  margin: 0 20rpx 20rpx;
  border-radius: 20rpx;
  display: flex;
  justify-content: space-around;
}

.summary-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.summary-label {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 15rpx;
}

.summary-value {
  font-size: 36rpx;
  font-weight: bold;
}

.summary-value.income {
  color: #06D6A0;
}

.summary-value.expense {
  color: #FF6B6B;
}

.summary-divider {
  width: 1px;
  background: #F5F5F5;
}

/* 数据洞察 */
.insight-card {
  background: #fff;
  margin: 0 20rpx 20rpx;
  border-radius: 20rpx;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  padding: 30rpx;
}

.insight-item {
  background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  position: relative;
}

.insight-item.clickable {
  border: 1px solid rgba(118, 75, 162, 0.2);
  padding-right: 60rpx;
}

.insight-item.clickable:active {
  opacity: 0.8;
}

.insight-arrow {
  position: absolute;
  right: 24rpx;
  top: 50%;
  transform: translateY(-50%);
}

.insight-label {
  font-size: 24rpx;
  color: #777;
  margin-bottom: 12rpx;
}

.insight-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.insight-value.expense {
  color: #FF6B6B;
}

.insight-value.income {
  color: #06D6A0;
}

.insight-desc {
  font-size: 24rpx;
  color: #999;
}

/* 分类统计 */
.category-stats {
  padding: 0 20rpx;
}

.stats-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1px solid #F5F5F5;
}

.stats-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.stats-total {
  font-size: 32rpx;
  font-weight: bold;
  color: #FF6B6B;
}

.stats-total.income {
  color: #06D6A0;
}

.stats-list {
  display: flex;
  flex-direction: column;
}

.stats-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  position: relative;
}

.stats-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.stats-icon {
  width: 70rpx;
  height: 70rpx;
  background: #F5F5F5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  margin-right: 20rpx;
}

.stats-icon .icon-img {
  width: 45rpx;
  height: 45rpx;
}

.stats-icon .icon-text {
  font-size: 36rpx;
}

.stats-info {
  display: flex;
  flex-direction: column;
}

.stats-name {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 5rpx;
}

.stats-count {
  font-size: 24rpx;
  color: #999;
}

.stats-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.stats-amount {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 5rpx;
}

.stats-percent {
  font-size: 24rpx;
  color: #999;
}

.stats-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: #F5F5F5;
  border-radius: 2rpx;
  overflow: hidden;
}

.stats-bar-fill {
  height: 100%;
  border-radius: 2rpx;
  transition: width 0.3s;
}

.stats-bar-fill.expense {
  background: #FF6B6B;
}

.stats-bar-fill.income {
  background: #06D6A0;
}

.empty-stats {
  text-align: center;
  padding: 60rpx 0;
  font-size: 26rpx;
  color: #999;
}
</style>
