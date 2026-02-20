'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AppShell from '../../components/AppShell'
import { getOrganizations, Organization } from '@/src/lib/supabase/organizations/organizations'
import { theme } from '@/src/styles/theme'
import OrgLink from '../../components/OrgLink'

const CATEGORIES = ['Academic', 'Social', 'Greek Life', 'Cultural', 'Sports', 'Arts', 'Service', 'Professional']

export default function StudentOrganizationsPage() {
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrganizations()
      .then((data: Organization[]) => { setOrgs(data); setFilteredOrgs(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    let filtered = orgs
    if (searchQuery)
      filtered = filtered.filter(org =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    if (selectedCategories.length > 0)
      filtered = filtered.filter(org =>
        org.categories?.some((cat: string) => selectedCategories.includes(cat))
      )
    setFilteredOrgs(filtered)
  }, [searchQuery, selectedCategories, orgs])

  const toggleCategory = (cat: string) =>
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])

  return (
    <AppShell>
      <h1 className={`${theme.heading} mb-1`}>Organizations</h1>
      <p className={`${theme.subheading} mb-6 text-sm`}>Find your community at ASU</p>

      <input
        type="text"
        placeholder="Search organizations..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        className={`${theme.input} max-w-xl mb-6`}
      />

      <div className="mb-6">
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
          <button onClick={() => setSelectedCategories([])} className="mt-3 text-sm text-[#8C1D40] hover:underline">
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-zinc-500 text-sm">Loading organizations...</p>
      ) : (
        <>
          <p className="text-sm text-zinc-600 mb-4">{filteredOrgs.length} organization{filteredOrgs.length !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrgs.map(org => (
              <div key={org.id} className={theme.card}>
                <OrgLink id={org.id}>
                  <h3 className="text-lg font-semibold text-[#8C1D40] mb-2 hover:underline">{org.name}</h3>
                </OrgLink>
                <p className="text-sm text-zinc-600 mb-4 line-clamp-3">{org.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {org.categories?.map((cat: string) => (
                    <span key={cat} className="px-2 py-1 bg-zinc-100 text-zinc-700 text-xs rounded-full">{cat}</span>
                  ))}
                </div>
                <OrgLink id={org.id} className={theme.link}>View Details →</OrgLink>
              </div>
            ))}
          </div>
        </>
      )}
    </AppShell>
  )
}
