import { createClient } from '@/lib/supabase/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('eventId')

  const query = supabase.from('registrations').select('*')
  if (eventId) query.eq('event_id', eventId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { eventId } = await request.json()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: event } = await supabase.from('events').select('capacity, registration_cutoff_at, status').eq('id', eventId).single()
  if (!event || event.status !== 'PUBLISHED') return NextResponse.json({ error: 'Registration not available' }, { status: 400 })
  if (new Date(event.registration_cutoff_at) < new Date()) return NextResponse.json({ error: 'Registration closed' }, { status: 400 })

  const { count } = await supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('event_id', eventId)
  if (count !== null && count >= event.capacity) return NextResponse.json({ error: 'Event at capacity' }, { status: 400 })

  const { data, error } = await supabase.from('registrations').insert({ event_id: eventId, user_id: user.id }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { eventId } = await request.json()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase.from('registrations').delete().eq('event_id', eventId).eq('user_id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
