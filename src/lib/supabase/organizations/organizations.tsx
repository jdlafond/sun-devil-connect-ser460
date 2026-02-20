import { supabase } from "../supabase";

export interface Organization {
  id: string
  name: string
  description: string | null
  categories: string[] | null
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE'
  logo_url: string | null
  contact_email: string | null
  created_at: string
  updated_at: string
}

export async function getOrganizations(): Promise<Organization[]> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('status', 'ACTIVE')
    .order('name')
  
  if (error) throw error
  return data
}

export async function createOrganization(org: Omit<Organization, 'id' | 'created_at' | 'updated_at'>): Promise<Organization> {
  const { data, error } = await supabase
    .from('organizations')
    .insert(org)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteOrganization(id: string): Promise<void> {
  const { error } = await supabase
    .from('organizations')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function updateOrganization(id: string, updates: Partial<Omit<Organization, 'id' | 'created_at' | 'updated_at'>>): Promise<Organization> {
  const { data, error } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}


export async function getOrganizationById(id: string): Promise<Organization> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}
