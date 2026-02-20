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

export async function updateUser(id: string, updates: Partial<Omit<UserProfile, 'id' | 'email' | 'created_at' | 'updated_at'>>): Promise<UserProfile> {
  const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}
