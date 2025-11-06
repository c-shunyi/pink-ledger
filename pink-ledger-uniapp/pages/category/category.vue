<template>
  <view class="container">
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
    <view class="category-list">
      <view 
        v-for="category in filteredCategories" 
        :key="category.id"
        class="category-item"
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
          <button class="action-btn edit" @click="editCategory(category)">
            编辑
          </button>
          <button class="action-btn delete" @click="deleteCategory(category)">
            删除
          </button>
        </view>
      </view>
      
      <view v-if="filteredCategories.length === 0" class="empty">
        <text>暂无分类</text>
      </view>
    </view>
    
    <!-- 添加按钮 -->
    <view class="add-btn" @click="addCategory">
      <text class="add-icon">+</text>
    </view>
  </view>
</template>

<script>
import { getCategories, deleteCategory as deleteCategoryApi } from '@/api'

export default {
  data() {
    return {
      currentType: 'expense',
      categories: []
    }
  },
  computed: {
    filteredCategories() {
      return this.categories.filter(cat => cat.type === this.currentType)
    }
  },
  onLoad() {
    this.loadCategories()
  },
  onShow() {
    this.loadCategories()
  },
  methods: {
    // 加载分类
    async loadCategories() {
      try {
        const res = await getCategories()
        this.categories = res.data.categories
      } catch (err) {
        console.error('加载分类失败:', err)
      }
    },
    
    // 切换类型
    changeType(type) {
      this.currentType = type
    },
    
    // 添加分类
    addCategory() {
      uni.navigateTo({
        url: `/pages/category/edit?type=${this.currentType}`
      })
    },
    
    // 编辑分类
    editCategory(category) {
      uni.navigateTo({
        url: `/pages/category/edit?id=${category.id}`
      })
    },
    
    // 删除分类
    deleteCategory(category) {
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
              this.loadCategories()
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
  padding-bottom: 120rpx;
}

/* 类型切换 */
.type-tabs {
  display: flex;
  background: #fff;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.type-tab {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #666;
  border-radius: 15rpx;
  transition: all 0.3s;
}

.type-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-weight: bold;
}

/* 分类列表 */
.category-list {
  padding: 0 20rpx;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 30rpx;
  border-radius: 20rpx;
  margin-bottom: 15rpx;
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
}

/* 添加按钮 */
.add-btn {
  position: fixed;
  right: 40rpx;
  bottom: 40rpx;
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 30rpx rgba(102, 126, 234, 0.5);
}

.add-icon {
  font-size: 60rpx;
  color: #fff;
  font-weight: bold;
}
</style>

