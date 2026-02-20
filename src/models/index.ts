// Enums — single source of truth
export type UserRole = 'STUDENT' | 'ADMIN' | 'ORGANIZER'
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED'
export type OrganizationStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING'
export type FlagStatus = 'OPEN' | 'CLOSED' | 'UNDER_REVIEW'
export type FlagTargetType = 'EVENT' | 'ANNOUNCEMENT' | 'ORGANIZATION' | 'USER'
export type ModerationStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

// Re-export interfaces from lib (snake_case, matches DB schema)
export type { UserProfile as User } from '@/src/lib/supabase/users/users'
export type { Organization } from '@/src/lib/supabase/organizations/organizations'
export type { Event } from '@/src/lib/supabase/events/events'
export type { Announcement } from '@/src/lib/supabase/announcements/announcements'
export type { MembershipApplication, OrganizationApplication } from '@/src/lib/supabase/applications/applications'
export type { ContentFlag } from '@/src/lib/supabase/flags/flags'
export type { Notification } from '@/src/lib/supabase/notifications/notifications'
