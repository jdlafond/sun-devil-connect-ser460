import { supabase } from '../supabase'
import type { Organization } from '../organizations/organizations'
import type { Event } from '../events/events'

export async function getMyOrganizations(userId: string): Promise<Organization[]> {
  const { data, error } = await supabase
    .from('organization_members')
    .select('organizations(*)')
    .eq('user_id', userId)
  if (error) throw error
  return (data as any[]).map(d => d.organizations).filter(Boolean)
}

export async function getMyEvents(userId: string): Promise<Event[]> {
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('event_registrations')
    .select('events(*, organizations(name))')
    .eq('user_id', userId)
  if (error) throw error
  return (data as any[])
    .map(d => d.events)
    .filter(e => e && e.end_at > now)
    .map(e => ({ ...e, org_name: e.organizations?.name ?? null }))
}

export async function registerForEvent(userId: string, eventId: string): Promise<void> {
  const { error } = await supabase
    .from('event_registrations')
    .insert({ user_id: userId, event_id: eventId })
  if (error) throw error
}

export async function unregisterFromEvent(userId: string, eventId: string): Promise<void> {
  const { error } = await supabase
    .from('event_registrations')
    .delete()
    .eq('user_id', userId)
    .eq('event_id', eventId)
  if (error) throw error
}

export async function isRegisteredForEvent(userId: string, eventId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('event_registrations')
    .select('id')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .maybeSingle()
  if (error) throw error
  return !!data
}

export async function leaveOrganization(userId: string, orgId: string): Promise<void> {
  const { error } = await supabase
    .from('organization_members')
    .delete()
    .eq('user_id', userId)
    .eq('org_id', orgId)
  if (error) throw error
}
