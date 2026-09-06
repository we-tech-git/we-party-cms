export type ReportType = 'EVENT' | 'COMMENT'
export type ReportStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

export interface ReportReporterDto {
  id: string
  name: string
  username: string
}

export interface ReportEventDto {
  id: string
  title: string
  createdAt: string
  creator: { id: string; name: string }
}

export interface ReportCommentDto {
  id: string
  content: string
  createdAt: string
  parentId: string | null
  user: { id: string; name: string }
  eventId: string
}

export interface ReportDto {
  id: string
  type: ReportType
  status: ReportStatus
  reason: string | null
  createdAt: string
  reporter: ReportReporterDto
  event: ReportEventDto | null
  comment: ReportCommentDto | null
}

export interface ReportsResponse {
  data: ReportDto[]
  total: number
  limit: number
  offset: number
}