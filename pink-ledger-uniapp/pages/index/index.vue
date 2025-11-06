<template>
  <view class="container">
    <!-- 头部统计卡片 -->
    <view class="header-card">
      <view class="month-selector">
        <text class="month-text">{{ currentMonth }}</text>
      </view>
      <view class="summary">
        <view class="summary-item">
          <text class="summary-label">收入</text>
          <text class="summary-value income">¥{{ summary.totalIncome }}</text>
        </view>
        <view class="summary-divider"></view>
        <view class="summary-item">
          <text class="summary-label">支出</text>
          <text class="summary-value expense">¥{{ summary.totalExpense }}</text>
        </view>
      </view>
      <view class="balance">
        <text class="balance-label">结余</text>
        <text class="balance-value">¥{{ summary.balance }}</text>
      </view>
    </view>
    
    <!-- 筛选条件 -->
    <view class="filter-bar">
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
    
    <!-- 账单列表 -->
    <scroll-view 
      class="transaction-list" 
      scroll-y 
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      :show-scrollbar="false"
    >
      <view v-if="groupedTransactions.length > 0">
        <view v-for="group in groupedTransactions" :key="group.date" class="date-group">
          <view class="date-header">
            <text class="date-text">{{ group.dateText }}</text>
            <text class="date-total">
              支出 ¥{{ group.expenseTotal }} | 收入 ¥{{ group.incomeTotal }}
            </text>
          </view>
          
          <view 
            v-for="item in group.transactions" 
            :key="item.id" 
            class="transaction-item"
            @click="goToDetail(item.id)"
          >
            <view class="transaction-icon">
              <text class="icon-text">{{ item.category.icon }}</text>
            </view>
            <view class="transaction-info">
              <text class="category-name">{{ item.category.name }}</text>
              <text class="description" v-if="item.description">{{ item.description }}</text>
            </view>
            <view class="transaction-amount">
              <text 
                class="amount" 
                :class="item.type"
              >
                {{ item.type === 'income' ? '+' : '-' }}¥{{ item.amount }}
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
    
    <!-- 添加按钮 -->
    <view class="add-btn" @click="goToAdd">
      <text class="add-icon">+</text>
    </view>
  </view>
</template>

<script>
import { getTransactions, getStatistics } from '@/utils/api.js'
import { getToken } from '@/utils/storage.js'
import { formatDate, getFriendlyDate, getMonthStart, getMonthEnd } from '@/utils/date.js'

export default {
  data() {
    return {
      filterType: 'all', // all, expense, income
      transactions: [],
      summary: {
        totalIncome: '0.00',
        totalExpense: '0.00',
        balance: '0.00'
      },
      currentMonth: '',
      page: 1,
      limit: 20,
      hasMore: true,
      refreshing: false,
      loading: false
    }
  },
  computed: {
    // 按日期分组的账单
    groupedTransactions() {
      const groups = {}
      
      this.transactions.forEach(item => {
        const date = item.date
        if (!groups[date]) {
          groups[date] = {
            date,
            dateText: getFriendlyDate(date),
            transactions: [],
            expenseTotal: 0,
            incomeTotal: 0
          }
        }
        
        groups[date].transactions.push(item)
        
        if (item.type === 'expense') {
          groups[date].expenseTotal += parseFloat(item.amount)
        } else {
          groups[date].incomeTotal += parseFloat(item.amount)
        }
      })
      
      // 转换为数组并格式化金额
      return Object.values(groups).map(group => ({
        ...group,
        expenseTotal: group.expenseTotal.toFixed(2),
        incomeTotal: group.incomeTotal.toFixed(2)
      }))
    }
  },
  onLoad() {
    // 检查登录状态
    const token = getToken()
    if (!token) {
      uni.reLaunch({
        url: '/pages/login/login'
      })
      return
    }
    
    this.initCurrentMonth()
    this.loadData()
  },
  onShow() {
    // 每次显示页面时刷新数据
    const token = getToken()
    if (token) {
      this.refreshData()
    }
  },
  methods: {
    // 初始化当前月份
    initCurrentMonth() {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      this.currentMonth = `${year}年${month}月`
    },
    
    // 加载数据
    async loadData() {
      if (this.loading) return
      
      try {
        this.loading = true
        
        const params = {
          page: this.page,
          limit: this.limit,
          startDate: getMonthStart(),
          endDate: getMonthEnd()
        }
        
        if (this.filterType !== 'all') {
          params.type = this.filterType
        }
        
        const res = await getTransactions(params)
        
        if (this.page === 1) {
          this.transactions = res.data.transactions
        } else {
          this.transactions = [...this.transactions, ...res.data.transactions]
        }
        
        this.hasMore = this.page < res.data.pagination.totalPages
        
        // 加载统计数据
        await this.loadStatistics()
      } catch (err) {
        console.error('加载数据失败:', err)
      } finally {
        this.loading = false
        this.refreshing = false
      }
    },
    
    // 加载统计数据
    async loadStatistics() {
      try {
        const res = await getStatistics({
          startDate: getMonthStart(),
          endDate: getMonthEnd()
        })
        
        this.summary = {
          totalIncome: res.data.summary.totalIncome.toFixed(2),
          totalExpense: res.data.summary.totalExpense.toFixed(2),
          balance: res.data.summary.balance.toFixed(2)
        }
      } catch (err) {
        console.error('加载统计数据失败:', err)
      }
    },
    
    // 刷新数据
    async refreshData() {
      this.page = 1
      this.hasMore = true
      await this.loadData()
    },
    
    // 下拉刷新
    onRefresh() {
      this.refreshing = true
      this.refreshData()
    },
    
    // 加载更多
    loadMore() {
      if (this.hasMore && !this.loading) {
        this.page++
        this.loadData()
      }
    },
    
    // 切换筛选类型
    changeFilter(type) {
      if (this.filterType === type) return
      
      this.filterType = type
      this.page = 1
      this.hasMore = true
      this.transactions = []
      this.loadData()
    },
    
    // 跳转到添加页面
    goToAdd() {
      uni.navigateTo({
        url: '/pages/transaction/add'
      })
    },
    
    // 跳转到详情页面
    goToDetail(id) {
      uni.navigateTo({
        url: `/pages/transaction/detail?id=${id}`
      })
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #F5F5F5;
  overflow-x: hidden;
}

/* 头部统计卡片 */
.header-card {
  background: linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 100%);
  padding: 60rpx 40rpx 40rpx;
  border-radius: 0 0 50rpx 50rpx;
}

.month-selector {
  display: flex;
  justify-content: center;
  margin-bottom: 40rpx;
}

.month-text {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.summary {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 30rpx;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.summary-label {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 10rpx;
}

.summary-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
}

.summary-divider {
  width: 2rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.3);
}

.balance {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
}

.balance-label {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-right: 20rpx;
}

.balance-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

/* 筛选条件 */
.filter-bar {
  display: flex;
  padding: 30rpx 40rpx;
  background: #fff;
  margin: 20rpx 30rpx;
  border-radius: 20rpx;
}

.filter-item {
  flex: 1;
  text-align: center;
  padding: 15rpx 0;
  font-size: 28rpx;
  color: #666;
  border-radius: 10rpx;
  transition: all 0.3s;
}

.filter-item.active {
  background: linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 100%);
  color: #fff;
  font-weight: bold;
}

/* 账单列表 */
.transaction-list {
  box-sizing: border-box;
  padding: 0 30rpx;
  /* 隐藏滚动条 */
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.transaction-list::-webkit-scrollbar {
  display: none;
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
}

.transaction-icon {
  width: 80rpx;
  height: 80rpx;
  background: #F5F5F5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.icon-text {
  font-size: 40rpx;
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

/* 添加按钮 */
.add-btn {
  position: fixed;
  right: 40rpx;
  bottom: 120rpx;
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 30rpx rgba(255, 154, 158, 0.5);
}

.add-icon {
  font-size: 60rpx;
  color: #fff;
  font-weight: bold;
}
</style>
