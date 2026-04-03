import { Router } from 'express';
import { UserController } from '@/controllers/userController';
import { UserValidator } from '@/validators/userValidator';
import { AuthMiddleware } from '@/middleware/auth';

const router = Router();

// ==================== 公开路由（无需认证） ====================

/**
 * @route POST /api/users/register
 * @desc 用户注册
 * @access 公开
 * @param {string} username - 用户名（3-30个字符，只能包含字母、数字和下划线）
 * @param {string} password - 密码（至少6位，必须包含英文字母和数字）
 * @param {string} email - 邮箱地址
 * @param {string} [full_name] - 全名（可选，最多50个字符）
 * @param {string} [phone] - 手机号（可选，10-20位）
 * @returns {Object} 注册结果
 * @example
 * // 请求示例
 * {
 *   "username": "testuser",
 *   "password": "password123",
 *   "email": "test@example.com",
 *   "full_name": "测试用户",
 *   "phone": "13800138000"
 * }
 * 
 * // 成功响应示例
 * {
 *   "success": true,
 *   "message": "用户注册成功",
 *   "data": {
 *     "id": "1",
 *     "username": "testuser",
 *     "email": "test@example.com",
 *     "full_name": "测试用户",
 *     "phone": "13800138000",
 *     "status": "active",
 *     "created_at": "2024-01-01T00:00:00.000Z",
 *     "updated_at": "2024-01-01T00:00:00.000Z"
 *   }
 * }
 * 
 * // 失败响应示例
 * {
 *   "success": false,
 *   "message": "用户名已存在",
 *   "error": "用户名已存在"
 * }
 */
router.post(
  '/register',
  UserValidator.register,
  UserController.register
);

/**
 * @route POST /api/users/login
 * @desc 用户登录
 * @access 公开
 */
router.post(
  '/login',
  UserValidator.login,
  UserController.login
);

/**
 * @route GET /api/users/check-username
 * @desc 检查用户名是否可用
 * @access 公开
 * @query {string} username - 要检查的用户名
 */
router.get(
  '/check-username',
  UserController.checkUsername
);

/**
 * @route GET /api/users/check-email
 * @desc 检查邮箱是否可用
 * @access 公开
 * @query {string} email - 要检查的邮箱地址
 */
router.get(
  '/check-email',
  UserController.checkEmail
);

// ==================== 需要认证的路由 ====================

// 应用认证中间件
router.use(AuthMiddleware.authenticate);

/**
 * @route GET /api/users/me
 * @desc 获取当前用户信息
 * @access 私有
 */
router.get(
  '/me',
  UserController.getCurrentUser
);

/**
 * @route PUT /api/users/profile
 * @desc 更新用户信息
 * @access 私有
 */
router.put(
  '/profile',
  UserValidator.updateProfile,
  UserController.updateProfile
);

/**
 * @route POST /api/users/change-password
 * @desc 修改密码
 * @access 私有
 */
router.post(
  '/change-password',
  UserValidator.changePassword,
  UserController.changePassword
);

/**
 * @route POST /api/users/logout
 * @desc 退出登录
 * @access 私有
 */
router.post(
  '/logout',
  UserController.logout
);

// ==================== 管理员路由（可根据需要添加权限控制） ====================

/**
 * @route GET /api/users
 * @desc 获取用户列表（管理员功能）
 * @access 管理员
 * @query {number} [page=1] - 页码
 * @query {number} [limit=20] - 每页数量（1-100）
 * @query {string} [search] - 搜索关键词（用户名、邮箱、全名）
 * @query {string} [status] - 用户状态（active/inactive/suspended）
 */
router.get(
  '/',
  UserValidator.getUsers,
  UserController.getUsers
);

export { router as userRoutes };
