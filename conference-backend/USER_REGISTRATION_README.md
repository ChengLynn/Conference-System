# 用户注册接口文档

## 概述

已成功为会议管理系统后端创建了一套完整的用户注册接口。该接口使用 TypeScript + Express 开发，包含完整的参数验证、错误处理和标准JSON响应格式。

## 功能特性

✅ **完整的用户注册功能**
- 用户名/账号验证（不能为空，3-30个字符，只能包含字母、数字和下划线）
- 密码验证（不能为空，至少6位，必须同时包含英文字母和数字）
- 邮箱验证（不能为空，必须是有效邮箱格式）
- 可选字段：全名、手机号

✅ **参数校验**
- 实时验证输入数据
- 明确的错误提示信息
- 防止重复注册（用户名和邮箱唯一性检查）

✅ **标准响应格式**
- 成功响应：`{ success: true, message: "...", data: {...} }`
- 失败响应：`{ success: false, message: "...", error: "..." }`

✅ **完整的用户管理**
- 用户注册
- 用户登录
- 个人信息管理
- 密码修改
- 退出登录

## 文件结构

```
src/
├── interfaces/
│   └── IUser.ts              # 用户接口定义
├── models/
│   └── User.ts               # 用户数据模型
├── validators/
│   └── userValidator.ts      # 用户参数验证器
├── controllers/
│   └── userController.ts     # 用户控制器
├── routes/
│   ├── userRoutes.ts         # 用户路由
│   └── index.ts              # 路由集成
└── config/
    └── database.ts           # 数据库配置（已添加用户表）
```

## 数据库表结构

已添加 `users` 表到 SQLite 数据库：

```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  status TEXT CHECK(status IN ('active', 'inactive', 'suspended')) DEFAULT 'active',
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## API 接口

### 1. 用户注册
**POST** `/api/users/register`

**请求参数：**
```json
{
  "username": "testuser",
  "password": "password123",
  "email": "test@example.com",
  "full_name": "测试用户",
  "phone": "13800138000"
}
```

**成功响应：**
```json
{
  "success": true,
  "message": "用户注册成功",
  "data": {
    "id": "1",
    "username": "testuser",
    "email": "test@example.com",
    "full_name": "测试用户",
    "phone": "13800138000",
    "status": "active",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**验证失败响应：**
```json
{
  "success": false,
  "message": "密码必须同时包含英文字母和数字",
  "error": "密码必须同时包含英文字母和数字"
}
```

### 2. 用户登录
**POST** `/api/users/login`

### 3. 检查用户名是否可用
**GET** `/api/users/check-username?username=xxx`

### 4. 检查邮箱是否可用
**GET** `/api/users/check-email?email=xxx`

### 5. 获取当前用户信息（需要认证）
**GET** `/api/users/me`

### 6. 更新用户信息（需要认证）
**PUT** `/api/users/profile`

### 7. 修改密码（需要认证）
**POST** `/api/users/change-password`

### 8. 退出登录（需要认证）
**POST** `/api/users/logout`

## 密码验证规则

密码必须满足以下条件：
1. **不能为空**
2. **长度至少6位**
3. **必须同时包含英文字母和数字**

**有效密码示例：**
- `password123`
- `abc123`
- `123abc`
- `Pass123`

**无效密码示例：**
- `123456`（只有数字）
- `abcdef`（只有字母）
- `123`（太短）
- `password`（只有字母）

## 快速开始

### 1. 启动服务器
```bash
npm run dev
```

### 2. 运行测试脚本
```bash
node test_user_registration.js
```

### 3. 使用 curl 测试
```bash
# 用户注册
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123",
    "email": "test@example.com",
    "full_name": "测试用户"
  }'

# 检查用户名
curl "http://localhost:3000/api/users/check-username?username=testuser"

# 用户登录
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

## 测试用例

已创建完整的测试脚本 `test_user_registration.js`，包含：

1. **有效用户注册测试**
2. **参数验证测试**（空用户名、短密码、无效密码格式、无效邮箱）
3. **重复注册测试**
4. **用户登录测试**

## 技术实现细节

### 验证器 (userValidator.ts)
使用 `express-validator` 实现：
- 用户名验证：非空、长度3-30、只允许字母数字下划线
- 密码验证：非空、长度≥6、必须包含字母和数字
- 邮箱验证：非空、有效邮箱格式
- 可选字段验证：全名长度、手机号格式

### 控制器 (userController.ts)
使用 `ErrorHandler.catchAsync` 包装异步函数，确保错误被正确处理：
- 统一的错误处理
- 详细的日志记录
- 标准化的响应格式

### 数据模型 (User.ts)
- 使用 bcrypt 加密密码
- 完整的 CRUD 操作
- 唯一性检查（用户名、邮箱）
- 状态管理（active/inactive/suspended）

## 集成说明

用户注册接口已完全集成到现有项目中：

1. **数据库集成**：已更新 `database.ts` 添加用户表
2. **路由集成**：已更新 `routes/index.ts` 添加用户路由
3. **接口集成**：已添加 `IUser.ts` 接口定义
4. **模型集成**：已添加 `User.ts` 数据模型并更新 `models/index.ts`

## 注意事项

1. **密码安全**：所有密码使用 bcrypt 加密存储
2. **数据唯一性**：用户名和邮箱具有唯一约束
3. **输入验证**：所有输入都经过严格验证
4. **错误处理**：提供明确的错误提示信息
5. **响应格式**：统一的 JSON 响应格式

## 扩展建议

未来可以扩展的功能：
1. 邮箱验证（发送验证邮件）
2. 密码重置功能
3. 用户角色和权限管理
4. 第三方登录（微信、GitHub等）
5. 用户头像上传

---

**创建时间**：2026年4月2日  
**技术栈**：TypeScript + Express + SQLite  
**状态**：✅ 已完成并测试通过