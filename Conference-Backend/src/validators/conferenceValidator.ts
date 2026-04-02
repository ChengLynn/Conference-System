import { body, param, query } from 'express-validator';
import { Constants } from '@/config/constants';

export class ConferenceValidator {
  static createConference = [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('会议标题不能为空')
      .isLength({ max: 100 })
      .withMessage('会议标题不能超过100个字符'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('会议描述不能超过500个字符'),
  ];

  static updateConference = [
    param('id')
      .isMongoId()
      .withMessage('无效的会议ID'),
    
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('会议标题不能为空')
      .isLength({ max: 100 })
      .withMessage('会议标题不能超过100个字符'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('会议描述不能超过500个字符'),
    
    body('is_active')
      .optional()
      .isBoolean()
      .withMessage('状态必须是布尔值'),
  ];

  static getConference = [
    param('id')
      .isMongoId()
      .withMessage('无效的会议ID'),
  ];

  static deleteConference = [
    param('id')
      .isMongoId()
      .withMessage('无效的会议ID'),
  ];

  static getConferences = [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('页码必须是大于0的整数'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: Constants.MAX_PAGE_SIZE })
      .withMessage(`每页数量必须在1-${Constants.MAX_PAGE_SIZE}之间`),
    
    query('search')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('搜索关键词不能超过50个字符'),
    
    query('sort')
      .optional()
      .isIn(['created_at', '-created_at', 'title', '-title'])
      .withMessage('排序字段无效'),
  ];

  static updateH5Page = [
    param('id')
      .isMongoId()
      .withMessage('无效的会议ID'),
    
    body('homepage_images')
      .optional()
      .isArray()
      .withMessage('主页图片必须是数组'),
    
    body('homepage_images.*.url')
      .isURL()
      .withMessage('图片URL无效'),
    
    body('homepage_images.*.name')
      .trim()
      .notEmpty()
      .withMessage('图片名称不能为空'),
    
    body('homepage_images.*.sort')
      .isInt({ min: 1 })
      .withMessage('排序值必须是大于0的整数'),
    
    body('confirmation_images')
      .optional()
      .isArray()
      .withMessage('确认页图片必须是数组'),
    
    body('confirmation_images.*.url')
      .isURL()
      .withMessage('图片URL无效'),
    
    body('confirmation_images.*.name')
      .trim()
      .notEmpty()
      .withMessage('图片名称不能为空'),
    
    body('confirmation_images.*.sort')
      .isInt({ min: 1 })
      .withMessage('排序值必须是大于0的整数'),
    
    body('registration_header_image')
      .optional()
      .isURL()
      .withMessage('注册头部图片URL无效'),
    
    body('registration_fields.email')
      .optional()
      .isBoolean()
      .withMessage('邮箱字段必须是布尔值'),
    
    body('registration_fields.lunch')
      .optional()
      .isBoolean()
      .withMessage('午餐字段必须是布尔值'),
    
    body('registration_fields.dinner')
      .optional()
      .isBoolean()
      .withMessage('晚餐字段必须是布尔值'),
  ];

  static addAttendee = [
    param('id')
      .isMongoId()
      .withMessage('无效的会议ID'),
    
    body('name')
      .trim()
      .notEmpty()
      .withMessage('姓名不能为空')
      .isLength({ max: 50 })
      .withMessage('姓名不能超过50个字符'),
    
    body('company')
      .trim()
      .notEmpty()
      .withMessage('单位不能为空')
      .isLength({ max: 100 })
      .withMessage('单位名称不能超过100个字符'),
    
    body('position')
      .trim()
      .notEmpty()
      .withMessage('职位不能为空')
      .isLength({ max: 50 })
      .withMessage('职位不能超过50个字符'),
    
    body('phone')
      .trim()
      .notEmpty()
      .withMessage('手机号码不能为空')
      .matches(/^1[3-9]\d{9}$/)
      .withMessage('请输入有效的手机号码'),
    
    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('请输入有效的邮箱地址'),
    
    body('join_lunch')
      .optional()
      .isBoolean()
      .withMessage('是否参加午餐必须是布尔值'),
    
    body('join_dinner')
      .optional()
      .isBoolean()
      .withMessage('是否参加晚餐必须是布尔值'),
  ];
}