import type { ApplicationStatus } from '@/src/models'

const transitions: Record<ApplicationStatus, ApplicationStatus[]> = {
  PENDING: ['APPROVED', 'REJECTED'],
  APPROVED: [],
  REJECTED: [],
}

export function transition(current: ApplicationStatus, next: ApplicationStatus): ApplicationStatus {
  if (!transitions[current]?.includes(next))
    throw new Error(`Invalid transition: ${current} → ${next}`)
  return next
}

export function canTransition(current: ApplicationStatus, next: ApplicationStatus): boolean {
  return transitions[current]?.includes(next) ?? false
}
