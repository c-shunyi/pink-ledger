/**
 * 分类相关的组合式函数
 */
import { ref, computed } from 'vue'
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/utils/api.js'

export function useCategories() {
  const categories = ref([])
  const loading = ref(false)

  // 根据类型筛选分类
  const getCategoriesByType = (type) => {
    return computed(() => {
      return categories.value.filter(cat => cat.type === type)
    })
  }

  // 支出分类
  const expenseCategories = computed(() => {
    return categories.value.filter(cat => cat.type === 'expense')
  })

  // 收入分类
  const incomeCategories = computed(() => {
    return categories.value.filter(cat => cat.type === 'income')
  })

  // 加载分类数据
  const loadCategories = async () => {
    if (loading.value) return
    
    try {
      loading.value = true
      const res = await getCategories()
      categories.value = res.data.categories || []
      return res
    } catch (error) {
      console.error('加载分类失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 创建分类
  const addCategory = async (categoryData) => {
    try {
      const res = await createCategory(categoryData)
      
      // 重新加载分类列表
      await loadCategories()
      
      return res
    } catch (error) {
      console.error('创建分类失败:', error)
      throw error
    }
  }

  // 更新分类
  const updateCategoryRecord = async (id, categoryData) => {
    try {
      const res = await updateCategory(id, categoryData)
      
      // 重新加载分类列表
      await loadCategories()
      
      return res
    } catch (error) {
      console.error('更新分类失败:', error)
      throw error
    }
  }

  // 删除分类
  const removeCategory = async (id) => {
    try {
      const res = await deleteCategory(id)
      
      // 重新加载分类列表
      await loadCategories()
      
      return res
    } catch (error) {
      console.error('删除分类失败:', error)
      throw error
    }
  }

  // 根据ID获取分类
  const getCategoryById = (id) => {
    return categories.value.find(cat => cat.id === id)
  }

  // 重置状态
  const reset = () => {
    categories.value = []
    loading.value = false
  }

  return {
    categories,
    expenseCategories,
    incomeCategories,
    loading,
    getCategoriesByType,
    loadCategories,
    addCategory,
    updateCategoryRecord,
    removeCategory,
    getCategoryById,
    reset
  }
}
