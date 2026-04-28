import React, { useState } from 'react'
import axios from 'axios'

const EXPERTISE_TAGS = [
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

export default function Submit() {
  const [step, setStep] = useState(1)
  const [branch, setBranch] = useState('self')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState('')
  const [org, setOrg] = useState('')
  const [bio, setBio] = useState('')
  const [expertise, setExpertise] = useState([])
  const [linkedin, setLinkedin] = useState('')
  const [consent, setConsent] = useState(null)
  const [status, setStatus] = useState('')

  function next() {
    if (step < 5) setStep(step + 1)
  }
  function back() {
    if (step > 1) setStep(step - 1)
  }

  async function submit() {
    setStatus('submitting')
    try {
      const url = import.meta.env.VITE_APPS_SCRIPT_URL || ''
      if (!url) {
        setTimeout(() => {
          setStatus('submitted')
        }, 1000)
        return
      }
      const payload = {
        branch,
        firstName,
        lastName,
        role,
        organisation: org,
        bio,
        expertise: expertise.join(', '),
        linkedin,
      }
      const r = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
      })
      if (r.data && r.data.ok) setStatus('submitted')
      else setStatus('error')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  function toggleExpertise(tag) {
    if (expertise.includes(tag)) {
      setExpertise(expertise.filter((e) => e !== tag))
    } else if (expertise.length < 5) {
      setExpertise([...expertise, tag])
    }
  }

  if (status === 'submitted') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center max-w-md">
          <div className="text-4xl mb-4">★</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Thank you for submitting
          </h2>
          <p className="text-gray-600 mb-4">
            Your profile has been submitted for review. You'll receive a confirmation once it's approved.
          </p>
          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
            You'll be notified by email when your profile goes live.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Submit Your Profile
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <React.Fragment key={s}>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${
                    s < step
                      ? 'bg-gray-800 text-white'
                      : s === step
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {s < step ? '✓' : s}
                </div>
                <div
                  className={`flex-1 h-0.5 ${
                    s < step ? 'bg-gray-800' : 'bg-gray-200'
                  } ${s === 4 ? 'hidden' : ''}`}
                />
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Type</span>
            <span>Details</span>
            <span>Expertise</span>
            <span>Review</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {step === 1 && (
            <div>
              <h2 className="text-lg font-medium mb-4">How would you like to add your profile?</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setBranch('self')
                    next()
                  }}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    branch === 'self'
                      ? 'border-gray-800 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-2">★</div>
                  <div className="font-medium">Submit my own</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Add yourself to the directory
                  </div>
                </button>
                <button
                  onClick={() => {
                    setBranch('nominate')
                    next()
                  }}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    branch === 'nominate'
                      ? 'border-gray-800 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-2">☆</div>
                  <div className="font-medium">Nominate someone</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Recommend a leader
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-lg font-medium mb-4">Tell us about yourself</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First name
                    </label>
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last name
                    </label>
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role / Title
                  </label>
                  <input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Chief Digital Health Officer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organisation
                  </label>
                  <input
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Short bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Brief description of your work in digital health..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-lg font-medium mb-4">Select your areas of expertise</h2>
              <p className="text-sm text-gray-500 mb-3">
                Choose up to 5 topics that best describe your work
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {EXPERTISE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleExpertise(tag)}
                    disabled={
                      !expertise.includes(tag) && expertise.length >= 5
                    }
                    className={`px-3 py-1.5 border rounded-full text-sm font-medium transition-colors ${
                      expertise.includes(tag)
                        ? 'border-gray-800 bg-gray-800 text-white'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400 disabled:opacity-40'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn profile (optional)
                </label>
                <input
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-lg font-medium mb-4">Review your submission</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Name</span>
                  <span className="font-medium">
                    {firstName} {lastName}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Role</span>
                  <span className="font-medium">{role}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Organisation</span>
                  <span className="font-medium">{org}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Bio</span>
                  <span className="font-medium max-w-[200px] truncate">
                    {bio}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Expertise</span>
                  <span className="font-medium">
                    {expertise.join(', ')}
                  </span>
                </div>
                {linkedin && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">LinkedIn</span>
                    <span className="font-medium">{linkedin}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t">
                <h3 className="font-medium mb-3">Consent</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Your profile will be visible in the public directory and shared for Transform Health communications.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setConsent(true)}
                    className={`p-3 border-2 rounded-lg text-center transition-colors ${
                      consent === true
                        ? 'border-gray-800 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-medium">Yes, proceed</div>
                    <div className="text-xs text-gray-500">
                      Add my profile
                    </div>
                  </button>
                  <button
                    onClick={() => setConsent(false)}
                    className={`p-3 border-2 rounded-lg text-center transition-colors ${
                      consent === false
                        ? 'border-red-600 bg-red-50'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-medium">No, thanks</div>
                    <div className="text-xs text-gray-500">
                      Remove my data
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="text-center py-4">
              {status === 'error' && (
                <div className="text-red-600 mb-4">
                  Error submitting. Please try again.
                </div>
              )}
              <button
                onClick={submit}
                disabled={status === 'submitting'}
                className="px-6 py-2.5 bg-gray-800 text-white rounded-full font-medium hover:bg-gray-700 disabled:opacity-50"
              >
                {status === 'submitting' ? 'Submitting...' : 'Submit Profile'}
              </button>
            </div>
          )}

          <div className="flex justify-between mt-6 pt-4 border-t">
            <button
              onClick={back}
              disabled={step === 1}
              className="px-4 py-2 border border-gray-300 rounded-full text-sm font-medium disabled:opacity-40 hover:border-gray-400"
            >
              ← Back
            </button>
            {step < 5 && (
              <button
                onClick={next}
                disabled={
                  (step === 2 && (!firstName || !lastName || !role || !org)) ||
                  (step === 4 && consent === null)
                }
                className="px-4 py-2 bg-gray-800 text-white rounded-full text-sm font-medium disabled:opacity-50 hover:bg-gray-700"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}