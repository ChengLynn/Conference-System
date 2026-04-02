import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { config } from '@/config/env';
import { ApiResponse } from '@/utils/apiResponse';
import { logger } from '@/utils/logger';
import { Helpers } from '@/utils/helpers';

// 存储配置
const storage = multer.diskStorage({
  destination: (
    _req: Request,
    _file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    const uploadDir = path.join(process.cwd(), config.upload.path, 'images');
    cb(null, uploadDir);
  },
  filename: (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extname = path.extname(file.originalname);
    const filename = `${file.fieldname}-${uniqueSuffix}${extname}`;
    cb(null, filename);
  },
});

// 文件过滤器
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = config.upload.allowedTypes;
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(
      `不支持的文件类型: ${file.mimetype}. 支持的类型: ${allowedTypes.join(', ')}`
    );
    cb(error);
  }
};

// 创建上传实例
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxSize,
  },
});

export class UploadMiddleware {
  /**
   * 单文件上传中间件
   */
  static single(fieldName: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      const uploadSingle = upload.single(fieldName);
      
      uploadSingle(req, res, (error: any) => {
        if (error) {
          logger.error('文件上传失败:', error);
          
          if (error instanceof multer.MulterError) {
            if (error.code === 'LIMIT_FILE_SIZE') {
              return ApiResponse.badRequest('文件大小超过限制').send(res);
            }
            if (error.code === 'LIMIT_UNEXPECTED_FILE') {
              return ApiResponse.badRequest('意外的文件字段').send(res);
            }
          }
          
          return ApiResponse.badRequest(error.message || '文件上传失败').send(res);
        }
        
        // 如果文件上传成功，构建完整的URL
        if (req.file) {
          req.file.filename = req.file.filename;
          req.file.path = Helpers.buildImageUrl(req.file.filename);
        }
        
        next();
      });
    };
  }

  /**
   * 多文件上传中间件
   */
  static array(fieldName: string, maxCount?: number) {
    return (req: Request, res: Response, next: NextFunction) => {
      const uploadArray = upload.array(fieldName, maxCount);
      
      uploadArray(req, res, (error: any) => {
        if (error) {
          logger.error('多文件上传失败:', error);
          
          if (error instanceof multer.MulterError) {
            if (error.code === 'LIMIT_FILE_SIZE') {
              return ApiResponse.badRequest('文件大小超过限制').send(res);
            }
            if (error.code === 'LIMIT_UNEXPECTED_FILE') {
              return ApiResponse.badRequest('意外的文件字段').send(res);
            }
            if (error.code === 'LIMIT_FILE_COUNT') {
              return ApiResponse.badRequest('文件数量超过限制').send(res);
            }
          }
          
          return ApiResponse.badRequest(error.message || '文件上传失败').send(res);
        }
        
        // 如果文件上传成功，构建完整的URL
        if (req.files && Array.isArray(req.files)) {
          req.files = req.files.map(file => ({
            ...file,
            filename: file.filename,
            path: Helpers.buildImageUrl(file.filename),
          }));
        }
        
        next();
      });
    };
  }

  /**
   * 验证文件类型
   */
  static validateFileType(allowedTypes: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.file) {
        return next();
      }
      
      if (!allowedTypes.includes(req.file.mimetype)) {
        return ApiResponse.badRequest(`不支持的文件类型: ${req.file.mimetype}`).send(res);
      }
      
      next();
    };
  }

  /**
   * 验证图片尺寸
   */
  static validateImageDimensions(_minWidth?: number, _minHeight?: number) {
    return (req: Request, _res: Response, next: NextFunction) => {
      if (!req.file) {
        return next();
      }
      
      // 这里可以添加图像尺寸验证逻辑
      // 需要使用 sharp 或类似的图像处理库
      
      next();
    };
  }
}