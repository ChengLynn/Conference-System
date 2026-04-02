import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import ConferenceModel from '@/models/Conference';
import { ApiResponse } from '@/utils/apiResponse';
import { ErrorHandler } from '@/middleware/errorHandler';

export class ConferenceController {
  /**
   * 创建会议
   */
  static createConference = ErrorHandler.catchAsync(
    async (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.badRequest(errors.array()[0].msg).send(res);
      }

      try {
        const conferenceData = {
          ...req.body,
          created_by: req.user?._id ? parseInt(req.user._id) : undefined
        };

        const conference = await ConferenceModel.create(conferenceData);
        ApiResponse.created(conference, '会议创建成功').send(res);
      } catch (error: any) {
        ApiResponse.error(error.message || '创建会议失败').send(res);
      }
    }
  );

  /**
   * 获取会议列表
   */
  static getConferences = ErrorHandler.catchAsync(
    async (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.badRequest(errors.array()[0].msg).send(res);
      }

      try {
        const { page = '1', limit = '10', search, status } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);

        const result = await ConferenceModel.findAll({
          page: pageNum,
          limit: limitNum,
          search: search as string,
          status: status as string
        });

        ApiResponse.success({
          data: result.data,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: result.total,
            pages: Math.ceil(result.total / limitNum),
            hasNext: pageNum < Math.ceil(result.total / limitNum),
            hasPrev: pageNum > 1,
          },
        }).send(res);
      } catch (error: any) {
        ApiResponse.error('获取会议列表失败').send(res);
      }
    }
  );

  /**
   * 获取单个会议
   */
  static getConference = ErrorHandler.catchAsync(
    async (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.badRequest(errors.array()[0].msg).send(res);
      }

      try {
        const { id } = req.params;
        const conference = await ConferenceModel.findById(parseInt(id));
        
        if (!conference) {
          return ApiResponse.notFound('会议不存在').send(res);
        }

        ApiResponse.success(conference).send(res);
      } catch (error: any) {
        ApiResponse.error('获取会议失败').send(res);
      }
    }
  );

  /**
   * 更新会议
   */
  static updateConference = ErrorHandler.catchAsync(
    async (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.badRequest(errors.array()[0].msg).send(res);
      }

      try {
        const { id } = req.params;
        const conference = await ConferenceModel.update(parseInt(id), req.body);
        
        if (!conference) {
          return ApiResponse.notFound('会议不存在').send(res);
        }

        ApiResponse.success(conference, '会议更新成功').send(res);
      } catch (error: any) {
        ApiResponse.error('更新会议失败').send(res);
      }
    }
  );

  /**
   * 删除会议
   */
  static deleteConference = ErrorHandler.catchAsync(
    async (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.badRequest(errors.array()[0].msg).send(res);
      }

      try {
        const { id } = req.params;
        const deleted = await ConferenceModel.delete(parseInt(id));
        
        if (!deleted) {
          return ApiResponse.notFound('会议不存在').send(res);
        }

        ApiResponse.success(null, '会议删除成功').send(res);
      } catch (error: any) {
        ApiResponse.error('删除会议失败').send(res);
      }
    }
  );

  /**
   * 获取即将开始的会议
   */
  static getUpcomingConferences = ErrorHandler.catchAsync(
    async (req: Request, res: Response) => {
      try {
        const { limit = '10' } = req.query;
        const limitNum = parseInt(limit as string, 10);
        
        const conferences = await ConferenceModel.getUpcomingConferences(limitNum);
        ApiResponse.success(conferences).send(res);
      } catch (error: any) {
        ApiResponse.error('获取即将开始的会议失败').send(res);
      }
    }
  );

  /**
   * 获取进行中的会议
   */
  static getOngoingConferences = ErrorHandler.catchAsync(
    async (_req: Request, res: Response) => {
      try {
        const conferences = await ConferenceModel.getOngoingConferences();
        ApiResponse.success(conferences).send(res);
      } catch (error: any) {
        ApiResponse.error('获取进行中的会议失败').send(res);
      }
    }
  );
}