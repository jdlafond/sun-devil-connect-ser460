'use client'

import Link from 'next/link'
import { useUser } from '@/src/lib/supabase/auth/UserProvider'

export default function OrgLink({ id, className, children }: { id: string; className?: string; children: React.ReactNode }) {
  const { user, loading } = useUser()
  const href = !loading && user ? `/student/organizations/${id}` : `/organizations/${id}`
  return <Link href={href} className={className}>{children}</Link>
}
