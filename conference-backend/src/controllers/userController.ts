import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import UserModel from '@/models/User';
import { ApiResponse } from '@/utils/apiResponse';
import { logger } from '@/utils/logger';
import { ErrorHandler } from '@/middleware/errorHandler';
import { IUserCreate, IUserLogin, IUserUpdate, IUserResponse } from '@/interfaces/IUser';

export class UserController {
  /**
   * 用户注册
   * 功能：实现用户注册功能
   * 参数校验：
   * - 用户名/账号不能为空，不能为空字符串
   * - 密码不能为空
   * - 密码必须同时包含【英文字母 + 数字】，长度至少6位
   * 校验不通过时返回明确的错误提示
   * 返回标准的成功/失败JSON格式
   */
  static register = ErrorHandler.catchAsync(async (req: Request, res: Response) => {
    // 验证请求参数
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.badRequest(errors.array()[0].msg).send(res);
    }

    const { username, password, email, full_name, phone }: IUserCreate = req.body;

    try {
      // 创建新用户
      const user = await UserModel.create({
        username,
        password,
        email,
        full_name,
        phone,
      });

      // 构建响应数据
      const userResponse: IUserResponse = {
        id: user._id!,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        status: user.status,
        last_login: user.last_login,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };

      logger.info('用户注册成功', { username, email });

      // 返回成功响应
      ApiResponse.created(userResponse, '用户注册成功').send(res);

    } catch (error: any) {
      logger.error('用户注册失败:', error);
      
      // 处理已知错误
      if (error.message === '用户名已存在') {
        return ApiResponse.conflict('用户名已存在').send(res);
      }
      
      if (error.message === '邮箱已被注册') {
        return ApiResponse.conflict('邮箱已被注册').send(res);
      }
      
      // 返回通用错误响应
      ApiResponse.error('用户注册失败，请稍后重试').send(res);
    }
  });

  /**
   * 用户登录
   */
  static login = ErrorHandler.catchAsync(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.badRequest(errors.array()[0].msg).send(res);
    }

    const { username, password }: IUserLogin = req.body;

    try {
      // 查找用户（包含密码字段）
      const userWithPassword = await UserModel.findByUsernameWithPassword(username);
      
      if (!userWithPassword) {
        logger.warn('登录失败: 用户不存在', { username });
        return ApiResponse.unauthorized('用户名或密码错误').send(res);
      }

      // 验证密码
      const isPasswordValid = await UserModel.verifyPassword(password, userWithPassword.password);
      if (!isPasswordValid) {
        logger.warn('登录失败: 密码错误', { username });
        return ApiResponse.unauthorized('用户名或密码错误').send(res);
      }

      // 更新最后登录时间
      await UserModel.updateLastLogin(parseInt(userWithPassword._id!));

      // 获取更新后的用户信息
      const user = await UserModel.findById(parseInt(userWithPassword._id!));
      if (!user || !user._id) {
        return ApiResponse.unauthorized('用户不存在').send(res);
      }

      // 构建响应数据
      const userResponse: IUserResponse = {
        id: user._id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        status: user.status,
        last_login: user.last_login,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };

      // 设置会话
      (req.session as any).user = {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
      };

      logger.info('用户登录成功', { username });

      ApiResponse.success({
        user: userResponse,
        message: '登录成功',
      }, '登录成功').send(res);

    } catch (error: any) {
      logger.error('登录过程中出错:', error);
      ApiResponse.error('登录失败，请稍后重试').send(res);
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
      const user = await UserModel.findById(parseInt(req.user._id!));
      
      if (!user) {
        return ApiResponse.unauthorized('用户不存在').send(res);
      }

      const userResponse: IUserResponse = {
        id: user._id!,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        status: user.status,
        last_login: user.last_login,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };

      ApiResponse.success(userResponse).send(res);

    } catch (error: any) {
      logger.error('获取用户信息失败:', error);
      ApiResponse.error('获取用户信息失败').send(res);
    }
  });

  /**
   * 更新用户信息
   */
  static updateProfile = ErrorHandler.catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
      return ApiResponse.unauthorized('用户未登录').send(res);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.badRequest(errors.array()[0].msg).send(res);
    }

    const { full_name, phone, email }: IUserUpdate = req.body;

    try {
      // 更新用户信息
      const user = await UserModel.update(parseInt(req.user._id!), {
        full_name,
        phone,
        email,
      });

      if (!user) {
        return ApiResponse.notFound('用户不存在').send(res);
      }

      const userResponse: IUserResponse = {
        id: user._id!,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        status: user.status,
        last_login: user.last_login,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };

      logger.info('用户信息更新成功', { 
        username: user.username,
        updatedFields: { full_name, phone, email }
      });

      ApiResponse.success(userResponse, '用户信息更新成功').send(res);

    } catch (error: any) {
      logger.error('更新用户信息失败:', error);
      
      if (error.message === '邮箱已被其他用户使用') {
        return ApiResponse.conflict('邮箱已被其他用户使用').send(res);
      }
      
      ApiResponse.error('更新用户信息失败').send(res);
    }
  });

  /**
   * 修改密码
   */
  static changePassword = ErrorHandler.catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
      return ApiResponse.unauthorized('用户未登录').send(res);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.badRequest(errors.array()[0].msg).send(res);
    }

    const { currentPassword, newPassword } = req.body;

    try {
      // 获取用户（包含密码字段）
      const userWithPassword = await UserModel.findByUsernameWithPassword(req.user.username);
      
      if (!userWithPassword) {
        return ApiResponse.unauthorized('用户不存在').send(res);
      }

      // 验证当前密码
      const isPasswordValid = await UserModel.verifyPassword(currentPassword, userWithPassword.password);
      if (!isPasswordValid) {
        return ApiResponse.unauthorized('当前密码错误').send(res);
      }

      // 更新密码
      await UserModel.updatePassword(parseInt(req.user._id!), newPassword);

      logger.info('密码修改成功', { username: req.user.username });

      // 清除会话
      req.session.destroy(() => {});

      ApiResponse.success(null, '密码修改成功，请重新登录').send(res);

    } catch (error: any) {
      logger.error('修改密码失败:', error);
      ApiResponse.error('修改密码失败').send(res);
    }
  });

  /**
   * 获取用户列表（管理员功能）
   */
  static getUsers = ErrorHandler.catchAsync(async (req: Request, res: Response) => {
    // 检查权限（这里可以根据需要添加权限检查）
    // if (req.user?.role !== 'admin') {
    //   return ApiResponse.forbidden('权限不足').send(res);
    // }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.badRequest(errors.array()[0].msg).send(res);
    }

    try {
      const { page = 1, limit = 20, search, status } = req.query;
      const pageNum = Math.max(1, parseInt(String(page), 10));
      const limitNum = Math.max(1, Math.min(100, parseInt(String(limit), 10)));

      const result = await UserModel.findAll({
        page: pageNum,
        limit: limitNum,
        search: search as string,
        status: status as string,
      });

      const totalPages = Math.ceil(result.total / limitNum);

      // 转换用户数据为响应格式
      const usersResponse = result.data.map(user => ({
        id: user._id!,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        status: user.status,
        last_login: user.last_login,
        created_at: user.created_at,
        updated_at: user.updated_at,
      }));

      ApiResponse.success({
        data: usersResponse,
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
      logger.error('获取用户列表失败:', error);
      ApiResponse.error('获取用户列表失败').send(res);
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
   * 检查用户名是否可用
   */
  static checkUsername = ErrorHandler.catchAsync(async (req: Request, res: Response) => {
    const { username } = req.query;

    if (!username || typeof username !== 'string') {
      return ApiResponse.badRequest('请输入用户名').send(res);
    }

    try {
      const exists = await UserModel.usernameExists(username);
      
      ApiResponse.success({
        username,
        available: !exists,
        message: exists ? '用户名已存在' : '用户名可用',
      }).send(res);

    } catch (error: any) {
      logger.error('检查用户名失败:', error);
      ApiResponse.error('检查用户名失败').send(res);
    }
  });

  /**
   * 检查邮箱是否可用
   */
  static checkEmail = ErrorHandler.catchAsync(async (req: Request, res: Response) => {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      return ApiResponse.badRequest('请输入邮箱地址').send(res);
    }

    try {
      const exists = await UserModel.emailExists(email);
      
      ApiResponse.success({
        email,
        available: !exists,
        message: exists ? '邮箱已被注册' : '邮箱可用',
      }).send(res);

    } catch (error: any) {
      logger.error('检查邮箱失败:', error);
      ApiResponse.error('检查邮箱失败').send(res);
    }
  });
}

export default UserController;