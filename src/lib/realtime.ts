import { supabase } from './supabase/supabase'

export function subscribeToEvent(eventId: string, onUpdate: (payload: any) => void) {
  return supabase
    .channel(`event:${eventId}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'events', filter: `id=eq.${eventId}` }, onUpdate)
    .subscribe()
}

export function subscribeToNotifications(userId: string, onInsert: (payload: any) => void) {
  return supabase
    .channel(`notifications:${userId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, onInsert)
    .subscribe()
}
