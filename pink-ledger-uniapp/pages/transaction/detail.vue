<template>
  <view class="container">
    <view v-if="transaction" class="detail-content">
      <!-- 金额显示 -->
      <view class="amount-section" :class="transaction.type">
        <text class="type-label">{{ transaction.type === 'income' ? '收入' : '支出' }}</text>
        <text class="amount">
          {{ transaction.type === 'income' ? '+' : '-' }}¥{{ transaction.amount }}
        </text>
      </view>
      
      <!-- 详细信息 -->
      <view class="info-section">
        <view class="info-item">
          <text class="info-label">分类</text>
          <view class="info-value">
            <text class="category-icon">{{ transaction.category.icon }}</text>
            <text class="category-name">{{ transaction.category.name }}</text>
          </view>
        </view>
        
        <view class="info-item">
          <text class="info-label">日期</text>
          <text class="info-value">{{ transaction.date }}</text>
        </view>
        
        <view class="info-item">
          <text class="info-label">账户</text>
          <text class="info-value">{{ getAccountLabel(transaction.accountType) }}</text>
        </view>
        
        <view class="info-item" v-if="transaction.description">
          <text class="info-label">备注</text>
          <text class="info-value">{{ transaction.description }}</text>
        </view>
        
        <view class="info-item">
          <text class="info-label">创建时间</text>
          <text class="info-value">{{ formatDateTime(transaction.createdAt) }}</text>
        </view>
      </view>
      
      <!-- 操作按钮 -->
      <view class="action-section">
        <button class="action-btn edit-btn" @click="handleEdit">
          编辑
        </button>
        <button class="action-btn delete-btn" @click="handleDelete">
          删除
        </button>
      </view>
    </view>
    
    <view v-else class="loading">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script>
import { getTransaction, deleteTransaction } from '@/api'
import { formatDate } from '@/utils/date.js'
import config from '@/config/index.js'

export default {
  data() {
    return {
      id: null,
      transaction: null,
      accountTypes: config.accountTypes
    }
  },
  onLoad(options) {
    if (options.id) {
      this.id = options.id
      this.loadDetail()
    }
  },
  methods: {
    // 加载详情
    async loadDetail() {
      try {
        const res = await getTransaction(this.id)
        this.transaction = res.data.transaction
      } catch (err) {
        console.error('加载详情失败:', err)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }
    },
    
    // 获取账户标签
    getAccountLabel(value) {
      const account = this.accountTypes.find(acc => acc.value === value)
      return account ? account.label : value
    },
    
    // 格式化日期时间
    formatDateTime(datetime) {
      return formatDate(datetime, 'YYYY-MM-DD HH:mm:ss')
    },
    
    // 编辑
    handleEdit() {
      uni.navigateTo({
        url: `/pages/transaction/edit?id=${this.id}`
      })
    },
    
    // 删除
    handleDelete() {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条账单吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              await deleteTransaction(this.id)
              uni.showToast({
                title: '删除成功',
                icon: 'success'
              })
              setTimeout(() => {
                uni.navigateBack()
              }, 1500)
            } catch (err) {
              console.error('删除失败:', err)
            }
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #F5F5F5;
}

/* 金额显示 */
.amount-section {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
  padding: 80rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.amount-section.income {
  background: linear-gradient(135deg, #06D6A0 0%, #26E5B0 100%);
}

.type-label {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 20rpx;
}

.amount {
  font-size: 80rpx;
  font-weight: bold;
  color: #fff;
}

/* 详细信息 */
.info-section {
  background: #fff;
  margin: 20rpx;
  border-radius: 20rpx;
  padding: 0 30rpx;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1px solid #F5F5F5;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  width: 150rpx;
  font-size: 28rpx;
  color: #666;
}

.info-value {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  text-align: right;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.category-icon {
  font-size: 32rpx;
  margin-right: 10rpx;
}

.category-name {
  font-size: 28rpx;
}

/* 操作按钮 */
.action-section {
  display: flex;
  padding: 40rpx 20rpx;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  height: 90rpx;
  border: none;
  border-radius: 45rpx;
  font-size: 32rpx;
  font-weight: bold;
}

.edit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.delete-btn {
  background: #fff;
  color: #FF6B6B;
  border: 2px solid #FF6B6B;
}

/* 加载状态 */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
  font-size: 28rpx;
  color: #999;
}
</style>

