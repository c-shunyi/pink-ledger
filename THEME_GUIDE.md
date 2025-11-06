# Pink Ledger 主题切换功能指南

## 功能概述

Pink Ledger 现在支持多主题切换功能，用户可以根据自己的喜好选择不同的主题色调，包括新增的青色主题。

## 新增功能

### 1. 主题管理系统

- **配置文件**: `/pink-ledger-uniapp/config/themes.json`
- **管理工具**: `/pink-ledger-uniapp/composables/useTheme.js`
- **本地存储**: 主题选择会自动保存到设备本地

### 2. 可用主题

目前提供 5 种精心设计的主题：

| 主题名称 | 图标 | 主色调 | 风格特点 |
|---------|------|--------|---------|
| 粉色 | 🌸 | #FF9A9E | 温柔优雅，适合日常使用 |
| **青色** | 🌊 | #4ECDC4 | 清新现代，清爽舒适 |
| 紫色 | 🦄 | #A890FE | 神秘高贵，个性十足 |
| 橙色 | 🍊 | #FFB347 | 活力温暖，充满朝气 |
| 绿色 | 🍀 | #56CCF2 | 自然清爽，舒适宜人 |

### 3. 主题切换入口

在 **个人中心** 页面，点击 **主题设置** 菜单项即可打开主题选择弹窗。

## 技术实现

### 配置文件结构

```json
{
  "themes": [
    {
      "id": "cyan",
      "name": "青色",
      "icon": "🌊",
      "colors": {
        "primary": "#4ECDC4",
        "secondary": "#44A08D",
        "gradient": "linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)",
        "gradientReverse": "linear-gradient(135deg, #44A08D 0%, #4ECDC4 100%)",
        "text": "#2D9CDB",
        "light": "#E0F7FA",
        "shadow": "rgba(78, 205, 196, 0.5)"
      }
    }
  ],
  "default": "pink"
}
```

### 使用方式

在 Vue 组件中使用主题：

```vue
<script setup>
import { useTheme } from '@/composables/useTheme.js'

const { themeColors } = useTheme()
</script>

<template>
  <view class="header">
    <!-- 动态使用主题颜色 -->
  </view>
</template>

<style scoped>
.header {
  /* 使用 v-bind 绑定主题颜色 */
  background: v-bind('themeColors.gradient');
}
</style>
```

### 已适配主题的页面

以下页面已全面适配主题系统：

- ✅ 登录页面 (`/pages/login/login.vue`)
- ✅ 注册页面 (`/pages/register/register.vue`)
- ✅ 首页/账单列表 (`/pages/index/index.vue`)
- ✅ 添加交易 (`/pages/transaction/add.vue`)
- ✅ 个人中心 (`/pages/profile/profile.vue`)

### 主题影响的元素

1. **渐变背景**: 页面头部、卡片背景
2. **按钮**: 主要操作按钮、确认按钮
3. **选中状态**: 标签选中、分类选中
4. **强调文字**: 链接、重点信息
5. **图标阴影**: 浮动按钮阴影效果

## 扩展主题

### 添加新主题步骤

1. 打开 `/pink-ledger-uniapp/config/themes.json`

2. 在 `themes` 数组中添加新主题配置：

```json
{
  "id": "your-theme-id",
  "name": "您的主题名称",
  "icon": "🎨",
  "colors": {
    "primary": "#主色调",
    "secondary": "#辅助色",
    "gradient": "linear-gradient(135deg, #起始色 0%, #结束色 100%)",
    "gradientReverse": "linear-gradient(135deg, #结束色 0%, #起始色 100%)",
    "text": "#文字颜色",
    "light": "#浅色背景",
    "shadow": "rgba(R, G, B, 0.5)"
  }
}
```

3. 保存文件，主题会自动生效

### 颜色选择建议

- **主色调**: 选择醒目但不刺眼的颜色
- **辅助色**: 与主色调相近但有层次感
- **文字颜色**: 确保在白色背景上有足够对比度
- **渐变**: 建议使用135度角，视觉效果更佳
- **阴影**: 使用rgba，透明度0.5左右

## 用户指南

### 如何切换主题

1. 打开 Pink Ledger 应用
2. 点击底部导航栏的 **"我的"** 标签
3. 在个人中心页面，点击 **"主题设置"** 
4. 在弹出的主题选择窗口中，点击您喜欢的主题
5. 主题会立即生效，并自动保存

### 主题预览

每个主题都有：
- 圆形色块预览，显示主题渐变效果
- 主题名称
- 代表该主题的 emoji 图标
- 当前选中主题会显示绿色 ✓ 标记

## 特性亮点

✨ **即时生效**: 切换主题后立即应用到所有页面  
💾 **自动保存**: 主题选择自动保存到本地存储  
🎨 **视觉一致**: 所有页面保持统一的主题风格  
⚡ **性能优化**: 使用响应式系统，无需刷新页面  
📱 **移动优先**: 专为移动端体验优化

## 技术亮点

- 使用 Vue 3 Composition API
- 响应式主题切换
- 基于 JSON 的配置管理
- CSS v-bind 动态样式绑定
- 本地存储持久化

## 问题反馈

如有任何问题或建议，欢迎联系开发团队。

---

**版本**: 1.1.0  
**更新日期**: 2025年11月6日  
**新增**: 主题切换功能 + 青色主题

