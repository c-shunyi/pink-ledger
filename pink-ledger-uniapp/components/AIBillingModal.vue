<template>
  <view v-if="visible" class="ai-modal" @click="handleMaskClick">
    <view class="modal-card" :style="cardStyle" @click.stop>
      <view class="modal-header">
        <text class="modal-title">AI 智能记账</text>
        <view class="close-btn" @click="handleClose">
          <text class="close-icon">×</text>
        </view>
      </view>

      <view class="modal-body">
        <textarea
          class="input-area"
          v-model="inputText"
          placeholder="描述你的账单，AI 会自动帮你记账..."
          :maxlength="500"
          :auto-height="true"
          :focus="autoFocus"
          :adjust-position="!manualAdjust"
        />
      </view>

      <view class="modal-footer">
        <button
          class="submit-btn"
          @click="handleSubmit"
          :loading="loading"
          :disabled="!inputText.trim() || loading"
        >
          {{ loading ? '解析中...' : '开始记账' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit'])

const inputText = ref('')
const loading = ref(false)
const autoFocus = ref(false)
const keyboardHeight = ref(0)
const manualAdjust = ref(false)

const cardStyle = computed(() => {
  if (!manualAdjust.value || keyboardHeight.value <= 0) {
    return {}
  }

  return {
    bottom: `${keyboardHeight.value}px`
  }
})

watch(() => props.visible, (isVisible) => {
  if (isVisible) {
    inputText.value = ''
    autoFocus.value = true
  } else {
    autoFocus.value = false
    keyboardHeight.value = 0
  }
})

const handleKeyboardChange = (res) => {
  keyboardHeight.value = res?.height || 0
}

onMounted(() => {
  if (typeof uni?.onKeyboardHeightChange === 'function') {
    manualAdjust.value = true
    uni.onKeyboardHeightChange(handleKeyboardChange)
  }
})

onUnmounted(() => {
  if (typeof uni?.offKeyboardHeightChange === 'function') {
    uni.offKeyboardHeightChange(handleKeyboardChange)
  }
})

const handleMaskClick = () => {
  if (!loading.value) {
    emit('close')
  }
}

const handleClose = () => {
  if (!loading.value) {
    emit('close')
  }
}

const handleSubmit = () => {
  if (!inputText.value.trim() || loading.value) {
    return
  }

  emit('submit', inputText.value.trim(), (isLoading) => {
    loading.value = isLoading
  })
}
</script>

<style scoped>
.ai-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1000;
}

.modal-card {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 40rpx;
  width: calc(100% - 80rpx);
  max-width: 600rpx;
  margin: 0 auto;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);
  animation: slideUp 0.25s ease-out;
  transition: bottom 0.2s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(60rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1px solid #f0f0f0;
}

.modal-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}

.close-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f5f5f5;
}

.close-icon {
  font-size: 40rpx;
  color: #999;
  line-height: 1;
}

.modal-body {
  padding: 32rpx;
}

.tips {
  padding: 20rpx;
  background: #f7f7f9;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}

.tips-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}

.input-area {
  width: 100%;
  min-height: 160rpx;
  padding: 16rpx;
  background: #fff;
  border-radius: 14rpx;
  border: 1px solid #ececec;
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  box-sizing: border-box;
}

.char-count {
  text-align: right;
  margin-top: 12rpx;
}

.char-count text {
  font-size: 24rpx;
  color: #999;
}

.modal-footer {
  padding: 24rpx 32rpx 32rpx;
  border-top: 1px solid #f0f0f0;
}

.modal-footer button {
  width: 100%;
  height: 80rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
  border: none;
}

.modal-footer button::after {
  border: none;
}

.submit-btn {
  background: #6b72e8;
  color: #fff;
}

.submit-btn[disabled] {
  opacity: 0.6;
}
</style>
