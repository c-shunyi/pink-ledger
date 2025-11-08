<template>
  <view class="container"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <!-- 类型切换 -->
    <view class="type-tabs">
      <!-- 滑块背景 -->
      <view class="tab-slider" :class="{ 'slide-right': currentType === 'income' }"></view>
      
      <view 
        class="type-tab" 
        :class="{ active: currentType === 'expense' }"
        @click="changeType('expense')"
      >
        支出分类
      </view>
      <view 
        class="type-tab" 
        :class="{ active: currentType === 'income' }"
        @click="changeType('income')"
      >
        收入分类
      </view>
    </view>
    
    <!-- 分类列表 -->
    <scroll-view 
      class="category-list" 
      scroll-y 
      :show-scrollbar="false"
    >
      <view class="category-list-content" :class="{ 'content-show': showContent }">
        <view 
          v-for="(category, index) in filteredCategories" 
          :key="category.id"
          class="category-item"
          :class="{ 'item-show': showContent }"
          :style="{ transitionDelay: (index * 0.05) + 's' }"
        >
          <view class="category-info">
            <text class="category-icon" :style="{ background: category.color || '#F5F5F5' }">
              {{ category.icon }}
            </text>
            <view class="category-text">
              <text class="category-name">{{ category.name }}</text>
              <text class="category-tag" v-if="category.isSystem">系统</text>
              <text class="category-tag custom" v-else>自定义</text>
            </view>
          </view>
          <view class="category-actions" v-if="!category.isSystem">
            <view class="action-btn edit" @click="editCategory(category)">
              <uni-icons type="compose" size="16" color="#fff"></uni-icons>
            </view>
            <view class="action-btn delete" @click="deleteCategory(category)">
              <uni-icons type="trash" size="16" color="#FF6B6B"></uni-icons>
            </view>
          </view>
        </view>
        
        <view 
          v-if="filteredCategories.length === 0" 
          class="empty"
          :class="{ 'item-show': showContent }"
        >
          <text>暂无分类</text>
        </view>
      </view>
    </scroll-view>
    
    <!-- 添加按钮 -->
    <view class="add-btn" @click="addCategory">
      <uni-icons type="plusempty" size="40" color="#fff"></uni-icons>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getCategories, deleteCategory as deleteCategoryApi } from '@/api'

// 响应式数据
const currentType = ref('expense')
const categories = ref([])
const showContent = ref(true)

// 触摸滑动相关
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchMoveX = ref(0)
const touchMoveTime = ref(0) // 节流控制

// 计算属性
const filteredCategories = computed(() => {
  return categories.value.filter(cat => cat.type === currentType.value)
})

// 加载分类
const loadCategories = async () => {
  try {
    const res = await getCategories()
    categories.value = res.data.categories
  } catch (err) {
    console.error('加载分类失败:', err)
  }
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
  // 1. 水平滑动距离至少80px
  // 2. 水平滑动距离必须是垂直滑动距离的2倍以上
  // 3. 垂直滑动距离不能超过50px
  if (Math.abs(deltaX) > 80 && Math.abs(deltaX) > deltaY * 2 && deltaY < 50) {
    if (deltaX > 0) {
      // 向右滑动，切换到支出
      if (currentType.value === 'income') {
        changeType('expense')
      }
    } else {
      // 向左滑动，切换到收入
      if (currentType.value === 'expense') {
        changeType('income')
      }
    }
  }
  
  // 重置触摸位置
  touchStartX.value = 0
  touchStartY.value = 0
  touchMoveX.value = 0
}

// 切换类型
const changeType = (type) => {
  if (currentType.value === type) return
  
  // 先隐藏内容
  showContent.value = false
  
  // 等待动画结束后切换类型
  setTimeout(() => {
    currentType.value = type
    
    // 延迟显示新内容，触发下拉动画
    setTimeout(() => {
      showContent.value = true
    }, 50)
  }, 100)
}

// 添加分类
const addCategory = () => {
  uni.navigateTo({
    url: `/pages/category/edit?type=${currentType.value}`
  })
}

// 编辑分类
const editCategory = (category) => {
  uni.navigateTo({
    url: `/pages/category/edit?id=${category.id}`
  })
}

// 删除分类
const deleteCategory = (category) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除分类"${category.name}"吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          await deleteCategoryApi(category.id)
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          })
          loadCategories()
        } catch (err) {
          console.error('删除失败:', err)
        }
      }
    }
  })
}

// 生命周期钩子
onLoad(() => {
  loadCategories()
})

onShow(() => {
  loadCategories()
})
</script>

<style scoped>
.container {
  height: 100vh;
  background: #F5F5F5;
}

/* 类型切换 */
.type-tabs {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  background: #fff;
  padding: 20rpx;
  z-index: 100;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

/* 滑块背景 */
.tab-slider {
  position: absolute;
  top: 20rpx;
  left: 20rpx;
  right: 50%;
  height: calc(100% - 40rpx);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15rpx;
  transition: all 0.4s cubic-bezier(0.1, 0.7, 0.3, 0.9);
  z-index: 1;
}

.tab-slider.slide-right {
  left: 50%;
  right: 20rpx;
}

.type-tab {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #666;
  border-radius: 15rpx;
  transition: all 0.3s;
  position: relative;
  z-index: 2;
}

.type-tab.active {
  color: #fff;
  font-weight: bold;
}

/* 分类列表 */
.category-list {
  position: fixed;
  top: 110rpx;
  left: 0;
  right: 0;
  bottom: 0;
}

.category-list-content {
  padding: 20rpx;
  padding-bottom: 240rpx;
  transform: translateY(-50rpx);
  opacity: 0;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.category-list-content.content-show {
  transform: translateY(0);
  opacity: 1;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 30rpx;
  border-radius: 20rpx;
  margin-bottom: 15rpx;
  transform: translateY(-100rpx);
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.category-item.item-show {
  transform: translateY(0);
  opacity: 1;
}

.category-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.category-icon {
  width: 80rpx;
  height: 80rpx;
  background: #F5F5F5;
  border-radius: 20%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-right: 20rpx;
}

.category-text {
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.category-name {
  font-size: 30rpx;
  color: #333;
}

.category-tag {
  padding: 5rpx 15rpx;
  background: #E8F5E9;
  color: #4CAF50;
  font-size: 22rpx;
  border-radius: 10rpx;
}

.category-tag.custom {
  background: #E3F2FD;
  color: #2196F3;
}

.category-actions {
  display: flex;
  gap: 15rpx;
}

.action-btn {
  padding: 10rpx 25rpx;
  border: none;
  border-radius: 10rpx;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.action-btn.edit {
  background: #667eea;
  color: #fff;
}

.action-btn.delete {
  background: #fff;
  color: #FF6B6B;
  border: 2rpx solid #FF6B6B;
}

.empty {
  text-align: center;
  padding: 150rpx 0;
  font-size: 28rpx;
  color: #999;
  transform: translateY(-30rpx);
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.empty.item-show {
  transform: translateY(0);
  opacity: 1;
}

/* 添加按钮 */
.add-btn {
  position: fixed;
  right: 40rpx;
  bottom: 120rpx;
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 30rpx rgba(102, 126, 234, 0.5);
}
</style>

