import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import AdminModel from '@/models/Admin';
import { AuthMiddleware } from '@/middleware/auth';
import { ApiResponse } from '@/utils/apiResponse';
import { config } from '@/config/env';
import { logger } from '@/utils/logger';
import { ErrorHandler } from '@/middleware/errorHandler';
import { IAuthTokens, IAdminLogin, IAdminCreate, IAdmin } from '@/interfaces/IAdmin';

export class AuthController {
  /**
   * 管理员登录
   */
  static login = ErrorHandler.catchAsync(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.badRequest(errors.array()[0].msg).send(res);
    }

    const { username, password }: IAdminLogin = req.body;
    // 分布解释
    // const user :IAdminLogin = req.body
    // const username  = user.username
    // const password = user.password

    try {
      // 查找管理员（包含密码字段）
      const adminWithPassword = await AdminModel.findByUsernameWithPassword(username);
      
      if (!adminWithPassword) {
        logger.warn('登录失败: 用户不存在', { username });
        return ApiResponse.unauthorized('用户名或密码错误').send(res);
      }

      // 验证密码
      const isPasswordValid = await AdminModel.verifyPassword(password, adminWithPassword.password);
      if (!isPasswordValid) {
        logger.warn('登录失败: 密码错误', { username });
        return ApiResponse.unauthorized('用户名或密码错误').send(res);
      }

      // 更新最后登录时间
      await AdminModel.updateLastLogin(parseInt(adminWithPassword._id!));

      // 获取更新后的管理员信息
      const admin = await AdminModel.findById(parseInt(adminWithPassword._id!));
      if (!admin || !admin._id) {
        return ApiResponse.unauthorized('用户不存在').send(res);
      }

      // 生成访问令牌和刷新令牌
      const tokens = this.generateTokens(admin);

      // 设置会话
      (req.session as any).admin = {
        id: admin._id.toString(),
        username: admin.username,
        role: admin.role,
      };

      // 设置HTTP-only cookie（可选）
      res.cookie('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30天
      });

      logger.info('登录成功', { username, role: admin.role });

      ApiResponse.success({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          last_login: admin.last_login,
        },
      }, '登录成功').send(res);

    } catch (error: any) {
      logger.error('登录过程中出错:', error);
      ApiResponse.error('登录失败，请稍后重试').send(res);
    }
  });

  /**
   * 管理员注册（仅限超级管理员使用）
   */
  static register = ErrorHandler.catchAsync(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.badRequest(errors.array()[0].msg).send(res);
    }

    // 检查当前用户是否有权限创建管理员
    if (req.user?.role !== 'super_admin') {
      return ApiResponse.forbidden('只有超级管理员可以创建新管理员').send(res);
    }

    const { username, password, email, role = 'admin' }: IAdminCreate = req.body;

    try {
      // 检查用户名是否已存在
      const usernameExists = await AdminModel.usernameExists(username);
      if (usernameExists) {
        return ApiResponse.conflict('用户名已存在').send(res);
      }

      // 创建新管理员
      const admin = await AdminModel.create({
        username,
        password,
        email,
        role,
      });

      logger.info('管理员创建成功', { 
        username, 
        role, 
        createdBy: req.user?.username 
      });

      ApiResponse.created({
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        created_at: admin.created_at,
      }, '管理员创建成功').send(res);

    } catch (error: any) {
      logger.error('创建管理员失败:', error);
      
      if (error.message === '用户名已存在') {
        return ApiResponse.conflict('用户名已存在').send(res);
      }
      
      ApiResponse.error('创建管理员失败').send(res);
    }
  });


  /**
   * 退出登录
   */
  static logout = ErrorHandler.catchAsync(async (req: Request, res: Response) => {
    try {
      // 清除会话
      req.session.destroy((err) => {
        if (err) {
          logger.error('清除会话失败:', err);
        }
      });

      // 清除刷新令牌cookie
      res.clearCookie('refresh_token');
      res.clearCookie('token');

      logger.info('用户退出登录', { 
        username: req.user?.username,
        userId: req.user?._id 
      });

      ApiResponse.success(null, '退出登录成功').send(res);

    } catch (error: any) {
      logger.error('退出登录过程中出错:', error);
      ApiResponse.error('退出登录失败').send(res);
    }
  });

  /**
   * 刷新访问令牌
   */
  static refreshToken = ErrorHandler.catchAsync(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refresh_token || req.body.refresh_token;

    if (!refreshToken) {
      return ApiResponse.unauthorized('刷新令牌不存在').send(res);
    }

    try {
      // 验证刷新令牌
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as any;
      
      // 查找管理员
      const admin = await AdminModel.findById(parseInt(decoded.id));
      if (!admin) {
        return ApiResponse.unauthorized('用户不存在').send(res);
      }

      // 生成新的访问令牌
      const tokens = this.generateTokens(admin);

      logger.info('令牌刷新成功', { username: admin.username });

      ApiResponse.success({
        access_token: tokens.access_token,
        expires_in: tokens.expires_in,
      }, '令牌刷新成功').send(res);

    } catch (error: any) {
      logger.error('刷新令牌失败:', error);
      
      if (error.name === 'TokenExpiredError') {
        return ApiResponse.unauthorized('刷新令牌已过期').send(res);
      }
      
      if (error.name === 'JsonWebTokenError') {
        return ApiResponse.unauthorized('无效的刷新令牌').send(res);
      }
      
      ApiResponse.unauthorized('刷新令牌失败').send(res);
    }
  });

  /**
   * 获取当前用户信息
   */
  static getCurrentUser = ErrorHandler.catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
      return ApiResponse.unauthorized('用户未登录').send(res);
    }

    try {
      const admin = await AdminModel.findById(parseInt(req.user._id!));
      
      if (!admin) {
        return ApiResponse.unauthorized('用户不存在').send(res);
      }

      ApiResponse.success({
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        last_login: admin.last_login,
        created_at: admin.created_at,
        updated_at: admin.updated_at,
      }).send(res);

    } catch (error: any) {
      logger.error('获取用户信息失败:', error);
      ApiResponse.error('获取用户信息失败').send(res);
    }
  });

  /**
   * 修改密码
   */
  static changePassword = ErrorHandler.catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
      return ApiResponse.unauthorized('用户未登录').send(res);
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return ApiResponse.badRequest('当前密码和新密码不能为空').send(res);
    }

    if (newPassword.length < 6) {
      return ApiResponse.badRequest('新密码至少6个字符').send(res);
    }

    try {
      // 获取管理员（包含密码字段）
      const adminWithPassword = await AdminModel.findByUsernameWithPassword(req.user.username);
      
      if (!adminWithPassword) {
        return ApiResponse.unauthorized('用户不存在').send(res);
      }

      // 验证当前密码
      const isPasswordValid = await AdminModel.verifyPassword(currentPassword, adminWithPassword.password!);
      if (!isPasswordValid) {
        return ApiResponse.unauthorized('当前密码错误').send(res);
      }

      // 更新密码
      await AdminModel.updatePassword(parseInt(req.user._id!), newPassword);

      logger.info('密码修改成功', { username: req.user.username });

      // 清除所有会话和令牌
      req.session.destroy(() => {});
      res.clearCookie('refresh_token');
      res.clearCookie('token');

      ApiResponse.success(null, '密码修改成功，请重新登录').send(res);

    } catch (error: any) {
      logger.error('修改密码失败:', error);
      ApiResponse.error('修改密码失败').send(res);
    }
  });

  /**
   * 更新用户信息
   */
  static updateProfile = ErrorHandler.catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
      return ApiResponse.unauthorized('用户未登录').send(res);
    }

    const { email } = req.body;

    try {
      // 检查邮箱是否已被其他用户使用
      if (email) {
        const emailExists = await AdminModel.emailExists(email, parseInt(req.user._id!));
        if (emailExists) {
          return ApiResponse.conflict('邮箱已被其他用户使用').send(res);
        }
      }

      // 更新用户信息
      const admin = await AdminModel.update(parseInt(req.user._id!), { email });

      if (!admin) {
        return ApiResponse.notFound('用户不存在').send(res);
      }

      logger.info('用户信息更新成功', { 
        username: admin.username,
        updatedFields: { email }
      });

      ApiResponse.success({
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        last_login: admin.last_login,
        updated_at: admin.updated_at,
      }, '用户信息更新成功').send(res);

    } catch (error: any) {
      logger.error('更新用户信息失败:', error);
      ApiResponse.error('更新用户信息失败').send(res);
    }
  });

  /**
   * 获取管理员列表（仅限超级管理员）
   */
  static getAdmins = ErrorHandler.catchAsync(async (req: Request, res: Response) => {
    // 检查权限
    if (req.user?.role !== 'super_admin') {
      return ApiResponse.forbidden('只有超级管理员可以查看管理员列表').send(res);
    }

    try {
      const { page = 1, limit = 20, search } = req.query;
      const pageNum = Math.max(1, parseInt(String(page), 10));
      const limitNum = Math.max(1, Math.min(100, parseInt(String(limit), 10)));

      const result = await AdminModel.findAll({
        page: pageNum,
        limit: limitNum,
        search: search as string
      });

      const totalPages = Math.ceil(result.total / limitNum);

      ApiResponse.success({
        data: result.data,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: result.total,
          pages: totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1,
        },
      }).send(res);

    } catch (error: any) {
      logger.error('获取管理员列表失败:', error);
      ApiResponse.error('获取管理员列表失败').send(res);
    }
  });

  /**
   * 删除管理员（仅限超级管理员）
   */
  static deleteAdmin = ErrorHandler.catchAsync(async (req: Request, res: Response) => {
    // 检查权限
    if (req.user?.role !== 'super_admin') {
      return ApiResponse.forbidden('只有超级管理员可以删除管理员').send(res);
    }

    const { id } = req.params;

    try {
      // 不能删除自己
      if (id === req.user._id?.toString()) {
        return ApiResponse.badRequest('不能删除自己的账户').send(res);
      }

      const admin = await AdminModel.findById(parseInt(id));
      
      if (!admin) {
        return ApiResponse.notFound('管理员不存在').send(res);
      }

      // 不能删除超级管理员（除非是唯一的超级管理员）
      if (admin.role === 'super_admin') {
        const superAdminCount = await AdminModel.countSuperAdmins();
        if (superAdminCount <= 1) {
          return ApiResponse.badRequest('不能删除唯一的超级管理员').send(res);
        }
      }

      const deleted = await AdminModel.delete(parseInt(id));
      if (!deleted) {
        return ApiResponse.notFound('管理员不存在').send(res);
      }

      logger.info('管理员删除成功', { 
        deletedAdmin: admin.username,
        deletedBy: req.user.username 
      });

      ApiResponse.success(null, '管理员删除成功').send(res);

    } catch (error: any) {
      logger.error('删除管理员失败:', error);
      ApiResponse.error('删除管理员失败').send(res);
    }
  });

  /**
   * 生成访问令牌和刷新令牌
   */
  private static generateTokens(admin: IAdmin): IAuthTokens {
    const accessToken = AuthMiddleware.generateToken(admin);
    const refreshToken = AuthMiddleware.generateRefreshToken(admin);
    
    // 计算过期时间（秒）
    const expiresIn = this.parseJwtExpiry(config.jwt.expiresIn);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresIn,
    };
  }

  /**
   * 解析JWT过期时间字符串为秒数
   */
  private static parseJwtExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 7 * 24 * 60 * 60; // 默认7天
    }

    const [, value, unit] = match;
    const numValue = parseInt(value, 10);

    switch (unit) {
      case 's': // 秒
        return numValue;
      case 'm': // 分钟
        return numValue * 60;
      case 'h': // 小时
        return numValue * 60 * 60;
      case 'd': // 天
        return numValue * 24 * 60 * 60;
      default:
        return 7 * 24 * 60 * 60;
    }
  }

  /**
   * 验证令牌
   */
  static verifyToken = ErrorHandler.catchAsync(async (req: Request, res: Response) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return ApiResponse.badRequest('令牌不存在').send(res);
    }

    try {
      jwt.verify(token, config.jwt.secret);
      ApiResponse.success(null, '令牌有效').send(res);
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return ApiResponse.unauthorized('令牌已过期').send(res);
      }
      ApiResponse.unauthorized('无效的令牌').send(res);
    }
  });

  /**
   * 初始化管理员账户（开发环境使用）
   */
  static initializeAdmin = ErrorHandler.catchAsync(async (_req: Request, res: Response) => {
    // 只在开发环境允许此操作
    if (config.env !== 'development') {
      return ApiResponse.forbidden('此操作仅限开发环境').send(res);
    }

    const { username, password, email } = config.admin;

    try {
      // 检查是否已存在管理员
      const existingAdmin = await AdminModel.findByUsernameWithPassword(username);
      
      if (existingAdmin) {
        logger.info('管理员账户已存在', { username });
        return ApiResponse.success(
          { username, message: '管理员账户已存在' },
          '管理员账户已存在'
        ).send(res);
      }

      // 创建默认管理员
      const admin = await AdminModel.create({
        username,
        password,
        email,
        role: 'super_admin',
      });

      logger.info('默认管理员创建成功', { username });

      ApiResponse.created(
        {
          username: admin.username,
          email: admin.email,
          role: admin.role,
        },
        '默认管理员创建成功'
      ).send(res);

    } catch (error: any) {
      logger.error('初始化管理员失败:', error);
      ApiResponse.error('初始化管理员失败').send(res);
    }
  });
}

export default AuthController;