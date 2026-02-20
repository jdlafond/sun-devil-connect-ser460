'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AppShell from '../../components/AppShell'
import { useUser } from '@/src/lib/supabase/auth/UserProvider'
import { getMyOrganizations } from '@/src/lib/supabase/membership/membership'
import { Organization } from '@/src/lib/supabase/organizations/organizations'
import { theme } from '@/src/styles/theme'
import OrgLink from '../../components/OrgLink'

export default function MyOrganizationsPage() {
  const { user } = useUser()
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    getMyOrganizations(user.id)
      .then(data => { setOrgs(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user])

  return (
    <AppShell>
      <h1 className={`${theme.heading} mb-1`}>My Organizations</h1>
      <p className={`${theme.subheading} mb-6 text-sm`}>Organizations you're an active member of</p>

      {loading ? (
        <p className="text-zinc-500 text-sm">Loading...</p>
      ) : orgs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-zinc-500 mb-4">You haven't joined any organizations yet.</p>
          <Link href="/student/organizations" className={theme.link}>Browse Organizations →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orgs.map(org => (
            <div key={org.id} className={theme.card}>
            <OrgLink id={org.id}>
                <h3 className="text-lg font-semibold text-[#8C1D40] mb-2 hover:underline">{org.name}</h3>
              </OrgLink>
              <p className="text-sm text-zinc-600 mb-4 line-clamp-3">{org.description}</p>
              <div className="flex flex-wrap gap-2">
                {org.categories?.map(cat => (
                  <span key={cat} className="px-2 py-1 bg-zinc-100 text-zinc-700 text-xs rounded-full">{cat}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  )
}
