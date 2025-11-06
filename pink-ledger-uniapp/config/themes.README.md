# 主题配置说明

## 配置文件

主题配置存储在 `themes.json` 文件中，采用JSON格式便于管理和扩展。

## 配置结构

```json
{
  "themes": [
    {
      "id": "主题唯一标识",
      "name": "主题名称",
      "icon": "主题图标emoji",
      "colors": {
        "primary": "主色调",
        "secondary": "辅助色",
        "gradient": "渐变色（用于背景）",
        "gradientReverse": "反向渐变色",
        "text": "文字颜色",
        "light": "浅色背景",
        "shadow": "阴影颜色"
      }
    }
  ],
  "default": "默认主题ID"
}
```

## 颜色属性说明

- **primary**: 主色调，用于按钮、图标等主要元素
- **secondary**: 辅助色，用于渐变的第二个颜色
- **gradient**: 从primary到secondary的渐变，常用于背景
- **gradientReverse**: 反向渐变，从secondary到primary
- **text**: 文字颜色，用于重点文字、链接等
- **light**: 浅色背景色，用于背景高亮
- **shadow**: 阴影颜色，用于按钮等元素的阴影效果

## 内置主题

### 1. 粉色主题 (pink) - 默认
- 主色调：#FF9A9E
- 风格：温柔、优雅
- 适合：日常记账

### 2. 青色主题 (cyan)
- 主色调：#4ECDC4
- 风格：清新、现代
- 适合：喜欢冷色调的用户

### 3. 紫色主题 (purple)
- 主色调：#A890FE
- 风格：神秘、高贵
- 适合：个性化用户

### 4. 橙色主题 (orange)
- 主色调：#FFB347
- 风格：活力、温暖
- 适合：充满活力的用户

### 5. 绿色主题 (green)
- 主色调：#56CCF2
- 风格：自然、清爽
- 适合：喜欢自然风格的用户

## 添加新主题

要添加新主题，请在 `themes.json` 的 `themes` 数组中添加新对象：

```json
{
  "id": "new-theme",
  "name": "新主题",
  "icon": "🎨",
  "colors": {
    "primary": "#颜色代码",
    "secondary": "#颜色代码",
    "gradient": "linear-gradient(135deg, #起始色 0%, #结束色 100%)",
    "gradientReverse": "linear-gradient(135deg, #结束色 0%, #起始色 100%)",
    "text": "#颜色代码",
    "light": "#颜色代码",
    "shadow": "rgba(R, G, B, 0.5)"
  }
}
```

## 使用主题

在Vue组件中使用主题：

```vue
<script setup>
import { useTheme } from '@/composables/useTheme.js'

const { themeColors, currentTheme, setTheme, availableThemes } = useTheme()
</script>

<style scoped>
.my-element {
  background: v-bind('themeColors.gradient');
  color: v-bind('themeColors.text');
}
</style>
```

## API说明

### useTheme()

返回主题相关的响应式数据和方法：

- `currentThemeId`: 当前主题ID
- `currentTheme`: 当前主题完整对象
- `themeColors`: 当前主题的颜色配置
- `availableThemes`: 所有可用主题列表
- `setTheme(themeId)`: 切换主题

## 注意事项

1. 主题配置会自动保存到本地存储
2. 切换主题会实时更新所有使用了主题的页面
3. 建议保持颜色对比度，确保文字可读性
4. 阴影颜色建议使用rgba格式，透明度设置为0.5
5. 渐变建议使用135度角，保持视觉一致性

