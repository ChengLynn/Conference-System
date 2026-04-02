import { IImage, IImageCreate } from '../interfaces/IImage';
import { getDb } from '../config/database';

export class ImageModel {
  // 创建图片
  static async create(imageData: IImageCreate): Promise<IImage> {
    const db = await getDb();
    
    const result = await db.run(
      `INSERT INTO images (
        conference_id, filename, original_name, path, size, mime_type, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        imageData.conference_id,
        imageData.filename,
        imageData.original_name,
        imageData.path,
        imageData.size,
        imageData.mime_type,
        new Date()
      ]
    );

    const image = await db.get(
      'SELECT * FROM images WHERE id = ?',
      [result.lastID]
    );

    return this.mapToIImage(image);
  }

  // 根据ID查找图片
  static async findById(id: number): Promise<IImage | null> {
    const db = await getDb();
    const image = await db.get(
      'SELECT * FROM images WHERE id = ?',
      [id]
    );
    
    if (!image) {
      return null;
    }

    return this.mapToIImage(image);
  }

  // 根据会议ID查找图片
  static async findByConferenceId(conferenceId: number): Promise<IImage[]> {
    const db = await getDb();
    const images = await db.all(
      'SELECT * FROM images WHERE conference_id = ? ORDER BY created_at DESC',
      [conferenceId]
    );
    
    return images.map(this.mapToIImage);
  }

  // 删除图片
  static async delete(id: number): Promise<boolean> {
    const db = await getDb();
    const result = await db.run(
      'DELETE FROM images WHERE id = ?',
      [id]
    );
    
    return result.changes > 0;
  }

  // 删除会议的所有图片
  static async deleteByConferenceId(conferenceId: number): Promise<boolean> {
    const db = await getDb();
    const result = await db.run(
      'DELETE FROM images WHERE conference_id = ?',
      [conferenceId]
    );
    
    return result.changes > 0;
  }

  // 映射数据库行到IImage接口
  private static mapToIImage(row: any): IImage {
    return {
      _id: row.id.toString(),
      conference_id: row.conference_id,
      filename: row.filename,
      original_name: row.original_name,
      path: row.path,
      size: row.size,
      mime_type: row.mime_type,
      created_at: new Date(row.created_at)
    };
  }
}

export default ImageModel;