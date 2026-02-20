'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/src/lib/supabase/supabase'
import { getOrganizationById, Organization } from '@/src/lib/supabase/organizations/organizations'

interface Announcement {
  id: string
  title: string
  content: string | null
  created_at: string
}

interface Event {
  id: string
  title: string
  description: string | null
  start_at: string
  end_at: string
  location: string | null
  category: string | null
}

interface Leader {
  role: string
  users: { id: string; full_name: string; avatar_url: string | null }
}

export default function OrganizationPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [org, setOrg] = useState<Organization | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [leaders, setLeaders] = useState<Leader[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [orgData, { data: ann }, { data: evts }, { data: ldrs }] = await Promise.all([
        getOrganizationById(id),
        supabase
          .from('announcements')
          .select('id, title, content, created_at')
          .eq('org_id', id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('events')
          .select('id, title, description, start_at, end_at, location, category')
          .eq('org_id', id)
          .eq('status', 'PUBLISHED')
          .gte('start_at', new Date().toISOString())
          .order('start_at'),
        supabase
          .from('organization_members')
          .select('role, users(id, full_name, avatar_url)')
          .eq('org_id', id)
          .neq('role', 'MEMBER'),
      ])
      setOrg(orgData)
      setAnnouncements(ann ?? [])
      setEvents(evts ?? [])
      setLeaders((ldrs as unknown as Leader[]) ?? [])
      setLoading(false)
    }
    load().catch(() => setLoading(false))
  }, [id])

  if (loading) return <p className="p-8 text-zinc-500">Loading...</p>
  if (!org) return <p className="p-8 text-zinc-500">Organization not found.</p>

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 shadow-md" style={{ background: 'linear-gradient(to right, #380111, #8C1D40)' }}>
        <Link href="/" className="flex items-center gap-3">
          <Image src="/arizona-state-university-logo.png" alt="ASU Logo" width={100} height={33} />
          <span className="text-white font-bold text-xl">Sun Devil Connect</span>
        </Link>
        <div className="flex gap-4">
          <Link href="/organizations" className="text-white/70 hover:text-white">Organizations</Link>
          <Link href="/events" className="text-white/70 hover:text-white">Events</Link>
        </div>
      </nav>

      {/* Hero / Info */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-8 py-10 flex items-start gap-6">
          {org.logo_url && (
            <Image src={org.logo_url} alt={org.name} width={80} height={80} className="rounded-xl object-cover" />
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[#8C1D40]">{org.name}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              {org.categories?.map((cat: string) => (
                <span key={cat} className="px-2 py-1 bg-zinc-100 text-zinc-600 text-xs rounded-full">{cat}</span>
              ))}
            </div>
            {org.contact_email && (
              <p className="text-sm text-zinc-500 mt-2">{org.contact_email}</p>
            )}
          </div>
          <a
            href={`mailto:${org.contact_email}`}
            className="shrink-0 px-5 py-2 bg-[#8C1D40] text-white text-sm font-semibold rounded-full hover:bg-[#380111] transition-colors"
          >
            Sign Up / Contact
          </a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-10">

          {/* About */}
          <section>
            <h2 className="text-xl font-bold text-[#8C1D40] mb-3">About</h2>
            <p className="text-zinc-700 leading-relaxed">{org.description ?? 'No description provided.'}</p>
          </section>

          {/* Announcements */}
          <section>
            <h2 className="text-xl font-bold text-[#8C1D40] mb-3">Announcements</h2>
            {announcements.length === 0 ? (
              <p className="text-zinc-500 text-sm">No announcements yet.</p>
            ) : (
              <ul className="space-y-4">
                {announcements.map(a => (
                  <li key={a.id} className="bg-white rounded-xl border border-zinc-200 p-4">
                    <p className="font-semibold text-zinc-800">{a.title}</p>
                    {a.content && <p className="text-sm text-zinc-600 mt-1">{a.content}</p>}
                    <p className="text-xs text-zinc-400 mt-2">{new Date(a.created_at).toLocaleDateString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Events */}
          <section>
            <h2 className="text-xl font-bold text-[#8C1D40] mb-3">Upcoming Events</h2>
            {events.length === 0 ? (
              <p className="text-zinc-500 text-sm">No upcoming events.</p>
            ) : (
              <ul className="space-y-4">
                {events.map(e => (
                  <li key={e.id} className="bg-white rounded-xl border border-zinc-200 p-4">
                    <p className="font-semibold text-zinc-800">{e.title}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {new Date(e.start_at).toLocaleString()} — {new Date(e.end_at).toLocaleString()}
                    </p>
                    {e.location && <p className="text-xs text-zinc-500">{e.location}</p>}
                    {e.description && <p className="text-sm text-zinc-600 mt-2 line-clamp-2">{e.description}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Right column — Leadership */}
        <aside>
          <h2 className="text-xl font-bold text-[#8C1D40] mb-3">Leadership</h2>
          {leaders.length === 0 ? (
            <p className="text-zinc-500 text-sm">No leadership listed.</p>
          ) : (
            <ul className="space-y-3">
              {leaders.map((l, i) => (
                <li key={i} className="flex items-center gap-3 bg-white rounded-xl border border-zinc-200 p-3">
                  {l.users.avatar_url ? (
                    <Image src={l.users.avatar_url} alt={l.users.full_name} width={36} height={36} className="rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 text-sm font-bold">
                      {l.users.full_name?.[0]}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-zinc-800">{l.users.full_name}</p>
                    <p className="text-xs text-zinc-500">{l.role}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  )
}
