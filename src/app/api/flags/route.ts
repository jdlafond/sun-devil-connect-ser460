import { createClient } from '@/lib/supabase/supabase-server'
import { NextResponse } from 'next/server'
import type { FlagTargetType } from '@/models'

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase.from('content_flags').select('*')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { targetType, targetId, reason, description }: { targetType: FlagTargetType; targetId: string; reason: string; description: string } = await request.json()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('content_flags')
    .insert({ reporter_user_id: user.id, target_type: targetType, target_id: targetId, reason, description, status: 'OPEN' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { id, status, decisionSummary } = await request.json()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('content_flags')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (decisionSummary) {
    await supabase.from('moderation_cases').insert({
      flag_ids: [id],
      admin_user_id: user.id,
      decision_summary: decisionSummary,
      status: 'RESOLVED',
      resolved_at: new Date().toISOString(),
    })
  }

  return NextResponse.json(data)
}
