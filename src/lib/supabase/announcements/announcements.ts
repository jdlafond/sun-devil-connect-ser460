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

  // Notify all org members
  const { data: members } = await supabase
    .from('organization_members')
    .select('user_id')
    .eq('org_id', announcement.org_id)
    .neq('user_id', announcement.author_user_id)

  if (members && members.length > 0) {
    await supabase.from('notifications').insert(
      members.map(m => ({
        user_id: m.user_id,
        type: 'ANNOUNCEMENT',
        title: announcement.title,
        message: announcement.content,
        data: { org_id: announcement.org_id, announcement_id: data.id },
      }))
    )
  }

  return data
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const { error } = await supabase.from('announcements').delete().eq('id', id)
  if (error) throw error
}
