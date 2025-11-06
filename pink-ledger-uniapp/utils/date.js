// 日期工具函数

/**
 * 格式化日期
 * @param {Date|String} date 日期对象或字符串
 * @param {String} format 格式，默认 YYYY-MM-DD
 */
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return ''
  
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  const second = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second)
}

/**
 * 获取今天的日期
 */
export const getToday = () => {
  return formatDate(new Date())
}

/**
 * 获取本月第一天
 */
export const getMonthStart = () => {
  const now = new Date()
  return formatDate(new Date(now.getFullYear(), now.getMonth(), 1))
}

/**
 * 获取本月最后一天
 */
export const getMonthEnd = () => {
  const now = new Date()
  return formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0))
}

/**
 * 获取指定年月的第一天
 * @param {Number} year 年份
 * @param {Number} month 月份 (1-12)
 */
export const getSpecificMonthStart = (year, month) => {
  return formatDate(new Date(year, month - 1, 1))
}

/**
 * 获取指定年月的最后一天
 * @param {Number} year 年份
 * @param {Number} month 月份 (1-12)
 */
export const getSpecificMonthEnd = (year, month) => {
  return formatDate(new Date(year, month, 0))
}

/**
 * 获取本年第一天
 */
export const getYearStart = () => {
  const now = new Date()
  return formatDate(new Date(now.getFullYear(), 0, 1))
}

/**
 * 获取本年最后一天
 */
export const getYearEnd = () => {
  const now = new Date()
  return formatDate(new Date(now.getFullYear(), 11, 31))
}

/**
 * 获取友好的日期显示
 */
export const getFriendlyDate = (date) => {
  if (!date) return ''
  
  const d = new Date(date)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (formatDate(d) === formatDate(today)) {
    return '今天'
  } else if (formatDate(d) === formatDate(yesterday)) {
    return '昨天'
  } else if (d.getFullYear() === today.getFullYear()) {
    return formatDate(d, 'MM月DD日')
  } else {
    return formatDate(d, 'YYYY年MM月DD日')
  }
}

