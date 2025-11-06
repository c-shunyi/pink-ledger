/**
 * 交易记录相关的组合式函数
 */
import { ref, computed, reactive } from 'vue'
import { getTransactions, getStatistics, createTransaction, updateTransaction, deleteTransaction } from '@/utils/api.js'
import { getFriendlyDate, getMonthStart, getMonthEnd, getSpecificMonthStart, getSpecificMonthEnd } from '@/utils/date.js'

export function useTransactions() {
  const transactions = ref([])
  const summary = reactive({
    totalIncome: '0.00',
    totalExpense: '0.00',
    balance: '0.00'
  })
  const loading = ref(false)
  const page = ref(1)
  const limit = ref(20)
  const hasMore = ref(true)

  // 按日期分组的交易记录
  const groupedTransactions = computed(() => {
    const groups = {}
    
    transactions.value.forEach(item => {
      const date = item.date
      if (!groups[date]) {
        groups[date] = {
          date,
          dateText: getFriendlyDate(date),
          transactions: [],
          expenseTotal: 0,
          incomeTotal: 0
        }
      }
      
      groups[date].transactions.push(item)
      
      if (item.type === 'expense') {
        groups[date].expenseTotal += parseFloat(item.amount)
      } else {
        groups[date].incomeTotal += parseFloat(item.amount)
      }
    })
    
    return Object.values(groups).map(group => ({
      ...group,
      expenseTotal: group.expenseTotal.toFixed(2),
      incomeTotal: group.incomeTotal.toFixed(2)
    }))
  })

  // 加载交易记录
  const loadTransactions = async (params = {}) => {
    if (loading.value) return
    
    try {
      loading.value = true
      
      // 确定日期范围
      let startDate, endDate
      if (params.year && params.month) {
        startDate = getSpecificMonthStart(params.year, params.month)
        endDate = getSpecificMonthEnd(params.year, params.month)
      } else {
        startDate = getMonthStart()
        endDate = getMonthEnd()
      }
      
      const requestParams = {
        page: page.value,
        limit: limit.value,
        startDate,
        endDate,
        ...params
      }
      
      // 移除year和month参数，避免传递给后端
      delete requestParams.year
      delete requestParams.month
      
      const res = await getTransactions(requestParams)
      
      if (page.value === 1) {
        transactions.value = res.data.transactions
      } else {
        transactions.value = [...transactions.value, ...res.data.transactions]
      }
      
      hasMore.value = page.value < res.data.pagination.totalPages
      
      return res
    } catch (error) {
      console.error('加载交易记录失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 加载统计数据
  const loadStatistics = async (params = {}) => {
    try {
      // 确定日期范围
      let startDate, endDate
      if (params.year && params.month) {
        startDate = getSpecificMonthStart(params.year, params.month)
        endDate = getSpecificMonthEnd(params.year, params.month)
      } else {
        startDate = getMonthStart()
        endDate = getMonthEnd()
      }
      
      const requestParams = {
        startDate,
        endDate,
        ...params
      }
      
      // 移除year和month参数，避免传递给后端
      delete requestParams.year
      delete requestParams.month
      
      const res = await getStatistics(requestParams)
      
      summary.totalIncome = res.data.summary.totalIncome.toFixed(2)
      summary.totalExpense = res.data.summary.totalExpense.toFixed(2)
      summary.balance = res.data.summary.balance.toFixed(2)
      
      return res
    } catch (error) {
      console.error('加载统计数据失败:', error)
      throw error
    }
  }

  // 创建交易记录
  const addTransaction = async (transactionData) => {
    try {
      const res = await createTransaction(transactionData)
      
      // 刷新数据
      await refreshData()
      
      return res
    } catch (error) {
      console.error('创建交易记录失败:', error)
      throw error
    }
  }

  // 更新交易记录
  const updateTransactionRecord = async (id, transactionData) => {
    try {
      const res = await updateTransaction(id, transactionData)
      
      // 刷新数据
      await refreshData()
      
      return res
    } catch (error) {
      console.error('更新交易记录失败:', error)
      throw error
    }
  }

  // 删除交易记录
  const removeTransaction = async (id) => {
    try {
      const res = await deleteTransaction(id)
      
      // 刷新数据
      await refreshData()
      
      return res
    } catch (error) {
      console.error('删除交易记录失败:', error)
      throw error
    }
  }

  // 刷新数据
  const refreshData = async (params = {}) => {
    page.value = 1
    hasMore.value = true
    await loadTransactions(params)
    await loadStatistics(params)
  }

  // 加载更多
  const loadMore = async (params = {}) => {
    if (hasMore.value && !loading.value) {
      page.value++
      await loadTransactions(params)
    }
  }

  // 重置状态
  const reset = () => {
    transactions.value = []
    summary.totalIncome = '0.00'
    summary.totalExpense = '0.00'
    summary.balance = '0.00'
    page.value = 1
    hasMore.value = true
    loading.value = false
  }

  return {
    transactions,
    groupedTransactions,
    summary,
    loading,
    page,
    hasMore,
    loadTransactions,
    loadStatistics,
    addTransaction,
    updateTransactionRecord,
    removeTransaction,
    refreshData,
    loadMore,
    reset
  }
}
