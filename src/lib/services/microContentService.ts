import { microContentAPI } from '../api'

export interface MicroContent {
  id: string
  university_id: string
  content_type: 'event' | 'tour' | 'announcement' | 'update'
  title: string
  content: string
  media_url?: string
  expiry_date?: string
  priority: number
  status: 'published' | 'draft'
  created_at: string
  updated_at: string
}

export interface MicroContentFormData {
  university_id: string
  content_type: 'event' | 'tour' | 'announcement' | 'update'
  title: string
  content: string
  media_url?: string
  expiry_date?: string
  priority: number
  status: 'published' | 'draft'
}

export { microContentAPI }

export const CONTENT_TYPES = [
  { value: 'event', label: 'Event', icon: '📅', description: 'Virtual open days, webinars, workshops' },
  { value: 'tour', label: 'Campus Tour', icon: '🎥', description: 'Virtual or in-person campus tours' },
  { value: 'announcement', label: 'Announcement', icon: '📢', description: 'News, updates, important information' },
  { value: 'update', label: 'Update', icon: '🔄', description: 'Program updates, new facilities' },
] as const;

export const PRIORITY_LEVELS = [
  { value: 1, label: 'Low', color: 'gray' },
  { value: 2, label: 'Medium', color: 'blue' },
  { value: 3, label: 'High', color: 'orange' },
  { value: 4, label: 'Urgent', color: 'red' },
] as const;
