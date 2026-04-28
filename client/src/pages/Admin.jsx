import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function Admin() {
  const [pending, setPending] = useState([])
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [actionId, setActionId] = useState(null)
  const appsScriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      if (appsScriptUrl) {
        const [pendingRes, allRes] = await Promise.all([
          axios.get(appsScriptUrl + '?api=entries&status=pending'),
          axios.get(appsScriptUrl + '?api=entries'),
        ])
        setPending(pendingRes.data || [])
        setAll(allRes.data || [])
      } else {
        const mockPending = [
          {
            id: 'th_p1',
            first_name: 'Jane',
            last_name: 'Doe',
            role: 'Health Tech Lead',
            organisation: 'HealthCorp',
            bio: 'Digital health innovator building AI solutions.',
            expertise: 'AI',
            linkedin: 'https://linkedin.com/in/janedoe',
            editor_email: 'jane@example.com',
            status: 'pending',
          },
          {
            id: 'th_p2',
            first_name: 'Maria',
            last_name: 'Santos',
            role: 'CEO',
            organisation: 'MedTech Africa',
            bio: 'Building health solutions for Africa.',
            expertise: 'Digital health innovation',
            linkedin: '',
            editor_email: 'maria@example.com',
            status: 'pending',
          },
        ]
        const mockAll = [
          ...mockPending,
          { id: 'th_a1', first_name: 'Adele', last_name: 'Waugaman', role: 'Senior Program Officer', organisation: 'Gates Foundation', bio: '', expertise: 'AI', linkedin: '', editor_email: '', status: 'live' },
          { id: 'th_a2', first_name: 'Kirsten', last_name: 'Mathieson', role: 'Deputy Director', organisation: 'Transform Health', bio: '', expertise: 'Digital health policy', linkedin: '', editor_email: '', status: 'live', featured: true },
        ]
        setPending(mockPending)
        setAll(mockAll)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(id, action) {
    setActionId(id)
    try {
      if (appsScriptUrl && action !== 'reject') {
        await axios.post(
          appsScriptUrl,
          { action, id, adminPassword: 'demo' },
          { headers: { 'Content-Type': 'application/json' } }
        )
      }
      const item = all.find((i) => i.id === id)
      if (item) {
        const updated = { ...item, status: action === 'approve' ? 'live' : 'rejected' }
        setAll(all.map((i) => (i.id === id ? updated : i)))
      }
      setPending(pending.filter((p) => p.id !== id))
    } catch (e) {
      console.error(e)
    } finally {
      setActionId(null)
    }
  }

  const handleRefresh = () => {
    loadData()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Admin Console</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex gap-4 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'pending'
                ? 'border-gray-800 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending ({pending.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-gray-800 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All ({all.length})
          </button>
          <button
            onClick={handleRefresh}
            className="ml-auto px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Refresh ↻
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : activeTab === 'pending' ? (
          pending.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">✓</div>
              <div className="text-gray-600">No pending submissions</div>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600 flex-shrink-0">
                          {(item.first_name?.[0] || '') + (item.last_name?.[0] || '')}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {item.first_name} {item.last_name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {item.role} · {item.organisation}
                          </div>
                        </div>
                      </div>
                      {item.bio && (
                        <p className="text-sm text-gray-600 mt-3 ml-13">{item.bio}</p>
                      )}
                      {item.expertise && (
                        <div className="flex gap-2 mt-2 ml-13">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {item.expertise}
                          </span>
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-2 ml-13">
                        {item.editor_email}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleAction(item.id, 'approve')}
                        disabled={actionId === item.id}
                        className="px-3 py-1.5 bg-gray-800 text-white text-sm font-medium rounded-full hover:bg-gray-700 disabled:opacity-50"
                      >
                        {actionId === item.id ? '...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleAction(item.id, 'reject')}
                        disabled={actionId === item.id}
                        className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-50 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Name</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Role</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Organisation</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Featured</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {all.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.first_name} {item.last_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.role}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.organisation}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            item.status === 'live'
                              ? 'bg-green-100 text-green-700'
                              : item.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {item.featured ? (
                          <span className="text-xs bg-gray-800 text-white px-2 py-1 rounded-full">
                            ★
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}