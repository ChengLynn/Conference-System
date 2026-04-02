declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: string;
    MONGODB_URI: string;
    JWT_SECRET: string;
    ADMIN_USERNAME: string;
    ADMIN_PASSWORD: string;
    [key: string]: string | undefined;
  }
}