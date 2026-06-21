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
  // The backend expects the singular field name `faq` (the create endpoints read
  // `faq`, with `faqs` only kept as a read fallback). Sending `faqs` here makes
  // the FAQs silently disappear on create.
  faq: FaqItem[]
}

export interface EventFaqDto {
  id: string
  eventId: string
  question: string
  answer: string
}

/**
 * Shape returned by GET /events/{id} (findOne). Extends the list DTO with the
 * fields only the detail endpoint returns: FAQs and the broken-down address.
 * Address fields can be null for events created from a single `location` string.
 */
export interface EventDetailDto extends EventDto {
  faq: EventFaqDto[]
  street: string | null
  number: string | null
  neighborhood: string | null
  city: string | null
  state: string | null
  country: string | null
  zipCode: string | null
}

/** Body sent to PUT /events/{id}. Mirrors the web-OPS update flow (faqs inline, photos = kept URLs). */
export interface UpdateEventPayload {
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  isPublic: boolean
  allowComments: boolean
  interestIds: string[]
  // Singular `faq`, same as the create payload (the backend has no dedicated
  // FAQ endpoint — FAQs are sent inline on the event itself).
  faq: FaqItem[]
  photos?: string[]
}
