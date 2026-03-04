'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInUser, getRoleRedirect } from '@/src/lib/supabase/auth/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const result = await signInUser(email, password)
    if (!result.success) return setError(result.message)
    router.push(await getRoleRedirect())
  }

  return (
    <main>
      <h1>Sign In</h1>
      <form onSubmit={handleLogin}>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
        {error && <p>{error}</p>}
        <button type="submit">Sign In</button>
      </form>
    </main>
  )
}
