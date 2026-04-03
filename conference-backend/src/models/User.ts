import bcrypt from 'bcryptjs';
import { IUser, IUserCreate, IUserUpdate } from '@/interfaces/IUser';
import { getDb } from '@/config/database';
import { logger } from '@/utils/logger';

export class UserModel {
  /**
   * 创建新用户
   */
  static async create(userData: IUserCreate): Promise<IUser> {
    const db = await getDb();
    
    // 检查用户名是否已存在
    const existingUser = await db.get(
      'SELECT id FROM users WHERE username = ?',
      [userData.username]
    );
    
    if (existingUser) {
      throw new Error('用户名已存在');
    }

    // 检查邮箱是否已存在
    const existingEmail = await db.get(
      'SELECT id FROM users WHERE email = ?',
      [userData.email]
    );
    
    if (existingEmail) {
      throw new Error('邮箱已被注册');
    }

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const now = new Date();
    const result = await db.run(
      `INSERT INTO users (username, password, email, full_name, phone, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userData.username,
        hashedPassword,
        userData.email,
        userData.full_name || null,
        userData.phone || null,
        'active', // 默认状态为激活
        now,
        now
      ]
    );

    const user = await db.get(
      'SELECT * FROM users WHERE id = ?',
      [result.lastID]
    );

    logger.info('用户创建成功', { username: userData.username, email: userData.email });
    return this.mapToIUser(user);
  }

  /**
   * 根据ID查找用户
   */
  static async findById(id: number): Promise<IUser | null> {
    const db = await getDb();
    const user = await db.get(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    
    if (!user) {
      return null;
    }

    return this.mapToIUser(user);
  }

  /**
   * 根据用户名查找用户（包含密码）
   */
  static async findByUsernameWithPassword(username: string): Promise<(IUser & { password: string }) | null> {
    const db = await getDb();
    const user = await db.get(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    if (!user) {
      return null;
    }

    return this.mapToIUserWithPassword(user);
  }

  /**
   * 根据邮箱查找用户
   */
  static async findByEmail(email: string): Promise<IUser | null> {
    const db = await getDb();
    const user = await db.get(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (!user) {
      return null;
    }

    return this.mapToIUser(user);
  }

  /**
   * 更新用户信息
   */
  static async update(id: number, updateData: IUserUpdate): Promise<IUser | null> {
    const db = await getDb();
    
    // 检查邮箱是否已被其他用户使用
    if (updateData.email) {
      const existingEmail = await db.get(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [updateData.email, id]
      );
      
      if (existingEmail) {
        throw new Error('邮箱已被其他用户使用');
      }
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (updateData.full_name !== undefined) {
      fields.push('full_name = ?');
      values.push(updateData.full_name || null);
    }

    if (updateData.phone !== undefined) {
      fields.push('phone = ?');
      values.push(updateData.phone || null);
    }

    if (updateData.email !== undefined) {
      fields.push('email = ?');
      values.push(updateData.email);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push('updated_at = ?');
    values.push(new Date());

    values.push(id);

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    const result = await db.run(query, values);

    if (result.changes === 0) {
      return null;
    }

    return this.findById(id);
  }

  /**
   * 更新用户密码
   */
  static async updatePassword(id: number, newPassword: string): Promise<void> {
    const db = await getDb();
    
    // 加密新密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.run(
      'UPDATE users SET password = ?, updated_at = ? WHERE id = ?',
      [hashedPassword, new Date(), id]
    );

    logger.info('用户密码更新成功', { userId: id });
  }

  /**
   * 更新最后登录时间
   */
  static async updateLastLogin(id: number): Promise<void> {
    const db = await getDb();
    await db.run(
      'UPDATE users SET last_login = ?, updated_at = ? WHERE id = ?',
      [new Date(), new Date(), id]
    );
  }

  /**
   * 验证密码
   */
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * 检查用户名是否存在
   */
  static async usernameExists(username: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.get(
      'SELECT 1 FROM users WHERE username = ?',
      [username]
    );
    
    return !!result;
  }

  /**
   * 检查邮箱是否存在
   */
  static async emailExists(email: string, excludeId?: number): Promise<boolean> {
    const db = await getDb();
    let query = 'SELECT 1 FROM users WHERE email = ?';
    const params: any[] = [email];
    
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    
    const result = await db.get(query, params);
    return !!result;
  }

  /**
   * 获取所有用户
   */
  static async findAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  } = {}): Promise<{ data: IUser[]; total: number }> {
    const db = await getDb();
    const { page = 1, limit = 20, search, status } = options;
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    const params: any[] = [];
    
    if (search) {
      whereClause += ' WHERE (username LIKE ? OR email LIKE ? OR full_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (status) {
      whereClause += whereClause ? ' AND status = ?' : ' WHERE status = ?';
      params.push(status);
    }
    
    // 获取总数
    const countQuery = `SELECT COUNT(*) as total FROM users${whereClause}`;
    const countResult = await db.get(countQuery, params);
    
    // 获取数据
    const dataQuery = `SELECT * FROM users${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const users = await db.all(dataQuery, [...params, limit, offset]);
    
    return {
      data: users.map(this.mapToIUser),
      total: countResult.total
    };
  }

  /**
   * 删除用户
   */
  static async delete(id: number): Promise<boolean> {
    const db = await getDb();
    const result = await db.run(
      'DELETE FROM users WHERE id = ?',
      [id]
    );
    
    return result.changes > 0;
  }

  /**
   * 更新用户状态
   */
  static async updateStatus(id: number, status: 'active' | 'inactive' | 'suspended'): Promise<boolean> {
    const db = await getDb();
    const result = await db.run(
      'UPDATE users SET status = ?, updated_at = ? WHERE id = ?',
      [status, new Date(), id]
    );
    
    return result.changes > 0;
  }

  /**
   * 映射数据库行到IUser接口
   */
  private static mapToIUser(row: any): IUser {
    return {
      _id: row.id.toString(),
      username: row.username,
      password: row.password,
      email: row.email,
      full_name: row.full_name || undefined,
      phone: row.phone || undefined,
      status: row.status as 'active' | 'inactive' | 'suspended',
      last_login: row.last_login ? new Date(row.last_login) : undefined,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    };
  }

  /**
   * 映射数据库行到IUser接口（包含密码）
   */
  private static mapToIUserWithPassword(row: any): IUser & { password: string } {
    return {
      ...this.mapToIUser(row),
      password: row.password
    };
  }
}

export default UserModel;