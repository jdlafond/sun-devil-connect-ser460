'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getOrganizations, Organization } from '@/src/lib/supabase/organizations/organizations'
import { theme } from '@/src/styles/theme'
import OrgLink from '../components/OrgLink'

const CATEGORIES = ['Academic', 'Social', 'Greek Life', 'Cultural', 'Sports', 'Arts', 'Service', 'Professional']

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrganizations()
      .then((data: Organization[]) => {
        setOrgs(data)
        setFilteredOrgs(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    let filtered = orgs

    if (searchQuery) {
      filtered = filtered.filter(org =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(org =>
        org.categories?.some((cat: string) => selectedCategories.includes(cat))
      )
    }

    setFilteredOrgs(filtered)
  }, [searchQuery, selectedCategories, orgs])

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Navbar */}
      <nav className={theme.nav} style={{ background: theme.navBg }}>
        <Link href="/" className="flex items-center gap-3">
          <Image src="/arizona-state-university-logo.png" alt="ASU Logo" width={100} height={33} />
          <span className="text-white font-bold text-xl">Sun Devil Connect</span>
        </Link>
        <div className="flex gap-4">
          <Link href="/organizations" className={theme.navLinkActive}>Organizations</Link>
          <Link href="/events" className={theme.navLink}>Events</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-12">
        <h1 className={`${theme.heading} mb-2`}>Browse Organizations</h1>
        <p className={`${theme.subheading} mb-8`}>Find your community at ASU</p>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search organizations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${theme.input} max-w-xl`}
          />
        </div>

        {/* Category Filters */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-zinc-700 mb-3">Filter by Category</h3>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategories.includes(cat)
                    ? 'bg-[#8C1D40] text-white'
                    : 'bg-white border border-zinc-300 text-zinc-700 hover:border-[#8C1D40]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {selectedCategories.length > 0 && (
            <button
              onClick={() => setSelectedCategories([])}
              className="mt-3 text-sm text-[#8C1D40] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <p className="text-zinc-500">Loading organizations...</p>
        ) : (
          <>
            <p className="text-sm text-zinc-600 mb-4">
              {filteredOrgs.length} organization{filteredOrgs.length !== 1 ? 's' : ''} found
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrgs.map(org => (
                <div key={org.id} className={theme.card}>
                  <OrgLink id={org.id}>
                    <h3 className="text-lg font-semibold text-[#8C1D40] mb-2 hover:underline">{org.name}</h3>
                  </OrgLink>
                  <p className="text-sm text-zinc-600 mb-4 line-clamp-3">{org.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {org.categories?.map((cat: string) => (
                      <span key={cat} className="px-2 py-1 bg-zinc-100 text-zinc-700 text-xs rounded-full">
                        {cat}
                      </span>
                    ))}
                  </div>
                  <OrgLink id={org.id} className={theme.link}>View Details →</OrgLink>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
