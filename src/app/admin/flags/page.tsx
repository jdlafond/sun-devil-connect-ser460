'use client'

import { useEffect, useState } from 'react'
import AdminShell from '../../components/AdminShell'
import { theme } from '@/src/styles/theme'
import { getFlags, updateFlagStatus, ContentFlag } from '@/src/lib/supabase/flags/flags'

export default function AdminFlagsPage() {
  const [flags, setFlags] = useState<ContentFlag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFlags().then(data => { setFlags(data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  async function updateStatus(id: string, status: ContentFlag['status']) {
    const updated = await updateFlagStatus(id, status)
    setFlags(prev => prev.map(f => f.id === id ? updated : f))
  }

  const open = flags.filter(f => f.status === 'OPEN')
  const inReview = flags.filter(f => f.status === 'UNDER_REVIEW')
  const closed = flags.filter(f => f.status === 'CLOSED')

  const FlagCard = ({ flag }: { flag: ContentFlag }) => (
    <div className={`${theme.card} ${flag.status === 'CLOSED' ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-zinc-500 uppercase">{flag.target_type}</span>
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              flag.status === 'OPEN' ? 'bg-red-100 text-red-600' :
              flag.status === 'UNDER_REVIEW' ? 'bg-yellow-100 text-yellow-700' :
              'bg-zinc-100 text-zinc-500'
            }`}>{flag.status}</span>
          </div>
          <p className="text-sm font-medium text-zinc-700">{flag.reason}</p>
          {flag.description && <p className="text-xs text-zinc-500 mt-1">{flag.description}</p>}
          <p className="text-xs text-zinc-400 mt-1">{new Date(flag.created_at).toLocaleDateString()}</p>
        </div>
        {flag.status !== 'CLOSED' && (
          <div className="flex gap-2 shrink-0">
            {flag.status === 'OPEN' && (
              <button onClick={() => updateStatus(flag.id, 'UNDER_REVIEW')}
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-yellow-400 text-yellow-600 hover:bg-yellow-50 transition-colors cursor-pointer">
                Review
              </button>
            )}
            <button onClick={() => updateStatus(flag.id, 'CLOSED')}
              className="px-3 py-1.5 text-xs font-medium rounded-full bg-[#8C1D40] text-white hover:bg-[#6e1632] transition-colors cursor-pointer">
              Resolve
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <AdminShell>
      <h1 className={`${theme.heading} mb-1`}>Flagged Content</h1>
      <p className={`${theme.subheading} mb-6 text-sm`}>Review and resolve reported content</p>

      {loading ? <p className="text-zinc-500 text-sm">Loading...</p> : (
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="text-sm font-semibold text-zinc-500 uppercase mb-3">Open ({open.length})</h2>
            <div className="flex flex-col gap-3">
              {open.length === 0 ? <p className="text-zinc-500 text-sm">No open flags.</p> : open.map(f => <FlagCard key={f.id} flag={f} />)}
            </div>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-zinc-500 uppercase mb-3">Under Review ({inReview.length})</h2>
            <div className="flex flex-col gap-3">
              {inReview.length === 0 ? <p className="text-zinc-500 text-sm">None under review.</p> : inReview.map(f => <FlagCard key={f.id} flag={f} />)}
            </div>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-zinc-500 uppercase mb-3">Resolved ({closed.length})</h2>
            <div className="flex flex-col gap-3">
              {closed.map(f => <FlagCard key={f.id} flag={f} />)}
            </div>
          </section>
        </div>
      )}
    </AdminShell>
  )
}
