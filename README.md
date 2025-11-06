# 🌸 Pink Ledger - 优雅记账应用

一个功能完善、界面优雅的记账应用，支持多端运行。

## 项目介绍

Pink Ledger 是一个基于 Express + SQLite + uniapp 开发的全栈记账应用，提供完整的记账功能，包括账单管理、统计分析、分类管理等。

### 特色功能

- 💰 **账单管理** - 支持收入/支出记录，多维度筛选
- 📊 **统计分析** - 月度/年度统计，分类占比分析
- 🏷️ **分类管理** - 系统分类 + 自定义分类
- 🎨 **优雅设计** - 渐变色设计，现代化 UI
- 📱 **多端支持** - 支持 H5、小程序、App
- 🔐 **安全可靠** - JWT 认证，密码加密

## 技术栈

### 后端 (pink-ledger-node)
- **Node.js** - 运行环境
- **Express** - Web 框架
- **Sequelize** - ORM 框架
- **SQLite** - 轻量级数据库
- **JWT** - 身份认证
- **Bcrypt** - 密码加密

### 前端 (pink-ledger-uniapp)
- **uni-app** - 跨平台应用框架
- **Vue.js** - 渐进式框架

## 项目结构

```
pink-ledger/
├── pink-ledger-node/          # 后端项目
│   ├── src/
│   │   ├── config/           # 配置
│   │   ├── models/           # 数据模型
│   │   ├── controllers/      # 控制器
│   │   ├── routes/           # 路由
│   │   ├── middlewares/      # 中间件
│   │   └── app.js           # 入口文件
│   ├── package.json
│   └── README.md
│
└── pink-ledger-uniapp/       # 前端项目
    ├── config/              # 配置
    ├── utils/               # 工具类
    ├── pages/               # 页面
    ├── static/              # 静态资源
    ├── pages.json
    ├── manifest.json
    └── README.md
```

## 快速开始

### 环境要求

- Node.js >= 14.0.0
- pnpm（推荐）或 npm
- HBuilderX（前端开发）

### 1. 启动后端服务

```bash
# 进入后端目录
cd pink-ledger-node

# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev
```

后端服务将在 `http://localhost:3000` 启动。

详细说明请查看：[后端 README](pink-ledger-node/README.md)

### 2. 配置并启动前端

#### 配置后端地址

编辑 `pink-ledger-uniapp/config/index.js`：

```javascript
export default {
  baseUrl: 'http://localhost:3000/api',  // 开发环境
  // baseUrl: 'http://你的服务器IP:3000/api',  // 生产环境
}
```

#### 运行前端

使用 HBuilderX 打开 `pink-ledger-uniapp` 目录：
1. 点击工具栏的"运行" 
2. 选择"运行到浏览器"或其他平台
3. 首次运行会自动安装依赖

详细说明请查看：[前端 README](pink-ledger-uniapp/README.md)

## 功能预览

### 核心功能

#### 1. 用户系统
- 用户注册/登录
- JWT Token 认证
- 个人信息管理

#### 2. 账单管理
- 添加收入/支出记录
- 选择分类、日期、账户类型
- 查看账单列表（按日期分组）
- 账单详情查看
- 编辑/删除账单
- 多条件筛选

#### 3. 统计分析
- 月度/年度切换
- 总收入、总支出、结余统计
- 分类支出/收入统计
- 分类占比分析

#### 4. 分类管理
- 13 个系统预设分类
- 创建自定义分类
- 编辑分类（名称、图标、颜色）
- 删除自定义分类

### 系统预设分类

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

## API 接口

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户
- `PUT /api/auth/profile` - 更新用户信息

### 分类接口
- `GET /api/categories` - 获取分类列表
- `POST /api/categories` - 创建分类
- `PUT /api/categories/:id` - 更新分类
- `DELETE /api/categories/:id` - 删除分类

### 账单接口
- `GET /api/transactions` - 获取账单列表
- `GET /api/transactions/statistics` - 获取统计数据
- `GET /api/transactions/:id` - 获取账单详情
- `POST /api/transactions` - 创建账单
- `PUT /api/transactions/:id` - 更新账单
- `DELETE /api/transactions/:id` - 删除账单

详细的 API 测试示例请查看：[api-examples.http](pink-ledger-node/api-examples.http)

## 使用指南

详细的使用说明请查看：[使用指南](pink-ledger-uniapp/USAGE.md)

## 常见问题

### Q: 如何修改后端端口？
**A:** 修改 `pink-ledger-node/.env` 文件中的 `PORT` 配置。

### Q: 真机调试无法连接后端？
**A:** 
1. 确保手机和电脑在同一局域网
2. 将前端配置中的 `localhost` 改为电脑的局域网 IP
3. 例如：`http://192.168.1.100:3000/api`

### Q: 如何添加 TabBar 图标？
**A:** 参考 [TabBar 图标说明](pink-ledger-uniapp/static/tabbar/README.md)

### Q: 如何备份数据？
**A:** 备份 `pink-ledger-node/database.sqlite` 文件即可。

## 数据安全

- ✅ 密码使用 bcrypt 加密存储
- ✅ JWT Token 认证，有效期可配置
- ✅ 所有需要认证的接口都有权限校验
- ✅ 数据存储在本地 SQLite 数据库

## 开发计划

- [ ] 添加图表可视化（ECharts/uCharts）
- [ ] 预算管理功能
- [ ] 账单搜索功能
- [ ] 账单导出（Excel/PDF）
- [ ] 多账户管理
- [ ] 周期性账单（订阅等）
- [ ] 数据同步功能
- [ ] 暗黑模式

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 开源协议

ISC License

## 致谢

感谢所有开源项目的贡献者！

---

**💝 如果这个项目对你有帮助，欢迎 Star ⭐️**

