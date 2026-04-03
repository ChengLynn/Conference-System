import { open } from 'sqlite';
import * as sqlite3 from 'sqlite3';
import * as path from 'path';
import { config } from './env';
import { logger } from '../utils/logger';
import * as fs from 'fs';

class Database {
  private static instance: Database;
  private db: any = null;
  private connected = false;

  private constructor() {}

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    try {
      // 确保数据库目录存在
      const dbDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // SQLite数据库文件路径
      const dbPath = config.env === 'test' 
        ? path.join(dbDir, 'test.db')
        : path.join(dbDir, 'conference.db');

      logger.info(`📁 Connecting to SQLite database: ${dbPath}`);

      // 打开数据库连接
      this.db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      // 启用外键约束
      await this.db.run('PRAGMA foreign_keys = ON');
      
      // 启用WAL模式以提高性能
      await this.db.run('PRAGMA journal_mode = WAL');
      
      // 设置同步模式
      await this.db.run('PRAGMA synchronous = NORMAL');

      this.connected = true;
      logger.info('✅ SQLite connected successfully');

      // 初始化数据库表
      await this.initializeTables();
      
    } catch (error) {
      logger.error('❌ SQLite connection failed:', error);
      process.exit(1);
    }
  }

  private async initializeTables(): Promise<void> {
    try {
      // 创建管理员表
      await this.db.run(`
        CREATE TABLE IF NOT EXISTS admins (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          email TEXT,
          role TEXT CHECK(role IN ('admin', 'super_admin')) DEFAULT 'admin',
          last_login DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 创建会议表
      await this.db.run(`
        CREATE TABLE IF NOT EXISTS conferences (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          start_date DATETIME NOT NULL,
          end_date DATETIME NOT NULL,
          location TEXT NOT NULL,
          max_attendees INTEGER,
          current_attendees INTEGER DEFAULT 0,
          status TEXT CHECK(status IN ('draft', 'published', 'cancelled', 'completed')) DEFAULT 'draft',
          created_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES admins(id)
        )
      `);

      // 创建参会者表
      await this.db.run(`
        CREATE TABLE IF NOT EXISTS attendees (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          conference_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          company TEXT,
          position TEXT,
          registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          status TEXT CHECK(status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (conference_id) REFERENCES conferences(id) ON DELETE CASCADE,
          UNIQUE(conference_id, email)
        )
      `);

      // 创建图片表
      await this.db.run(`
        CREATE TABLE IF NOT EXISTS images (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          conference_id INTEGER NOT NULL,
          filename TEXT NOT NULL,
          original_name TEXT NOT NULL,
          path TEXT NOT NULL,
          size INTEGER NOT NULL,
          mime_type TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (conference_id) REFERENCES conferences(id) ON DELETE CASCADE
        )
      `);

      // 创建用户表
      await this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          full_name TEXT,
          phone TEXT,
          status TEXT CHECK(status IN ('active', 'inactive', 'suspended')) DEFAULT 'active',
          last_login DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 创建索引
      await this.db.run('CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username)');
      await this.db.run('CREATE INDEX IF NOT EXISTS idx_conferences_status ON conferences(status)');
      await this.db.run('CREATE INDEX IF NOT EXISTS idx_conferences_start_date ON conferences(start_date)');
      await this.db.run('CREATE INDEX IF NOT EXISTS idx_attendees_conference_id ON attendees(conference_id)');
      await this.db.run('CREATE INDEX IF NOT EXISTS idx_attendees_email ON attendees(email)');
      await this.db.run('CREATE INDEX IF NOT EXISTS idx_images_conference_id ON images(conference_id)');
      await this.db.run('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
      await this.db.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
      await this.db.run('CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)');

      logger.info('✅ Database tables initialized successfully');

    } catch (error) {
      logger.error('❌ Failed to initialize database tables:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connected || !this.db) {
      return;
    }

    try {
      await this.db.close();
      this.connected = false;
      this.db = null;
      logger.info('SQLite disconnected successfully');
    } catch (error) {
      logger.error('Error disconnecting from SQLite:', error);
      throw error;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  getConnection() {
    return this.db;
  }

  // 获取数据库实例的便捷方法
  static async getDb() {
    const instance = Database.getInstance();
    if (!instance.isConnected()) {
      await instance.connect();
    }
    return instance.getConnection();
  }

  // 事务支持
  async transaction<T>(callback: (db: any) => Promise<T>): Promise<T> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    await this.db.run('BEGIN TRANSACTION');
    try {
      const result = await callback(this.db);
      await this.db.run('COMMIT');
      return result;
    } catch (error) {
      await this.db.run('ROLLBACK');
      throw error;
    }
  }

  // 查询辅助方法
  async query(sql: string, params: any[] = []): Promise<any[]> {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db.all(sql, params);
  }

  async get(sql: string, params: any[] = []): Promise<any> {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db.get(sql, params);
  }

  async run(sql: string, params: any[] = []): Promise<any> {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db.run(sql, params);
  }
}

export const database = Database.getInstance();
export const getDb = Database.getDb;