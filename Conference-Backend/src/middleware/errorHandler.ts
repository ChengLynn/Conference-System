import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@/utils/apiResponse';
import { logger } from '@/utils/logger';
import { Constants } from '@/config/constants';
import { config } from '@/config/env';

export class ErrorHandler {
  /**
   * 404错误处理器
   */
  static notFound(req: Request, res: Response, _next: NextFunction): void {
    // 控制台打印一条该路径不存在即可，不需打印完整的错误堆栈信息
    console.log(`未找到路由: ${req.originalUrl}`);
    
    // 直接返回404响应，不传递错误给全局处理器
    res.status(Constants.HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: `未找到路由: ${req.originalUrl}`,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 全局错误处理器
   */
  static handle(
    error: any,
    req: Request,
    res: Response,
    _next: NextFunction
  ): void {
    logger.error('全局错误处理器:', {
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    // 如果是JWT错误
    if (error.name === 'JsonWebTokenError') {
      return ApiResponse.unauthorized('无效的令牌').send(res);
    }

    if (error.name === 'TokenExpiredError') {
      return ApiResponse.unauthorized('令牌已过期').send(res);
    }

    // 如果是验证错误
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return ApiResponse.badRequest(messages.join(', ')).send(res);
    }

    // 如果是MongoDB重复键错误
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      return ApiResponse.conflict(`${field} '${value}' 已存在`).send(res);
    }

    // 如果是CastError（无效的ObjectId）
    if (error.name === 'CastError') {
      return ApiResponse.badRequest(`无效的ID: ${error.value}`).send(res);
    }

    // 默认错误响应
    const statusCode = error.statusCode || res.statusCode || Constants.HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = error.message || Constants.ERROR_MESSAGES.INTERNAL_ERROR;

    res.status(statusCode).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 异步错误包装器
   */
  static catchAsync(fn: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * 处理未捕获的异常
   */
  static setupUnhandledRejection(): void {
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      logger.error('未处理的Promise拒绝:', {
        reason: reason?.message || reason,
        stack: reason?.stack,
        promise,
      });
      
      // 在开发环境中退出进程
      if (config.env === 'development') {
        process.exit(1);
      }
    });

    process.on('uncaughtException', (error: Error) => {
      logger.error('未捕获的异常:', {
        error: error.message,
        stack: error.stack,
      });
      
      // 给进程一点时间记录错误
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    });
  }
}