'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AppShell from '../../components/AppShell'
import { useUser } from '@/src/lib/supabase/auth/UserProvider'
import { getMyEvents } from '@/src/lib/supabase/membership/membership'
import { Event } from '@/src/lib/supabase/events/events'
import { theme } from '@/src/styles/theme'

export default function MyEventsPage() {
  const { user } = useUser()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    getMyEvents(user.id)
      .then(data => { setEvents(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user])

  return (
    <AppShell>
      <h1 className={`${theme.heading} mb-1`}>My Events</h1>
      <p className={`${theme.subheading} mb-6 text-sm`}>Upcoming events you're registered for</p>

      {loading ? (
        <p className="text-zinc-500 text-sm">Loading...</p>
      ) : events.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-zinc-500 mb-4">You haven't registered for any upcoming events.</p>
          <Link href="/student/events" className={theme.link}>Browse Events →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <div key={event.id} className={theme.card}>
              <h3 className="text-lg font-semibold text-[#8C1D40] mb-1">{event.title}</h3>
              <p className="text-xs text-zinc-500 mb-2">
                {event.location} · {new Date(event.start_at).toLocaleDateString()}
                {event.org_name && (
                  <> · <span className="text-[#8C1D40]">{event.org_name}</span></>
                )}
              </p>
              <p className="text-sm text-zinc-600 line-clamp-3">{event.description}</p>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  )
}
