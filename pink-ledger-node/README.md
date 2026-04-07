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
- ✅ 微信一键登录（小程序）
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

复制 `.env.example` 文件并重命名为 `.env`，然后根据实际情况修改配置：

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑配置文件
vim .env  # 或使用其他编辑器
```

**必须配置的项：**
- `JWT_SECRET`: JWT 密钥（生产环境请修改为强密码）
- `WECHAT_APPID`: 微信小程序 AppID
- `WECHAT_APP_SECRET`: 微信小程序 AppSecret

**微信登录配置说明：**
1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入你的小程序
3. 在「开发」->「开发管理」->「开发设置」中找到：
   - **AppID**（小程序ID）
   - **AppSecret**（小程序密钥，生成时需管理员扫码）
4. 将获取到的 AppID 和 AppSecret 填入 `.env` 文件

### 3. 初始化数据库

**⚠️ 重要：首次运行前必须执行数据库初始化**

```bash
# 初始化数据库（创建表结构和系统分类）
node scripts/init-database.js
```

该脚本会：
- ✅ 检查数据库文件是否已存在
- 🚫 如果已存在，自动停止运行（避免误操作）
- 🔧 如果不存在，创建全新数据库并初始化：
  - 创建所有数据表
  - 初始化系统分类数据
  - 显示数据库状态

**核心特性：**
- 🔒 安全保护，自动检测已存在的数据库
- 🎯 专注首次初始化，不处理数据库更新
- 📊 简单直接，无需考虑增量更新

**更多选项：**

```bash
# 查看帮助信息
node scripts/init-database.js --help

# 重建数据库（先删除旧文件）
rm database.sqlite
node scripts/init-database.js
```

详细说明请查看 [scripts/README.md](./scripts/README.md)

### 4. 启动服务

```bash
# 开发模式（热重载）
pnpm run dev

# 生产模式
pnpm start
```

服务将在 `http://localhost:8860` 启动。

### 5. 使用 OrbStack / Docker Compose 本地部署

如果你希望 `pink-ledger-node` 直接跑在 OrbStack 里，可以在后端目录执行：

```bash
# 进入后端目录
cd pink-ledger-node

# 首次使用时准备环境变量
cp .env.example .env

# 构建并后台启动
pnpm run docker:up
```

容器启动时会自动执行 `node scripts/init-database.js`：
- 如果数据库不存在，会自动创建表结构并初始化系统分类
- 如果数据库已存在，会跳过初始化，直接启动服务

本地访问地址：

```text
http://localhost:8860/api
http://localhost:8860/api/health
```

数据库会持久化到项目目录下的 `./data/database.sqlite`，重启容器不会丢失数据。

常用命令：

```bash
# 查看日志
pnpm run docker:logs

# 停止容器
pnpm run docker:down

# 删除本地容器并重新创建（保留 data 目录）
pnpm run docker:down
pnpm run docker:up
```

## API 文档

### 基础路径

```
http://localhost:8860/api
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

#### 微信一键登录
```
POST /api/auth/wechat-login
Content-Type: application/json

{
  "code": "微信登录凭证code",
  "nickname": "用户昵称（可选）",
  "avatar": "头像URL（可选）"
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
  "description": "午餐"
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
- username: 用户名（唯一，可为空）
- password: 密码（加密，可为空）
- nickname: 昵称
- avatar: 头像
- wechat_openid: 微信小程序 openid（唯一）
- wechat_unionid: 微信 unionid
- wechat_session_key: 微信会话密钥
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
- createdAt: 创建时间
- updatedAt: 更新时间

## 系统分类

执行数据库初始化脚本后，系统会自动创建以下分类：

**支出分类：**
- 🍽️ 餐饮
- 🚗 交通
- 🛒 购物
- 🎮 娱乐
- 💊 医疗
- 🏠 住房
- 📚 学习
- 🍭 零食
- 🧴 日用
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
├── scripts/             # 管理脚本
│   ├── init-database.js # 数据库初始化脚本
│   └── README.md        # 脚本说明文档
├── .env                 # 环境变量
├── .gitignore
├── package.json
└── README.md
```

## 数据库迁移

如果你已有现有数据库，需要支持微信登录功能，请执行以下迁移脚本：

```bash
# 添加微信登录字段
node scripts/migrate-add-wechat-fields.js
```

此脚本会：
- ✅ 添加微信登录相关字段（wechat_openid、wechat_unionid、wechat_session_key）
- ✅ 将 username 和 password 改为可空（支持纯微信登录用户）
- ✅ 保留所有现有用户数据

**注意：** 新建项目不需要执行此脚本，直接运行 `init-database.js` 即可。

## 注意事项

1. **首次运行必须先执行数据库初始化脚本** `node scripts/init-database.js`
   - 脚本会检查数据库是否已存在
   - 如已存在会自动停止，避免误操作
   - 如果使用 `docker compose` / OrbStack，本步骤会在容器启动时自动完成
2. **如需添加微信登录功能到现有数据库**，请运行 `node scripts/migrate-add-wechat-fields.js`
3. 请在生产环境中修改 `JWT_SECRET` 为安全的密钥
4. 微信登录需要配置 `WECHAT_APPID` 和 `WECHAT_APP_SECRET` 环境变量
5. 系统分类不可被修改或删除
6. 删除分类前需确保没有关联的账单记录
7. 所有接口（除注册、登录和微信登录）都需要 JWT 认证
8. SQLite 数据库文件位置由 `DB_PATH` 环境变量指定
   - 本机运行默认是 `./database.sqlite`
   - OrbStack / Docker Compose 默认是 `./data/database.sqlite`

## 开发建议

- 使用 `nodemon` 进行热重载开发
- 生产环境建议使用 PM2 进行进程管理
- 定期备份 SQLite 数据库文件
- 建议配置日志系统记录操作日志

## License

ISC
