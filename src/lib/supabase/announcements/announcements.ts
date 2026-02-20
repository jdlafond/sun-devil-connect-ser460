import { supabase } from '../supabase'

export interface Announcement {
  id: string
  org_id: string
  author_user_id: string
  title: string
  content: string | null
  created_at: string
}

export async function getAnnouncementsByOrg(orgId: string): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createAnnouncement(announcement: Omit<Announcement, 'id' | 'created_at'>): Promise<Announcement> {
  const { data, error } = await supabase.from('announcements').insert(announcement).select().single()
  if (error) throw error
  return data
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const { error } = await supabase.from('announcements').delete().eq('id', id)
  if (error) throw error
}
