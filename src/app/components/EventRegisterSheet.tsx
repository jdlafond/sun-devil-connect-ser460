'use client'

import { useState } from 'react'
import { theme } from '@/src/styles/theme'
import { registerForEvent, isRegisteredForEvent } from '@/src/lib/supabase/membership/membership'
import { useUser } from '@/src/lib/supabase/auth/UserProvider'
import { Event } from '@/src/lib/supabase/events/events'

export default function EventRegisterSheet({ event, onClose }: { event: Event | null; onClose: () => void }) {
  const { user } = useUser()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const open = !!event

  async function handleRegister() {
    if (!user || !event) return
    setStatus('loading')
    try {
      const already = await isRegisteredForEvent(user.id, event.id)
      if (already) { setStatus('error'); setMessage('You are already registered for this event.'); return }
      await registerForEvent(user.id, event.id)
      setStatus('success')
      setMessage('You\'re registered!')
    } catch {
      setStatus('error')
      setMessage('Registration failed. Please try again.')
    }
  }

  function handleClose() {
    setStatus('idle')
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
          <span className="text-white font-bold text-lg">Register for Event</span>
          <button onClick={handleClose} className="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        {event && (
          <div className="flex-1 px-6 py-8 flex flex-col gap-4 overflow-y-auto">
            <h2 className="text-xl font-bold text-[#8C1D40]">{event.title}</h2>

            <div className="text-sm text-zinc-500 flex flex-col gap-1">
              <span>📅 {new Date(event.start_at).toLocaleString()}</span>
              {event.location && <span>📍 {event.location}</span>}
              {event.org_name && <span>🏛 {event.org_name}</span>}
              <span>{event.is_free || !event.price ? '🎟 Free' : `💵 $${event.price}`}</span>
              {event.capacity && <span>👥 Capacity: {event.capacity}</span>}
            </div>

            {event.description && (
              <p className="text-sm text-zinc-600">{event.description}</p>
            )}

            {status === 'success' ? (
              <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-green-700 text-sm">{message}</div>
            ) : (
              <>
                {status === 'error' && (
                  <p className="text-red-600 text-sm">{message}</p>
                )}
                <button
                  onClick={handleRegister}
                  disabled={status === 'loading'}
                  className={`${theme.btnPrimary} disabled:opacity-50`}
                >
                  {status === 'loading' ? 'Registering...' : 'Confirm Registration'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}
