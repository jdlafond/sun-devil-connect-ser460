'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { theme } from '@/src/styles/theme'
import { signInUser } from '@/src/lib/supabase/auth/auth'

export default function LoginSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const result = await signInUser(email, password)
    if (!result.success) return setError(result.message)
    onClose()
    router.push('/student')
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ background: theme.navBg }}>
          <span className="text-white font-bold text-lg">Sign In</span>
          <button onClick={onClose} className="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-8 flex flex-col gap-4">
          <p className={`${theme.subheading} text-sm mb-2`}>Welcome back to Sun Devil Connect</p>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ASU Email"
              required
              className={theme.input}
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              required
              className={theme.input}
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button type="submit" className={theme.btnPrimary}>Sign In</button>
          </form>
        </div>
      </div>
    </>
  )
}
