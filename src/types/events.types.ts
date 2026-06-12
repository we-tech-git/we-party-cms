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
