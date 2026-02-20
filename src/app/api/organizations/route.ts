import { createClient } from '@/lib/supabase/supabase-server'
import { NextResponse } from 'next/server'
import type { Organization } from '@/models'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('organizations').select('*')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body: Partial<Organization> = await request.json()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase.from('organizations').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { id, ...updates }: Partial<Organization> & { id: string } = await request.json()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || (user.user_metadata?.role !== 'ORGANIZER' && user.user_metadata?.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase.from('organizations').update(updates).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
