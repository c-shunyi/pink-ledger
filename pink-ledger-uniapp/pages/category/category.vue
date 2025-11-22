<template>
  <view class="container"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <!-- 类型切换 -->
    <view class="type-tabs">
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
          :class="{ 
            'item-show': showContent,
            'dragging-source': dragState.dragging && dragState.dragIndex === index
          }"
          :style="getItemStyle(index)"
          @touchmove="onItemTouchMove($event, index)"
          @touchend="onItemTouchEnd($event, index)"
        >
          <view 
            class="drag-handle"
            @touchstart="onItemTouchStart($event, index)"
          >
            <uni-icons type="bars" size="20" color="#ccc"></uni-icons>
          </view>
          <view class="category-info">
            <view class="category-icon" :style="{ background: category.color || '#F5F5F5' }">
              <image v-if="category.icon && category.icon.startsWith('/static/')" class="icon-img" :src="category.icon" mode="aspectFit"></image>
              <text v-else class="icon-text">{{ category.icon }}</text>
            </view>
            <view class="category-text">
              <text class="category-name">{{ category.name }}</text>
              <text class="category-tag" v-if="category.isSystem">系统</text>
              <text class="category-tag custom" v-else>自定义</text>
            </view>
          </view>
          <view class="category-actions" v-if="!category.isSystem">
            <view class="action-btn edit" @click.stop="editCategory(category)">
              <uni-icons type="compose" size="16" color="#fff"></uni-icons>
            </view>
            <view class="action-btn delete" @click.stop="deleteCategory(category)">
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
import { getCategories, deleteCategory as deleteCategoryApi, updateCategoryOrder } from '@/api'

// 响应式数据
const currentType = ref('expense')
const categories = ref([])
const showContent = ref(true)

// 触摸滑动相关（用于类型切换）
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchMoveX = ref(0)
const touchMoveTime = ref(0) // 节流控制

// 拖拽排序相关
const dragState = ref({
  dragging: false,
  dragIndex: -1,
  dragOverIndex: -1,
  dragOffset: 0,
  startY: 0,
  currentY: 0,
  previewY: 0,
  itemHeight: 0
})

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

// 获取元素样式
const getItemStyle = (index) => {
  const style = {
    transitionDelay: dragState.value.dragging ? '0s' : (index * 0.05) + 's',
    transition: dragState.value.dragging ? 'transform 0.2s ease-out' : 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
  }
  
  if (!dragState.value.dragging) {
    return style
  }
  
  const { dragIndex, dragOverIndex, dragOffset } = dragState.value
  // 每个分类项占据的总高度计算：
  // padding: 30rpx (上) + 30rpx (下) = 60rpx
  // 内容高度: 约 80rpx (图标60rpx + 文字等)
  // margin-bottom: 15rpx
  // 总计: 60 + 80 + 15 = 155rpx
  const itemHeight = 155 // rpx，每个分类项占据的总高度（包括margin）
  
  // 被拖动的元素跟随手指移动
  if (index === dragIndex) {
    // 获取系统信息，计算px到rpx的转换比例
    const systemInfo = uni.getSystemInfoSync()
    const pixelRatio = systemInfo.pixelRatio || 2
    const screenWidth = systemInfo.windowWidth
    // rpx = px * (750 / screenWidth)
    const rpxRatio = 750 / screenWidth
    const offsetRpx = dragOffset * rpxRatio
    style.transform = `translateY(${offsetRpx}rpx)`
    style.zIndex = 1000
    style.opacity = '0.9'
    return style
  }
  
  // 计算其他元素需要移动的距离
  if (dragOverIndex >= 0 && dragIndex >= 0) {
    if (index > dragIndex && index <= dragOverIndex) {
      // 向下拖动，中间的元素向上移动一个位置
      style.transform = `translateY(-${itemHeight}rpx)`
    } else if (index < dragIndex && index >= dragOverIndex) {
      // 向上拖动，中间的元素向下移动一个位置
      style.transform = `translateY(${itemHeight}rpx)`
    } else {
      style.transform = 'translateY(0)'
    }
  }
  
  return style
}

// 拖拽排序相关
const onItemTouchStart = (e, index) => {
  // 阻止事件冒泡，避免触发类型切换
  e.stopPropagation()
  
  const touch = e.touches[0]
  const itemHeight = 120 // rpx，每个分类项的高度
  
  dragState.value = {
    dragging: true,
    dragIndex: index,
    dragOverIndex: -1,
    dragOffset: 0,
    startY: touch.clientY,
    currentY: touch.clientY,
    previewY: touch.clientY,
    itemHeight: itemHeight
  }
}

const onItemTouchMove = (e, index) => {
  // 只有在拖拽状态激活时才响应移动事件
  if (!dragState.value.dragging) return
  
  const dragIndex = dragState.value.dragIndex
  if (dragIndex === -1) return
  
  e.stopPropagation()
  e.preventDefault()
  
  const currentY = e.touches[0].clientY
  const offset = currentY - dragState.value.startY
  dragState.value.dragOffset = offset
  dragState.value.currentY = currentY
  dragState.value.previewY = currentY
  
  // 获取系统信息，计算rpx到px的转换
  const systemInfo = uni.getSystemInfoSync()
  const screenWidth = systemInfo.windowWidth
  // px = rpx * (screenWidth / 750)
  const pxRatio = screenWidth / 750
  
  // 每个分类项占据的总高度（rpx转px）
  const itemHeightRpx = 155 // rpx，与 getItemStyle 中的值保持一致
  const itemHeightPx = itemHeightRpx * pxRatio
  
  // 需要移动超过 70% 的高度才切换位置，避免过早触发
  const threshold = itemHeightPx * 0.7
  
  let newIndex = dragIndex
  if (Math.abs(offset) > threshold) {
    // 计算应该移动到哪个位置
    const direction = offset > 0 ? 1 : -1
    const steps = Math.floor(Math.abs(offset) / itemHeightPx)
    newIndex = dragIndex + (direction * steps)
    newIndex = Math.max(0, Math.min(newIndex, filteredCategories.value.length - 1))
  }
  
  // 只有当新索引确实改变时才更新
  if (newIndex !== dragIndex && newIndex >= 0 && newIndex < filteredCategories.value.length) {
    dragState.value.dragOverIndex = newIndex
  } else {
    dragState.value.dragOverIndex = -1
  }
}

const onItemTouchEnd = async (e, index) => {
  // 只有在拖拽状态激活时才响应结束事件
  if (!dragState.value.dragging) return
  
  e.stopPropagation()
  
  const { dragIndex, dragOverIndex } = dragState.value
  
  // 先重置拖拽状态，避免样式混乱
  const wasDragged = dragOverIndex >= 0 && dragOverIndex !== dragIndex
  dragState.value = {
    dragging: false,
    dragIndex: -1,
    dragOverIndex: -1,
    dragOffset: 0,
    startY: 0,
    currentY: 0,
    previewY: 0,
    itemHeight: 0
  }
  
  // 如果拖拽到了新位置，更新排序
  if (wasDragged) {
    const filtered = filteredCategories.value
    const newCategories = [...filtered]
    const [movedItem] = newCategories.splice(dragIndex, 1)
    newCategories.splice(dragOverIndex, 0, movedItem)
    
    // 获取新的分类ID顺序
    const filteredIds = newCategories.map(cat => cat.id)
    
    // 先更新本地数据，提供即时反馈
    const allCategories = [...categories.value]
    const filteredByType = allCategories.filter(cat => cat.type === currentType.value)
    const otherCategories = allCategories.filter(cat => cat.type !== currentType.value)
    
    // 更新当前类型的分类顺序
    const updatedFiltered = newCategories.map((cat, idx) => {
      const found = filteredByType.find(c => c.id === cat.id)
      return found ? { ...found, sortOrder: idx + 1 } : cat
    })
    
    categories.value = [...otherCategories, ...updatedFiltered]
    
    // 调用API更新排序
    try {
      await updateCategoryOrder(filteredIds)
      // 重新加载分类列表以确保数据同步
      await loadCategories()
    } catch (err) {
      console.error('更新排序失败:', err)
      uni.showToast({
        title: '排序更新失败',
        icon: 'none'
      })
      // 失败时重新加载
      loadCategories()
    }
  }
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
  gap: 20rpx;
  z-index: 100;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.type-tab {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #666;
  background: #f5f5f5;
  border-radius: 15rpx;
  transition: all 0.3s;
}

.type-tab.active {
  color: #fff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  position: relative;
  touch-action: pan-y;
}

.category-item.item-show {
  transform: translateY(0);
  opacity: 1;
}



.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60rpx;
  height: 60rpx;
  margin-right: 20rpx;
  padding: 10rpx;
  touch-action: none;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
}

.drag-handle:active {
  cursor: grabbing;
  opacity: 0.7;
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

.category-icon .icon-img {
  width: 50rpx;
  height: 50rpx;
}

.category-icon .icon-text {
  font-size: 40rpx;
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

