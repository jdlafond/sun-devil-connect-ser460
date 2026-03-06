'use client'

import { useState } from 'react'
import { theme } from '@/src/styles/theme'
import { applyToCreateOrg } from '@/src/lib/supabase/applications/applications'
import { useUser } from '@/src/lib/supabase/auth/UserProvider'

const CATEGORIES = ['Academic', 'Social', 'Greek Life', 'Cultural', 'Sports', 'Arts', 'Service', 'Professional']

export default function CreateOrgSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useUser()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [justification, setJustification] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [feedback, setFeedback] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setStatus('loading')
    try {
      await applyToCreateOrg(user.id, { name, description, category }, justification)
      setStatus('success')
      setFeedback('Your application has been submitted for admin review!')
    } catch {
      setStatus('error')
      setFeedback('Failed to submit. Please try again.')
    }
  }

  function handleClose() {
    setStatus('idle')
    setFeedback('')
    setName('')
    setDescription('')
    setCategory('')
    setJustification('')
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
          <span className="text-white font-bold text-lg">Apply to Create Organization</span>
          <button onClick={handleClose} className="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <div className="flex-1 px-6 py-8 flex flex-col gap-4 overflow-y-auto">
          {status === 'success' ? (
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-green-700 text-sm">{feedback}</div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase mb-1 block">Organization Name *</label>
                <input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. ASU Robotics Club" className={theme.input} />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase mb-1 block">Description *</label>
                <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={3}
                  placeholder="What is this organization about?"
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm text-black outline-none focus:border-[#8C1D40] transition-colors placeholder:text-zinc-500 resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase mb-1 block">Category *</label>
                <select required value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full rounded-full border border-zinc-300 px-5 py-3 text-sm text-black outline-none focus:border-[#8C1D40] transition-colors"
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase mb-1 block">Why should this org be approved?</label>
                <textarea value={justification} onChange={e => setJustification(e.target.value)} rows={3}
                  placeholder="Explain the need and benefit to ASU students..."
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
      </div>
    </>
  )
}
