<template>
  <view class="container">
    <view v-if="transaction" class="detail-content">
      <!-- 金额显示 -->
      <view class="amount-section" :class="transaction.type">
        <text class="type-label">{{ transaction.type === 'income' ? '收入' : '支出' }}</text>
        <text class="amount">
          {{ transaction.type === 'income' ? '+' : '-' }}{{ transaction.amount }}
        </text>
      </view>
      
      <!-- 详细信息 -->
      <view class="info-section">
        <view class="info-item">
          <text class="info-label">分类</text>
          <view class="info-value">
            <view class="category-icon-wrapper" :style="{ background: transaction.category.color || '#F5F5F5' }">
              <image v-if="transaction.category.icon && transaction.category.icon.startsWith('/static/')" class="category-icon-img" :src="transaction.category.icon" mode="aspectFit"></image>
              <text v-else class="category-icon">{{ transaction.category.icon }}</text>
            </view>
            <text class="category-name">{{ transaction.category.name }}</text>
          </view>
        </view>
        
        <view class="info-item">
          <text class="info-label">日期</text>
          <text class="info-value">{{ transaction.date }}</text>
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
        <button class="action-btn edit-btn" @click="handleShowModal">
          <view class="btn-content">
            <text class="btn-text">编辑</text>
          </view>
        </button>
        <button class="action-btn delete-btn" @click="handleDelete">
          <view class="btn-content">
            <text class="btn-text">删除</text>
          </view>
        </button>
      </view>
    </view>
    
    <view v-else class="loading">
      <text>加载中...</text>
    </view>
    
    <!-- 编辑弹窗 -->
    <view v-if="showEditModal" class="modal-overlay" @click="showEditModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">编辑账单</text>
          <text class="modal-close" @click="showEditModal = false">✕</text>
        </view>
        
        <view class="modal-body">
          <!-- 金额 -->
          <view class="edit-item">
            <text class="edit-label">金额</text>
            <input 
              class="edit-input" 
              v-model="editForm.amount"
              type="digit"
              placeholder="请输入金额"
            />
          </view>
          
          <!-- 日期 -->
          <picker
            mode="date"
            :value="editForm.date"
            @change="onEditDateChange"
          >
            <view class="edit-item">
              <text class="edit-label">日期</text>
              <text class="edit-value">{{ editForm.date }}</text>
            </view>
          </picker>
          
          <!-- 备注 -->
          <view class="edit-item">
            <text class="edit-label">备注</text>
            <input 
              class="edit-input" 
              v-model="editForm.description"
              placeholder="请输入备注"
            />
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="modal-btn cancel-btn" @click="showEditModal = false">
            <text class="btn-text">取消</text>
          </button>
          <button class="modal-btn confirm-btn" @click="handleConfirmEdit" :loading="editLoading">
            <text class="btn-text">确定</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getTransaction, deleteTransaction, updateTransaction } from '@/api'
import { formatDate } from '@/utils/date.js'
import { useTheme } from '@/composables/useTheme.js'

// 使用主题
const { themeColors } = useTheme()

// 响应式数据
const id = ref(null)
const transaction = ref(null)
const showEditModal = ref(false)
const editLoading = ref(false)

// 编辑表单
const editForm = reactive({
  amount: '',
  date: '',
  description: ''
})

// 加载详情
const loadDetail = async () => {
  try {
    const res = await getTransaction(id.value)
    transaction.value = res.data.transaction
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
}

// 格式化日期时间
const formatDateTime = (datetime) => {
  return formatDate(datetime, 'YYYY-MM-DD HH:mm:ss')
}

// 初始化编辑表单
const initEditForm = () => {
  editForm.amount = transaction.value.amount
  editForm.date = transaction.value.date
  editForm.description = transaction.value.description || ''
}

// 日期改变
const onEditDateChange = (e) => {
  editForm.date = e.detail.value
}

// 确认编辑
const handleConfirmEdit = async () => {
  // 验证
  if (!editForm.amount || parseFloat(editForm.amount) <= 0) {
    uni.showToast({
      title: '请输入有效金额',
      icon: 'none'
    })
    return
  }
  
  try {
    editLoading.value = true
    await updateTransaction(id.value, {
      amount: editForm.amount,
      date: editForm.date,
      description: editForm.description
    })
    
    uni.showToast({
      title: '修改成功',
      icon: 'success'
    })
    
    showEditModal.value = false
    
    // 重新加载详情
    await loadDetail()
  } catch (err) {
    console.error('修改失败:', err)
    uni.showToast({
      title: '修改失败',
      icon: 'none'
    })
  } finally {
    editLoading.value = false
  }
}

// 删除
const handleDelete = async () => {
  uni.showModal({
    title: '确认删除',
    content: '删除后无法恢复，确定要删除这条账单吗？',
    confirmColor: '#FF6B6B',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({
            title: '删除中...',
            mask: true
          })

          await deleteTransaction(id.value)

          uni.hideLoading()
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          })

          setTimeout(() => {
            uni.navigateBack()
          }, 500)
        } catch (err) {
          console.error('删除失败:', err)
          uni.hideLoading()
          uni.showToast({
            title: '删除失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

// 生命周期
onLoad((options) => {
  if (options.id) {
    id.value = options.id
    loadDetail()
  }
})

// 监听弹窗打开，初始化表单
const handleShowModal = () => {
  showEditModal.value = true
  initEditForm()
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #F5F5F5;
}

/* 金额显示 */
.amount-section {
  background: v-bind('themeColors.gradient');
  padding: 80rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.type-label {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
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

.category-icon-wrapper {
  width: 60rpx;
  height: 60rpx;
  border-radius: 20%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10rpx;
}

.category-icon {
  font-size: 32rpx;
}

.category-icon-img {
  width: 40rpx;
  height: 40rpx;
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
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.action-btn::after {
  border: none;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
}

.btn-text {
  font-size: 32rpx;
  font-weight: bold;
}

.edit-btn {
  background: v-bind('themeColors.gradient');
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

/* 编辑弹窗 */
.modal-overlay {
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

.modal-content {
  width: 600rpx;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1px solid #F5F5F5;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.modal-close {
  font-size: 40rpx;
  color: #999;
  padding: 0 10rpx;
}

.modal-body {
  padding: 20rpx 30rpx;
  max-height: 800rpx;
  overflow-y: auto;
}

.edit-item {
  display: flex;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1px solid #F5F5F5;
}

.edit-item:last-child {
  border-bottom: none;
}

.edit-label {
  width: 120rpx;
  font-size: 28rpx;
  color: #333;
  flex-shrink: 0;
}

.edit-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  text-align: right;
}

.edit-value {
  flex: 1;
  font-size: 28rpx;
  color: #666;
  text-align: right;
}

.modal-footer {
  display: flex;
  padding: 20rpx;
  gap: 20rpx;
  border-top: 1px solid #F5F5F5;
}

.modal-btn {
  flex: 1;
  height: 80rpx;
  border: none;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  line-height: 80rpx;
}

.modal-btn::after {
  border: none;
}

.cancel-btn {
  background: #F5F5F5;
  color: #666;
}

.confirm-btn {
  background: v-bind('themeColors.gradient');
  color: #fff;
}

.modal-btn[loading] {
  opacity: 0.7;
}
</style>

