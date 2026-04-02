// src/types/conference.ts
export interface ConferenceItem {
  id: number
  name: string
  host?: string // 主持人
  speakers?: string // 演讲嘉宾
  roundtableGuests?: string // 圆桌嘉宾
  importantGuests?: string // 重要嘉宾
  otherGuests?: string // 其他嘉宾
  totalAttendees?: number // 总人数
  totalSponsorship?: string // 总赞助金额
  sponsorCompanies?: string // 赞助企业数
  scale?: number // 会议规模（可选，保持向后兼容）
  totalForms?: number // 表单总数（可选，保持向后兼容）
  todaySubmit?: number // 今日提交（可选，保持向后兼容）
  increase?: number // 增加数量（可选，保持向后兼容）
  filePath?: string // 可选的文件路径
  editors?: string[] // 编辑者
  designItems?: string // 设计事项
}

export interface ConferenceQueryParams {
  keyword?: string
  date?: string
  page: number
  pageSize: number
}

export interface PaginatedResponse<T> {
  total: number
  data: T[]
}
