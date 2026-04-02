import { Request } from 'express';
import { IAdmin } from './IAdmin';

export interface IRequest extends Request {
  user?: IAdmin;
  files?: any;
}

export interface IPaginatedRequest extends IRequest {
  query: {
    page?: string;
    limit?: string;
    sort?: string;
    search?: string;
  };
}