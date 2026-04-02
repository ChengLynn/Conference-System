import { Router } from 'express';
import { AuthController } from '@/controllers/authController';
import { AuthValidator } from '@/validators/authValidator';
import { AuthMiddleware } from '@/middleware/auth';

const router = Router();

// 公开路由（无需认证）
router.post(
  '/auth/login',
  AuthValidator.login,
  AuthController.login
);

router.post(
  '/auth/refresh',
  AuthValidator.refreshToken,
  AuthController.refreshToken
);

router.get(
  '/auth/verify',
  AuthController.verifyToken
);

// 开发环境专用
router.post(
  '/auth/initialize',
  AuthController.initializeAdmin
);

// 需要认证的路由
router.use(AuthMiddleware.authenticate);

// 用户管理
router.get(
  '/auth/me',
  AuthController.getCurrentUser
);

router.put(
  '/auth/profile',
  AuthValidator.updateProfile,
  AuthController.updateProfile
);

router.post(
  '/auth/change-password',
  AuthValidator.changePassword,
  AuthController.changePassword
);

router.post(
  '/auth/logout',
  AuthController.logout
);

// 管理员管理（仅限超级管理员）
router.post(
  '/auth/register',
  AuthMiddleware.authorize(['super_admin']),
  AuthValidator.register,
  AuthController.register
);

router.get(
  '/auth/admins',
  AuthMiddleware.authorize(['super_admin']),
  AuthValidator.getAdmins,
  AuthController.getAdmins
);

router.delete(
  '/auth/admins/:id',
  AuthMiddleware.authorize(['super_admin']),
  AuthValidator.deleteAdmin,
  AuthController.deleteAdmin
);

export { router as authRoutes };