import bcrypt from 'bcryptjs';
import { IAdmin, IAdminCreate } from '@/interfaces/IAdmin';
import { getDb } from '@/config/database';

export class AdminModel {
  // 创建管理员
  static async create(adminData: IAdminCreate): Promise<IAdmin> {
    const db = await getDb();
    
    // 检查用户名是否已存在
    const existingAdmin = await db.get(
      'SELECT id FROM admins WHERE username = ?',
      [adminData.username]
    );
    
    if (existingAdmin) {
      throw new Error('用户名已存在');
    }

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    const now = new Date();
    const result = await db.run(
      `INSERT INTO admins (username, password, email, role, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        adminData.username,
        hashedPassword,
        adminData.email || null,
        adminData.role || 'admin',
        now,
        now
      ]
    );

    const admin = await db.get(
      'SELECT * FROM admins WHERE id = ?',
      [result.lastID]
    );

    return this.mapToIAdmin(admin);
  }

  // 根据用户名查找管理员（包含密码）
  static async findByUsernameWithPassword(username: string): Promise<(IAdmin & { password: string }) | null> {
    const db = await getDb();
    const admin = await db.get(
      'SELECT * FROM admins WHERE username = ?',
      [username]
    );
    
    if (!admin) {
      return null;
    }

    return {
      ...this.mapToIAdmin(admin),
      password: admin.password
    };
  }

  // 根据ID查找管理员
  static async findById(id: number): Promise<IAdmin | null> {
    const db = await getDb();
    const admin = await db.get(
      'SELECT * FROM admins WHERE id = ?',
      [id]
    );
    
    if (!admin) {
      return null;
    }

    return this.mapToIAdmin(admin);
  }

  // 更新最后登录时间
  static async updateLastLogin(id: number): Promise<void> {
    const db = await getDb();
    await db.run(
      'UPDATE admins SET last_login = ?, updated_at = ? WHERE id = ?',
      [new Date(), new Date(), id]
    );
  }

  // 更新管理员信息
  static async update(id: number, updateData: Partial<IAdmin>): Promise<IAdmin | null> {
    const db = await getDb();
    
    // 构建更新字段
    const fields: string[] = [];
    const values: any[] = [];
    
    if (updateData.email !== undefined) {
      fields.push('email = ?');
      values.push(updateData.email);
    }
    
    if (updateData.role !== undefined) {
      fields.push('role = ?');
      values.push(updateData.role);
    }
    
    // 总是更新updated_at
    fields.push('updated_at = ?');
    values.push(new Date());
    
    if (fields.length === 0) {
      return this.findById(id);
    }
    
    values.push(id);
    
    await db.run(
      `UPDATE admins SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return this.findById(id);
  }

  // 更新密码
  static async updatePassword(id: number, newPassword: string): Promise<void> {
    const db = await getDb();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await db.run(
      'UPDATE admins SET password = ?, updated_at = ? WHERE id = ?',
      [hashedPassword, new Date(), id]
    );
  }

  // 验证密码
  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // 获取所有管理员
  static async findAll(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<{ data: IAdmin[]; total: number }> {
    const db = await getDb();
    const { page = 1, limit = 20, search } = options;
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    const params: any[] = [];
    
    if (search) {
      whereClause = 'WHERE username LIKE ? OR email LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    // 获取总数
    const countResult = await db.get(
      `SELECT COUNT(*) as total FROM admins ${whereClause}`,
      params
    );
    
    // 获取数据
    const admins = await db.all(
      `SELECT * FROM admins ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    
    return {
      data: admins.map(this.mapToIAdmin),
      total: countResult.total
    };
  }

  // 删除管理员
  static async delete(id: number): Promise<boolean> {
    const db = await getDb();
    const result = await db.run(
      'DELETE FROM admins WHERE id = ?',
      [id]
    );
    
    return result.changes > 0;
  }

  // 检查超级管理员数量
  static async countSuperAdmins(): Promise<number> {
    const db = await getDb();
    const result = await db.get(
      'SELECT COUNT(*) as count FROM admins WHERE role = ?',
      ['super_admin']
    );
    
    return result.count;
  }

  // 映射数据库行到IAdmin接口
  private static mapToIAdmin(row: any): IAdmin {
    return {
      _id: row.id.toString(),
      username: row.username,
      password: '', // 不返回密码
      email: row.email || undefined,
      role: row.role as 'admin' | 'super_admin',
      last_login: row.last_login ? new Date(row.last_login) : undefined,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    };
  }

  // 检查用户名是否存在
  static async usernameExists(username: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.get(
      'SELECT 1 FROM admins WHERE username = ?',
      [username]
    );
    
    return !!result;
  }

  // 检查邮箱是否存在（排除指定ID）
  static async emailExists(email: string, excludeId?: number): Promise<boolean> {
    const db = await getDb();
    let query = 'SELECT 1 FROM admins WHERE email = ?';
    const params: any[] = [email];
    
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    
    const result = await db.get(query, params);
    return !!result;
  }
}

export default AdminModel;