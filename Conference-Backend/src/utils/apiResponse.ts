import { Response } from 'express';
import { Constants } from '@/config/constants';

export class ApiResponse<T = any> {
  constructor(
    public success: boolean,
    public message: string,
    public data?: T,
    public statusCode: number = Constants.HTTP_STATUS.OK
  ) {}

  static success<T>(data?: T, message: string = Constants.SUCCESS_MESSAGES.RETRIEVED): ApiResponse<T> {
    return new ApiResponse(true, message, data);
  }

  static created<T>(data?: T, message: string = Constants.SUCCESS_MESSAGES.CREATED): ApiResponse<T> {
    return new ApiResponse(true, message, data, Constants.HTTP_STATUS.CREATED);
  }

  static error(
    message: string = Constants.ERROR_MESSAGES.INTERNAL_ERROR,
    statusCode: number = Constants.HTTP_STATUS.INTERNAL_SERVER_ERROR
  ): ApiResponse {
    return new ApiResponse(false, message, undefined, statusCode);
  }

  static notFound(message: string = Constants.ERROR_MESSAGES.NOT_FOUND): ApiResponse {
    return new ApiResponse(false, message, undefined, Constants.HTTP_STATUS.NOT_FOUND);
  }

  static unauthorized(message: string = Constants.ERROR_MESSAGES.UNAUTHORIZED): ApiResponse {
    return new ApiResponse(false, message, undefined, Constants.HTTP_STATUS.UNAUTHORIZED);
  }

  static forbidden(message: string = Constants.ERROR_MESSAGES.FORBIDDEN): ApiResponse {
    return new ApiResponse(false, message, undefined, Constants.HTTP_STATUS.FORBIDDEN);
  }

  static badRequest(message: string = Constants.ERROR_MESSAGES.VALIDATION_ERROR): ApiResponse {
    return new ApiResponse(false, message, undefined, Constants.HTTP_STATUS.BAD_REQUEST);
  }

  static conflict(message: string = Constants.ERROR_MESSAGES.DUPLICATE_ERROR): ApiResponse {
    return new ApiResponse(false, message, undefined, Constants.HTTP_STATUS.CONFLICT);
  }

  send(res: Response): void {
    res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
      timestamp: new Date().toISOString(),
    });
  }
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}