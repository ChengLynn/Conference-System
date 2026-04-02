import { get, post, put, del } from './index'

// 用户相关的API接口
export const userApi = {
  // 登录
  login: (data: { username: string; password: string }) =>
    post<{
      access_token: string
      refresh_token: string
      expires_in: number
      admin: {
        id: number
        username: string
        email: string
        role: string
        last_login: string
      }
    }>('/auth/login', data),

  // 注册（仅限超级管理员）
  register: (data: { username: string; email: string; password: string; role?: string }) =>
    post('/auth/register', data),

  // 获取当前用户信息
  getCurrentUser: () => get('/auth/me'),

  // 更新用户信息
  updateProfile: (data: { email?: string }) => put('/auth/profile', data),

  // 修改密码
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    post('/auth/change-password', data),

  // 退出登录
  logout: () => post('/auth/logout'),

  // 刷新令牌
  refreshToken: (data: { refresh_token: string }) => post('/auth/refresh', data),

  // 验证令牌
  verifyToken: () => get('/auth/verify'),
}
