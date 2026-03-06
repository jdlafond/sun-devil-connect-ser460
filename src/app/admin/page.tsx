'use client'

import { useEffect, useState } from 'react'
import AdminShell from '../components/AdminShell'
import { theme } from '@/src/styles/theme'
import { getFlags } from '@/src/lib/supabase/flags/flags'
import { getOrganizationApplications } from '@/src/lib/supabase/applications/applications'
import { getOrganizations } from '@/src/lib/supabase/organizations/organizations'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ orgs: 0, pendingApps: 0, openFlags: 0 })

  useEffect(() => {
    Promise.all([
      getOrganizations(),
      getOrganizationApplications(),
      getFlags('OPEN'),
    ]).then(([orgs, apps, flags]) => {
      setStats({
        orgs: orgs.length,
        pendingApps: apps.filter(a => a.state === 'PENDING').length,
        openFlags: flags.length,
      })
    }).catch(() => {})
  }, [])

  const cards = [
    { label: 'Active Organizations', value: stats.orgs, href: '/admin/organizations' },
    { label: 'Pending Org Applications', value: stats.pendingApps, href: '/admin/applications' },
    { label: 'Open Flags', value: stats.openFlags, href: '/admin/flags' },
  ]

  return (
    <AdminShell>
      <h1 className={`${theme.heading} mb-1`}>Admin Dashboard</h1>
      <p className={`${theme.subheading} mb-8 text-sm`}>Oversee organizations, applications, and flagged content.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map(({ label, value, href }) => (
          <a key={href} href={href} className={`${theme.card} hover:border-[#8C1D40] transition-colors`}>
            <p className="text-3xl font-bold text-[#8C1D40]">{value}</p>
            <p className="text-sm text-zinc-600 mt-1">{label}</p>
          </a>
        ))}
      </div>
    </AdminShell>
  )
}
