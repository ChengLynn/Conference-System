import { body, param, query } from 'express-validator';

export class AuthValidator {
  static login = [
    body('username')
      .trim()
      .notEmpty()
      .withMessage('用户名不能为空')
      .isLength({ min: 3, max: 30 })
      .withMessage('用户名长度为3-30个字符'),
    
    body('password')
      .trim()
      .notEmpty()
      .withMessage('密码不能为空')
      .isLength({ min: 6 })
      .withMessage('密码至少6个字符'),
  ];

  static register = [
    body('username')
      .trim()
      .notEmpty()
      .withMessage('用户名不能为空')
      .isLength({ min: 3, max: 30 })
      .withMessage('用户名长度为3-30个字符')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('用户名只能包含字母、数字和下划线'),
    
    body('password')
      .trim()
      .notEmpty()
      .withMessage('密码不能为空')
      .isLength({ min: 6 })
      .withMessage('密码至少6个字符'),
    
    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('请输入有效的邮箱地址'),
    
    body('role')
      .optional()
      .isIn(['admin', 'super_admin'])
      .withMessage('角色必须是admin或super_admin'),
  ];

  static refreshToken = [
    body('refresh_token')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('刷新令牌不能为空'),
  ];

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
      .withMessage('新密码至少6个字符'),
  ];

  static updateProfile = [
    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('请输入有效的邮箱地址'),
  ];

  static getAdmins = [
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
  ];

  static deleteAdmin = [
    param('id')
      .isMongoId()
      .withMessage('无效的管理员ID'),
  ];
}