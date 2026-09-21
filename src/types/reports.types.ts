export type ReportType = 'EVENT' | 'COMMENT' | 'INTEREST_COMMENT'
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
  eventId: string
  user: { id: string; name: string }
}

export interface ReportInterestCommentDto {
  id: string
  content: string
  createdAt: string
  parentId: string | null
  interestId: string
  user: { id: string; name: string }
}

/** Mirrors an item of GET /reports. */
export interface ReportDto {
  id: string
  type: ReportType
  status: ReportStatus
  reason: string | null
  createdAt: string
  reporter: ReportReporterDto
  event: ReportEventDto | null
  comment: ReportCommentDto | null
  interestComment: ReportInterestCommentDto | null
}

export interface ReportsQuery {
  status?: ReportStatus
  type?: ReportType
  limit?: number
  offset?: number
}

/** Response shape for GET /reports. */
export interface ReportsResponse {
  data: ReportDto[]
  total: number
  limit: number
  offset: number
}
