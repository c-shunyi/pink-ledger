import { post } from '@/utils/request.js'

/**
 * AI 智能解析账单
 * @param {string} text - 用户输入的自然语言账单描述
 */
export const parseSmartBilling = (text) => {
  return post('/ai/parse-billing', { text })
}
