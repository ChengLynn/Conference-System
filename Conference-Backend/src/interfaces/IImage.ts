export interface IImage {
  _id?: string;
  conference_id: number;
  filename: string;
  original_name: string;
  path: string;
  size: number;
  mime_type: string;
  created_at: Date;
}

export interface IImageCreate {
  conference_id: number;
  filename: string;
  original_name: string;
  path: string;
  size: number;
  mime_type: string;
}