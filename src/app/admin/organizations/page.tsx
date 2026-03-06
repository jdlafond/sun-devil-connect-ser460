'use client'

import { useEffect, useState } from 'react'
import AdminShell from '../../components/AdminShell'
import { theme } from '@/src/styles/theme'
import { getOrganizations, updateOrganization, Organization } from '@/src/lib/supabase/organizations/organizations'
import { getOrganizationApplications } from '@/src/lib/supabase/applications/applications'
import { updateUserRole } from '@/src/lib/supabase/users/users'

export default function AdminOrganizationsPage() {
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrganizations().then(data => { setOrgs(data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  async function toggleStatus(org: Organization) {
    const next = org.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    const updated = await updateOrganization(org.id, { status: next })
    setOrgs(prev => prev.map(o => o.id === org.id ? updated : o))

    if (next === 'INACTIVE') {
      const apps = await getOrganizationApplications()
      const leaderApp = apps.find(a => {
        const proposed = a.proposed_organization as any
        return a.state === 'APPROVED' && proposed.name === org.name
      })
      if (leaderApp) await updateUserRole(leaderApp.submitted_by, 'STUDENT')
    }
  }

  return (
    <AdminShell>
      <h1 className={`${theme.heading} mb-1`}>Organizations</h1>
      <p className={`${theme.subheading} mb-6 text-sm`}>Manage all active organizations</p>
      {loading ? <p className="text-zinc-500 text-sm">Loading...</p> : (
        <div className="flex flex-col gap-3">
          {orgs.map(org => (
            <div key={org.id} className={`${theme.card} flex items-center justify-between`}>
              <div>
                <p className="font-semibold text-[#8C1D40]">{org.name}</p>
                <p className="text-xs text-zinc-500">{org.categories?.join(', ')}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 text-xs rounded-full ${org.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>
                  {org.status}
                </span>
                <button onClick={() => toggleStatus(org)}
                  className="px-4 py-1.5 text-sm font-medium rounded-full border border-[#8C1D40] text-[#8C1D40] hover:bg-[#8C1D40] hover:text-white transition-colors cursor-pointer">
                  {org.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  )
}
