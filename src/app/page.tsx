'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import LoginSheet from './components/LoginSheet'

export default function Home() {
  const [loginOpen, setLoginOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white font-sans">
      <LoginSheet open={loginOpen} onClose={() => setLoginOpen(false)} />

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 shadow-md" style={{background: 'linear-gradient(to right, #380111, #8C1D40)'}}>
        <div className="flex items-center gap-3">
          <Image src="/arizona-state-university-logo.png" alt="ASU Logo" width={120} height={40} />
          <span className="text-white font-bold text-xl tracking-tight">Sun Devil Connect</span>
        </div>
        <button
          onClick={() => setLoginOpen(true)}
          className="rounded-full bg-[#FFC627] px-5 py-2 text-sm font-semibold text-[#8C1D40] hover:bg-yellow-400 transition-colors"
        >
          Login / Sign Up
        </button>
      </nav>

      {/* Hero */}
      <section className="relative h-[480px] w-full">
        <Image
          src="/sun-devil-connect.jpeg"
          alt="Sun Devil Connect"
          fill
          className="object-cover brightness-50"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-5xl font-bold text-white drop-shadow-lg">Sun Devil Connect</h1>
          <p className="mt-4 max-w-xl text-lg text-zinc-200">
            Your hub for campus organizations, events, and community at Arizona State University.
          </p>
          <button
            onClick={() => setLoginOpen(true)}
            className="mt-8 rounded-full bg-[#FFC627] px-8 py-3 font-semibold text-[#8C1D40] hover:bg-yellow-400 transition-colors"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* About */}
      <section className="mx-auto max-w-4xl px-8 py-16 text-center">
        <h2 className="text-3xl font-bold text-[#8C1D40]">What is Sun Devil Connect?</h2>
        <p className="mt-4 text-zinc-600 text-lg leading-relaxed">
          Sun Devil Connect is ASU&apos;s campus organization and event management platform. Students can
          discover and join clubs, register for events, and stay informed with announcements — all in
          one place. Organizers manage their organizations and events.
        </p>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {[
            { icon: '🎓', title: 'Students', desc: 'Browse orgs, register for events, and manage your campus life.' },
            { icon: '📋', title: 'Organizers', desc: 'Create events, manage members, and post announcements.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-zinc-200 p-6 shadow-sm">
              <div className="text-4xl">{icon}</div>
              <h3 className="mt-3 font-semibold text-[#8C1D40] text-lg">{title}</h3>
              <p className="mt-2 text-zinc-500 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Organizations */}
      <section className="bg-zinc-50 px-8 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-[#8C1D40]">Join an Organization</h2>
          <p className="mt-3 text-zinc-600">
            From academic clubs to Greek life, find your community at ASU.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {['Academic', 'Social', 'Greek Life', 'Cultural', 'Sports', 'Arts', 'Service', 'Professional'].map((cat) => (
              <div
                key={cat}
                className="rounded-xl bg-white border border-zinc-200 px-4 py-5 text-sm font-medium text-zinc-700 shadow-sm hover:border-[#8C1D40] hover:text-[#8C1D40] transition-colors cursor-pointer"
              >
                {cat}
              </div>
            ))}
          </div>
          <Link
            href="/organizations"
            className="mt-8 inline-block rounded-full border-2 border-[#8C1D40] px-6 py-2 text-sm font-semibold text-[#8C1D40] hover:bg-[#8C1D40] hover:text-white transition-colors"
          >
            Browse All Organizations
          </Link>
        </div>
      </section>

      {/* Events */}
      <section className="px-8 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-[#8C1D40]">Search Events</h2>
          <p className="mt-3 text-zinc-600">
            Discover upcoming events across campus and register in seconds.
          </p>
          <div className="mt-6 flex items-center gap-2 max-w-lg mx-auto">
            <input
              type="text"
              placeholder="Search events..."
              className="flex-1 rounded-full border border-zinc-300 px-5 py-3 text-sm text-black outline-none focus:border-[#8C1D40] transition-colors placeholder:text-zinc-500"
            />
            <button
              onClick={() => setLoginOpen(true)}
              className="rounded-full bg-[#8C1D40] px-6 py-3 text-sm font-semibold text-white hover:bg-[#6e1632] transition-colors"
            >
              Search
            </button>
          </div>
          <p className="mt-4 text-xs text-zinc-400">Sign in to register for events and get personalized recommendations.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-6 text-center text-sm text-zinc-300" style={{background: 'linear-gradient(to right, #380111, #8C1D40)'}}>
        <Image src="/arizona-state-university-logo.png" alt="ASU" width={80} height={26} className="mx-auto mb-2" />
        © {new Date().getFullYear()} Arizona State University · Sun Devil Connect
      </footer>

    </div>
  )
}
