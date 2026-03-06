'use client'

import { useState } from 'react'
import { theme } from '@/src/styles/theme'
import { applyToOrg } from '@/src/lib/supabase/applications/applications'
import { useUser } from '@/src/lib/supabase/auth/UserProvider'
import { Organization } from '@/src/lib/supabase/organizations/organizations'

export default function JoinOrgSheet({ org, onClose }: { org: Organization | null; onClose: () => void }) {
  const { user } = useUser()
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [feedback, setFeedback] = useState('')

  const open = !!org

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !org) return
    setStatus('loading')
    try {
      await applyToOrg(user.id, org.id, message)
      setStatus('success')
      setFeedback('Your application has been submitted!')
    } catch {
      setStatus('error')
      setFeedback('Failed to submit application. You may have already applied.')
    }
  }

  function handleClose() {
    setStatus('idle')
    setFeedback('')
    setMessage('')
    onClose()
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={handleClose}
      />
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-6 py-5" style={{ background: theme.navBg }}>
          <span className="text-white font-bold text-lg">Join Organization</span>
          <button onClick={handleClose} className="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        {org && (
          <div className="flex-1 px-6 py-8 flex flex-col gap-4 overflow-y-auto">
            <h2 className="text-xl font-bold text-[#8C1D40]">{org.name}</h2>
            {org.description && <p className="text-sm text-zinc-600">{org.description}</p>}

            {status === 'success' ? (
              <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-green-700 text-sm">{feedback}</div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase mb-1 block">Why do you want to join? (optional)</label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Tell the organizers why you're interested..."
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm text-black outline-none focus:border-[#8C1D40] transition-colors placeholder:text-zinc-500 resize-none"
                  />
                </div>
                {status === 'error' && <p className="text-red-600 text-sm">{feedback}</p>}
                <button type="submit" disabled={status === 'loading'} className={`${theme.btnPrimary} disabled:opacity-50`}>
                  {status === 'loading' ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </>
  )
}
