'use client'

import { useState } from 'react'
import { Flag } from 'lucide-react'
import { createFlag, ContentFlag } from '@/src/lib/supabase/flags/flags'
import { useUser } from '@/src/lib/supabase/auth/UserProvider'
import { theme } from '@/src/styles/theme'

const REASONS = ['Inappropriate content', 'Spam', 'Misleading information', 'Harassment', 'Other']

interface Props {
  targetType: ContentFlag['target_type']
  targetId: string
}

export default function FlagButton({ targetType, targetId }: Props) {
  const { user } = useUser()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !reason) return
    setSubmitting(true)
    await createFlag({ reporter_user_id: user.id, target_type: targetType, target_id: targetId, reason, description: description || null })
    setSubmitting(false)
    setDone(true)
    setTimeout(() => { setOpen(false); setDone(false); setReason(''); setDescription('') }, 1500)
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-1 text-xs text-zinc-400 hover:text-red-500 transition-colors cursor-pointer">
        <Flag size={13} />
        Report
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            {done ? (
              <p className="text-center text-green-600 font-medium py-4">Report submitted. Thank you.</p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <h2 className="text-base font-bold text-[#8C1D40]">Report {targetType.toLowerCase()}</h2>
                <select required value={reason} onChange={e => setReason(e.target.value)} className={theme.input}>
                  <option value="">Select a reason</option>
                  {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <textarea
                  placeholder="Additional details (optional)"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm text-black outline-none focus:border-[#8C1D40] resize-none"
                  rows={3}
                />
                <div className="flex gap-2 mt-1">
                  <button type="submit" disabled={submitting} className="flex-1 bg-[#8C1D40] text-white font-semibold py-2.5 rounded-full hover:bg-[#6e1632] transition-colors cursor-pointer disabled:opacity-50">
                    {submitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                  <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-zinc-300 text-zinc-700 font-semibold py-2.5 rounded-full hover:bg-zinc-50 cursor-pointer">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
