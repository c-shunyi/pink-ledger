# 统一响应工具使用文档

## 简介

`sendResponse` 是一个统一的响应方法，通过传入 config 配置对象来控制所有响应参数。

## 导入

```javascript
const sendResponse = require('../utils/response');
```

## 方法签名

```javascript
sendResponse(res, config)
```

### 参数说明

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `res` | Object | - | Express response 对象（必填）|
| `config.status` | Number | 200 | HTTP 状态码 |
| `config.code` | Number | 200 | 业务状态码 |
| `config.msg` | String | '操作成功' | 提示信息 |
| `config.data` | Any | null | 返回数据 |

### 响应格式

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": { ... }
}
```

## 使用示例

### 1. 成功响应（默认）

```javascript
// 最简单的成功响应
return sendResponse(res, {
  msg: '获取成功',
  data: { user: userInfo }
});

// 返回：HTTP 200, code 200
```

### 2. 参数错误（400）

```javascript
return sendResponse(res, {
  code: 400,
  msg: '用户名和密码不能为空'
});

// 返回：HTTP 200, code 400
```

### 3. 未授权（401）

```javascript
// 注意：未授权需要设置 status: 401
return sendResponse(res, {
  status: 401,
  code: 401,
  msg: '未提供认证令牌'
});

// 返回：HTTP 401, code 401
```

### 4. 资源不存在（404）

```javascript
return sendResponse(res, {
  code: 404,
  msg: '用户不存在'
});

// 返回：HTTP 200, code 404
```

### 5. 禁止访问（403）

```javascript
return sendResponse(res, {
  code: 403,
  msg: '系统分类不能修改'
});

// 返回：HTTP 200, code 403
```

### 6. 服务器错误（500）

```javascript
return sendResponse(res, {
  code: 500,
  msg: '服务器内部错误'
});

// 返回：HTTP 200, code 500
```

### 7. 只返回消息（无数据）

```javascript
return sendResponse(res, {
  msg: '删除成功'
});

// 返回：HTTP 200, code 200, data: null
```

## 完整控制器示例

### 用户登录

```javascript
const sendResponse = require('../utils/response');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 参数验证
    if (!username || !password) {
      return sendResponse(res, {
        code: 400,
        msg: '用户名和密码不能为空'
      });
    }

    // 查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return sendResponse(res, {
        code: 401,
        msg: '用户名或密码错误'
      });
    }

    // 验证密码
    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return sendResponse(res, {
        code: 401,
        msg: '用户名或密码错误'
      });
    }

    // 成功响应
    return sendResponse(res, {
      code: 200,
      msg: '登录成功',
      data: {
        token: generateToken(user.id),
        user: user.toSafeObject()
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    return sendResponse(res, {
      code: 500,
      msg: '登录失败'
    });
  }
};
```

### 认证中间件

```javascript
const sendResponse = require('../utils/response');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    
    if (!token) {
      return sendResponse(res, {
        status: 401,  // HTTP 401
        code: 401,
        msg: '未提供认证令牌'
      });
    }

    const decoded = jwt.verify(token, SECRET);
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return sendResponse(res, {
        status: 401,  // HTTP 401
        code: 401,
        msg: '用户不存在'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendResponse(res, {
        status: 401,
        code: 401,
        msg: '令牌已过期'
      });
    }
    return sendResponse(res, {
      code: 500,
      msg: '认证失败'
    });
  }
};
```

### 资源删除

```javascript
const sendResponse = require('../utils/response');

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findOne({ 
      where: { id, userId: req.userId } 
    });

    // 资源不存在
    if (!category) {
      return sendResponse(res, {
        code: 404,
        msg: '分类不存在或无权限删除'
      });
    }

    // 权限校验
    if (category.isSystem) {
      return sendResponse(res, {
        code: 403,
        msg: '系统分类不能删除'
      });
    }

    await category.destroy();

    return sendResponse(res, {
      msg: '删除成功'
    });
  } catch (error) {
    console.error('删除分类失败:', error);
    return sendResponse(res, {
      code: 500,
      msg: '删除分类失败'
    });
  }
};
```

## HTTP 状态码规则

- **HTTP 401**: 仅用于认证失败（需要显式设置 `status: 401`）
- **HTTP 200**: 所有其他情况（默认值）
- **业务状态码（code）**: 用于区分具体的业务状态
  - `200`: 成功
  - `400`: 参数错误
  - `401`: 认证/授权错误
  - `403`: 禁止访问
  - `404`: 资源不存在
  - `500`: 服务器错误

## 优势

1. ✅ **极简设计**: 只有一个方法，通过 config 配置一切
2. ✅ **灵活配置**: 可以自由组合 status、code、msg、data
3. ✅ **统一规范**: 所有响应格式完全一致
4. ✅ **代码简洁**: 减少重复代码，提高可读性
5. ✅ **易于维护**: 修改响应格式只需改一个地方

## 最佳实践

1. 总是使用 `return` 关键字返回响应
2. 认证失败时记得设置 `status: 401`
3. 其他所有情况使用默认的 `status: 200`
4. 通过 `code` 字段区分不同的业务状态
5. 提供清晰的 `msg` 提示信息
6. 成功时尽量返回有意义的 `data`

