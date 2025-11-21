<template>
  <!-- 遮罩层 -->
  <view
    class="keyboard-overlay"
    :class="{ show: visible }"
    @click="close"
    v-if="visible"
  ></view>

  <!-- 键盘弹窗 -->
  <view class="keyboard-popup" :class="{ show: visible }">
    <!-- 金额显示和编辑区域 -->
    <view class="amount-editor">
      <view class="amount-display-wrapper">
        <view class="input-wrapper">
          <text
            class="amount-display-text"
            :style="{ fontSize: inputFontSize }"
          >{{ displayValue || '0' }}</text>
        </view>
      </view>
      <text class="expression-text" v-if="previewResult">= {{ previewResult }}</text>
    </view>

    <!-- 键盘区域 -->
    <view class="keyboard">
      <view class="keyboard-main">
        <!-- 左侧数字键盘 -->
        <view class="number-keys">
          <view class="keyboard-row" v-for="(row, rowIndex) in numberKeys" :key="rowIndex">
            <view
              v-for="key in row"
              :key="key.value"
              class="key-item"
              :class="[key.type]"
              @tap.stop="handleKeyPress(key)"
            >
              <text class="key-text">{{ key.label }}</text>
            </view>
          </view>
        </view>

        <!-- 右侧运算和功能键 -->
        <view class="function-keys">
          <view
            v-for="key in functionKeys"
            :key="key.value"
            class="key-item function"
            :class="key.type"
            @tap.stop="handleKeyPress(key)"
          >
            <text class="key-text">{{ key.label }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'update:visible', 'close'])

// 当前显示的值
const displayValue = ref('')
// 保存原始公式用于显示（点击等号后）
const expression = ref('')
// 预览计算结果
const previewResult = ref('')

// 动态字体大小（只缩小一次）
const inputFontSize = computed(() => {
  const length = displayValue.value.length
  if (length <= 18) {
    return '60rpx'
  } else {
    return '45rpx'
  }
})

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  displayValue.value = newVal || ''
})

// 监听键盘显示状态
watch(() => props.visible, (newVal) => {
  if (newVal) {
    displayValue.value = props.modelValue || ''
    expression.value = ''
    previewResult.value = ''
  }
})

// 监听 displayValue 变化，实时计算预览结果
watch(displayValue, (newVal) => {
  // 检查是否包含运算符
  const hasOperator = /[\+\-\*\/]/.test(newVal)

  if (!hasOperator || !newVal) {
    previewResult.value = ''
    return
  }

  // 准备计算的值
  let value = newVal

  // 如果值以小数点结尾，先补0
  if (value.endsWith('.')) {
    value = value + '0'
  }

  // 移除末尾的运算符（如果有）
  const cleanValue = value.replace(/\s*[\+\-\*\/×÷]\s*$/, '')

  // 如果清理后还有运算符，尝试计算
  if (/[\+\-\*\/]/.test(cleanValue)) {
    try {
      const result = calculateExpression(cleanValue)
      if (result !== null) {
        previewResult.value = result.toString()
      } else {
        previewResult.value = ''
      }
    } catch (err) {
      previewResult.value = ''
    }
  } else {
    previewResult.value = ''
  }
})

// 数字键盘布局（左侧）
const numberKeys = [
  [
    { label: '+', value: '+', type: 'operator' },
    { label: '-', value: '-', type: 'operator' },
    { label: '×', value: '*', type: 'operator' },
    { label: '÷', value: '/', type: 'operator' }
  ],
  [
    { label: '1', value: '1', type: 'number' },
    { label: '2', value: '2', type: 'number' },
    { label: '3', value: '3', type: 'number' }
  ],
  [
    { label: '4', value: '4', type: 'number' },
    { label: '5', value: '5', type: 'number' },
    { label: '6', value: '6', type: 'number' }
  ],
  [
    { label: '7', value: '7', type: 'number' },
    { label: '8', value: '8', type: 'number' },
    { label: '9', value: '9', type: 'number' }
  ],
  [
    { label: '.', value: '.', type: 'dot' },
    { label: '0', value: '0', type: 'number' },
    { label: '00', value: '00', type: 'number' }
  ]
]

// 功能键（右侧）
const functionKeys = [
  { label: '删除', value: 'delete', type: 'delete' },
  { label: '=', value: '=', type: 'equals' },
  { label: '完成', value: 'done', type: 'done' }
]

// 处理按键
const handleKeyPress = (key) => {
  if (key.value === 'delete') {
    handleDelete()
  } else if (key.value === '=') {
    handleEquals()
  } else if (key.value === 'done') {
    close()
  } else if (['+', '-', '*', '/'].includes(key.value)) {
    handleOperator(key.value)
  } else {
    handleNumber(key.value)
  }
}

// 处理数字输入
const handleNumber = (num) => {
  const value = displayValue.value

  // 检查小数点
  if (num === '.') {
    // 获取当前正在输入的数字（最后一个运算符之后的部分）
    const operators = ['+', '-', '*', '/']
    let currentNumber = value
    for (const op of operators) {
      const lastIndex = value.lastIndexOf(` ${op} `)
      if (lastIndex !== -1) {
        currentNumber = value.substring(lastIndex + 3) // 跳过 " op "
        break
      }
    }

    // 如果当前数字已经有小数点，不允许再输入
    if (currentNumber.includes('.')) {
      return
    }

    // 如果值为空或只有0，添加'0.'
    if (!value || value === '0') {
      displayValue.value = '0.'
    } else {
      displayValue.value = value + '.'
    }
  } else {
    // 检查小数位数限制
    const operators = ['+', '-', '*', '/']
    let currentNumber = value
    for (const op of operators) {
      const lastIndex = value.lastIndexOf(` ${op} `)
      if (lastIndex !== -1) {
        currentNumber = value.substring(lastIndex + 3)
        break
      }
    }

    // 如果当前数字已经有小数点，检查小数位数
    if (currentNumber.includes('.')) {
      const parts = currentNumber.split('.')
      if (parts[1] && parts[1].length >= 2) {
        return
      }
    }

    displayValue.value = value + num
  }

  emit('update:modelValue', displayValue.value)
}

// 处理删除
const handleDelete = () => {
  let value = displayValue.value
  if (value.length === 0) return

  // 检查是否以 " 运算符 " 结尾（空格+运算符+空格）
  const operatorPattern = /\s[\+\-\*\/]\s$/
  if (operatorPattern.test(value)) {
    // 删除整个运算符（包括前后空格）
    displayValue.value = value.replace(/\s[\+\-\*\/]\s$/, '')
  } else {
    // 普通删除，删除最后一个字符
    displayValue.value = value.slice(0, -1)
  }

  emit('update:modelValue', displayValue.value)
}

// 处理运算符
const handleOperator = (operator) => {
  let value = displayValue.value
  if (!value) return

  // 如果值以小数点结尾，先补0
  if (value.endsWith('.')) {
    value = value + '0'
  }

  // 检查是否已经有未完成的运算符（末尾是运算符）
  if (/[\+\-\*\/]\s*$/.test(value)) {
    // 替换最后的运算符
    displayValue.value = value.replace(/\s*[\+\-\*\/]\s*$/, '') + ' ' + operator + ' '
  } else {
    // 在值的末尾添加运算符
    displayValue.value = value + ' ' + operator + ' '
  }

  emit('update:modelValue', displayValue.value)
}

// 处理等号（计算结果）
const handleEquals = () => {
  let value = displayValue.value
  if (!value) return

  // 检查是否包含运算符
  const hasOperator = /[\+\-\*\/]/.test(value)
  if (!hasOperator) return

  // 如果值以小数点结尾，先补0
  if (value.endsWith('.')) {
    value = value + '0'
  }

  // 移除末尾的运算符（如果有）
  value = value.replace(/\s*[\+\-\*\/]\s*$/, '')

  try {
    const result = calculateExpression(value)
    if (result !== null) {
      expression.value = value
      displayValue.value = result.toString()
      previewResult.value = '' // 清空预览，因为已经计算完成
      emit('update:modelValue', result.toString())
    }
  } catch (err) {
    console.error('计算错误:', err)
  }
}

// 安全计算表达式
const calculateExpression = (expr) => {
  try {
    // 简单的表达式解析
    expr = expr.replace(/×/g, '*').replace(/÷/g, '/')

    // 分割表达式
    const tokens = expr.split(/([+\-*/])/).map(t => t.trim()).filter(t => t)

    if (tokens.length < 3) return null

    // 处理乘除（优先级高）
    let i = 0
    while (i < tokens.length) {
      if (tokens[i] === '*' || tokens[i] === '/') {
        const left = parseFloat(tokens[i - 1])
        const right = parseFloat(tokens[i + 1])

        if (isNaN(left) || isNaN(right)) return null
        if (tokens[i] === '/' && right === 0) return null

        const result = tokens[i] === '*' ? left * right : left / right
        tokens.splice(i - 1, 3, result.toString())
      } else {
        i++
      }
    }

    // 处理加减
    i = 0
    while (i < tokens.length) {
      if (tokens[i] === '+' || tokens[i] === '-') {
        const left = parseFloat(tokens[i - 1])
        const right = parseFloat(tokens[i + 1])

        if (isNaN(left) || isNaN(right)) return null

        const result = tokens[i] === '+' ? left + right : left - right
        tokens.splice(i - 1, 3, result.toString())
      } else {
        i++
      }
    }

    if (tokens.length === 1) {
      const finalResult = parseFloat(tokens[0])
      // 保留两位小数
      return Math.round(finalResult * 100) / 100
    }

    return null
  } catch (err) {
    return null
  }
}

// 关闭键盘
const close = () => {
  // 如果有未完成的表达式，自动计算
  let value = displayValue.value
  const hasOperator = /[\+\-\*\/×÷]/.test(value)

  if (hasOperator) {
    // 如果值以小数点结尾，先补0
    if (value.endsWith('.')) {
      value = value + '0'
    }

    // 移除末尾的运算符（如果有）
    value = value.replace(/\s*[\+\-\*\/×÷]\s*$/, '')

    try {
      const result = calculateExpression(value)
      if (result !== null) {
        displayValue.value = result.toString()
        emit('update:modelValue', result.toString())
      }
    } catch (err) {
      console.error('计算错误:', err)
    }
  } else {
    // 没有运算符，但如果以小数点结尾，也要补0
    if (value.endsWith('.')) {
      displayValue.value = value + '0'
      emit('update:modelValue', displayValue.value)
    }
  }

  emit('update:visible', false)
  emit('close')
}
</script>

<style scoped>
/* 遮罩层 */
.keyboard-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: 0;
  transition: opacity 0.3s;
}

.keyboard-overlay.show {
  opacity: 1;
}

/* 键盘弹窗 */
.keyboard-popup {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #E5E5E5;
  z-index: 1000;
  transform: translateY(100%);
  transition: transform 0.3s;
  padding-bottom: env(safe-area-inset-bottom);
}

.keyboard-popup.show {
  transform: translateY(0);
}

/* 金额编辑区域 */
.amount-editor {
  background: #fff;
  padding: 20rpx 30rpx 20rpx;
  border-bottom: 1rpx solid #E5E5E5;
  min-height: 150rpx;
}

.amount-display-wrapper {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10rpx;
  min-height: 100rpx;
}

.currency-symbol {
  font-size: 60rpx;
  color: #333;
  font-weight: bold;
  margin-right: 10rpx;
  line-height: 1.2;
  margin-top: 5rpx;
}

.input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.amount-display-text {
  color: #333;
  font-weight: bold;
  width: 100%;
  line-height: 1.4;
  word-wrap: break-word;
  word-break: break-all;
  transition: font-size 0.3s;
  display: block;
}

.expression-text {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}

/* 键盘区域 */
.keyboard {
  padding: 10rpx;
}

.keyboard-main {
  display: flex;
  gap: 10rpx;
}

/* 数字键盘区域 */
.number-keys {
  flex: 3;
}

.keyboard-row {
  display: flex;
  gap: 10rpx;
  margin-bottom: 10rpx;
}

.keyboard-row:last-child {
  margin-bottom: 0;
}

/* 功能键区域 */
.function-keys {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.key-item {
  flex: 1;
  height: 100rpx;
  background: #fff;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s;
  position: relative;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

.key-item:active {
  background: #F5F5F5;
  transform: scale(0.95);
}

.key-text {
  font-size: 36rpx;
  color: #333;
  font-weight: 500;
}

/* 功能键样式 */
.key-item.function {
  background: #F5F5F5;
}

.key-item.function .key-text {
  font-size: 32rpx;
  color: #666;
}

/* 运算符样式 */
.key-item.operator {
  background: #FFF3E0;
}

.key-item.operator:active {
  background: #FFE0B2;
}

.key-item.operator .key-text {
  font-size: 40rpx;
  color: #FF9800;
  font-weight: bold;
  line-height: 1;
}

/* 等号样式 */
.key-item.equals {
  background: #576B95;
}

.key-item.equals:active {
  background: #4A5E88;
}

.key-item.equals .key-text {
  font-size: 40rpx;
  color: #fff;
  font-weight: bold;
  line-height: 1;
}

/* 删除键样式 */
.key-item.delete .key-text {
  font-size: 28rpx;
  line-height: 1;
}

/* 完成按钮样式 */
.key-item.done {
  background: #06D6A0;
}

.key-item.done:active {
  background: #05C090;
}

.key-item.done .key-text {
  font-size: 32rpx;
  color: #fff;
  font-weight: bold;
  line-height: 1;
}

/* 小数点和双零 */
.key-item.dot .key-text {
  font-size: 48rpx;
  font-weight: bold;
}
</style>
