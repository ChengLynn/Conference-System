import { IConference, IConferenceCreate, IConferenceUpdate } from '@/interfaces/IConference';
import { getDb } from '@/config/database';
import { logger } from '@/utils/logger';

export class ConferenceModel {
  // 创建会议
  static async create(conferenceData: IConferenceCreate): Promise<IConference> {
    const db = await getDb();
    
    const now = new Date();
    const result = await db.run(
      `INSERT INTO conferences (
        title, description, start_date, end_date, location,
        max_attendees, current_attendees, status, created_by,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        conferenceData.title,
        conferenceData.description || null,
        conferenceData.start_date,
        conferenceData.end_date,
        conferenceData.location,
        conferenceData.max_attendees || null,
        conferenceData.current_attendees || 0,
        conferenceData.status || 'draft',
        conferenceData.created_by || null,
        now,
        now
      ]
    );

    const conference = await db.get(
      'SELECT * FROM conferences WHERE id = ?',
      [result.lastID]
    );

    return this.mapToIConference(conference);
  }

  // 根据ID查找会议
  static async findById(id: number): Promise<IConference | null> {
    const db = await getDb();
    const conference = await db.get(
      'SELECT * FROM conferences WHERE id = ?',
      [id]
    );
    
    if (!conference) {
      return null;
    }

    return this.mapToIConference(conference);
  }

  // 更新会议
  static async update(id: number, updateData: IConferenceUpdate): Promise<IConference | null> {
    const db = await getDb();
    
    // 构建更新字段
    const fields: string[] = [];
    const values: any[] = [];
    
    if (updateData.title !== undefined) {
      fields.push('title = ?');
      values.push(updateData.title);
    }
    
    if (updateData.description !== undefined) {
      fields.push('description = ?');
      values.push(updateData.description);
    }
    
    if (updateData.start_date !== undefined) {
      fields.push('start_date = ?');
      values.push(updateData.start_date);
    }
    
    if (updateData.end_date !== undefined) {
      fields.push('end_date = ?');
      values.push(updateData.end_date);
    }
    
    if (updateData.location !== undefined) {
      fields.push('location = ?');
      values.push(updateData.location);
    }
    
    if (updateData.max_attendees !== undefined) {
      fields.push('max_attendees = ?');
      values.push(updateData.max_attendees);
    }
    
    if (updateData.current_attendees !== undefined) {
      fields.push('current_attendees = ?');
      values.push(updateData.current_attendees);
    }
    
    if (updateData.status !== undefined) {
      fields.push('status = ?');
      values.push(updateData.status);
    }
    
    // 总是更新updated_at
    fields.push('updated_at = ?');
    values.push(new Date());
    
    if (fields.length === 0) {
      return this.findById(id);
    }
    
    values.push(id);
    
    await db.run(
      `UPDATE conferences SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return this.findById(id);
  }

  // 删除会议
  static async delete(id: number): Promise<boolean> {
    const db = await getDb();
    const result = await db.run(
      'DELETE FROM conferences WHERE id = ?',
      [id]
    );
    
    return result.changes > 0;
  }

  // 获取所有会议
  static async findAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    startDateFrom?: Date;
    startDateTo?: Date;
  } = {}): Promise<{ data: IConference[]; total: number }> {
    const db = await getDb();
    const { 
      page = 1, 
      limit = 20, 
      search, 
      status,
      startDateFrom,
      startDateTo 
    } = options;
    
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    const params: any[] = [];
    
    const conditions: string[] = [];
    
    if (search) {
      conditions.push('(title LIKE ? OR description LIKE ? OR location LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    
    if (startDateFrom) {
      conditions.push('start_date >= ?');
      params.push(startDateFrom);
    }
    
    if (startDateTo) {
      conditions.push('start_date <= ?');
      params.push(startDateTo);
    }
    
    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }
    
    // 获取总数
    const countResult = await db.get(
      `SELECT COUNT(*) as total FROM conferences ${whereClause}`,
      params
    );
    
    // 获取数据
    const conferences = await db.all(
      `SELECT * FROM conferences ${whereClause} ORDER BY start_date ASC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    
    return {
      data: conferences.map(this.mapToIConference),
      total: countResult.total
    };
  }

  // 更新参会者数量
  static async updateAttendeeCount(id: number, change: number): Promise<boolean> {
    const db = await getDb();
    
    try {
      await db.run(
        'UPDATE conferences SET current_attendees = current_attendees + ?, updated_at = ? WHERE id = ?',
        [change, new Date(), id]
      );
      return true;
    } catch (error) {
      logger.error('更新参会者数量失败:', error);
      return false;
    }
  }

  // 检查会议是否存在
  static async exists(id: number): Promise<boolean> {
    const db = await getDb();
    const result = await db.get(
      'SELECT 1 FROM conferences WHERE id = ?',
      [id]
    );
    
    return !!result;
  }

  // 获取即将开始的会议
  static async getUpcomingConferences(limit: number = 10): Promise<IConference[]> {
    const db = await getDb();
    const now = new Date();
    
    const conferences = await db.all(
      `SELECT * FROM conferences 
       WHERE start_date > ? AND status = 'published'
       ORDER BY start_date ASC 
       LIMIT ?`,
      [now, limit]
    );
    
    return conferences.map(this.mapToIConference);
  }

  // 获取进行中的会议
  static async getOngoingConferences(): Promise<IConference[]> {
    const db = await getDb();
    const now = new Date();
    
    const conferences = await db.all(
      `SELECT * FROM conferences 
       WHERE start_date <= ? AND end_date >= ? AND status = 'published'
       ORDER BY start_date ASC`,
      [now, now]
    );
    
    return conferences.map(this.mapToIConference);
  }

  // 映射数据库行到IConference接口
  private static mapToIConference(row: any): IConference {
    return {
      _id: row.id.toString(),
      title: row.title,
      description: row.description || undefined,
      start_date: new Date(row.start_date),
      end_date: new Date(row.end_date),
      location: row.location,
      max_attendees: row.max_attendees || undefined,
      current_attendees: row.current_attendees,
      status: row.status as 'draft' | 'published' | 'cancelled' | 'completed',
      created_by: row.created_by ? row.created_by.toString() : undefined,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    };
  }
}

export default ConferenceModel;