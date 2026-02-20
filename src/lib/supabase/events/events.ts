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
  registration_cutoff_at: string | null
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED'
  category: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}

export async function getEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*, organizations(name)')
    .eq('status', 'PUBLISHED')
    .order('start_at')

  if (error) throw error
  return (data as any[]).map(e => ({ ...e, org_name: e.organizations?.name ?? null }))
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
