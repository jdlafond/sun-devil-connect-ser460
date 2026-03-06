'use client'

import { useEffect, useState } from 'react'
import { use } from 'react'
import AppShell from '../../../../components/AppShell'
import { theme } from '@/src/styles/theme'
import { useUser } from '@/src/lib/supabase/auth/UserProvider'
import { getOrganizations, Organization } from '@/src/lib/supabase/organizations/organizations'
import { createEvent, updateEvent, deleteEvent, Event } from '@/src/lib/supabase/events/events'
import { getMembershipApplicationsByOrg, updateMembershipApplicationState, MembershipApplication } from '@/src/lib/supabase/applications/applications'
import { getOrgMembers, removeOrgMember } from '@/src/lib/supabase/membership/membership'
import { getAnnouncementsByOrg, createAnnouncement, deleteAnnouncement, Announcement } from '@/src/lib/supabase/announcements/announcements'
import { supabase } from '@/src/lib/supabase/supabase'

const CATEGORIES = ['Academic', 'Social', 'Greek Life', 'Cultural', 'Sports', 'Arts', 'Service', 'Professional']
const BLANK = { title: '', description: '', location: '', start_at: '', end_at: '', category: '', capacity: '', is_free: true }

type Member = { id: string; user_id: string; role: string; joined_at: string; users: { display_name: string; email: string } }

export default function ClubDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useUser()
  const now = new Date().toISOString()

  const [org, setOrg] = useState<Organization | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [applications, setApplications] = useState<MembershipApplication[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  // Events tab
  const [eventTab, setEventTab] = useState<'upcoming' | 'past'>('upcoming')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Event | null>(null)
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)

  // Announcements
  const [annTitle, setAnnTitle] = useState('')
  const [annContent, setAnnContent] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    async function load() {
      const [orgs, { data: evts }] = await Promise.all([
        getOrganizations(),
        supabase.from('events').select('*').eq('org_id', id).order('start_at'),
      ])
      setOrg(orgs.find(o => o.id === id) ?? null)
      setEvents((evts as Event[]) ?? [])

      getMembershipApplicationsByOrg(id).then(async apps => {
        // Resolve display names
        const userIds = [...new Set(apps.map(a => a.user_id))]
        const { data: users } = await supabase.from('users').select('id, display_name').in('id', userIds)
        const nameMap = Object.fromEntries((users ?? []).map(u => [u.id, u.display_name]))
        setApplications(apps.map(a => ({ ...a, _display_name: nameMap[a.user_id] ?? a.user_id } as any)))
      }).catch(() => {})
      getOrgMembers(id).then(m => setMembers(m as Member[])).catch(() => {})
      getAnnouncementsByOrg(id).then(setAnnouncements).catch(() => {})

      setLoading(false)
    }
    load().catch(() => setLoading(false))
  }, [id])

  // --- Events ---
  const upcomingEvents = events.filter(e => e.end_at >= now)
  const pastEvents = events.filter(e => e.end_at < now)
  const displayedEvents = eventTab === 'upcoming' ? upcomingEvents : pastEvents

  function openCreate() { setEditing(null); setForm(BLANK); setShowForm(true) }
  function openEdit(event: Event) {
    setEditing(event)
    setForm({ title: event.title, description: event.description ?? '', location: event.location ?? '', start_at: event.start_at.slice(0, 16), end_at: event.end_at.slice(0, 16), category: event.category ?? '', capacity: event.capacity?.toString() ?? '', is_free: event.is_free ?? true })
    setShowForm(true)
  }

  async function handleEventSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    const payload = { org_id: id, title: form.title, description: form.description || null, location: form.location || null, start_at: new Date(form.start_at).toISOString(), end_at: new Date(form.end_at).toISOString(), category: form.category || null, capacity: form.capacity ? parseInt(form.capacity) : null, is_free: form.is_free, status: 'PUBLISHED' as const, registration_cutoff_at: null, image_url: null }
    if (editing) {
      const updated = await updateEvent(editing.id, payload)
      setEvents(prev => prev.map(e => e.id === editing.id ? updated : e))
      // Notify registered attendees of the change
      const { data: registrations } = await supabase
        .from('event_registrations')
        .select('user_id')
        .eq('event_id', editing.id)
      if (registrations && registrations.length > 0) {
        await supabase.from('notifications').insert(
          registrations.map(r => ({
            user_id: r.user_id,
            type: 'EVENT_UPDATED',
            title: `Event updated: ${form.title}`,
            message: `Details for this event have changed. Check the latest info.`,
            data: { event_id: editing.id, org_id: id },
          }))
        )
      }
    } else {
      const created = await createEvent(payload)
      setEvents(prev => [...prev, created])
    }
    setSaving(false); setShowForm(false)
  }

  async function handleCancelEvent(event: Event) {
    const updated = await updateEvent(event.id, { status: 'CANCELLED' })
    setEvents(prev => prev.map(e => e.id === event.id ? updated : e))
  }

  async function handleDeleteEvent(event: Event) {
    await deleteEvent(event.id)
    setEvents(prev => prev.filter(e => e.id !== event.id))
  }

  // --- Members ---
  const pending = applications.filter(a => a.state === 'PENDING')

  async function reviewApp(app: MembershipApplication, next: 'APPROVED' | 'REJECTED') {
    if (!user) return
    const updated = await updateMembershipApplicationState(app.id, app.state, next, user.id)
    if (next === 'APPROVED') {
      await supabase.from('organization_members').insert({ user_id: app.user_id, org_id: app.org_id, role: 'MEMBER' })
      const { data } = await supabase.from('organization_members').select('*, users(display_name, email)').eq('user_id', app.user_id).eq('org_id', app.org_id).single()
      if (data) setMembers(prev => [...prev, data as Member])
    }
    await supabase.from('notifications').insert({
      user_id: app.user_id,
      type: next === 'APPROVED' ? 'MEMBERSHIP_APPROVED' : 'MEMBERSHIP_REJECTED',
      title: next === 'APPROVED'
        ? `You've been approved to join ${org?.name ?? 'the club'}`
        : `Your application to join ${org?.name ?? 'the club'} was not approved`,
      message: null,
      data: { org_id: app.org_id },
    })
    setApplications(prev => prev.map(a => a.id === app.id ? updated : a))
  }

  async function handleRemoveMember(member: Member) {
    await removeOrgMember(member.user_id, id)
    setMembers(prev => prev.filter(m => m.id !== member.id))
  }

  // --- Announcements ---
  async function handlePost(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !annTitle.trim()) return
    setPosting(true)
    const created = await createAnnouncement({ org_id: id, author_user_id: user.id, title: annTitle.trim(), content: annContent.trim() || null })
    setAnnouncements(prev => [created, ...prev])
    setAnnTitle(''); setAnnContent(''); setPosting(false)
  }

  async function handleDeleteAnn(ann: Announcement) {
    await deleteAnnouncement(ann.id)
    setAnnouncements(prev => prev.filter(a => a.id !== ann.id))
  }

  const set = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }))

  if (loading) return <AppShell><p className="text-zinc-500 text-sm">Loading...</p></AppShell>

  return (
    <AppShell>
      <h1 className={`${theme.heading} mb-1`}>{org?.name ?? 'Club'}</h1>
      <p className={`${theme.subheading} mb-8 text-sm`}>Manage your club's events, members, and announcements</p>

      <div className="flex flex-col gap-8">

        {/* ── Events (tabbed) ── */}
        <div className={theme.card}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1">
              {(['upcoming', 'past'] as const).map(tab => (
                <button key={tab} onClick={() => setEventTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${eventTab === tab ? 'bg-[#8C1D40] text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>
                  {tab} ({tab === 'upcoming' ? upcomingEvents.length : pastEvents.length})
                </button>
              ))}
            </div>
            <button onClick={openCreate} className="px-4 py-1.5 bg-[#8C1D40] text-white text-sm font-semibold rounded-full hover:bg-[#6e1632] transition-colors cursor-pointer">
              + New Event
            </button>
          </div>

          {displayedEvents.length === 0 ? (
            <p className="text-zinc-500 text-sm">No {eventTab} events.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {displayedEvents.map(event => (
                <div key={event.id} className="flex items-start justify-between gap-4 border border-zinc-100 rounded-xl p-4">
                  <div>
                    <p className="font-semibold text-[#8C1D40]">{event.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{event.location} · {new Date(event.start_at).toLocaleString()}</p>
                    {event.description && <p className="text-sm text-zinc-600 mt-1 line-clamp-2">{event.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-1 text-xs rounded-full ${event.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : event.status === 'CANCELLED' ? 'bg-red-100 text-red-600' : 'bg-zinc-100 text-zinc-500'}`}>{event.status}</span>
                    {event.status !== 'CANCELLED' && <button onClick={() => openEdit(event)} className="px-3 py-1.5 text-xs font-medium rounded-full border border-zinc-300 text-zinc-700 hover:bg-zinc-50 cursor-pointer">Edit</button>}
                    {event.status === 'PUBLISHED' && <button onClick={() => handleCancelEvent(event)} className="px-3 py-1.5 text-xs font-medium rounded-full border border-yellow-400 text-yellow-600 hover:bg-yellow-50 cursor-pointer">Cancel</button>}
                    <button onClick={() => handleDeleteEvent(event)} className="px-3 py-1.5 text-xs font-medium rounded-full border border-red-300 text-red-500 hover:bg-red-50 cursor-pointer">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Members ── */}
        <div className={theme.card}>
          <h2 className="text-base font-bold text-[#8C1D40] mb-4">Members</h2>

          {pending.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-zinc-500 uppercase mb-2">Pending Applications ({pending.length})</p>
              <div className="flex flex-col gap-2">
                {pending.map(app => (
                  <div key={app.id} className="flex items-start justify-between gap-4 border border-zinc-100 rounded-xl p-4">
                    <div>
                      <p className="text-sm font-medium text-zinc-700">{(app as any)._display_name ?? app.user_id}</p>
                      <p className="text-xs text-zinc-400">Submitted {new Date(app.submitted_at).toLocaleDateString()}</p>
                      {app.message && <p className="text-sm text-zinc-600 mt-1 italic">"{app.message}"</p>}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => reviewApp(app, 'APPROVED')} className="px-4 py-1.5 text-sm font-medium rounded-full bg-green-600 text-white hover:bg-green-700 cursor-pointer">Approve</button>
                      <button onClick={() => reviewApp(app, 'REJECTED')} className="px-4 py-1.5 text-sm font-medium rounded-full border border-red-400 text-red-500 hover:bg-red-50 cursor-pointer">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs font-semibold text-zinc-500 uppercase mb-2">Current Members ({members.length})</p>
          {members.length === 0 ? (
            <p className="text-zinc-500 text-sm">No members yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {members.map(member => (
                <div key={member.id} className="flex items-center justify-between border border-zinc-100 rounded-xl p-4">
                  <div>
                    <p className="text-sm font-medium text-zinc-700">{member.users?.display_name ?? member.user_id}</p>
                    <p className="text-xs text-zinc-400">{member.users?.email} · {member.role}</p>
                  </div>
                  {member.user_id !== user?.id && (
                    <button onClick={() => handleRemoveMember(member)} className="px-3 py-1.5 text-xs font-medium rounded-full border border-red-300 text-red-500 hover:bg-red-50 cursor-pointer">Remove</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Announcements ── */}
        <div className={theme.card}>
          <h2 className="text-base font-bold text-[#8C1D40] mb-4">Announcements</h2>
          <form onSubmit={handlePost} className="flex flex-col gap-3 mb-5">
            <input required placeholder="Announcement title" value={annTitle} onChange={e => setAnnTitle(e.target.value)} className={theme.input} />
            <textarea placeholder="Content (optional)" value={annContent} onChange={e => setAnnContent(e.target.value)} className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm text-black outline-none focus:border-[#8C1D40] resize-none" rows={2} />
            <button type="submit" disabled={posting} className="self-end px-6 py-2 bg-[#8C1D40] text-white text-sm font-semibold rounded-full hover:bg-[#6e1632] transition-colors cursor-pointer disabled:opacity-50">
              {posting ? 'Posting...' : 'Post'}
            </button>
          </form>

          {announcements.length === 0 ? (
            <p className="text-zinc-500 text-sm">No announcements yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {announcements.map(ann => (
                <div key={ann.id} className="flex items-start justify-between gap-4 border border-zinc-100 rounded-xl p-4">
                  <div>
                    <p className="font-semibold text-zinc-800">{ann.title}</p>
                    <p className="text-xs text-zinc-400 mb-1">{new Date(ann.created_at).toLocaleString()}</p>
                    {ann.content && <p className="text-sm text-zinc-600">{ann.content}</p>}
                  </div>
                  <button onClick={() => handleDeleteAnn(ann)} className="px-3 py-1.5 text-xs font-medium rounded-full border border-red-300 text-red-500 hover:bg-red-50 cursor-pointer shrink-0">Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Event form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleEventSubmit} className="bg-white rounded-2xl p-6 w-full max-w-lg flex flex-col gap-3 shadow-xl">
            <h2 className="text-lg font-bold text-[#8C1D40]">{editing ? 'Edit Event' : 'New Event'}</h2>
            <input required placeholder="Title" value={form.title} onChange={e => set('title', e.target.value)} className={theme.input} />
            <textarea placeholder="Description" value={form.description} onChange={e => set('description', e.target.value)} className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm text-black outline-none focus:border-[#8C1D40] resize-none" rows={3} />
            <input placeholder="Location" value={form.location} onChange={e => set('location', e.target.value)} className={theme.input} />
            <div className="flex gap-2">
              <div className="flex-1">
                <p className="text-xs text-zinc-500 mb-1">Start</p>
                <input required type="datetime-local" value={form.start_at} onChange={e => set('start_at', e.target.value)} className={theme.input} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-zinc-500 mb-1">End</p>
                <input required type="datetime-local" value={form.end_at} onChange={e => set('end_at', e.target.value)} className={theme.input} />
              </div>
            </div>
            <select value={form.category} onChange={e => set('category', e.target.value)} className={theme.input}>
              <option value="">Category (optional)</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="number" placeholder="Capacity (optional)" value={form.capacity} onChange={e => set('capacity', e.target.value)} className={theme.input} min={1} />
            <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
              <input type="checkbox" checked={form.is_free} onChange={e => set('is_free', e.target.checked)} />
              Free event
            </label>
            <div className="flex gap-2 mt-2">
              <button type="submit" disabled={saving} className="flex-1 bg-[#8C1D40] text-white font-semibold py-2.5 rounded-full hover:bg-[#6e1632] transition-colors cursor-pointer disabled:opacity-50">
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Event'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-zinc-300 text-zinc-700 font-semibold py-2.5 rounded-full hover:bg-zinc-50 transition-colors cursor-pointer">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  )
}
