import { body, param, query } from 'express-validator';

export class UserValidator {
  /**
   * 用户注册验证规则
   * 要求：
   * 1. 用户名/账号不能为空，不能为空字符串
   * 2. 密码不能为空
   * 3. 密码必须同时包含【英文字母 + 数字】，长度至少6位
   */
  static register = [
    // 用户名验证
    body('username')
      .trim()
      .notEmpty()
      .withMessage('用户名不能为空')
      .isLength({ min: 3, max: 30 })
      .withMessage('用户名长度为3-30个字符')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('用户名只能包含字母、数字和下划线'),

    // 密码验证
    body('password')
      .trim()
      .notEmpty()
      .withMessage('密码不能为空')
      .isLength({ min: 6 })
      .withMessage('密码至少6个字符')
      .matches(/^(?=.*[a-zA-Z])(?=.*\d).+$/)
      .withMessage('密码必须同时包含英文字母和数字'),

    // 邮箱验证
    body('email')
      .trim()
      .notEmpty()
      .withMessage('邮箱不能为空')
      .isEmail()
      .withMessage('请输入有效的邮箱地址')
      .normalizeEmail(),

    // 全名验证（可选）
    body('full_name')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('全名不能超过50个字符'),

    // 手机号验证（可选）
    body('phone')
      .optional()
      .trim()
      .matches(/^[0-9+\-\s()]+$/)
      .withMessage('请输入有效的手机号码')
      .isLength({ min: 10, max: 20 })
      .withMessage('手机号码长度应在10-20位之间'),
  ];

  /**
   * 用户登录验证规则
   */
  static login = [
    body('username')
      .trim()
      .notEmpty()
      .withMessage('用户名不能为空'),

    body('password')
      .trim()
      .notEmpty()
      .withMessage('密码不能为空'),
  ];

  /**
   * 更新用户信息验证规则
   */
  static updateProfile = [
    body('full_name')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('全名不能超过50个字符'),

    body('phone')
      .optional()
      .trim()
      .matches(/^[0-9+\-\s()]+$/)
      .withMessage('请输入有效的手机号码')
      .isLength({ min: 10, max: 20 })
      .withMessage('手机号码长度应在10-20位之间'),

    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('请输入有效的邮箱地址')
      .normalizeEmail(),
  ];

  /**
   * 修改密码验证规则
   */
  static changePassword = [
    body('currentPassword')
      .trim()
      .notEmpty()
      .withMessage('当前密码不能为空'),

    body('newPassword')
      .trim()
      .notEmpty()
      .withMessage('新密码不能为空')
      .isLength({ min: 6 })
      .withMessage('新密码至少6个字符')
      .matches(/^(?=.*[a-zA-Z])(?=.*\d).+$/)
      .withMessage('新密码必须同时包含英文字母和数字'),
  ];

  /**
   * 获取用户列表验证规则
   */
  static getUsers = [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('页码必须是大于0的整数'),

    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('每页数量必须在1-100之间'),

    query('search')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('搜索关键词不能超过50个字符'),

    query('status')
      .optional()
      .isIn(['active', 'inactive', 'suspended'])
      .withMessage('状态必须是active、inactive或suspended'),
  ];

  /**
   * 用户ID参数验证
   */
  static userIdParam = [
    param('id')
      .isInt({ min: 1 })
      .withMessage('用户ID必须是大于0的整数'),
  ];

  /**
   * 更新用户状态验证规则
   */
  static updateStatus = [
    param('id')
      .isInt({ min: 1 })
      .withMessage('用户ID必须是大于0的整数'),

    body('status')
      .isIn(['active', 'inactive', 'suspended'])
      .withMessage('状态必须是active、inactive或suspended'),
  ];
}

export default UserValidator;