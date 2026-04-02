export const Constants = {
  API_PREFIX: '/api/v1',
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  
  ROLES: {
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin',
  },
  
  IMAGE_TYPES: {
    HOMEPAGE: 'homepage',
    CONFIRMATION: 'confirmation',
    REGISTRATION_HEADER: 'registration-header',
  },
  
  STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
  },
  
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
  },
  
  ERROR_MESSAGES: {
    NOT_FOUND: '资源未找到',
    UNAUTHORIZED: '未授权访问',
    FORBIDDEN: '禁止访问',
    INTERNAL_ERROR: '服务器内部错误',
    VALIDATION_ERROR: '验证失败',
    DUPLICATE_ERROR: '资源已存在',
  },
  
  SUCCESS_MESSAGES: {
    CREATED: '创建成功',
    UPDATED: '更新成功',
    DELETED: '删除成功',
    RETRIEVED: '获取成功',
  },
} as const;