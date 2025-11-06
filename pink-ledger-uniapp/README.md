# Pink Ledger - uniapp 前端

一个优雅的记账应用前端，基于 uniapp 开发，支持多端运行。

## 技术栈

- **uni-app** - 跨平台应用框架
- **Vue.js** - 渐进式 JavaScript 框架

## 功能特性

- ✅ 用户注册与登录
- ✅ 账单管理（增删改查）
- ✅ 账单列表（支持筛选、分页）
- ✅ 添加账单（支持分类、日期、账户类型）
- ✅ 账单详情与编辑
- ✅ 统计报表（月度/年度）
- ✅ 分类统计图表
- ✅ 分类管理（自定义分类）
- ✅ 个人中心
- ✅ 资料编辑

## 项目结构

```
pink-ledger-uniapp/
├── config/              # 配置文件
│   └── index.js        # 全局配置（API地址等）
├── utils/              # 工具类
│   ├── api.js         # API接口管理
│   ├── request.js     # 请求封装
│   ├── storage.js     # 本地存储
│   └── date.js        # 日期工具
├── pages/              # 页面
│   ├── login/         # 登录
│   ├── register/      # 注册
│   ├── index/         # 首页（账单列表）
│   ├── transaction/   # 账单管理
│   │   ├── add.vue   # 添加账单
│   │   └── detail.vue # 账单详情
│   ├── statistics/    # 统计页面
│   ├── category/      # 分类管理
│   │   ├── category.vue # 分类列表
│   │   └── edit.vue  # 编辑分类
│   └── profile/       # 个人中心
│       ├── profile.vue # 个人主页
│       └── edit.vue   # 编辑资料
├── static/            # 静态资源
│   ├── logo.png
│   └── tabbar/       # TabBar图标（需要添加）
├── App.vue
├── main.js
├── pages.json        # 页面配置
└── manifest.json     # 应用配置
```

## 快速开始

### 1. 配置后端地址

修改 `config/index.js` 中的 `baseUrl`：

```javascript
export default {
  // API 基础地址 - 根据实际情况修改
  baseUrl: 'http://localhost:3000/api',  // 本地开发
  // baseUrl: 'http://你的服务器IP:3000/api',  // 部署后
  
  // ...其他配置
}
```

### 2. 准备 TabBar 图标

在 `static/tabbar/` 目录下添加以下图标文件（建议尺寸 81x81px）：

- `bill.png` - 账单图标（未选中）
- `bill-active.png` - 账单图标（选中）
- `chart.png` - 统计图标（未选中）
- `chart-active.png` - 统计图标（选中）
- `profile.png` - 个人图标（未选中）
- `profile-active.png` - 个人图标（选中）

> 如果没有图标，可以暂时注释掉 `pages.json` 中的 `tabBar.list` 的 `iconPath` 和 `selectedIconPath` 字段，使用纯文字 TabBar。

### 3. 运行项目

#### 方式一：使用 HBuilderX

1. 使用 HBuilderX 打开项目
2. 点击工具栏的"运行" -> 选择运行平台
3. 选择浏览器或手机模拟器运行

#### 方式二：使用命令行（需要先安装 @vue/cli）

```bash
# 运行到H5
npm run dev:h5

# 运行到微信小程序
npm run dev:mp-weixin

# 运行到App
npm run dev:app
```

## 主要页面说明

### 1. 登录/注册页面
- 路径：`pages/login/login.vue` 和 `pages/register/register.vue`
- 功能：用户登录和注册，登录成功后保存 token 和用户信息

### 2. 账单列表（首页）
- 路径：`pages/index/index.vue`
- 功能：
  - 显示当月收入/支出统计
  - 显示账单列表（按日期分组）
  - 支持筛选（全部/支出/收入）
  - 支持下拉刷新和上拉加载更多
  - 点击账单跳转到详情

### 3. 添加账单
- 路径：`pages/transaction/add.vue`
- 功能：
  - 切换收入/支出类型
  - 选择分类
  - 输入金额
  - 选择日期和账户类型
  - 添加备注

### 4. 账单详情
- 路径：`pages/transaction/detail.vue`
- 功能：
  - 显示账单详细信息
  - 编辑账单
  - 删除账单

### 5. 统计页面
- 路径：`pages/statistics/statistics.vue`
- 功能：
  - 切换月度/年度统计
  - 显示总收入、总支出、结余
  - 显示分类统计（支出/收入）
  - 显示各分类占比

### 6. 分类管理
- 路径：`pages/category/category.vue`
- 功能：
  - 查看系统分类和自定义分类
  - 添加自定义分类
  - 编辑自定义分类
  - 删除自定义分类（系统分类不可删除）

### 7. 个人中心
- 路径：`pages/profile/profile.vue`
- 功能：
  - 显示用户信息
  - 编辑资料
  - 分类管理入口
  - 退出登录

## API 接口说明

所有 API 接口都在 `utils/api.js` 中定义，包括：

### 认证相关
- `register(data)` - 用户注册
- `login(data)` - 用户登录
- `getCurrentUser()` - 获取当前用户信息
- `updateProfile(data)` - 更新用户信息

### 分类相关
- `getCategories(params)` - 获取分类列表
- `createCategory(data)` - 创建分类
- `updateCategory(id, data)` - 更新分类
- `deleteCategory(id)` - 删除分类

### 账单相关
- `getTransactions(params)` - 获取账单列表
- `getTransaction(id)` - 获取账单详情
- `createTransaction(data)` - 创建账单
- `updateTransaction(id, data)` - 更新账单
- `deleteTransaction(id)` - 删除账单
- `getStatistics(params)` - 获取统计数据

## 数据持久化

使用 `uni.storage` 进行本地存储：

- `pink_ledger_token` - 用户认证 token
- `pink_ledger_user` - 用户信息

## 注意事项

1. **跨域问题**：
   - H5 端开发时可能遇到跨域问题
   - 需要在后端配置 CORS
   - 或使用 manifest.json 配置代理

2. **Token 过期**：
   - Token 过期后会自动跳转到登录页
   - 需要重新登录

3. **图标显示**：
   - 确保 TabBar 图标已添加到 `static/tabbar/` 目录
   - 图标建议使用 PNG 格式，尺寸 81x81px

4. **真机调试**：
   - 需要将 `baseUrl` 改为实际的服务器地址
   - 不能使用 `localhost`

## 美化建议

当前 UI 已经相对完善，使用了渐变色和现代化设计风格：

- 主色调：粉红色渐变（#FF9A9E 到 #FAD0C4）
- 辅助色：紫色渐变（#667eea 到 #764ba2）
- 收入色：绿色（#06D6A0）
- 支出色：红色（#FF6B6B）

## 后续优化方向

- [ ] 添加图表展示（可使用 uCharts）
- [ ] 添加预算管理功能
- [ ] 添加账单搜索功能
- [ ] 添加账单导出功能
- [ ] 添加多账户管理
- [ ] 添加指纹/面容解锁
- [ ] 添加暗黑模式

## License

ISC

