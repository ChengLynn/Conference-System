// 导出模型类
import AdminModel from './Admin';
import ConferenceModel from './Conference';
import ImageModel from './Image';
import AttendeeModel from './Attendee';
import UserModel from './User';

export { AdminModel, ConferenceModel, ImageModel, AttendeeModel, UserModel };

// 导出接口
export type { IAdmin } from '@/interfaces/IAdmin';
export type { IConference } from '@/interfaces/IConference';
export type { IImage } from '@/interfaces/IImage';
export type { IAttendee } from '@/interfaces/IAttendee';
export type { IUser } from '@/interfaces/IUser';
