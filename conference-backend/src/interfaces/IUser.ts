/**
 * 用户接口定义
 */

export interface IUser {
  _id?: string;
  username: string;
  password: string;
  email: string;
  full_name?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface IUserCreate {
  username: string;
  password: string;
  email: string;
  full_name?: string;
  phone?: string;
}

export interface IUserLogin {
  username: string;
  password: string;
}

export interface IUserUpdate {
  full_name?: string;
  phone?: string;
  email?: string;
}

export interface IUserResponse {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface IUserRegisterResponse {
  success: boolean;
  message: string;
  data?: IUserResponse;
  error?: string;
}