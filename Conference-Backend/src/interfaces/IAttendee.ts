export interface IAttendee {
  _id?: string;
  conference_id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  registration_date: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: Date;
  updated_at: Date;
}

export interface IAttendeeCreate {
  conference_id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  registration_date?: Date;
  status?: 'pending' | 'confirmed' | 'cancelled';
}