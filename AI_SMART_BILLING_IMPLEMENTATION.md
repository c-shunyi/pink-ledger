# AI 智能记账功能实现文档

## 功能概述

在首页添加账单按钮上方悬浮一个 AI 智能记账按钮，点击后弹出输入框，用户输入自然语言描述的账单（如"早餐花了25元，打车40元"），系统自动调用 AI 识别金额、分类、日期和备注，并创建多笔账单记录。

## 功能流程

```
用户点击 AI 按钮 
  ↓
弹出输入框（屏幕中间）
  ↓
用户输入自然语言账单描述
  ↓
调用后端 AI 接口解析
  ↓
后端调用 DeepSeek API 分析
  ↓
返回结构化账单数据
  ↓
前端批量创建账单
  ↓
显示成功提示并刷新列表
```

## 一、后端实现

### 1.1 创建 AI 控制器

**文件路径：** `pink-ledger-node/src/controllers/aiController.js`

```javascript
const { Category } = require('../models');
const { Op } = require('sequelize');
const sendResponse = require('../utils/response');
const https = require('https');

// AI 智能解析账单
exports.parseSmartBilling = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.userId;

    if (!text || text.trim().length === 0) {
      return sendResponse(res, {
        code: 400,
        msg: '请输入账单描述'
      });
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      return sendResponse(res, {
        code: 500,
        msg: '未配置 DEEPSEEK_API_KEY'
      });
    }

    // 1. 获取用户的所有分类（系统分类 + 用户自定义分类）
    const categories = await Category.findAll({
      where: {
        [Op.or]: [
          { isSystem: true },
          { userId }
        ]
      },
      attributes: ['id', 'name', 'type'],
      order: [['sortOrder', 'ASC']]
    });

    if (categories.length === 0) {
      return sendResponse(res, {
        code: 400,
        msg: '暂无可用分类，请先创建分类'
      });
    }

    // 2. 构造分类数据给 AI
    const categoryData = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      type: cat.type // income 或 expense
    }));

    // 3. 调用 AI API 解析
    const aiResult = await callDeepSeekAPI(text, categoryData);

    if (!aiResult.success) {
      return sendResponse(res, {
        code: 500,
        msg: aiResult.error || 'AI 解析失败'
      });
    }

    // 4. 验证返回的分类 ID 是否有效，并补齐交易类型、日期与备注字段
    const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
    const defaultDate = new Date().toISOString().split('T')[0];
    const parsedBills = aiResult.data
      .map((bill) => {
        const categoryId = Number(bill.categoryId);
        const category = categoryMap.get(categoryId);
        const amount = Number(bill.amount);
        const date = typeof bill.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(bill.date)
          ? bill.date
          : defaultDate;

        if (!category || !Number.isFinite(amount) || amount <= 0) {
          return null;
        }

        return {
          categoryId,
          type: category.type,
          amount,
          date,
          description: bill.description || bill.remark || ''
        };
      })
      .filter(Boolean);

    if (parsedBills.length === 0) {
      return sendResponse(res, {
        code: 400,
        msg: 'AI 未能识别出有效的账单信息'
      });
    }

    return sendResponse(res, {
      code: 200,
      msg: '解析成功',
      data: { bills: parsedBills }
    });

  } catch (error) {
    console.error('AI 智能解析失败:', error);
    return sendResponse(res, {
      code: 500,
      msg: 'AI 解析失败，请稍后重试'
    });
  }
};

// 调用 DeepSeek API
function callDeepSeekAPI(userText, categories) {
  return new Promise((resolve) => {
    const url = "https://www.dmxapi.cn/v1/chat/completions";
    
    const payload = {
      model: "DeepSeek-V3.2",
      messages: [
        {
          role: "system",
          content: `你是一个账单处理系统，只返回 JSON 数据，不需要任何其他文字说明。
规则：
1. 从用户描述中提取所有账单项
2. 每笔账单必须包含：categoryId（分类ID）、amount（金额，正数）、date（交易日期，YYYY-MM-DD）、description（备注）
3. 如果用户未明确日期，date 使用今天（YYYY-MM-DD）
4. 根据分类的 type 字段判断收入还是支出
5. 如果无法识别分类，使用最相近的分类
6. 金额必须是数字，不要包含货币符号
7. 返回格式：[{"categoryId": 数字, "amount": 数字, "date": "YYYY-MM-DD", "description": "字符串"}]`
        },
        {
          role: "user",
          content: `可用分类数据：\n${JSON.stringify(categories, null, 2)}`
        },
        {
          role: "user",
          content: `用户账单描述：${userText}`
        },
        {
          role: "user",
          content: `请解析账单并返回 JSON 数组格式：[{"categoryId": xxx, "amount": xxx, "date": "YYYY-MM-DD", "description": "xxx"}]`
        }
      ],
      temperature: 0.3 // 降低随机性，提高准确性
    };

    const data = JSON.stringify(payload);
    
    const options = {
      method: 'POST',
      headers: {
        // 如需 Bearer 前缀，请在此拼接
        'Authorization': process.env.DEEPSEEK_API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(url, options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          
          if (result.choices && result.choices[0] && result.choices[0].message) {
            const content = result.choices[0].message.content.trim();
            
            // 尝试提取 JSON（可能包含 markdown 代码块）
            let jsonStr = content;
            const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                            content.match(/```\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
              jsonStr = jsonMatch[1];
            }
            
            const parsedData = JSON.parse(jsonStr);
            
            if (Array.isArray(parsedData)) {
              resolve({
                success: true,
                data: parsedData
              });
            } else {
              resolve({
                success: false,
                error: 'AI 返回数据格式错误'
              });
            }
          } else {
            resolve({
              success: false,
              error: 'AI 响应格式异常'
            });
          }
        } catch (error) {
          console.error('解析 AI 响应失败:', error);
          resolve({
            success: false,
            error: '解析 AI 响应失败'
          });
        }
      });
    });

    req.on('error', (error) => {
      console.error('调用 AI API 失败:', error);
      resolve({
        success: false,
        error: '网络请求失败'
      });
    });

    req.setTimeout(30000, () => {
      req.destroy();
      resolve({
        success: false,
        error: '请求超时'
      });
    });

    req.write(data);
    req.end();
  });
}

module.exports = exports;
```

### 1.2 添加路由

**文件路径：** `pink-ledger-node/src/routes/ai.js`

```javascript
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticate } = require('../middlewares/auth');

// AI 智能解析账单
router.use(authenticate);
router.post('/parse-billing', aiController.parseSmartBilling);

module.exports = router;
```

### 1.3 注册路由

**修改文件：** `pink-ledger-node/src/routes/index.js`

在路由注册部分添加：

```javascript
const aiRoutes = require('./ai');

// API 路由
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/transactions', transactionRoutes);
router.use('/ai', aiRoutes);
```

### 1.4 环境变量配置

**修改文件：** `pink-ledger-node/.env` 和 `pink-ledger-node/.env.example`

添加 API Key：

```env
DEEPSEEK_API_KEY=your_deepseek_api_key
```

## 二、前端实现

### 2.1 创建 API 接口

**文件路径：** `pink-ledger-uniapp/api/ai.js`

```javascript
import { post } from '@/utils/request.js'

/**
 * AI 智能解析账单
 * @param {string} text - 用户输入的自然语言账单描述
 */
export const parseSmartBilling = (text) => {
  return post('/ai/parse-billing', { text })
}
```

### 2.2 注册 API 导出

**修改文件：** `pink-ledger-uniapp/api/index.js`

```javascript
// AI 智能记账相关
export * from './ai.js'
```

### 2.3 创建 AI 输入弹窗组件

**文件路径：** `pink-ledger-uniapp/components/AIBillingModal.vue`

```vue
<template>
  <view class="ai-modal" v-if="visible" @click="handleMaskClick">
    <view class="modal-content" @click.stop>
      <view class="modal-header">
        <text class="title">AI 智能记账</text>
        <view class="close-btn" @click="handleClose">
          <text class="close-icon">×</text>
        </view>
      </view>
      
      <view class="modal-body">
        <view class="tips">
          <text class="tips-text">试试说：早餐花了25元，打车回家40元</text>
        </view>
        
        <textarea 
          class="input-area"
          v-model="inputText"
          placeholder="描述你的账单，AI 会自动帮你记账..."
          :maxlength="500"
          :auto-height="true"
          :focus="autoFocus"
        />
        
        <view class="char-count">
          <text>{{ inputText.length }}/500</text>
        </view>
      </view>
      
      <view class="modal-footer">
        <button 
          class="cancel-btn" 
          @click="handleClose"
        >
          取消
        </button>
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
import { ref, watch } from 'vue'

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

// 监听弹窗显示，自动聚焦
watch(() => props.visible, (newVal) => {
  if (newVal) {
    autoFocus.value = true
    inputText.value = ''
  } else {
    autoFocus.value = false
  }
})

const handleMaskClick = () => {
  if (!loading.value) {
    handleClose()
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

<style scoped lang="scss">
.ai-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 40rpx;
}

.modal-content {
  width: 100%;
  max-width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(100rpx);
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
  
  .title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
  }
  
  .close-btn {
    width: 56rpx;
    height: 56rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .close-icon {
      font-size: 48rpx;
      color: #999;
      line-height: 1;
    }
  }
}

.modal-body {
  padding: 32rpx;
  
  .tips {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 24rpx;
    border-radius: 16rpx;
    margin-bottom: 24rpx;
    
    .tips-text {
      font-size: 28rpx;
      color: #fff;
      line-height: 1.6;
    }
  }
  
  .input-area {
    width: 100%;
    min-height: 240rpx;
    padding: 24rpx;
    background: #f8f9fa;
    border-radius: 16rpx;
    font-size: 32rpx;
    color: #333;
    line-height: 1.6;
    box-sizing: border-box;
  }
  
  .char-count {
    text-align: right;
    margin-top: 16rpx;
    
    text {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.modal-footer {
  display: flex;
  gap: 24rpx;
  padding: 32rpx;
  border-top: 1px solid #f0f0f0;
  
  button {
    flex: 1;
    height: 88rpx;
    border-radius: 16rpx;
    font-size: 32rpx;
    border: none;
    
    &::after {
      border: none;
    }
  }
  
  .cancel-btn {
    background: #f5f5f5;
    color: #666;
  }
  
  .submit-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    
    &[disabled] {
      opacity: 0.6;
    }
  }
}
</style>
```

### 2.4 修改首页添加 AI 按钮

**修改文件：** `pink-ledger-uniapp/pages/index/index.vue`

```vue
<template>
  <view class="container">
    <!-- 原有内容 -->
    
    <!-- 悬浮操作区 -->
    <view class="float-actions">
      <view class="ai-btn" @click="showAIModal">
        <text class="ai-btn-text">AI 记账</text>
      </view>
      <view class="add-btn" @click="goToAdd">
        <uni-icons type="plusempty" size="26" color="#fff"></uni-icons>
      </view>
    </view>
    
    <!-- AI 输入弹窗 -->
    <AIBillingModal 
      :visible="aiModalVisible"
      @close="aiModalVisible = false"
      @submit="handleAISubmit"
    />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import AIBillingModal from '@/components/AIBillingModal.vue'
import { parseSmartBilling, createTransaction } from '@/api'

const aiModalVisible = ref(false)

// 显示 AI 弹窗
const showAIModal = () => {
  aiModalVisible.value = true
}

// 处理 AI 提交
const handleAISubmit = async (text, setLoading) => {
  setLoading(true)
  
  try {
    // 1. 调用 AI 解析
    const parseRes = await parseSmartBilling(text)
    const bills = parseRes.data?.bills || []
    
    if (bills.length === 0) {
      uni.showToast({
        title: parseRes.msg || 'AI 未能识别账单',
        icon: 'none'
      })
      return
    }
    
    // 2. 批量创建账单
    const createPromises = bills.map(bill => {
      return createTransaction({
        categoryId: bill.categoryId,
        type: bill.type,
        amount: bill.amount,
        date: bill.date,
        description: bill.description
      })
    })
    
    const results = await Promise.allSettled(createPromises)
    
    // 3. 统计成功和失败
    const successCount = results.filter(r => r.status === 'fulfilled').length
    const failCount = results.length - successCount
    
    aiModalVisible.value = false
    
    // 4. 显示结果
    if (successCount > 0) {
      uni.showToast({
        title: `成功创建 ${successCount} 笔账单${failCount > 0 ? `，${failCount} 笔失败` : ''}`,
        icon: 'success'
      })
      
      // 刷新列表（复用页面已有的 loadData）
      await loadData()
    } else {
      uni.showToast({
        title: '创建账单失败',
        icon: 'none'
      })
    }
    
  } catch (error) {
    console.error('AI 记账失败:', error)
    uni.showToast({
      title: '操作失败，请重试',
      icon: 'none'
    })
  } finally {
    setLoading(false)
  }
}

// 跳转到添加账单页面（原有功能）
const goToAdd = () => {
  uni.navigateTo({
    url: '/pages/transaction/add'
  })
}
</script>

<style scoped lang="scss">
.float-actions {
  position: fixed;
  right: 40rpx;
  bottom: 120rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  z-index: 999;
}

.ai-btn {
  height: 72rpx;
  padding: 0 24rpx;
  border-radius: 36rpx;
  background: v-bind('themeColors.gradientReverse');
  box-shadow: 0 8rpx 24rpx v-bind('themeColors.shadow');
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-btn-text {
  font-size: 26rpx;
  color: #fff;
  font-weight: 500;
}

.add-btn {
  width: 120rpx;
  height: 120rpx;
  background: v-bind('themeColors.gradient');
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 30rpx v-bind('themeColors.shadow');
  cursor: pointer;
  transition: transform 0.2s;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

.add-btn:active {
  transform: scale(0.95);
}
</style>
```

## 三、测试流程

### 3.1 后端测试

使用 API 测试工具（如 Postman）测试：

端口以 `.env` 中的 `PORT` 为准（示例使用 8860）。

```http
POST http://localhost:8860/api/ai/parse-billing
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "text": "2026-01-18 早餐在麦当劳吃了汉堡花了25元，然后打车回家花了40元"
}
```

预期响应：

```json
{
  "code": 200,
  "msg": "解析成功",
  "data": {
    "bills": [
      {
        "categoryId": 25,
        "type": "expense",
        "amount": 25,
        "date": "2026-01-18",
        "description": "早餐在麦当劳吃了汉堡"
      },
      {
        "categoryId": 24,
        "type": "expense",
        "amount": 40,
        "date": "2026-01-18",
        "description": "打车回家"
      }
    ]
  }
}
```

### 3.2 前端测试

1. 启动前端项目
2. 进入首页
3. 点击右下角 "AI 记账" 按钮
4. 输入测试文本："2026-01-18 中午吃饭50元，买水果30元"
5. 点击"开始记账"
6. 验证是否成功创建账单

## 四、注意事项

1. **API Key 安全**：不要将 API Key 提交到代码仓库，使用环境变量管理
2. **字段对齐**：`transactions` 创建接口必须包含 `type`，备注字段为 `description`（不是 `remark`），`date` 使用 `YYYY-MM-DD`（未提供时后端默认当天）
3. **错误处理**：AI 可能返回无效数据，需要做好验证和容错
4. **用户体验**：
   - 加载状态要明确
   - 失败时给出友好提示
   - 成功后自动刷新列表
5. **性能优化**：
   - AI 请求设置超时时间（30秒）
   - 批量创建账单使用 Promise.allSettled 避免部分失败影响全部
6. **成本控制**：AI API 调用可能产生费用，建议：
   - 限制单次输入字数（500字）
   - 添加请求频率限制
   - 监控 API 使用量

## 五、后续优化建议

1. **历史记录**：保存用户的 AI 记账历史，方便查看和修改
2. **智能学习**：根据用户的记账习惯优化 AI 提示词
3. **语音输入**：集成语音识别，支持语音记账
4. **批量确认**：AI 解析后先预览，用户确认后再创建
5. **分类推荐**：AI 识别到新的消费类型时，推荐创建新分类

---

**文档版本：** v1.1  
**创建日期：** 2026-01-19  
**适用项目：** Pink Ledger 记账应用
