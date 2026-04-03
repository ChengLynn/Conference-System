import { Router } from 'express';
import { authRoutes } from './authRoutes';
import { conferenceRoutes } from './conferenceRoutes';
import { userRoutes } from './userRoutes';

const router = Router();

// 用户相关路由
router.use('/users', userRoutes);

// 认证相关路由
router.use('/auth', authRoutes);

// 会议相关路由
router.use('/conferences', conferenceRoutes);

// 健康检查路由
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'conference-backend',
    version: '1.0.0',
  });
});

export default router;
