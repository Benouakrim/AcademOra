import { advancedAnalyticsAPI } from '../api'

export interface AnalyticsOverview {
  totalUsers: number
  activeUsers: number
  totalUniversities: number
  totalApplications: number
  conversionRate: number
  avgSessionDuration: number
  bounceRate: number
  pageViews: number
  uniqueVisitors: number
}

export interface UserAnalytics {
  totalUsers: number
  newUsers: number
  activeUsers: number
  returningUsers: number
  userGrowthRate: number
  topCountries: Array<{
    country: string
    count: number
    percentage: number
  }>
  userDemographics: {
    ageGroups: Array<{ range: string; count: number; percentage: number }>
    genderDistribution: Array<{ gender: string; count: number; percentage: number }>
  }
  registrationTrends: Array<{
    date: string
    registrations: number
    cumulative: number
  }>
}

export interface UniversityAnalytics {
  totalUniversities: number
  featuredUniversities: number
  claimedUniversities: number
  topUniversities: Array<{
    id: string
    name: string
    views: number
    applications: number
    conversionRate: number
  }>
  countryDistribution: Array<{
    country: string
    count: number
    percentage: number
  }>
  programPopularity: Array<{
    program: string
    count: number
    percentage: number
  }>
}

export interface EngagementAnalytics {
  pageViews: number
  uniquePageViews: number
  avgSessionDuration: number
  bounceRate: number
  topPages: Array<{
    path: string
    title: string
    views: number
    avgDuration: number
    bounceRate: number
  }>
  userJourney: Array<{
    step: string
    page: string
    dropoffRate: number
    completionRate: number
  }>
  featureUsage: Array<{
    feature: string
    usage: number
    users: number
    percentage: number
  }>
}

export interface ConversionAnalytics {
  totalApplications: number
  completedApplications: number
  conversionRate: number
  conversionFunnel: Array<{
    step: string
    count: number
    conversionRate: number
    dropoffRate: number
  }>
  sourceAttribution: Array<{
    source: string
    applications: number
    conversions: number
    conversionRate: number
  }>
  timeToConvert: {
    average: number
    median: number
    distribution: Array<{ range: string; count: number }>
  }
}

export interface ContentAnalytics {
  totalArticles: number
  publishedArticles: number
  totalViews: number
  avgReadTime: number
  topArticles: Array<{
    id: string
    title: string
    views: number
    readTime: number
    engagement: number
  }>
  contentPerformance: Array<{
    type: string
    count: number
    views: number
    engagement: number
  }>
  searchAnalytics: {
    totalSearches: number
    topQueries: Array<{
      query: string
      count: number
      resultsFound: number
    }>
    noResultQueries: Array<{
      query: string
      count: number
    }>
  }
}

export interface TimeSeriesData {
  date: string
  value: number
  label?: string
}

export interface AnalyticsFilters {
  dateRange: '7d' | '30d' | '90d' | '1y' | 'custom'
  startDate?: string
  endDate?: string
  country?: string
  university?: string
  contentType?: string
}

export { advancedAnalyticsAPI }

export const DATE_RANGES = [
  { value: '7d', label: 'Last 7 days', days: 7 },
  { value: '30d', label: 'Last 30 days', days: 30 },
  { value: '90d', label: 'Last 90 days', days: 90 },
  { value: '1y', label: 'Last year', days: 365 },
  { value: 'custom', label: 'Custom range', days: 0 },
] as const

export const METRIC_TYPES = [
  { value: 'users', label: 'Users', icon: '👥', color: 'blue' },
  { value: 'pageViews', label: 'Page Views', icon: '👁️', color: 'green' },
  { value: 'applications', label: 'Applications', icon: '📝', color: 'purple' },
  { value: 'engagement', label: 'Engagement', icon: '💫', color: 'orange' },
  { value: 'conversions', label: 'Conversions', icon: '🎯', color: 'red' },
  { value: 'revenue', label: 'Revenue', icon: '💰', color: 'emerald' },
] as const

export const CHART_TYPES = [
  { value: 'line', label: 'Line Chart', icon: '📈' },
  { value: 'bar', label: 'Bar Chart', icon: '📊' },
  { value: 'pie', label: 'Pie Chart', icon: '🥧' },
  { value: 'area', label: 'Area Chart', icon: '📉' },
] as const

export const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV', icon: '📄', extension: '.csv' },
  { value: 'json', label: 'JSON', icon: '🗂️', extension: '.json' },
  { value: 'xlsx', label: 'Excel', icon: '📊', extension: '.xlsx' },
] as const
