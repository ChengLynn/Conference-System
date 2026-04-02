import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { ApiResponse } from '../utils/apiResponse';
import AdminModel from '../models/Admin';
import { IAdmin } from '../interfaces/IAdmin';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user: IAdmin;
}

export class AuthMiddleware {
  /**
   * 验证JWT令牌
   */
  static async authenticate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = AuthMiddleware.extractToken(req);

      if (!token) {
        return ApiResponse.unauthorized('请先登录').send(res);
      }

      const decoded = jwt.verify(token, config.jwt.secret) as any;
      
      const admin = await AdminModel.findById(parseInt(decoded.id));
      
      if (!admin) {
        return ApiResponse.unauthorized('用户不存在').send(res);
      }

      req.user = admin;
      next();
    } catch (error: any) {
      logger.error('认证失败:', error);
      
      if (error.name === 'TokenExpiredError') {
        return ApiResponse.unauthorized('令牌已过期').send(res);
      }
      
      if (error.name === 'JsonWebTokenError') {
        return ApiResponse.unauthorized('无效的令牌').send(res);
      }
      
      ApiResponse.unauthorized('认证失败').send(res);
    }
  }

  /**
   * 检查管理员角色
   */
  static authorize(roles: string[] = []) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return ApiResponse.unauthorized().send(res);
      }

      if (roles.length > 0 && !roles.includes(req.user.role)) {
        return ApiResponse.forbidden('权限不足').send(res);
      }

      next();
    };
  }

  /**
   * 从请求中提取令牌
   */
  private static extractToken(req: Request): string | null {
    // 从Authorization头部提取
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // 从cookie中提取
    if (req.cookies?.token) {
      return req.cookies.token;
    }

    // 从查询参数中提取
    if (req.query?.token) {
      return req.query.token as string;
    }

    return null;
  }

  /**
   * 生成JWT令牌
   */
  static generateToken(admin: IAdmin): string {
    return jwt.sign(
      {
        id: admin._id,
        username: admin.username,
        role: admin.role,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as any }
    );
  }

  /**
   * 生成刷新令牌
   */
  static generateRefreshToken(admin: IAdmin): string {
    return jwt.sign(
      { id: admin._id },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn as any }
    );
  }
}