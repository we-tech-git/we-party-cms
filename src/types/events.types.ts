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

/** Kinds of activity the backend surfaces for an event (comments, likes, attendance, shares). */
export type EventActivityType = 'comment' | 'like' | 'attendance' | 'share'

export interface ActivityUserDto {
  id: string
  name: string
  profileImage?: string | null
}

export interface ActivityEventDto {
  id: string
  title: string
}

/**
 * A single activity on one of the producer's events. Shared shape between the
 * consolidated dashboard feed (`GET /events/my-dashboard`) and the per-event
 * feed (`GET /events/{id}/activities`), per the backend's OpenAPI schema.
 */
export interface EventActivityDto {
  id: string
  type: EventActivityType
  /** Type-specific payload — e.g. the comment text for `comment` activities. */
  data: string | null
  createdAt: string
  user: ActivityUserDto
  event: ActivityEventDto
}

/** Response shape for `GET /events/{id}/activities`. */
export interface EventActivitiesResponse {
  items: EventActivityDto[]
  total: number
  offset: number
  limit: number
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
  /** Consolidated recent activities across the producer's events (up to 20). */
  recentActivities: EventActivityDto[]
}

export interface FaqItem {
  question: string
  answer: string
}

export interface InterestDto {
  id: string
  name: string
}

export type InterestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

/**
 * Richer interest shape returned by GET /interest for the admin view. Beyond
 * the minimal {id,name} used elsewhere, the backend may also send a
 * description, a moderation status and timestamps — all optional here so we
 * tolerate older/leaner payloads.
 */
export interface AdminInterestDto {
  id: string
  name: string
  description?: string | null
  status?: InterestStatus
  createdAt?: string
  updatedAt?: string
  eventCount?: number
  eventViewCount?: number
  userCount?: number
}

export interface UpdateInterestPayload {
  name?: string
  description?: string
  status?: InterestStatus
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

export interface InterestDetailCreatorDto {
  id: string
  name: string
  username: string
  email: string
}

export interface InterestDetailInterestDto {
  id: string
  name: string
  description: string | null
  status: string
  createdAt: string
  eventCount: number
  eventViewCount: number
  creator: InterestDetailCreatorDto
}

export interface InterestDetailUserDto {
  id: string
  name: string
  username: string
  email: string
  profileImage: string | null
  interestedAt: string
}

export interface InterestDetailEventDto {
  id: string
  title: string
  startDate: string
  endDate: string | null
  city: string | null
  state: string | null
  status: string
  viewCount: number
  createdAt: string
  associatedAt: string
}

export interface InterestDetailsResponse {
  interest: InterestDetailInterestDto
  totalUsers: number
  users: InterestDetailUserDto[]
  totalEvents: number
  events: InterestDetailEventDto[]
}
