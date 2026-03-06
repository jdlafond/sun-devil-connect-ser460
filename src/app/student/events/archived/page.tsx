'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AppShell from '../../../components/AppShell'
import { theme } from '@/src/styles/theme'
import { getPastEvents, Event } from '@/src/lib/supabase/events/events'

export default function ArchivedEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPastEvents().then(data => { setEvents(data); setLoading(false) })
  }, [])

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-1">
        <h1 className={theme.heading}>Past Events</h1>
        <Link href="/student/events" className={theme.link}>← Back to Events</Link>
      </div>
      <p className={`${theme.subheading} mb-6 text-sm`}>Events that have already taken place</p>

      {loading ? (
        <p className="text-zinc-500 text-sm">Loading...</p>
      ) : events.length === 0 ? (
        <p className="text-zinc-500 text-sm">No past events found.</p>
      ) : (
        <>
          <p className="text-sm text-zinc-600 mb-4">{events.length} past event{events.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <div key={event.id} className={`${theme.card} opacity-75`}>
                <h3 className="text-lg font-semibold text-zinc-500 mb-1">{event.title}</h3>
                <p className="text-xs text-zinc-400 mb-2">
                  {event.location} · {new Date(event.start_at).toLocaleDateString()}
                  {event.org_name && <> · {event.org_name}</>}
                </p>
                <p className="text-sm text-zinc-500 line-clamp-3 mb-3">{event.description}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {event.category && (
                    <span className="px-2 py-1 bg-zinc-100 text-zinc-500 text-xs rounded-full">{event.category}</span>
                  )}
                  {event.registration_count != null && (
                    <span className="px-2 py-1 bg-zinc-100 text-zinc-400 text-xs rounded-full">
                      {event.registration_count} attended
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </AppShell>
  )
}
