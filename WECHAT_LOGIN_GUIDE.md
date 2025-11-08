# 微信一键登录配置指南

本指南将帮助你在 Pink Ledger 项目中配置和使用微信一键登录功能。

## 📋 功能说明

微信一键登录允许用户通过微信小程序快速登录，无需注册账号密码。首次登录时系统会自动创建账户。

### 功能特点

- ✅ 一键快速登录，无需注册
- ✅ 自动获取微信用户信息（昵称、头像）
- ✅ 安全的 OpenID 绑定机制
- ✅ 支持与传统账号密码登录并存
- ✅ 优雅的登录界面设计

## 🚀 配置步骤

### 1. 后端配置

#### 1.1 安装依赖

后端需要 `axios` 依赖来调用微信接口：

```bash
cd pink-ledger-node
pnpm install axios
```

#### 1.2 配置微信小程序信息

在后端项目根目录创建或编辑 `.env` 文件：

```env
# 微信小程序配置
WECHAT_APPID=your_wechat_appid_here
WECHAT_APP_SECRET=your_wechat_app_secret_here
```

**获取 AppID 和 AppSecret：**

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入你的小程序
3. 在「开发」->「开发管理」->「开发设置」中找到 AppID
4. 在同一页面生成或查看 AppSecret（需要管理员扫码确认）

#### 1.3 数据库迁移（如果是现有项目）

如果你的数据库已经存在，需要执行迁移脚本添加微信登录字段：

```bash
cd pink-ledger-node
node scripts/migrate-add-wechat-fields.js
```

**新项目可以跳过此步骤**，直接运行初始化脚本：

```bash
node scripts/init-database.js
```

#### 1.4 启动后端服务

```bash
pnpm run dev
```

### 2. 前端配置

#### 2.1 配置小程序 AppID

编辑 `pink-ledger-uniapp/manifest.json` 文件，配置小程序 AppID：

```json
{
  "mp-weixin": {
    "appid": "your_wechat_appid_here",
    ...
  }
}
```

#### 2.2 配置后端接口地址

编辑 `pink-ledger-uniapp/config/index.js`，确保 API 地址正确：

```javascript
export default {
  // 本地开发
  baseURL: 'http://localhost:3000/api',
  // 或线上地址
  // baseURL: 'https://your-domain.com/api'
}
```

#### 2.3 配置小程序服务器域名

在微信公众平台配置服务器域名：

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入「开发」->「开发管理」->「开发设置」
3. 在「服务器域名」中添加你的后端 API 域名
   - request 合法域名：`https://your-domain.com`
   - 本地开发可以勾选「不校验合法域名」

## 🎯 使用流程

### 用户登录流程

1. 用户点击「微信一键登录」按钮
2. 小程序请求用户授权获取基本信息（昵称、头像）
3. 获取微信登录凭证 code
4. 将 code 和用户信息发送到后端
5. 后端使用 code 向微信服务器换取 openid
6. 根据 openid 查找或创建用户
7. 返回 JWT token 给前端
8. 前端保存 token，完成登录

### 技术实现

**前端调用示例：**

```javascript
import { wechatLogin } from '@/api'

// 微信一键登录
const handleWechatLogin = async () => {
  // 1. 获取微信登录凭证
  const loginRes = await uni.login({ provider: 'weixin' })
  const code = loginRes[1].code
  
  // 2. 获取用户信息（需要用户授权）
  const userInfoRes = await uni.getUserProfile({
    desc: '用于完善用户资料'
  })
  
  // 3. 调用后端接口
  const res = await wechatLogin({
    code: code,
    nickname: userInfoRes[1].userInfo.nickName,
    avatar: userInfoRes[1].userInfo.avatarUrl
  })
  
  // 4. 保存 token
  setToken(res.data.token)
  setUserInfo(res.data.user)
}
```

**后端接口：**

- **URL:** `POST /api/auth/wechat-login`
- **请求体：**
  ```json
  {
    "code": "微信登录凭证",
    "nickname": "用户昵称（可选）",
    "avatar": "头像URL（可选）"
  }
  ```
- **响应：**
  ```json
  {
    "code": 200,
    "msg": "登录成功",
    "data": {
      "token": "jwt_token",
      "user": {
        "id": 1,
        "username": "wx_xxx",
        "nickname": "微信用户",
        "avatar": "头像URL",
        "wechat_openid": "openid"
      }
    }
  }
  ```

## 📱 界面展示

登录页面现在包含：

1. **传统登录区域**
   - 用户名输入框
   - 密码输入框
   - 登录按钮

2. **分隔线** - "或"

3. **微信登录区域**
   - 微信一键登录按钮（绿色，带微信图标）

## 🔒 安全说明

### 数据安全

- ✅ OpenID 作为用户唯一标识，不会暴露用户微信信息
- ✅ Session Key 存储在服务端，用于解密用户敏感数据
- ✅ 所有接口使用 JWT token 进行身份验证
- ✅ AppSecret 仅存储在服务端，不会暴露给前端

### 隐私保护

- 用户首次登录时需要授权获取基本信息
- 用户可以选择使用传统账号密码登录
- 微信登录和传统登录方式可以独立使用

## 🐛 常见问题

### Q1: 提示"服务器配置错误"

**A:** 检查后端 `.env` 文件中的 `WECHAT_APPID` 和 `WECHAT_APP_SECRET` 是否正确配置。

### Q2: 提示"获取微信登录凭证失败"

**A:** 
1. 检查 `manifest.json` 中的 AppID 是否正确
2. 确认小程序已发布或在开发者工具中测试
3. 确认已在微信公众平台配置服务器域名

### Q3: 本地开发时无法登录

**A:** 
1. 在微信开发者工具中勾选「不校验合法域名」
2. 确保后端服务正常运行
3. 检查 `config/index.js` 中的 API 地址是否正确

### Q4: 用户信息获取失败 / 无法获取头像昵称

**A:** 
1. **新版微信小程序政策变化**：从 2022 年开始，微信调整了隐私政策，`uni.getUserProfile` 已无法获取真实的用户头像和昵称
2. **当前方案**：微信登录时使用默认昵称"微信用户"和空头像
3. **完善资料**：用户登录后可以在个人资料页面自己编辑昵称和头像
4. **如需获取真实头像昵称**：需要使用 `<button open-type="chooseAvatar">` 和 `<input type="nickname">` 组件，让用户手动选择

### Q5: 数据库迁移失败

**A:** 
1. 确保数据库文件存在
2. 确保有文件读写权限
3. 如果迁移失败，可以备份数据后重新初始化数据库

## 📚 相关文档

- [微信小程序登录文档](https://developers.weixin.qq.com/miniprogram/dev/api/open-api/login/wx.login.html)
- [微信开放平台](https://developers.weixin.qq.com/)
- [UniApp 微信登录](https://uniapp.dcloud.net.cn/api/plugins/login.html)

## 🎉 完成

现在你的 Pink Ledger 应用已经支持微信一键登录功能了！用户可以选择：

- 🔑 使用传统账号密码登录
- 💬 使用微信一键登录

两种登录方式互不影响，用户可以根据自己的喜好选择。

## 📝 更新日志

### v1.1.0 (2025-11-08)
- ✨ 新增微信一键登录功能
- 🔧 更新用户模型支持微信登录字段
- 📝 添加数据库迁移脚本
- 🎨 优化登录页面 UI

