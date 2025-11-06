// 配置文件
export default {
  // API 基础地址
  baseUrl: 'https://pink-ledger.shunyi.website/api',
  // baseUrl: 'http://localhost:8860/api',
  
  
  // 请求超时时间
  timeout: 10000,
  
  // token 存储 key
  tokenKey: 'pink_ledger_token',
  
  // 用户信息存储 key
  userKey: 'pink_ledger_user',
  
  // 交易类型
  transactionTypes: [
    { value: 'expense', label: '支出', color: '#FF6B6B' },
    { value: 'income', label: '收入', color: '#06D6A0' }
  ]
}

