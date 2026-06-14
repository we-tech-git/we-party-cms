export interface ProducerDashboardGrowthPoint {
  date: string
  peopleReached: number
}

export interface TopEventDto {
  id: string
  title: string
  location: string
  startDate: string
  ageRange: null
  totalPeopleReached: number
  viewCount: number
  totalLikes: number
  totalComments: number
  totalConfirmed: number
  totalSaves: number
  shareCount: number
}

export interface RecentEventDto {
  id: string
  title: string
  startDate: string
  location: string
  viewCount: number
  totalLikes: number
  totalConfirmed: number
}

export interface ProducerDashboardResponse {
  producerId: string
  totalViews: number
  totalShares: number
  totalLikes: number
  totalComments: number
  totalAttendances: number
  peopleReached: number
  totalEvents: number
  growthChart: ProducerDashboardGrowthPoint[]
  topEvent: TopEventDto | null
  recentEvents: RecentEventDto[]
}

export interface FaqItem {
  question: string
  answer: string
}

export interface InterestDto {
  id: string
  name: string
}

export interface EventInterestDto {
  id: string
  eventId: string
  interestId: string
  interest: InterestDto
}

export interface EventCreatorDto {
  id: string
  name: string
  username: string
  profileImage: string | null
}

export interface EventCountDto {
  attendances: number
  comments: number
  likes: number
}

export interface EventDto {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string | null
  location: string
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED'
  isPublic: boolean
  allowComments: boolean
  photos: string[]
  viewCount: number
  shareCount: number
  createdAt: string
  creator: EventCreatorDto
  eventInterests: EventInterestDto[]
  _count: EventCountDto
}

export interface MyEventsResponse {
  events: EventDto[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CommentDto {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string
    username: string
    profileImage: string | null
  }
}

export interface CommentsResponse {
  comments: CommentDto[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CreateEventPayload {
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  isPublic: boolean
  allowComments: boolean
  showInMainFeed: true
  interestIds: string[]
  invitedUserIds: []
  faqs: FaqItem[]
}
