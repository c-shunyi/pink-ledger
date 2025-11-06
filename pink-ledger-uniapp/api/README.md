# API 接口说明

本目录包含所有前端 API 接口定义，按功能模块进行分类管理。

## 目录结构

```
api/
├── auth.js          # 用户认证相关接口
├── category.js      # 分类管理相关接口
├── transaction.js   # 账单管理相关接口
├── index.js         # 统一导出文件
└── README.md        # 本说明文件
```

## 使用方式

### 方式一：从统一入口导入（推荐）

```javascript
import { login, register, getCategories, createTransaction } from '@/api'
```

### 方式二：从具体模块导入

```javascript
import { login, register } from '@/api/auth'
import { getCategories } from '@/api/category'
import { createTransaction } from '@/api/transaction'
```

## API 模块说明

### 1. auth.js - 用户认证

| API | 说明 | 参数 |
|-----|------|------|
| `register(data)` | 用户注册 | `{username, password, email}` |
| `login(data)` | 用户登录 | `{username, password}` |
| `getCurrentUser()` | 获取当前用户信息 | - |
| `updateProfile(data)` | 更新用户信息 | `{nickname, email, ...}` |

### 2. category.js - 分类管理

| API | 说明 | 参数 |
|-----|------|------|
| `getCategories(params)` | 获取分类列表 | `{type}` |
| `createCategory(data)` | 创建分类 | `{name, type, icon, color}` |
| `updateCategory(id, data)` | 更新分类 | `id, {name, icon, color}` |
| `deleteCategory(id)` | 删除分类 | `id` |

### 3. transaction.js - 账单管理

| API | 说明 | 参数 |
|-----|------|------|
| `getTransactions(params)` | 获取账单列表 | `{type, categoryId, startDate, endDate}` |
| `getTransaction(id)` | 获取账单详情 | `id` |
| `createTransaction(data)` | 创建账单 | `{type, amount, categoryId, date, remark}` |
| `updateTransaction(id, data)` | 更新账单 | `id, {amount, categoryId, ...}` |
| `deleteTransaction(id)` | 删除账单 | `id` |
| `getStatistics(params)` | 获取统计数据 | `{startDate, endDate, type}` |

## 新增 API 接口

当需要新增 API 接口时：

1. **选择或创建模块文件**
   - 如果是现有模块的新功能，在对应文件中添加
   - 如果是全新模块，创建新的 `.js` 文件

2. **编写 API 函数**
   ```javascript
   /**
    * 功能描述
    * @param {Object} data - 参数说明
    * @returns {Promise}
    */
   export const apiName = (data) => {
     return post('/endpoint', data)
   }
   ```

3. **在 index.js 中导出**（如果是新模块）
   ```javascript
   export * from './newModule.js'
   ```

4. **更新本文档**
   - 在对应模块表格中添加新 API 说明

## 最佳实践

1. ✅ 使用统一的导入方式：`import { xxx } from '@/api'`
2. ✅ 为每个 API 添加详细的 JSDoc 注释
3. ✅ 保持模块划分清晰，职责单一
4. ✅ API 命名使用动词+名词的方式：`getUser`, `createTransaction`
5. ✅ 参数和返回值类型要明确
6. ❌ 避免在业务组件中直接使用 `request.js`，统一通过 API 模块调用

## 注意事项

- 所有 API 接口都使用 Promise 返回
- 错误处理已在 `utils/request.js` 中统一处理
- 接口路径基于 `config/index.js` 中配置的 `baseURL`
- 请求拦截器会自动添加 token 等认证信息

