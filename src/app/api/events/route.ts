import { createClient } from '@/lib/supabase/supabase-server'
import { NextResponse } from 'next/server'
import type { Event } from '@/models'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const orgId = searchParams.get('orgId')

  const query = supabase.from('events').select('*')
  if (orgId) query.eq('org_id', orgId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body: Partial<Event> = await request.json()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'ORGANIZER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase.from('events').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}
