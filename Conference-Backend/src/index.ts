import 'reflect-metadata';
import 'module-alias/register';
import { server } from './server';

// 启动服务器
server.start().catch((error) => {
  console.error('启动服务器失败:', error);
  process.exit(1);
});

export { server };
