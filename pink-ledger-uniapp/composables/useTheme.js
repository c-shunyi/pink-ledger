import { computed } from 'vue'

// 固定使用紫色主题
const purpleTheme = {
  id: "purple",
  name: "紫色",
  icon: "🦄",
  colors: {
    primary: "#A890FE",
    secondary: "#C9B6FF",
    gradient: "linear-gradient(135deg, #A890FE 0%, #C9B6FF 100%)",
    gradientReverse: "linear-gradient(135deg, #C9B6FF 0%, #A890FE 100%)",
    text: "#8B7FE8",
    light: "#F0EBFF",
    shadow: "rgba(168, 144, 254, 0.5)"
  }
}

// 当前主题对象
const currentTheme = computed(() => purpleTheme)

// 当前主题颜色
const themeColors = computed(() => purpleTheme.colors)

export function useTheme() {
  return {
    currentTheme,
    themeColors
  }
}

