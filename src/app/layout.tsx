import type { Metadata } from 'next'
import './globals.css'
import { UserProvider } from '@/src/lib/supabase/auth/UserProvider'

export const metadata: Metadata = {
  title: 'Sun Devil Connect',
  description: 'Campus Organization & Event Management Platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  )
}
