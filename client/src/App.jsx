import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Database from './pages/Database'
import Submit from './pages/Submit'
import Admin from './pages/Admin'
import Analytics from './pages/Analytics'
import ManageProfile from './pages/ManageProfile'
import SiteHeader from './components/SiteHeader'
import SiteFooter from './components/SiteFooter'

const NAV_ITEMS = [
  { id: 'database', label: 'Database', display: 'DATABASE' },
  { id: 'submit', label: 'Submit', display: 'SUBMIT PROFILE' },
  { id: 'analytics', label: 'Analytics', display: 'ANALYTICS' },
  { id: 'admin', label: 'Admin', display: 'ADMIN' },
]

export default function App() {
  const [route, setRoute] = useState('database')
  const [managePrefill, setManagePrefill] = useState(null)
  const [tokenLoading, setTokenLoading] = useState(false)
  const [tokenError, setTokenError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (!token) return

    const url = import.meta.env.VITE_APPS_SCRIPT_URL
    if (!url) return

    setTokenLoading(true)
    window.history.replaceState({}, '', window.location.pathname)

    axios
      .get(`${url}?api=profile&token=${token}`)
      .then((r) => {
        if (r.data?.ok && r.data?.profile) {
          setManagePrefill({ ...r.data.profile, _verified: true })
          setRoute('manage')
        } else {
          setTokenError(
            r.data?.error === 'token_used'
              ? 'This link has already been used. Please request a new one.'
              : 'This link is invalid or has expired. Please request a new one.'
          )
        }
      })
      .catch(() => {
        setTokenError('Could not load your profile. Please try again.')
      })
      .finally(() => setTokenLoading(false))
  }, [])

  function goToManage(profile = null) {
    setManagePrefill(profile)
    setRoute('manage')
  }

  const showHero = ['database', 'submit', 'analytics'].includes(route)

  return (
    <div className="min-h-screen" style={{ background: 'rgb(255, 255, 244)' }}>
      <SiteHeader />

      {showHero && (
        <div style={{ background: 'rgb(255, 255, 244)', fontFamily: "'Montserrat', sans-serif" }}>
          <div className="max-w-6xl mx-auto px-6 py-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#000' }}>
              Transform Health · Women in Digital Health
            </p>
            <h1 className="text-4xl font-bold text-black leading-tight mb-4" style={{ maxWidth: 640 }}>
              Women Leaders in Digital Health
            </h1>
            <p className="text-base mb-8" style={{ color: '#333', maxWidth: 560, lineHeight: 1.7 }}>
              A curated global network of women driving digital transformation across health systems, policy, and innovation.
            </p>
            <div className="flex gap-8">
              <div>
                <div className="text-3xl font-bold text-black">81</div>
                <div className="text-xs uppercase tracking-widest mt-1" style={{ color: '#333' }}>Leaders</div>
              </div>
              <div style={{ borderLeft: '1px solid #e8c800', paddingLeft: 32 }}>
                <div className="text-3xl font-bold text-black">15</div>
                <div className="text-xs uppercase tracking-widest mt-1" style={{ color: '#333' }}>Expertise Areas</div>
              </div>
              <div style={{ borderLeft: '1px solid #e8c800', paddingLeft: 32 }}>
                <div className="text-3xl font-bold text-black">30+</div>
                <div className="text-xs uppercase tracking-widest mt-1" style={{ color: '#333' }}>Organisations</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="sticky top-0 z-50" style={{ background: '#FADF56' }}>
        <div className="max-w-[1440px] mx-auto px-8 pt-8 flex justify-between items-end">

          {/* Main tabs */}
          <div className="flex gap-8">
            {NAV_ITEMS.filter(item => item.id !== 'admin').map((item) => {
              const active = route === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setRoute(item.id)}
                  className={`font-['Montserrat'] font-medium text-2xl tracking-[0.03em] px-7 py-2.5 whitespace-nowrap leading-7 cursor-pointer rounded-none ${
                    active ? 'text-white' : 'text-black bg-transparent'
                  }`}
                  style={{
                    background: active ? '#E8571D' : 'transparent',
                    clipPath: active ? 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)' : 'none',
                  }}
                >
                  {item.display}
                </button>
              )
            })}
          </div>

          {/* Admin — tucked to the right, smaller */}
          <button
            onClick={() => setRoute('admin')}
            className={`font-['Montserrat'] font-medium text-xs tracking-[0.08em] uppercase px-3.5 py-1.5 mb-1.5 cursor-pointer rounded ${
              route === 'admin'
                ? 'text-white border-transparent'
                : 'text-[#333] border border-[#555]'
            }`}
            style={{
              background: route === 'admin' ? '#E8571D' : 'transparent',
            }}
          >
            Admin
          </button>

        </div>
      </nav>
      <main>
        {tokenLoading ? (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p className="text-gray-500">Loading your profile...</p>
          </div>
        ) : tokenError ? (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center max-w-md">
              <div className="text-3xl mb-4">⚠</div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Link unavailable</h2>
              <p className="text-gray-600 text-sm mb-4">{tokenError}</p>
              <button
                onClick={() => { setTokenError(''); setRoute('manage') }}
                className="px-4 py-2 bg-gray-800 text-white rounded-full text-sm font-medium hover:bg-gray-700"
              >
                Request a new link
              </button>
            </div>
          </div>
        ) : (
          <>
            {route === 'database' && <Database onManageProfile={(profile) => goToManage(profile)} />}
            {route === 'submit' && <Submit onManageProfile={() => goToManage()} />}
            {route === 'analytics' && <Analytics />}
            {route === 'admin' && <Admin />}
            {route === 'manage' && (
              <ManageProfile
                prefill={managePrefill}
                onBack={() => setRoute(managePrefill?._verified || managePrefill ? 'database' : 'submit')}
              />
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
