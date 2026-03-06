import { supabase } from '../supabase'

export interface Event {
  id: string
  org_id: string
  org_name?: string
  title: string
  description: string | null
  start_at: string
  end_at: string
  location: string | null
  capacity: number | null
  is_free: boolean | null
  registration_cutoff_at: string | null
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED'
  category: string | null
  image_url: string | null
  created_at: string
  updated_at: string
  registration_count?: number
}

export async function getEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*, organizations(name), event_registrations(count)')
    .eq('status', 'PUBLISHED')
    .gte('end_at', new Date().toISOString())
    .order('start_at')

  if (error) throw error
  return (data as any[]).map(e => ({
    ...e,
    org_name: e.organizations?.name ?? null,
    registration_count: e.event_registrations?.[0]?.count ?? 0,
  }))
}

export async function getPastEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*, organizations(name), event_registrations(count)')
    .eq('status', 'PUBLISHED')
    .lt('end_at', new Date().toISOString())
    .order('start_at', { ascending: false })

  if (error) throw error
  return (data as any[]).map(e => ({
    ...e,
    org_name: e.organizations?.name ?? null,
    registration_count: e.event_registrations?.[0]?.count ?? 0,
  }))
}

export async function getEventById(id: string): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .insert(event)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateEvent(id: string, updates: Partial<Omit<Event, 'id' | 'created_at' | 'updated_at'>>): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)

  if (error) throw error
}
