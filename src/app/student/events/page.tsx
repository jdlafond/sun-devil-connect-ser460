'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AppShell from '../../components/AppShell'
import { theme } from '@/src/styles/theme'
import { getEvents, Event } from '@/src/lib/supabase/events/events'

const CATEGORIES = ['Academic', 'Social', 'Greek Life', 'Cultural', 'Sports', 'Arts', 'Service', 'Professional']

export default function StudentEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getEvents().then(data => { setEvents(data); setFilteredEvents(data); setLoading(false) })
  }, [])

  useEffect(() => {
    let filtered = events
    if (searchQuery)
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    if (selectedCategories.length > 0)
      filtered = filtered.filter(e => e.category && selectedCategories.includes(e.category))
    setFilteredEvents(filtered)
  }, [searchQuery, selectedCategories, events])

  const toggleCategory = (cat: string) =>
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])

  return (
    <AppShell>
      <h1 className={`${theme.heading} mb-1`}>Events</h1>
      <p className={`${theme.subheading} mb-6 text-sm`}>Discover upcoming events across campus</p>

      <input
        type="text"
        placeholder="Search events..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        className={`${theme.input} max-w-xl mb-6`}
      />

      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategories.includes(cat)
                  ? 'bg-[#8C1D40] text-white'
                  : 'bg-white border border-zinc-300 text-zinc-700 hover:border-[#8C1D40]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        {selectedCategories.length > 0 && (
          <button onClick={() => setSelectedCategories([])} className="mt-3 text-sm text-[#8C1D40] hover:underline">
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-zinc-500 text-sm">Loading events...</p>
      ) : filteredEvents.length === 0 ? (
        <p className="text-zinc-500 text-sm">No events found.</p>
      ) : (
        <>
          <p className="text-sm text-zinc-600 mb-4">{filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <div key={event.id} className={theme.card}>
                <h3 className="text-lg font-semibold text-[#8C1D40] mb-1">{event.title}</h3>
                  <p className="text-xs text-zinc-500 mb-2">
                    {event.location} · {new Date(event.start_at).toLocaleDateString()}
                    {event.org_name && (
                      <> · <Link href={`/student/organizations`} className="hover:underline text-[#8C1D40]">{event.org_name}</Link></>
                    )}
                  </p>
                <p className="text-sm text-zinc-600 line-clamp-3 mb-4">{event.description}</p>
                {event.category && (
                  <span className="px-2 py-1 bg-zinc-100 text-zinc-700 text-xs rounded-full mb-4 inline-block">{event.category}</span>
                )}
                <div className="mt-2">
                  <button onClick={() => console.log('register', event.id)} className={theme.btnPrimary}>
                    Register
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </AppShell>
  )
}
