import { IAttendee, IAttendeeCreate } from '../interfaces/IAttendee';
import { getDb } from '../config/database';

export class AttendeeModel {
  // 创建参会者
  static async create(attendeeData: IAttendeeCreate): Promise<IAttendee> {
    const db = await getDb();
    
    const now = new Date();
    const result = await db.run(
      `INSERT INTO attendees (
        conference_id, name, email, phone, company, position,
        registration_date, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        attendeeData.conference_id,
        attendeeData.name,
        attendeeData.email,
        attendeeData.phone || null,
        attendeeData.company || null,
        attendeeData.position || null,
        attendeeData.registration_date || now,
        attendeeData.status || 'pending',
        now,
        now
      ]
    );

    const attendee = await db.get(
      'SELECT * FROM attendees WHERE id = ?',
      [result.lastID]
    );

    return this.mapToIAttendee(attendee);
  }

  // 根据ID查找参会者
  static async findById(id: number): Promise<IAttendee | null> {
    const db = await getDb();
    const attendee = await db.get(
      'SELECT * FROM attendees WHERE id = ?',
      [id]
    );
    
    if (!attendee) {
      return null;
    }

    return this.mapToIAttendee(attendee);
  }

  // 根据会议ID查找参会者
  static async findByConferenceId(conferenceId: number, options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  } = {}): Promise<{ data: IAttendee[]; total: number }> {
    const db = await getDb();
    const { page = 1, limit = 20, search, status } = options;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE conference_id = ?';
    const params: any[] = [conferenceId];
    
    if (search) {
      whereClause += ' AND (name LIKE ? OR email LIKE ? OR company LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }
    
    // 获取总数
    const countResult = await db.get(
      `SELECT COUNT(*) as total FROM attendees ${whereClause}`,
      params
    );
    
    // 获取数据
    const attendees = await db.all(
      `SELECT * FROM attendees ${whereClause} ORDER BY registration_date DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    
    return {
      data: attendees.map(this.mapToIAttendee),
      total: countResult.total
    };
  }

  // 更新参会者状态
  static async updateStatus(id: number, status: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.run(
      'UPDATE attendees SET status = ?, updated_at = ? WHERE id = ?',
      [status, new Date(), id]
    );
    
    return result.changes > 0;
  }

  // 删除参会者
  static async delete(id: number): Promise<boolean> {
    const db = await getDb();
    const result = await db.run(
      'DELETE FROM attendees WHERE id = ?',
      [id]
    );
    
    return result.changes > 0;
  }

  // 检查邮箱是否已注册会议
  static async emailExistsForConference(email: string, conferenceId: number): Promise<boolean> {
    const db = await getDb();
    const result = await db.get(
      'SELECT 1 FROM attendees WHERE email = ? AND conference_id = ?',
      [email, conferenceId]
    );
    
    return !!result;
  }

  // 获取会议参会者统计
  static async getConferenceStats(conferenceId: number): Promise<{
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
  }> {
    const db = await getDb();
    
    const result = await db.get(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
       FROM attendees WHERE conference_id = ?`,
      [conferenceId]
    );
    
    return {
      total: result.total || 0,
      confirmed: result.confirmed || 0,
      pending: result.pending || 0,
      cancelled: result.cancelled || 0
    };
  }

  // 映射数据库行到IAttendee接口
  private static mapToIAttendee(row: any): IAttendee {
    return {
      _id: row.id.toString(),
      conference_id: row.conference_id,
      name: row.name,
      email: row.email,
      phone: row.phone || undefined,
      company: row.company || undefined,
      position: row.position || undefined,
      registration_date: new Date(row.registration_date),
      status: row.status as 'pending' | 'confirmed' | 'cancelled',
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    };
  }
}

export default AttendeeModel;