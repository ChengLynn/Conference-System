import { get, post, put, del } from './index'

// 会议相关的API接口
export const conferenceApi = {
  // 获取会议列表
  getConferences: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    get<{
      data: Array<{
        id: number
        title: string
        description?: string
        start_date: string
        end_time: string
        location: string
        status: 'preparing' | 'ongoing' | 'finished'
        max_participants?: number
        current_participants?: number
        created_by?: number
        created_at: string
        updated_at: string
      }>
      pagination: {
        page: number
        limit: number
        total: number
        pages: number
        hasNext: boolean
        hasPrev: boolean
      }
    }>('/conferences', params),

  // 获取单个会议
  getConference: (id: number) => get(`/conferences/${id}`),

  // 创建会议
  createConference: (data: {
    name: string
    description?: string
    start_time: string
    end_time: string
    location: string
    status?: 'preparing' | 'ongoing' | 'finished'
    max_participants?: number
  }) => post('/conferences', data),

  // 更新会议
  updateConference: (
    id: number,
    data: {
      name?: string
      description?: string
      start_time?: string
      end_time?: string
      location?: string
      status?: 'preparing' | 'ongoing' | 'finished'
      max_participants?: number
    },
  ) => put(`/conferences/${id}`, data),

  // 删除会议
  deleteConference: (id: number) => del(`/conferences/${id}`),

  // 获取即将开始的会议
  getUpcomingConferences: (limit?: number) => get('/conferences/upcoming', { limit }),

  // 获取进行中的会议
  getOngoingConferences: () => get('/conferences/ongoing'),
}
