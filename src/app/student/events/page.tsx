'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import AppShell from '../../components/AppShell'
import { theme } from '@/src/styles/theme'
import { getEvents, Event } from '@/src/lib/supabase/events/events'
import EventRegisterSheet from '../../components/EventRegisterSheet'
import FlagButton from '../../components/FlagButton'

const CATEGORIES = ['Academic', 'Social', 'Greek Life', 'Cultural', 'Sports', 'Arts', 'Service', 'Professional']
const POPULARITY_OPTIONS = ['Most Registered', 'Most Available']

export default function StudentEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [locationQuery, setLocationQuery] = useState('')
  const [pricingFilter, setPricingFilter] = useState<'all' | 'free' | 'paid'>('all')
  const [popularitySort, setPopularitySort] = useState<string>('')

  useEffect(() => {
    getEvents().then(data => { setEvents(data); setLoading(false) })
  }, [])

  const filteredEvents = useMemo(() => {
    let result = [...events]

    if (searchQuery)
      result = result.filter(e =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )

    if (selectedCategories.length > 0)
      result = result.filter(e => e.category && selectedCategories.includes(e.category))

    if (dateFrom)
      result = result.filter(e => new Date(e.start_at) >= new Date(dateFrom))

    if (dateTo)
      result = result.filter(e => new Date(e.start_at) <= new Date(dateTo))

    if (locationQuery)
      result = result.filter(e => e.location?.toLowerCase().includes(locationQuery.toLowerCase()))

    if (pricingFilter === 'free')
      result = result.filter(e => e.is_free === true || e.price === 0 || e.price === null)
    else if (pricingFilter === 'paid')
      result = result.filter(e => e.is_free === false && e.price !== null && e.price > 0)

    if (popularitySort === 'Most Registered')
      result.sort((a, b) => (b.registration_count ?? 0) - (a.registration_count ?? 0))
    else if (popularitySort === 'Most Available')
      result.sort((a, b) => {
        const aAvail = a.capacity != null ? a.capacity - (a.registration_count ?? 0) : Infinity
        const bAvail = b.capacity != null ? b.capacity - (b.registration_count ?? 0) : Infinity
        return bAvail - aAvail
      })

    return result
  }, [events, searchQuery, selectedCategories, dateFrom, dateTo, locationQuery, pricingFilter, popularitySort])

  const toggleCategory = (cat: string) =>
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])

  const clearFilters = () => {
    setSelectedCategories([])
    setDateFrom('')
    setDateTo('')
    setLocationQuery('')
    setPricingFilter('all')
    setPopularitySort('')
  }

  const hasFilters = selectedCategories.length > 0 || dateFrom || dateTo || locationQuery || pricingFilter !== 'all' || popularitySort

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-1">
        <h1 className={theme.heading}>Events</h1>
        <Link href="/student/events/archived" className={theme.link}>View Past Events →</Link>
      </div>
      <p className={`${theme.subheading} mb-6 text-sm`}>Discover upcoming events across campus</p>

      {/* Search */}
      <input
        type="text"
        placeholder="Search events..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        className={`${theme.input} max-w-xl mb-6`}
      />

      <div className="mb-6 bg-white border border-zinc-200 rounded-xl p-4 flex flex-wrap gap-x-6 gap-y-3 items-end">

        {/* Categories */}
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase mb-1">Category</p>
          <div className="flex flex-wrap gap-1">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => toggleCategory(cat)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategories.includes(cat) ? 'bg-[#8C1D40] text-white' : 'bg-zinc-100 text-zinc-700'
                }`}>{cat}</button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase mb-1">Date Range</p>
          <div className="flex gap-2 items-center">
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={theme.input} />
            <span className="text-zinc-400 text-sm">to</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className={theme.input} />
          </div>
        </div>

        {/* Location */}
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase mb-1">Location</p>
          <input type="text" placeholder="Filter by location..." value={locationQuery}
            onChange={e => setLocationQuery(e.target.value)} className={`${theme.input} w-44`} />
        </div>

        {/* Pricing */}
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase mb-1">Pricing</p>
          <div className="flex gap-1">
            {(['all', 'free', 'paid'] as const).map(opt => (
              <button key={opt} onClick={() => setPricingFilter(opt)}
                className={`px-3 py-1 rounded-full text-sm font-medium capitalize transition-colors ${
                  pricingFilter === opt ? 'bg-[#8C1D40] text-white' : 'bg-zinc-100 text-zinc-700'
                }`}>{opt}</button>
            ))}
          </div>
        </div>

        {/* Popularity */}
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase mb-1">Popularity</p>
          <div className="flex gap-1">
            {POPULARITY_OPTIONS.map(opt => (
              <button key={opt} onClick={() => setPopularitySort(prev => prev === opt ? '' : opt)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  popularitySort === opt ? 'bg-[#8C1D40] text-white' : 'bg-zinc-100 text-zinc-700'
                }`}>{opt}</button>
            ))}
          </div>
        </div>

        {hasFilters && (
          <button onClick={clearFilters} className="text-sm text-[#8C1D40] hover:underline self-end pb-1">Clear all</button>
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
                <p className="text-sm text-zinc-600 line-clamp-3 mb-3">{event.description}</p>
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  {event.category && (
                    <span className="px-2 py-1 bg-zinc-100 text-zinc-700 text-xs rounded-full">{event.category}</span>
                  )}
                  <span className={`px-2 py-1 text-xs rounded-full ${event.is_free || !event.price ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {event.is_free || !event.price ? 'Free' : `$${event.price}`}
                  </span>
                  {event.registration_count != null && (
                    <span className="px-2 py-1 bg-zinc-100 text-zinc-500 text-xs rounded-full">
                      {event.registration_count} registered
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-400">{new Date(event.start_at).toLocaleDateString()}</span>
                    <FlagButton targetType="EVENT" targetId={event.id} />
                  </div>
                  <button onClick={() => setSelectedEvent(event)} className="px-5 py-2 bg-[#8C1D40] text-white text-sm font-semibold rounded-full hover:bg-[#6e1632] transition-colors cursor-pointer">Register</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <EventRegisterSheet event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </AppShell>
  )
}
