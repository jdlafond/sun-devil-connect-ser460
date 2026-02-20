import { supabase } from '../supabase'
import { transition } from '../../applicationState'
import type { ApplicationStatus } from '@/src/models'

export interface MembershipApplication {
  id: string
  user_id: string
  org_id: string
  message: string | null
  submitted_at: string
  state: ApplicationStatus
  reviewed_at: string | null
  reviewed_by: string | null
}

export interface OrganizationApplication {
  id: string
  submitted_by: string
  proposed_organization: Record<string, unknown>
  justification: string | null
  submitted_at: string
  review: Record<string, unknown> | null
  state: ApplicationStatus
  reviewed_at: string | null
  reviewed_by: string | null
}

// Membership Applications
export async function applyToOrg(userId: string, orgId: string, message?: string): Promise<MembershipApplication> {
  const { data, error } = await supabase
    .from('membership_applications')
    .insert({ user_id: userId, org_id: orgId, message })
    .select().single()
  if (error) throw error
  return data
}

export async function getMembershipApplicationsByOrg(orgId: string): Promise<MembershipApplication[]> {
  const { data, error } = await supabase
    .from('membership_applications')
    .select('*')
    .eq('org_id', orgId)
    .order('submitted_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getMembershipApplicationsByUser(userId: string): Promise<MembershipApplication[]> {
  const { data, error } = await supabase
    .from('membership_applications')
    .select('*, organizations(name)')
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false })
  if (error) throw error
  return data
}

export async function updateMembershipApplicationState(
  id: string,
  current: ApplicationStatus,
  next: ApplicationStatus,
  reviewedBy: string
): Promise<MembershipApplication> {
  transition(current, next) // throws if invalid
  const { data, error } = await supabase
    .from('membership_applications')
    .update({ state: next, reviewed_at: new Date().toISOString(), reviewed_by: reviewedBy })
    .eq('id', id).select().single()
  if (error) throw error
  return data
}

// Organization Applications
export async function applyToCreateOrg(
  userId: string,
  proposedOrganization: Record<string, unknown>,
  justification?: string
): Promise<OrganizationApplication> {
  const { data, error } = await supabase
    .from('organization_applications')
    .insert({ submitted_by: userId, proposed_organization: proposedOrganization, justification })
    .select().single()
  if (error) throw error
  return data
}

export async function getOrganizationApplications(): Promise<OrganizationApplication[]> {
  const { data, error } = await supabase
    .from('organization_applications')
    .select('*')
    .order('submitted_at', { ascending: false })
  if (error) throw error
  return data
}

export async function updateOrganizationApplicationState(
  id: string,
  current: ApplicationStatus,
  next: ApplicationStatus,
  reviewedBy: string,
  review?: Record<string, unknown>
): Promise<OrganizationApplication> {
  transition(current, next)
  const { data, error } = await supabase
    .from('organization_applications')
    .update({ state: next, reviewed_at: new Date().toISOString(), reviewed_by: reviewedBy, review })
    .eq('id', id).select().single()
  if (error) throw error
  return data
}
