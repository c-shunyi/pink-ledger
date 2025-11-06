# Pink Ledger - 记账软件后端

一个基于 Express + Sequelize + SQLite 的记账软件后端服务。

## 技术栈

- **Node.js** - 运行环境
- **Express** - Web 框架
- **Sequelize** - ORM 框架
- **SQLite** - 轻量级数据库
- **JWT** - 身份认证
- **Bcrypt** - 密码加密

## 功能特性

- ✅ 用户注册与登录
- ✅ JWT 身份认证
- ✅ 账单管理（增删改查）
- ✅ 分类管理（支持系统分类和自定义分类）
- ✅ 统计报表（收入、支出、分类统计）
- ✅ 数据分页
- ✅ 日期范围筛选

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

创建 `.env` 文件（或使用默认配置）：

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d
DB_PATH=./database.sqlite
```

### 3. 启动服务

```bash
# 开发模式（热重载）
pnpm run dev

# 生产模式
pnpm start
```

服务将在 `http://localhost:3000` 启动。

## API 文档

### 基础路径

```
http://localhost:3000/api
```

### 认证相关

#### 用户注册
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "user123",
  "password": "123456",
  "nickname": "用户昵称"
}
```

#### 用户登录
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "user123",
  "password": "123456"
}
```

#### 获取当前用户信息
```
GET /api/auth/me
Authorization: Bearer <token>
```

#### 更新用户信息
```
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "nickname": "新昵称",
  "avatar": "头像URL"
}
```

### 分类管理

#### 获取分类列表
```
GET /api/categories?type=expense
Authorization: Bearer <token>

查询参数:
- type: income(收入) 或 expense(支出)，可选
```

#### 创建分类
```
POST /api/categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "零食",
  "type": "expense",
  "icon": "🍭",
  "color": "#FF6B6B"
}
```

#### 更新分类
```
PUT /api/categories/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "新名称",
  "icon": "🎉",
  "color": "#00FF00"
}
```

#### 删除分类
```
DELETE /api/categories/:id
Authorization: Bearer <token>
```

### 账单管理

#### 获取账单列表
```
GET /api/transactions?type=expense&page=1&limit=20&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>

查询参数:
- type: income(收入) 或 expense(支出)，可选
- categoryId: 分类ID，可选
- startDate: 开始日期，可选
- endDate: 结束日期，可选
- page: 页码，默认1
- limit: 每页数量，默认20
```

#### 获取账单详情
```
GET /api/transactions/:id
Authorization: Bearer <token>
```

#### 创建账单
```
POST /api/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "categoryId": 1,
  "type": "expense",
  "amount": 50.00,
  "date": "2024-01-15",
  "description": "午餐",
  "accountType": "alipay"
}
```

#### 更新账单
```
PUT /api/transactions/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 60.00,
  "description": "午餐（已修改）"
}
```

#### 删除账单
```
DELETE /api/transactions/:id
Authorization: Bearer <token>
```

#### 获取统计数据
```
GET /api/transactions/statistics?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>

查询参数:
- startDate: 开始日期，可选
- endDate: 结束日期，可选
```

### 健康检查
```
GET /api/health
```

## 数据模型

### User（用户）
- id: 主键
- username: 用户名（唯一）
- password: 密码（加密）
- nickname: 昵称
- avatar: 头像
- createdAt: 创建时间
- updatedAt: 更新时间

### Category（分类）
- id: 主键
- name: 分类名称
- type: 类型（income/expense）
- icon: 图标
- color: 颜色
- isSystem: 是否系统分类
- userId: 用户ID（null 表示系统分类）
- createdAt: 创建时间
- updatedAt: 更新时间

### Transaction（账单）
- id: 主键
- userId: 用户ID
- categoryId: 分类ID
- type: 类型（income/expense）
- amount: 金额
- date: 日期
- description: 备注
- accountType: 账户类型（cash/alipay/wechat/bank）
- createdAt: 创建时间
- updatedAt: 更新时间

## 系统分类

系统会自动初始化以下分类：

**支出分类：**
- 🍽️ 餐饮
- 🚗 交通
- 🛒 购物
- 🎮 娱乐
- 💊 医疗
- 🏠 住房
- 📚 学习
- 💸 其他支出

**收入分类：**
- 💰 工资
- 💼 兼职
- 📈 投资
- 🧧 红包
- 💵 其他收入

## 项目结构

```
pink-ledger-node/
├── src/
│   ├── config/           # 配置文件
│   │   └── database.js   # 数据库配置
│   ├── models/           # 数据模型
│   │   ├── index.js
│   │   ├── User.js
│   │   ├── Category.js
│   │   └── Transaction.js
│   ├── controllers/      # 控制器
│   │   ├── authController.js
│   │   ├── categoryController.js
│   │   └── transactionController.js
│   ├── routes/          # 路由
│   │   ├── index.js
│   │   ├── auth.js
│   │   ├── categories.js
│   │   └── transactions.js
│   ├── middlewares/     # 中间件
│   │   ├── auth.js
│   │   └── errorHandler.js
│   └── app.js          # 应用入口
├── .env                 # 环境变量
├── .gitignore
├── package.json
└── README.md
```

## 注意事项

1. 请在生产环境中修改 `JWT_SECRET` 为安全的密钥
2. 系统分类不可被修改或删除
3. 删除分类前需确保没有关联的账单记录
4. 所有接口（除注册和登录）都需要 JWT 认证
5. SQLite 数据库文件会自动创建在项目根目录

## 开发建议

- 使用 `nodemon` 进行热重载开发
- 生产环境建议使用 PM2 进行进程管理
- 定期备份 SQLite 数据库文件
- 建议配置日志系统记录操作日志

## License

ISC

