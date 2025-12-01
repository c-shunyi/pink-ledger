<template>
  <view class="top-container">
    <view class="range-card">
      <text class="range-title">{{ pageTitle }}</text>
      <text class="range-desc">{{ rangeText }}</text>
      <text class="range-tip">{{ type === 'expense' ? '金额越大表示支出越高' : '金额越大表示收入越高' }}</text>
    </view>

    <view v-if="loading" class="status-text">加载中...</view>
    <view v-else-if="records.length === 0" class="status-text">暂无记录</view>
    <view v-else class="top-list">
      <view 
        v-for="(item, index) in records"
        :key="item.id"
        class="top-item"
      >
        <view class="rank" :class="{ highlight: index < 3 }">
          {{ index + 1 }}
        </view>
        <view class="item-icon">
          <image 
            v-if="item.category?.icon && item.category.icon.startsWith('/static/')"
            :src="item.category.icon"
            class="icon-img"
            mode="aspectFit"
          ></image>
          <text v-else class="icon-text">{{ item.category?.icon || '·' }}</text>
        </view>
        <view class="item-info">
          <text class="item-name">{{ item.category?.name || '未分类' }}</text>
          <text class="item-date">{{ item.date }}</text>
        </view>
        <view class="item-amount" :class="type">
          ¥{{ formatAmount(item.amount) }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getTopTransactions } from '@/api'
import { useTheme } from '@/composables/useTheme.js'

const { themeColors } = useTheme()

const type = ref('expense')
const pageTitle = ref('最高支出')
const range = ref({
  startDate: '',
  endDate: ''
})
const limit = ref(10)
const loading = ref(false)
const records = ref([])

const rangeText = computed(() => {
  if (range.value.startDate && range.value.endDate) {
    return `${range.value.startDate} ~ ${range.value.endDate}`
  }
  return '所有时间'
})

const formatAmount = (value) => {
  const num = Number(value) || 0
  return num.toFixed(2)
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      type: type.value,
      limit: limit.value
    }
    if (range.value.startDate) params.startDate = range.value.startDate
    if (range.value.endDate) params.endDate = range.value.endDate

    const res = await getTopTransactions(params)
    records.value = res.data.transactions || []
  } catch (error) {
    console.error('加载高金额账单失败:', error)
  } finally {
    loading.value = false
  }
}

onLoad((options) => {
  if (options?.type === 'income') {
    type.value = 'income'
    pageTitle.value = '最高收入'
  } else {
    type.value = 'expense'
    pageTitle.value = '最高支出'
  }

  if (options?.startDate) {
    range.value.startDate = options.startDate
  }
  if (options?.endDate) {
    range.value.endDate = options.endDate
  }
  if (options?.limit) {
    const parsed = parseInt(options.limit)
    if (!Number.isNaN(parsed)) {
      limit.value = parsed
    }
  }

  uni.setNavigationBarTitle({
    title: pageTitle.value
  })

  loadData()
})
</script>

<style scoped>
.top-container {
  min-height: 100vh;
  background: #F5F5F5;
  padding: 30rpx 20rpx 60rpx;
  box-sizing: border-box;
}

.range-card {
  background: v-bind('themeColors.gradient');
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
  color: #fff;
  margin-bottom: 30rpx;
  box-shadow: 0 20rpx 30rpx rgba(118, 75, 162, 0.25);
}

.range-title {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 15rpx;
}

.range-desc {
  font-size: 26rpx;
  opacity: 0.9;
}

.range-tip {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  opacity: 0.8;
}

.status-text {
  text-align: center;
  color: #999;
  font-size: 28rpx;
  padding: 80rpx 0;
}

.top-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.top-item {
  background: #fff;
  border-radius: 20rpx;
  padding: 20rpx 24rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.04);
}

.rank {
  width: 50rpx;
  text-align: center;
  font-size: 32rpx;
  font-weight: bold;
  color: #999;
}

.rank.highlight {
  color: v-bind('themeColors.text');
}

.item-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  background: #F7F7F7;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 20rpx;
}

.icon-img {
  width: 48rpx;
  height: 48rpx;
}

.icon-text {
  font-size: 36rpx;
  color: #555;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.item-date {
  font-size: 24rpx;
  color: #999;
  margin-top: 6rpx;
}

.item-amount {
  font-size: 34rpx;
  font-weight: bold;
}

.item-amount.expense {
  color: #FF6B6B;
}

.item-amount.income {
  color: #06D6A0;
}
</style>
