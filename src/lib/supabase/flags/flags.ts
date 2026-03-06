import { supabase } from '../supabase'

export interface ContentFlag {
  id: string
  reporter_user_id: string
  target_type: 'EVENT' | 'ANNOUNCEMENT' | 'ORGANIZATION' | 'USER'
  target_id: string
  reason: string
  description: string | null
  created_at: string
  status: 'OPEN' | 'CLOSED' | 'UNDER_REVIEW'
}

export async function createFlag(flag: Omit<ContentFlag, 'id' | 'created_at' | 'status'>): Promise<ContentFlag> {
  const { data, error } = await supabase.from('content_flags').insert(flag).select().single()
  if (error) throw error

  // Notify all admins
  const { data: admins } = await supabase.from('users').select('id').eq('role', 'ADMIN')
  if (admins && admins.length > 0) {
    await supabase.from('notifications').insert(
      admins.map(a => ({
        user_id: a.id,
        type: 'CONTENT_FLAGGED',
        title: `New ${flag.target_type.toLowerCase()} report`,
        message: flag.reason,
        data: { target_type: flag.target_type, target_id: flag.target_id, flag_id: data.id },
      }))
    )
  }

  return data
}

export async function getFlags(status?: ContentFlag['status']): Promise<ContentFlag[]> {
  let query = supabase.from('content_flags').select('*').order('created_at', { ascending: false })
  if (status) query = query.eq('status', status)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function updateFlagStatus(id: string, status: ContentFlag['status']): Promise<ContentFlag> {
  const { data, error } = await supabase.from('content_flags').update({ status }).eq('id', id).select().single()
  if (error) throw error
  return data
}
