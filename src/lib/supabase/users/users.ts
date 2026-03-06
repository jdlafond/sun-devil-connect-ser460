import { supabase } from '../supabase'

export interface UserProfile {
  id: string
  email: string
  display_name: string
  role: 'STUDENT' | 'ADMIN' | 'ORGANIZER'
  interests: string[] | null
  major: string | null
  graduation_year: number | null
  department: string | null
  created_at: string
  updated_at: string
}

export async function getUserById(id: string): Promise<UserProfile> {
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function updateUserRole(id: string, role: UserProfile['role']): Promise<void> {
  const { error } = await supabase.from('users').update({ role }).eq('id', id)
  if (error) throw error
}
  const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}
