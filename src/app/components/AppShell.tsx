'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useUser } from '@/src/lib/supabase/auth/UserProvider'
import { signOutUser } from '@/src/lib/supabase/auth/auth'
import { theme } from '@/src/styles/theme'
import { LayoutDashboard, Building2, CalendarDays, UserCircle } from 'lucide-react'

const navLinks = [
  { href: '/student', label: 'Home' },
  { href: '/student/organizations', label: 'Organizations' },
  { href: '/student/events', label: 'Events' },
]

const sidebarLinks = [
  { href: '/student', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/student/my-organizations', label: 'My Organizations', icon: Building2 },
  { href: '/student/my-events', label: 'My Events', icon: CalendarDays },
  { href: '/student/profile', label: 'Profile', icon: UserCircle },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useUser()
  const router = useRouter()

  async function handleSignOut() {
    await signOutUser()
    router.push('/')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navbar */}
      <nav className={`${theme.nav} z-10`} style={{ background: theme.navBg }}>
        <Link href="/student" className="flex items-center gap-3">
          <Image src="/arizona-state-university-logo.png" alt="ASU Logo" width={100} height={33} />
          <span className="text-white font-bold text-xl">Sun Devil Connect</span>
        </Link>
        <div className="flex items-center gap-6">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? theme.navLinkActive : theme.navLink}
            >
              {link.label}
            </Link>
          ))}
          <span className="text-white/50">|</span>
          <span className="text-white/70 text-sm">{(user as any)?.display_name ?? user?.email}</span>
          <button onClick={handleSignOut} className="text-sm text-white/70 hover:text-white">
            Sign Out
          </button>
        </div>
      </nav>

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <aside className="w-56 bg-white border-r border-zinc-200 flex flex-col py-6 px-4 gap-1 shrink-0">
          {sidebarLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-[#8C1D40] text-white' : 'text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <Icon size={18} color={active ? 'white' : '#8C1D40'} />
                {label}
              </Link>
            )
          })}
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-zinc-50 p-8">{children}</main>
      </div>
    </div>
  )
}
