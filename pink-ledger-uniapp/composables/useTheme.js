import { computed } from 'vue'

// 固定使用淡蓝色主题
const purpleTheme = {
  id: "purple",
  name: "淡蓝",
  icon: "🦄",
  colors: {
    primary: "#6b72e8",
    secondary: "#8b91f0",
    gradient: "linear-gradient(135deg, #6b72e8 0%, #8b91f0 100%)",
    gradientReverse: "linear-gradient(135deg, #8b91f0 0%, #6b72e8 100%)",
    text: "#5a60d8",
    light: "#eff0fc",
    shadow: "rgba(107, 114, 232, 0.5)"
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

