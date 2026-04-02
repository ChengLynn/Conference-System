import { Router } from 'express';
import { ConferenceController } from '@/controllers/conferenceController';
import { AuthMiddleware } from '@/middleware/auth';
import { ConferenceValidator } from '@/validators/conferenceValidator';

const router = Router();

// 所有会议路由都需要认证
router.use(AuthMiddleware.authenticate);

// 会议CRUD操作
router.route('/conferences')
  .post(
    ConferenceValidator.createConference,
    ConferenceController.createConference
  )
  .get(
    ConferenceValidator.getConferences,
    ConferenceController.getConferences
  );

router.route('/conferences/:id')
  .get(
    ConferenceValidator.getConference,
    ConferenceController.getConference
  )
  .put(
    ConferenceValidator.updateConference,
    ConferenceController.updateConference
  )
  .delete(
    ConferenceValidator.deleteConference,
    ConferenceController.deleteConference
  );

// 获取即将开始的会议（公开接口）
router.get(
  '/conferences/upcoming',
  ConferenceController.getUpcomingConferences
);

// 获取进行中的会议（公开接口）
router.get(
  '/conferences/ongoing',
  ConferenceController.getOngoingConferences
);

export { router as conferenceRoutes };