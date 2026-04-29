import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { MOCK_LEADERS } from '../data/mockData'

function TBC() {
  return <span className="text-gray-400 italic text-sm">TBC</span>
}

const EXPERTISE_OPTIONS = [
  'AI',
  'Digital health',
  'Health financing',
  'Health information systems',
  'Health systems strengthening',
  'mHealth',
  'Digital health policy',
  'Digital health strategy',
  'Digital health advocacy',
  'Digital health innovation',
  'Digital health transformation',
  'Digital health philanthropy',
  'Research',
  'Telemedicine',
  'Health workforce',
]

const ITEMS_PER_PAGE = 12

export default function Database({ onManageProfile }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expertiseFilter, setExpertiseFilter] = useState('')
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProfile, setSelectedProfile] = useState(null)

  useEffect(() => {
    loadEntries()
  }, [])

  async function loadEntries() {
    setLoading(true)
    try {
      const url = import.meta.env.VITE_APPS_SCRIPT_URL || ''
      if (!url) {
        setItems(MOCK_LEADERS)
      } else {
        const r = await axios.get(url + '?api=entries&status=live')
        setItems(r.data || [])
      }
    } catch (e) {
      console.error(e)
      setItems(MOCK_LEADERS)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = useMemo(() => {
    let result = items

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (it) =>
          (it.first_name || '').toLowerCase().includes(q) ||
          (it.last_name || '').toLowerCase().includes(q) ||
          (it.role || '').toLowerCase().includes(q) ||
          (it.organisation || '').toLowerCase().includes(q) ||
          (it.bio || '').toLowerCase().includes(q)
      )
    }

    if (expertiseFilter) {
      result = result.filter((it) => (it.expertise || '').includes(expertiseFilter))
    }

    if (featuredOnly) {
      result = result.filter((it) => it.featured === true || it.featured === 'true')
    }

    return result
  }, [items, search, expertiseFilter, featuredOnly])

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE)
  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredItems.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredItems, currentPage])

  const stats = useMemo(() => {
    const expertiseCounts = {}
    items.forEach((it) => {
      const exp = it.expertise || 'Other'
      expertiseCounts[exp] = (expertiseCounts[exp] || 0) + 1
    })
    return {
      total: items.length,
      expertise: Object.keys(expertiseCounts).length,
      expertiseCounts,
    }
  }, [items])

  function clearFilters() {
    setSearch('')
    setExpertiseFilter('')
    setFeaturedOnly(false)
    setCurrentPage(1)
  }

  function goToPage(n) {
    if (n >= 1 && n <= totalPages) setCurrentPage(n)
  }

  function getInitials(first, last) {
    return ((first?.[0] || '') + (last?.[0] || '')).toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-3 flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px] max-w-[320px]">
            <input
              type="text"
              placeholder="Search name, organisation, role..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-full bg-gray-50 focus:bg-white focus:outline-none focus:border-gray-400"
            />
          </div>

          <select
            value={expertiseFilter}
            onChange={(e) => {
              setExpertiseFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2 border border-gray-300 rounded-full bg-white focus:outline-none focus:border-gray-400"
          >
            <option value="">All Expertise</option>
            {EXPERTISE_OPTIONS.map((exp) => (
              <option key={exp} value={exp}>
                {exp}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setFeaturedOnly(!featuredOnly)
              setCurrentPage(1)
            }}
            className={`px-4 py-2 border rounded-full text-sm font-medium transition-colors ${
              featuredOnly
                ? 'border-gray-800 bg-gray-800 text-white'
                : 'border-gray-300 text-gray-600 hover:border-gray-400'
            }`}
          >
            ★ Featured only
          </button>

          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-dashed border-gray-300 text-gray-500 hover:border-gray-400 rounded-full text-sm"
          >
            Clear ×
          </button>

          <div className="ml-auto text-sm text-gray-500">
            {filteredItems.length} of {stats.total} leaders
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-3xl mb-2">No leaders found</div>
            <div className="text-sm">Try adjusting your filters</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pagedItems.map((it) => (
                <div
                  key={it.id}
                  onClick={() => setSelectedProfile(it)}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  {it.featured === true || it.featured === 'true' ? (
                    <span className="inline-block text-xs font-medium bg-gray-800 text-white px-2 py-0.5 rounded-full mb-3">
                      ★ Featured
                    </span>
                  ) : null}

                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600 flex-shrink-0">
                      {getInitials(it.first_name, it.last_name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 text-sm leading-tight">
                        {it.first_name} {it.last_name}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5 leading-tight">
                        {it.role}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {it.organisation}
                      </div>
                    </div>
                  </div>

                  {it.bio && (
                    <p className="text-xs text-gray-600 mt-3 line-clamp-2">
                      {it.bio}
                    </p>
                  )}

                  {it.expertise && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {it.expertise}
                      </span>
                    </div>
                  )}

                  {it.linkedin && (
                    <a
                      href={it.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-700 mt-3 inline-flex items-center gap-1 hover:underline"
                    >
                      LinkedIn →
                    </a>
                  )}
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-200 flex-wrap">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:border-gray-400"
                >
                  ← Prev
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page
                  if (totalPages <= 5) {
                    page = i + 1
                  } else if (currentPage <= 3) {
                    page = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i
                  } else {
                    page = currentPage - 2 + i
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-1.5 border rounded text-sm font-medium ${
                        page === currentPage
                          ? 'bg-gray-800 text-white border-gray-800'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:border-gray-400"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedProfile && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProfile(null)}
        >
          <div
            className="bg-white rounded-xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProfile(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ✕
            </button>

            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-semibold text-gray-600 mb-3">
                {getInitials(selectedProfile.first_name, selectedProfile.last_name)}
              </div>
              {(selectedProfile.featured === true || selectedProfile.featured === 'true') && (
                <span className="text-xs font-medium bg-gray-800 text-white px-2 py-0.5 rounded-full mb-2">
                  ★ Featured
                </span>
              )}
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedProfile.first_name} {selectedProfile.last_name}
              </h2>
              <p className="text-sm text-gray-600 mt-1">{selectedProfile.role || <TBC />}</p>
              <p className="text-sm text-gray-500 mt-0.5">{selectedProfile.organisation || <TBC />}</p>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                  Bio
                </div>
                {selectedProfile.bio ? (
                  <p className="text-gray-700 leading-relaxed">{selectedProfile.bio}</p>
                ) : (
                  <TBC />
                )}
              </div>

              <div>
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                  Expertise
                </div>
                {selectedProfile.expertise ? (
                  <div className="flex flex-wrap gap-1">
                    {selectedProfile.expertise.split(', ').map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <TBC />
                )}
              </div>

              <div>
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                  LinkedIn
                </div>
                {selectedProfile.linkedin ? (
                  <a
                    href={selectedProfile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:underline"
                  >
                    View profile →
                  </a>
                ) : (
                  <TBC />
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400 mb-2">Is this you?</p>
              <button
                onClick={() => {
                  setSelectedProfile(null)
                  onManageProfile(selectedProfile)
                }}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-full hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                Update or remove my profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}