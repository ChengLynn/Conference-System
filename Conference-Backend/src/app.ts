import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import path from 'path';

import { config } from './config/env';
import { Constants } from './config/constants';
import { ErrorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

// 导入路由
import { conferenceRoutes } from './routes/conferenceRoutes';
import { authRoutes } from './routes/authRoutes';

export class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // 安全中间件
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", config.clientUrl],
        },
      },
      crossOriginEmbedderPolicy: false,
    }));

    // CORS配置
    this.app.use(cors({
      origin: config.clientUrl,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // 请求体解析
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(cookieParser());

    // 会话管理
    this.app.use(session({
      secret: config.session.secret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: config.env === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24小时
      },
    }));

    // Passport初始化
    this.app.use(passport.initialize());
    this.app.use(passport.session());

    // 请求限制
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.max,
      message: '请求过于频繁，请稍后再试',
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);

    // 数据清理
    this.app.use(mongoSanitize());

    // 压缩响应
    this.app.use(compression());

    // 静态文件服务
    this.app.use('/uploads', express.static(path.join(process.cwd(), config.upload.path)));

    // 请求日志
    this.app.use((req, _res, next) => {
      logger.http(`${req.method} ${req.url}`, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        body: req.body,
      });
      next();
    });
  }

  private initializeRoutes(): void {
    // API文档路由
    if (config.env === 'development') {
      this.app.use('/api-docs', (_req, res) => {
        res.send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>会议管理系统 API 文档</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                h1 { color: #333; }
                .endpoint { background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px; }
                .method { display: inline-block; padding: 5px 10px; border-radius: 3px; color: white; }
                .get { background: #61affe; }
                .post { background: #49cc90; }
                .put { background: #fca130; }
                .delete { background: #f93e3e; }
              </style>
            </head>
            <body>
              <h1>会议管理系统 API 文档</h1>
              
              <div class="endpoint">
                <span class="method post">POST</span> <strong>${Constants.API_PREFIX}/auth/login</strong>
                <p>管理员登录</p>
                <pre>请求体: { "username": "admin", "password": "admin123" }</pre>
              </div>
              
              <div class="endpoint">
                <span class="method get">GET</span> <strong>${Constants.API_PREFIX}/conferences</strong>
                <p>获取会议列表</p>
                <pre>查询参数: ?page=1&limit=10&search=会议</pre>
              </div>
              
              <!-- 更多API文档 -->
            </body>
          </html>
        `);
      });
    }

    // 健康检查
    this.app.get('/health', (_req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.env,
        version: process.env.npm_package_version || '1.0.0',
      });
    });

    // API路由
    this.app.use(Constants.API_PREFIX, authRoutes);
    this.app.use(Constants.API_PREFIX, conferenceRoutes);

    // 404处理
    this.app.use('*', ErrorHandler.notFound);
  }

  private initializeErrorHandling(): void {
    this.app.use(ErrorHandler.handle);
  }

  public getServer(): express.Application {
    return this.app;
  }
}