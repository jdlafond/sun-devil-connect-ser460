'use client'

import { useEffect, useState } from 'react'
import type { OrganizationApplication, ContentFlag } from '@/models'

export default function AdminDashboard() {
  const [applications, setApplications] = useState<OrganizationApplication[]>([])
  const [flags, setFlags] = useState<ContentFlag[]>([])

  useEffect(() => {
    fetch('/api/applications').then(r => r.json()).then(setApplications)
    fetch('/api/flags').then(r => r.json()).then(setFlags)
  }, [])

  async function reviewApplication(id: string, state: 'APPROVED' | 'REJECTED') {
    await fetch('/api/applications', {
      method: 'PATCH',
      body: JSON.stringify({ id, state }),
      headers: { 'Content-Type': 'application/json' },
    })
    setApplications(prev => prev.map(a => a.id === id ? { ...a, state } : a))
  }

  async function resolveFlag(id: string, decisionSummary: string) {
    await fetch('/api/flags', {
      method: 'PATCH',
      body: JSON.stringify({ id, status: 'CLOSED', decisionSummary }),
      headers: { 'Content-Type': 'application/json' },
    })
    setFlags(prev => prev.filter(f => f.id !== id))
  }

  return (
    <main>
      <h1>Admin Dashboard</h1>

      <section>
        <h2>Organization Applications</h2>
        <ul>
          {applications.map(app => (
            <li key={app.id}>
              {app.state}
              <button onClick={() => reviewApplication(app.id, 'APPROVED')}>Approve</button>
              <button onClick={() => reviewApplication(app.id, 'REJECTED')}>Reject</button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Flagged Content</h2>
        <ul>
          {flags.map(flag => (
            <li key={flag.id}>
              {flag.reason} — {flag.status}
              <button onClick={() => resolveFlag(flag.id, 'Reviewed and resolved')}>Resolve</button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
