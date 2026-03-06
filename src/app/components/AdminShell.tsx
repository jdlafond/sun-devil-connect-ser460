'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useUser } from '@/src/lib/supabase/auth/UserProvider'
import { signOutUser } from '@/src/lib/supabase/auth/auth'
import { theme } from '@/src/styles/theme'
import { LayoutDashboard, Building2, Flag, UserCircle, Bell } from 'lucide-react'
import { getNotifications, markAsRead, markAllAsRead, Notification } from '@/src/lib/supabase/notifications/notifications'
import { subscribeToNotifications } from '@/src/lib/realtime'

const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/applications', label: 'Applications', icon: Flag },
  { href: '/admin/flags', label: 'Flagged Content', icon: Flag },
  { href: '/admin/organizations', label: 'Manage Organizations', icon: Building2 },
  { href: '/admin/profile', label: 'Profile', icon: UserCircle },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useUser()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifs, setShowNotifs] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)
  const unread = notifications.filter(n => !n.read).length

  useEffect(() => {
    if (!user) return
    getNotifications(user.id).then(setNotifications).catch(() => {})
    const channel = subscribeToNotifications(user.id, payload => {
      setNotifications(prev => [payload.new as Notification, ...prev])
    })
    return () => { channel.unsubscribe() }
  }, [user])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setShowNotifs(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleMarkRead(id: string) {
    await markAsRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  async function handleMarkAllRead() {
    if (!user) return
    await markAllAsRead(user.id)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  async function handleSignOut() {
    await signOutUser()
    router.push('/')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className={`${theme.nav} z-10`} style={{ background: theme.navBg }}>
        <Link href="/admin" className="flex items-center gap-3">
          <Image src="/arizona-state-university-logo.png" alt="ASU Logo" width={100} height={33} />
          <span className="text-white font-bold text-xl">Sun Devil Connect — Admin</span>
        </Link>
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <div ref={bellRef} className="relative">
            <button onClick={() => setShowNotifs(p => !p)} className="relative text-white/70 hover:text-white">
              <Bell size={20} />
              {unread > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>
            {showNotifs && (
              <div className="absolute right-0 top-8 w-80 bg-white rounded-xl shadow-xl border border-zinc-200 z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
                  <p className="text-sm font-semibold text-zinc-800">Notifications</p>
                  {unread > 0 && (
                    <button onClick={handleMarkAllRead} className="text-xs text-[#8C1D40] hover:underline">Mark all read</button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-zinc-500 px-4 py-6 text-center">No notifications</p>
                  ) : notifications.map(n => (
                    <div key={n.id} onClick={() => handleMarkRead(n.id)}
                      className={`px-4 py-3 border-b border-zinc-50 cursor-pointer hover:bg-zinc-50 transition-colors ${!n.read ? 'bg-[#8C1D40]/5' : ''}`}>
                      <p className={`text-sm font-medium ${!n.read ? 'text-[#8C1D40]' : 'text-zinc-700'}`}>{n.title}</p>
                      {n.message && <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{n.message}</p>}
                      <p className="text-xs text-zinc-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <span className="text-white/70 text-sm">{(user as any)?.display_name ?? user?.email}</span>
          <button onClick={handleSignOut} className="text-sm text-white/70 hover:text-white cursor-pointer">Sign Out</button>
        </div>
      </nav>

      <div className="flex flex-1">
        <aside className="w-56 bg-white border-r border-zinc-200 flex flex-col py-6 px-4 gap-1 shrink-0">
          {sidebarLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-[#8C1D40] text-white' : 'text-zinc-700 hover:bg-zinc-100'
                }`}>
                <Icon size={18} color={active ? 'white' : '#8C1D40'} />
                {label}
              </Link>
            )
          })}
        </aside>
        <main className="flex-1 bg-zinc-50 p-8">{children}</main>
      </div>
    </div>
  )
}
