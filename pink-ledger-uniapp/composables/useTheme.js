import { ref, computed, watch } from 'vue'
import themesConfig from '@/config/themes.json'

// 从本地存储获取主题
const getStoredTheme = () => {
  try {
    return uni.getStorageSync('theme') || themesConfig.default
  } catch (e) {
    return themesConfig.default
  }
}

// 当前主题ID
const currentThemeId = ref(getStoredTheme())

// 所有可用主题
const availableThemes = computed(() => themesConfig.themes)

// 当前主题对象
const currentTheme = computed(() => {
  return themesConfig.themes.find(t => t.id === currentThemeId.value) || themesConfig.themes[0]
})

// 当前主题颜色
const themeColors = computed(() => currentTheme.value.colors)

// 切换主题
const setTheme = (themeId) => {
  const theme = themesConfig.themes.find(t => t.id === themeId)
  if (theme) {
    currentThemeId.value = themeId
    try {
      uni.setStorageSync('theme', themeId)
      // 显示切换成功提示
      // uni.showToast({
      //   title: `已切换到${theme.name}主题`,
      //   icon: 'success',
      //   duration: 1500
      // })
    } catch (e) {
      console.error('保存主题失败:', e)
    }
  }
}

// 监听主题变化，更新页面样式
watch(currentThemeId, (newTheme) => {
  console.log('主题已切换:', newTheme)
  // 这里可以添加额外的主题切换逻辑
})

export function useTheme() {
  return {
    currentThemeId,
    currentTheme,
    themeColors,
    availableThemes,
    setTheme
  }
}

