import { Request } from 'express';
import { IAdmin } from '@/interfaces/IAdmin';

declare global {
  namespace Express {
    interface User extends IAdmin {}
    
    interface Request {
      user?: User;
      files?: any;
    }
  }
}
