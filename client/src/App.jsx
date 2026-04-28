import React, { useState } from 'react'
import Submit from './pages/Submit'
import Directory from './pages/Directory'
import Admin from './pages/Admin'

const NAV_ITEMS = [
  { id: 'directory', label: 'Directory' },
  { id: 'submit', label: 'Submit' },
  { id: 'admin', label: 'Admin' },
]

export default function App() {
  const [route, setRoute] = useState('directory')
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-8">
              <h1 className="text-lg font-semibold text-gray-900">
                Transform Health
              </h1>
              <div className="flex gap-1">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setRoute(item.id)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                      route === item.id
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main>
        {route === 'submit' && <Submit />}
        {route === 'directory' && <Directory />}
        {route === 'admin' && <Admin />}
      </main>
    </div>
  )
}