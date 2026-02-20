'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AppShell from '../components/AppShell'
import { useUser } from '@/src/lib/supabase/auth/UserProvider'
import { theme } from '@/src/styles/theme'
import { getMyOrganizations, getMyEvents } from '@/src/lib/supabase/membership/membership'
import { Organization } from '@/src/lib/supabase/organizations/organizations'
import { Event } from '@/src/lib/supabase/events/events'

export default function StudentDashboard() {
  const { user } = useUser()
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    if (!user?.id) return
    getMyOrganizations(user.id).then(setOrgs).catch(() => {})
    getMyEvents(user.id).then(setEvents).catch(() => {})
  }, [user])

  const displayName = (user as any)?.display_name

  return (
    <AppShell>
      <h1 className={`${theme.heading} mb-1`}>Welcome back{displayName ? `, ${displayName}` : ''}!</h1>
      <p className={`${theme.subheading} mb-8 text-sm`}>Here's what's happening on campus.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={theme.card}>
          <h2 className="text-lg font-semibold text-[#8C1D40] mb-4">Your Organizations</h2>
          {orgs.length === 0 ? (
            <div>
              <p className="text-sm text-zinc-500 mb-2">You haven't joined any organizations yet.</p>
              <Link href="/student/organizations" className={theme.link}>Browse Organizations →</Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {orgs.slice(0, 5).map(org => (
                <li key={org.id} className="text-sm text-zinc-700">{org.name}</li>
              ))}
            </ul>
          )}
        </div>

        <div className={theme.card}>
          <h2 className="text-lg font-semibold text-[#8C1D40] mb-4">Upcoming Events</h2>
          {events.length === 0 ? (
            <div>
              <p className="text-sm text-zinc-500 mb-2">No upcoming registered events.</p>
              <Link href="/student/events" className={theme.link}>Browse Events →</Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {events.slice(0, 5).map(event => (
                <li key={event.id} className="text-sm text-zinc-700">{event.title}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  )
}
