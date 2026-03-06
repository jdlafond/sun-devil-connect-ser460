'use client'

import { useEffect, useState } from 'react'
import AdminShell from '../../components/AdminShell'
import { theme } from '@/src/styles/theme'
import { getOrganizationApplications, updateOrganizationApplicationState, OrganizationApplication } from '@/src/lib/supabase/applications/applications'
import { createOrganization } from '@/src/lib/supabase/organizations/organizations'
import { updateUserRole } from '@/src/lib/supabase/users/users'
import { useUser } from '@/src/lib/supabase/auth/UserProvider'
import { supabase } from '@/src/lib/supabase/supabase'

export default function AdminApplicationsPage() {
  const { user } = useUser()
  const [apps, setApps] = useState<OrganizationApplication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrganizationApplications().then(data => { setApps(data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  async function review(app: OrganizationApplication, next: 'APPROVED' | 'REJECTED') {
    if (!user) return
    if (next === 'APPROVED') {
      const org = app.proposed_organization as any
      const created = await createOrganization({
        name: org.name,
        description: org.description ?? null,
        categories: org.category ? [org.category] : null,
        status: 'ACTIVE',
        logo_url: null,
        contact_email: null,
      })
      await supabase.from('organization_members').insert({ user_id: app.submitted_by, org_id: created.id, role: 'ORGANIZER' })
      await updateUserRole(app.submitted_by, 'ORGANIZER')
    }
    const updated = await updateOrganizationApplicationState(app.id, app.state, next, user.id)
    setApps(prev => prev.map(a => a.id === app.id ? updated : a))
  }

  const pending = apps.filter(a => a.state === 'PENDING')
  const reviewed = apps.filter(a => a.state !== 'PENDING')

  return (
    <AdminShell>
      <h1 className={`${theme.heading} mb-1`}>Org Applications</h1>
      <p className={`${theme.subheading} mb-6 text-sm`}>Review applications to create new organizations</p>

      {loading ? <p className="text-zinc-500 text-sm">Loading...</p> : (
        <>
          <h2 className="text-sm font-semibold text-zinc-500 uppercase mb-3">Pending ({pending.length})</h2>
          <div className="flex flex-col gap-3 mb-8">
            {pending.length === 0 && <p className="text-zinc-500 text-sm">No pending applications.</p>}
            {pending.map(app => {
              const org = app.proposed_organization as any
              return (
                <div key={app.id} className={`${theme.card}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[#8C1D40]">{org.name}</p>
                      <p className="text-xs text-zinc-500 mb-1">{org.category} · Submitted {new Date(app.submitted_at).toLocaleDateString()}</p>
                      <p className="text-sm text-zinc-600">{org.description}</p>
                      {app.justification && <p className="text-xs text-zinc-400 mt-2 italic">"{app.justification}"</p>}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => review(app, 'APPROVED')}
                        className="px-4 py-1.5 text-sm font-medium rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors cursor-pointer">
                        Approve
                      </button>
                      <button onClick={() => review(app, 'REJECTED')}
                        className="px-4 py-1.5 text-sm font-medium rounded-full border border-red-400 text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <h2 className="text-sm font-semibold text-zinc-500 uppercase mb-3">Reviewed ({reviewed.length})</h2>
          <div className="flex flex-col gap-3">
            {reviewed.map(app => {
              const org = app.proposed_organization as any
              return (
                <div key={app.id} className={`${theme.card} opacity-60`}>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-zinc-600">{org.name}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${app.state === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {app.state}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </AdminShell>
  )
}
