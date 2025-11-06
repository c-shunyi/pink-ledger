<template>
  <view class="container">
    <!-- 时间范围选择 -->
    <view class="time-selector">
      <view 
        class="time-tab"
        :class="{ active: timeRange === 'month' }"
        @click="changeTimeRange('month')"
      >
        本月
      </view>
      <view 
        class="time-tab"
        :class="{ active: timeRange === 'year' }"
        @click="changeTimeRange('year')"
      >
        本年
      </view>
    </view>
    
    <!-- 总览卡片 -->
    <view class="summary-card">
      <view class="summary-item">
        <text class="summary-label">总收入</text>
        <text class="summary-value income">¥{{ summary.totalIncome }}</text>
      </view>
      <view class="summary-divider"></view>
      <view class="summary-item">
        <text class="summary-label">总支出</text>
        <text class="summary-value expense">¥{{ summary.totalExpense }}</text>
      </view>
      <view class="summary-divider"></view>
      <view class="summary-item">
        <text class="summary-label">结余</text>
        <text class="summary-value balance">¥{{ summary.balance }}</text>
      </view>
    </view>
    
    <!-- 分类统计 -->
    <view class="category-stats">
      <!-- 支出统计 -->
      <view class="stats-section">
        <view class="stats-header">
          <text class="stats-title">支出分类</text>
          <text class="stats-total">¥{{ summary.totalExpense }}</text>
        </view>
        <view class="stats-list">
          <view 
            v-for="item in expenseStats" 
            :key="item.categoryId"
            class="stats-item"
          >
            <view class="stats-left">
              <text class="stats-icon">{{ item.category.icon }}</text>
              <view class="stats-info">
                <text class="stats-name">{{ item.category.name }}</text>
                <text class="stats-count">{{ item.count }}笔</text>
              </view>
            </view>
            <view class="stats-right">
              <text class="stats-amount">¥{{ parseFloat(item.total).toFixed(2) }}</text>
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
          <text class="stats-total income">¥{{ summary.totalIncome }}</text>
        </view>
        <view class="stats-list">
          <view 
            v-for="item in incomeStats" 
            :key="item.categoryId"
            class="stats-item"
          >
            <view class="stats-left">
              <text class="stats-icon">{{ item.category.icon }}</text>
              <view class="stats-info">
                <text class="stats-name">{{ item.category.name }}</text>
                <text class="stats-count">{{ item.count }}笔</text>
              </view>
            </view>
            <view class="stats-right">
              <text class="stats-amount">¥{{ parseFloat(item.total).toFixed(2) }}</text>
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
  </view>
</template>

<script>
import { getStatistics } from '@/api'
import { getMonthStart, getMonthEnd, getYearStart, getYearEnd } from '@/utils/date.js'

export default {
  data() {
    return {
      timeRange: 'month', // month, year
      summary: {
        totalIncome: '0.00',
        totalExpense: '0.00',
        balance: '0.00'
      },
      categoryStats: []
    }
  },
  computed: {
    // 支出统计
    expenseStats() {
      return this.categoryStats
        .filter(item => item.type === 'expense')
        .sort((a, b) => parseFloat(b.total) - parseFloat(a.total))
    },
    // 收入统计
    incomeStats() {
      return this.categoryStats
        .filter(item => item.type === 'income')
        .sort((a, b) => parseFloat(b.total) - parseFloat(a.total))
    }
  },
  onLoad() {
    this.loadData()
  },
  onShow() {
    this.loadData()
  },
  methods: {
    // 加载数据
    async loadData() {
      try {
        const params = this.getDateParams()
        const res = await getStatistics(params)
        
        this.summary = {
          totalIncome: res.data.summary.totalIncome.toFixed(2),
          totalExpense: res.data.summary.totalExpense.toFixed(2),
          balance: res.data.summary.balance.toFixed(2)
        }
        
        this.categoryStats = res.data.categoryStats
      } catch (err) {
        console.error('加载统计数据失败:', err)
      }
    },
    
    // 获取日期参数
    getDateParams() {
      if (this.timeRange === 'month') {
        return {
          startDate: getMonthStart(),
          endDate: getMonthEnd()
        }
      } else {
        return {
          startDate: getYearStart(),
          endDate: getYearEnd()
        }
      }
    },
    
    // 切换时间范围
    changeTimeRange(range) {
      if (this.timeRange === range) return
      this.timeRange = range
      this.loadData()
    },
    
    // 计算百分比
    getPercent(value, total) {
      if (!total || parseFloat(total) === 0) return 0
      return ((parseFloat(value) / parseFloat(total)) * 100).toFixed(1)
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

/* 时间范围选择 */
.time-selector {
  display: flex;
  background: #fff;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.time-tab {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #666;
  border-radius: 15rpx;
  transition: all 0.3s;
}

.time-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-weight: bold;
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

.summary-value.balance {
  color: #333;
}

.summary-divider {
  width: 1px;
  background: #F5F5F5;
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

