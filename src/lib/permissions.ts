import type { UserRole } from '@/src/models'

export const can = {
  manageOrg: (role: UserRole) => ['ORGANIZER', 'ADMIN'].includes(role),
  manageEvents: (role: UserRole) => ['ORGANIZER', 'ADMIN'].includes(role),
  moderateContent: (role: UserRole) => role === 'ADMIN',
  reviewApplications: (role: UserRole) => role === 'ADMIN',
  applyToOrg: (role: UserRole) => role === 'STUDENT',
  registerForEvent: (role: UserRole) => role === 'STUDENT',
  postAnnouncement: (role: UserRole) => ['ORGANIZER', 'ADMIN'].includes(role),
}
