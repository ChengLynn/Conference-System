import { config } from '@/config/env';
import crypto from 'crypto';

export class Helpers {
  /**
   * 生成随机字符串
   */
  static generateRandomString(length = 16): string {
    return crypto.randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);
  }

  /**
   * 生成唯一ID
   */
  static generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * 格式化日期
   */
  static formatDate(date: Date | string, format = 'YYYY-MM-DD HH:mm:ss'): string {
    const d = date instanceof Date ? date : new Date(date);
    
    const pad = (num: number): string => num.toString().padStart(2, '0');
    
    const replacements: { [key: string]: string } = {
      YYYY: d.getFullYear().toString(),
      MM: pad(d.getMonth() + 1),
      DD: pad(d.getDate()),
      HH: pad(d.getHours()),
      mm: pad(d.getMinutes()),
      ss: pad(d.getSeconds()),
    };

    return format.replace(/YYYY|MM|DD|HH|mm|ss/g, (match) => replacements[match]);
  }

  /**
   * 验证手机号码
   */
  static isValidPhone(phone: string): boolean {
    return /^1[3-9]\d{9}$/.test(phone);
  }

  /**
   * 验证邮箱
   */
  static isValidEmail(email: string): boolean {
    return /^\S+@\S+\.\S+$/.test(email);
  }

  /**
   * 安全获取对象属性
   */
  static safeGet<T, K extends keyof T>(obj: T, key: K, defaultValue?: T[K]): T[K] | undefined {
    try {
      return obj[key] ?? defaultValue;
    } catch {
      return defaultValue;
    }
  }

  /**
   * 深度克隆对象
   */
  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as any;
    }

    if (obj instanceof Array) {
      return obj.map(item => this.deepClone(item)) as any;
    }

    if (typeof obj === 'object') {
      const clonedObj: any = {};
      Object.keys(obj).forEach(key => {
        clonedObj[key] = this.deepClone((obj as any)[key]);
      });
      return clonedObj;
    }

    return obj;
  }

  /**
   * 生成H5文件名
   */
  static generateH5Filename(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `${timestamp}${random}`;
  }

  /**
   * 构建图片URL
   */
  static buildImageUrl(filename: string): string {
    if (!filename) return '';
    
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      return filename;
    }
    
    const baseUrl = config.clientUrl.replace(/\/$/, '');
    return `${baseUrl}/uploads/images/${filename}`;
  }

  /**
   * 解析分页参数
   */
  static parsePaginationParams(
    page?: string | number,
    limit?: string | number
  ): { page: number; limit: number } {
    const pageNum = Math.max(1, parseInt(String(page || '1'), 10) || 1);
    const limitNum = Math.max(
      1,
      Math.min(100, parseInt(String(limit || '10'), 10) || 10)
    );
    
    return { page: pageNum, limit: limitNum };
  }

  /**
   * 生成分页元数据
   */
  static generatePaginationMeta(
    total: number,
    page: number,
    limit: number
  ): {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } {
    const pages = Math.ceil(total / limit);
    
    return {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
    };
  }
}