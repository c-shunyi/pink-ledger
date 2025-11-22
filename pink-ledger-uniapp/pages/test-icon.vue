<template>
  <view class="container">
    <text class="title">图标测试页面</text>
    
    <view class="test-section">
      <text class="section-title">测试1: 直接路径</text>
      <image class="test-img" src="/static/category-icon/rice.png" mode="aspectFit"></image>
    </view>
    
    <view class="test-section">
      <text class="section-title">测试2: 变量路径</text>
      <image class="test-img" :src="iconPath" mode="aspectFit"></image>
    </view>
    
    <view class="test-section">
      <text class="section-title">测试3: 条件判断</text>
      <image v-if="iconPath && iconPath.startsWith('/static/')" class="test-img" :src="iconPath" mode="aspectFit"></image>
      <text v-else>不是图片路径</text>
    </view>
    
    <view class="test-section">
      <text class="section-title">当前路径值</text>
      <text>{{ iconPath }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const iconPath = ref('/static/category-icon/rice.png')
</script>

<style scoped>
.container {
  padding: 40rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 40rpx;
}

.test-section {
  margin-bottom: 40rpx;
  padding: 30rpx;
  background: #fff;
  border-radius: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}

.test-img {
  width: 100rpx;
  height: 100rpx;
  background: #f5f5f5;
  border: 2rpx solid #ddd;
}
</style>
