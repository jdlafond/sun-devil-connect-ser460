'use client'

import { useEffect, useState } from 'react'
import type { Event, Organization } from '@/models'

export default function OrganizerDashboard() {
  const [events, setEvents] = useState<Event[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])

  useEffect(() => {
    fetch('/api/events').then(r => r.json()).then(setEvents)
    fetch('/api/organizations').then(r => r.json()).then(setOrganizations)
  }, [])

  async function cancelEvent(eventId: string) {
    await fetch('/api/events', {
      method: 'PATCH',
      body: JSON.stringify({ id: eventId, status: 'CANCELLED' }),
      headers: { 'Content-Type': 'application/json' },
    })
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: 'CANCELLED' } : e))
  }

  return (
    <main>
      <h1>Organizer Dashboard</h1>

      <section>
        <h2>My Organizations</h2>
        <ul>
          {organizations.map(org => (
            <li key={org.id}>{org.name} — {org.status}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Events</h2>
        <ul>
          {events.map(event => (
            <li key={event.id}>
              {event.title} — {event.status}
              <button onClick={() => cancelEvent(event.id)}>Cancel</button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
