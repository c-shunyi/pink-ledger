# UniApp Vue3 Composition API 改造指南

## 项目概览
该项目已经成功从 Vue2 Options API 升级到 Vue3 Composition API (setup) 语法。

## 主要改动

### 1. 语法变化

#### Vue2 Options API → Vue3 Composition API

**原来的写法 (Vue2):**
```vue
<script>
export default {
  data() {
    return {
      count: 0,
      user: {
        name: '',
        email: ''
      }
    }
  },
  computed: {
    doubleCount() {
      return this.count * 2
    }
  },
  methods: {
    increment() {
      this.count++
    }
  },
  onLoad() {
    this.loadData()
  }
}
</script>
```

**现在的写法 (Vue3):**
```vue
<script setup>
import { ref, reactive, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// 响应式数据
const count = ref(0)
const user = reactive({
  name: '',
  email: ''
})

// 计算属性
const doubleCount = computed(() => count.value * 2)

// 方法
const increment = () => {
  count.value++
}

// 生命周期钩子
onLoad(() => {
  loadData()
})
</script>
```

### 2. 核心API变化

#### 响应式数据
- `data()` → `ref()` / `reactive()`
- 基础类型使用 `ref()`
- 对象类型使用 `reactive()`

#### 计算属性
- `computed: {}` → `computed(() => {})`

#### 方法
- `methods: {}` → 直接定义函数

#### 生命周期钩子
- `onLoad()` → `onLoad(() => {})`
- `onShow()` → `onShow(() => {})`
- `onHide()` → `onHide(() => {})`

### 3. 组合式函数 (Composables)

创建了可复用的业务逻辑组合式函数：

#### `useAuth.js` - 认证相关
```javascript
export function useAuth() {
  const loading = ref(false)
  const isLoggedIn = ref(false)
  const userInfo = reactive({})

  const login = async (loginForm) => { /* ... */ }
  const logout = () => { /* ... */ }
  const checkAuthStatus = () => { /* ... */ }

  return {
    loading,
    isLoggedIn,
    userInfo,
    login,
    logout,
    checkAuthStatus
  }
}
```

#### `useTransactions.js` - 交易记录相关
```javascript
export function useTransactions() {
  const transactions = ref([])
  const summary = reactive({})
  const loading = ref(false)

  const loadTransactions = async () => { /* ... */ }
  const addTransaction = async () => { /* ... */ }
  const refreshData = async () => { /* ... */ }

  return {
    transactions,
    groupedTransactions,
    summary,
    loading,
    loadTransactions,
    addTransaction,
    refreshData
  }
}
```

#### `useCategories.js` - 分类相关
```javascript
export function useCategories() {
  const categories = ref([])
  const expenseCategories = computed(() => /* ... */)
  const incomeCategories = computed(() => /* ... */)

  const loadCategories = async () => { /* ... */ }
  const addCategory = async () => { /* ... */ }

  return {
    categories,
    expenseCategories,
    incomeCategories,
    loadCategories,
    addCategory
  }
}
```

### 4. 页面改造示例

已完成改造的页面：
- ✅ `pages/index/index.vue` - 首页
- ✅ `pages/login/login.vue` - 登录页
- ✅ `pages/transaction/add.vue` - 添加交易页

### 5. 主要优势

#### 更好的类型推断
Vue3 + TypeScript 有更好的类型支持

#### 更好的代码组织
- 逻辑复用通过 composables
- 相关逻辑可以组合在一起
- 更容易测试

#### 更好的性能
- 更好的 tree-shaking
- 更小的打包体积
- 更快的渲染速度

#### 更灵活的组合
```vue
<script setup>
// 可以轻松组合多个 composables
const { isLoggedIn, login } = useAuth()
const { transactions, loadTransactions } = useTransactions()
const { categories, loadCategories } = useCategories()

// 页面特有的逻辑
const pageSpecificData = ref('')
</script>
```

### 6. 注意事项

#### ref vs reactive
- `ref()`: 基础类型 (string, number, boolean)
- `reactive()`: 对象和数组
- 访问 ref 的值需要 `.value`

#### 模板中的使用
```vue
<template>
  <!-- ref 在模板中自动解包，不需要 .value -->
  <view>{{ count }}</view>
  <view>{{ user.name }}</view>
</template>

<script setup>
const count = ref(0)
const user = reactive({ name: 'John' })
</script>
```

#### watch 的使用
```javascript
import { watch } from 'vue'

// 监听 ref
watch(count, (newValue, oldValue) => {
  console.log('count changed:', newValue)
})

// 监听 reactive 对象的属性
watch(() => user.name, (newValue) => {
  console.log('name changed:', newValue)
})
```

### 7. 迁移建议

对于其他还未改造的页面，建议按照以下步骤进行：

1. **分析页面复杂度**: 简单页面可以直接改造，复杂页面先提取 composables
2. **提取可复用逻辑**: 将通用逻辑抽象为 composables
3. **逐步改造**: 一个页面一个页面地进行改造
4. **测试验证**: 确保改造后功能正常

### 8. 相关文档

- [Vue 3 Composition API 文档](https://v3.cn.vuejs.org/guide/composition-api-introduction.html)
- [UniApp Vue3 支持](https://uniapp.dcloud.net.cn/tutorial/vue3-basics.html)
- [组合式函数 (Composables)](https://v3.cn.vuejs.org/guide/composition-api-introduction.html#%E4%BB%80%E4%B9%88%E6%98%AF%E7%BB%84%E5%90%88%E5%BC%8F-api)
