import { App } from './app';
import { database } from './config/database';
import { config } from './config/env';
import { logger } from './utils/logger';
import { ErrorHandler } from './middleware/errorHandler';
import { Constants } from './config/constants';

class Server {
  private app: App;
  private server: any;

  constructor() {
    this.app = new App();
    this.setupGracefulShutdown();
    ErrorHandler.setupUnhandledRejection();
  }

  public async start(): Promise<void> {
    try {
      // 连接数据库
      await database.connect();

      // 启动服务器
      const port = config.port;
      const host = config.host;
      
      this.server = this.app.getServer().listen(port, host, () => {
        logger.info(`🚀 服务器运行在 http://${host}:${port}`);
        logger.info(`📊 健康检查: http://${host}:${port}/health`);
        logger.info(`📖 API文档: http://${host}:${port}/api-docs`);
        logger.info(`🌍 环境: ${config.env}`);
        logger.info(`📚 API前缀: ${Constants.API_PREFIX}`);
      });

    } catch (error) {
      logger.error('启动服务器失败:', error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(): void {
    const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];

    signals.forEach(signal => {
      process.on(signal, async () => {
        logger.info(`收到 ${signal} 信号，正在优雅关闭...`);
        
        try {
          // 关闭服务器
          if (this.server) {
            await new Promise<void>((resolve, reject) => {
              this.server.close((err: any) => {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              });
            });
          }

          // 断开数据库连接
          await database.disconnect();
          
          logger.info('服务器已优雅关闭');
          process.exit(0);
        } catch (error) {
          logger.error('优雅关闭失败:', error);
          process.exit(1);
        }
      });
    });
  }

  public async stop(): Promise<void> {
    if (this.server) {
      await new Promise<void>((resolve) => {
        this.server.close(() => {
          resolve();
        });
      });
    }
    
    await database.disconnect();
  }
}

export const server = new Server();

// 如果是直接运行此文件
if (require.main === module) {
  server.start().catch((error) => {
    logger.error('启动失败:', error);
    process.exit(1);
  });
}