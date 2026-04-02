export interface IImage {
  url: string;
  name: string;
  sort: number;
  type: 'homepage' | 'confirmation' | 'registration-header';
  created_at: Date;
}

export interface IAttendee {
  name: string;
  company: string;
  position: string;
  phone: string;
  email?: string;
  join_lunch: boolean;
  join_dinner: boolean;
  registration_time: Date;
}

export interface IRegistrationFields {
  email: boolean;
  lunch: boolean;
  dinner: boolean;
}

export interface IConference {
  _id?: string;
  title: string;
  description?: string;
  start_date: Date;
  end_date: Date;
  location: string;
  max_attendees?: number;
  current_attendees: number;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface IConferenceCreate {
  title: string;
  description?: string;
  start_date: Date;
  end_date: Date;
  location: string;
  max_attendees?: number;
  current_attendees?: number;
  status?: 'draft' | 'published' | 'cancelled' | 'completed';
  created_by?: string;
}

export interface IConferenceUpdate {
  title?: string;
  description?: string;
  start_date?: Date;
  end_date?: Date;
  location?: string;
  max_attendees?: number;
  current_attendees?: number;
  status?: 'draft' | 'published' | 'cancelled' | 'completed';
}

export interface IConferenceStats {
  total_attendees: number;
  join_lunch: number;
  join_dinner: number;
}