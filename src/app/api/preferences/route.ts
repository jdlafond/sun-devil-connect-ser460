import { createClient } from '@/lib/supabase/supabase-server'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { interests, notificationSettings } = await request.json()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const updates: Record<string, unknown> = {}
  if (interests !== undefined) updates.interests = interests
  if (notificationSettings !== undefined) updates.notification_settings = notificationSettings

  const { data, error } = await supabase.from('users').update(updates).eq('id', user.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
