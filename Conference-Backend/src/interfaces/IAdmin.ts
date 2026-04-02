export interface IAdmin {
  _id?: string;
  username: string;
  password: string;
  email?: string;
  role: 'admin' | 'super_admin';
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface IAdminCreate {
  username: string;
  password: string;
  email?: string;
  role?: 'admin' | 'super_admin';
}

export interface IAdminLogin {
  username: string;
  password: string;
}

export interface IAuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}