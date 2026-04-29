import React, { useState } from 'react'
import axios from 'axios'
import { storage } from '../firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { compressImage } from '../utils/compressImage'

const EXPERTISE_TAGS = [
  'AI & Automation',
  'Digital health policy',
  'Health financing',
  'Health systems',
  'Data & analytics',
  'mHealth',
  'Telemedicine',
  'Research',
  'Health information systems',
  'Health systems strengthening',
  'Digital health strategy',
  'Digital health advocacy',
  'Digital health innovation',
  'Digital health transformation',
  'Digital health philanthropy',
  'Health workforce',
]

const COUNTRIES = [
  'Kenya', 'Nigeria', 'South Africa', 'Tanzania', 'Uganda', 'Ghana',
  'Ethiopia', 'Rwanda', 'Senegal', 'India', 'Brazil', 'Malaysia',
  'United States', 'United Kingdom', 'France', 'Switzerland',
  'Germany', 'Australia', 'Japan', 'China',
]

export default function Submit({ onManageProfile }) {
  const [step, setStep] = useState(0)
  const [branch, setBranch] = useState('self')
  const [nominateLink, setNominateLink] = useState('')
  const [consent, setConsent] = useState(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState('')
  const [org, setOrg] = useState('')
  const [expertise, setExpertise] = useState([])
  const [geoScope, setGeoScope] = useState('')
  const [country, setCountry] = useState('')
  const [bio, setBio] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoName, setPhotoName] = useState('')
  const [status, setStatus] = useState('')

  const wordCount = bio.trim() ? bio.trim().split(/\s+/).length : 0

  function goStep(n) {
    if (n >= 0 && n <= 5) setStep(n)
  }

  function selectBranch(b) {
    setBranch(b)
  }

  function handleStep0Continue() {
    if (branch === 'nominate' && nominateLink) {
      goStep(5)
      return
    }
    goStep(1)
  }

  function handleConsent() {
    if (consent === 'no') {
      goStep(-1)
    } else if (consent === 'yes') {
      goStep(2)
    }
  }

  function toggleExpertise(tag) {
    if (expertise.includes(tag)) {
      setExpertise(expertise.filter((e) => e !== tag))
    } else if (expertise.length < 3) {
      setExpertise([...expertise, tag])
    }
  }

  function bioWordWarning() {
    return wordCount > 0 && (wordCount < 100 || wordCount > 150)
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return

    try {
      const compressed = await compressImage(file)
      setPhoto(compressed)
      setPhotoName(compressed.name + ' (' + Math.round(compressed.size / 1024) + 'KB)')
      const reader = new FileReader()
      reader.onload = (ev) => setPhotoPreview(ev.target.result)
      reader.readAsDataURL(compressed)
    } catch (err) {
      console.error('Compression failed:', err)
    }
  }

  async function uploadPhoto(file) {
    const fileName = Date.now() + '-' + file.name.replace(/\s+/g, '-')
    const storageRef = ref(storage, 'profile-photos/' + fileName)
    const snapshot = await uploadBytes(storageRef, file)
    return getDownloadURL(snapshot.ref)
  }

  function resetForm() {
    setFirstName('')
    setLastName('')
    setRole('')
    setOrg('')
    setExpertise([])
    setGeoScope('')
    setCountry('')
    setBio('')
    setLinkedin('')
    setPhoto(null)
    setPhotoPreview(null)
    setPhotoName('')
    setConsent(null)
    setStep(0)
    setStatus('')
  }

  async function submit() {
    setStatus('submitting')
    try {
      let photoUrl = ''
      if (photo) {
        const hasFirebase = import.meta.env.VITE_FIREBASE_API_KEY
        if (hasFirebase) {
          photoUrl = await uploadPhoto(photo)
        }
      }

      const url = import.meta.env.VITE_APPS_SCRIPT_URL || ''
      if (!url) {
        setTimeout(() => setStatus('submitted'), 1000)
        return
      }

      const payload = {
        branch,
        firstName,
        lastName,
        role,
        organisation: org,
        expertise: expertise.join(', '),
        geoScope,
        country: geoScope === 'national' ? country : '',
        bio,
        linkedin,
        photoUrl,
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

  if (step === -1) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center max-w-md">
          <div className="text-4xl mb-4">🙏</div>
          <h2 className="text-xl font-semibold text-gray-500 mb-2">
            Thank you. We cannot proceed without consent.
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            If you change your mind, you're welcome to return and submit anytime.
          </p>
          <button
            onClick={() => goStep(1)}
            className="px-4 py-2 border border-gray-300 rounded-full text-sm font-medium hover:border-gray-400"
          >
            ← Go back
          </button>
        </div>
      </div>
    )
  }

  if (status === 'submitted') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center max-w-md">
          <div className="text-4xl mb-4">🌍</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Thank you for contributing to the Transform Health Women Leaders in Digital Health Database
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Your submission helps advance gender equity and representation in digital health leadership.
          </p>
          <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded text-left space-y-1 mb-6">
            <p className="font-medium text-gray-800">Confirmation email sent to your inbox</p>
            <p>Your email includes:</p>
            <ul className="list-disc ml-4 text-xs text-gray-500">
              <li>"Update your profile anytime here" — a direct link to edit</li>
              <li>A follow-up survey link to share additional feedback</li>
            </ul>
            <p className="text-xs text-gray-400 mt-2">The Transform Health team will review your profile before it goes live.</p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800"
            >
              Submit another
            </button>
          </div>
        </div>
      </div>
    )
  }

  const stepLabels = ['Start', 'Consent', 'Basic Info', 'Profile', 'Links']

  const nextDisabled =
    (step === 2 && (!firstName || !lastName || !role || !org)) ||
    (step === 3 && (expertise.length === 0 || !bio || !geoScope)) ||
    (step === 3 && geoScope === 'national' && !country)

  return (
    <div style={{ background: 'rgb(255, 255, 244)' }}>
      <div className="max-w-4xl mx-auto px-6 py-6">
        {step >= 1 && step <= 4 && (
          <div className="mb-6">
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3, 4].map((s) => (
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
                    {s < step ? '✓' : s + 1}
                  </div>
                  <div
                    className={`flex-1 h-0.5 ${s < step ? 'bg-gray-800' : 'bg-gray-200'} ${s === 4 ? 'hidden' : ''}`}
                  />
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              {stepLabels.map((label, i) => (
                <span key={i}>{label}</span>
              ))}
            </div>
          </div>
        )}

          <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8">
          {step === 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Women Leaders in Digital Health Database
              </h2>
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-sm text-gray-600 leading-relaxed mb-5">
                <p className="mb-3">
                  Transform Health is building a global database of women leaders in digital health to increase visibility, representation, and engagement in leadership, policy, and technical spaces. This takes forward recommendations from the Transform Health policy brief <em>"Establishing Gender Equitable Foundations for Digital Health Transformation to Advance Universal Health Coverage"</em> launched in 2024 to mainstream gender in digital health.
                </p>
                <p>
                  Information submitted through this form may be featured in a publicly accessible database. By consenting, you agree that your profile information including your name, role, organisation, biography, and relevant links may be publicly displayed. <strong>Your email address will not be publicly displayed.</strong>
                </p>
              </div>

              <p className="text-xs text-gray-500 mb-4">
                You can <strong className="text-[#F85A8E]">submit your profile</strong> or <strong>nominate another woman leader</strong>. ⏱️ This form takes 3–5 minutes.
              </p>

              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
                Are you adding yourself or nominating someone else? *
              </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                  <button
                    onClick={() => selectBranch('self')}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      branch === 'self'
                        ? 'border-[#F85A8E] bg-pink-50'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-2">👤</div>
                    <div className="font-medium text-sm">I am nominating myself</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Submit your own profile
                    </div>
                  </button>
                  <button
                    onClick={() => selectBranch('nominate')}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      branch === 'nominate'
                        ? 'border-[#F85A8E] bg-pink-50'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-2">🌟</div>
                    <div className="font-medium text-sm">I am nominating someone else</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Nominate another woman leader
                    </div>
                  </button>
              </div>

              {branch === 'nominate' && (
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Public profile link of the person you are nominating *
                  </label>
                  <p className="text-xs text-gray-400 mb-2">e.g. LinkedIn URL or professional website</p>
                  <input
                    value={nominateLink}
                    onChange={(e) => setNominateLink(e.target.value)}
                    placeholder="https://linkedin.com/in/…"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 text-sm"
                  />
                </div>
              )}

              <div className="flex justify-end mt-4">
                <button
                  onClick={handleStep0Continue}
                  className="px-6 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                >
                  {branch === 'nominate' ? 'Submit nomination →' : 'Continue →'}
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-gray-100 text-gray-700 mb-4">
                {branch === 'self' ? '👤 Adding myself' : '🌟 Nominating someone'}
              </span>
              <h2 className="text-lg font-medium mb-3">Consent & Permissions</h2>

              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-5">
                <p className="text-sm font-medium text-gray-800 mb-2">
                  Do you consent to your information being included in the Transform Health Women Leaders Database?
                </p>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  Your name, role, organisation, areas of expertise, bio, and LinkedIn will be <strong>publicly visible</strong>. Your email address will <strong>never</strong> be published and is used only for follow-up and profile updates.
                </p>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   <button
                    onClick={() => setConsent('yes')}
                    className={`p-3 border-2 rounded-md text-center text-sm font-medium transition-colors ${
                      consent === 'yes'
                        ? 'border-gray-900 bg-gray-50 text-gray-900'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    ✓ Yes, I consent
                  </button>
                  <button
                    onClick={() => setConsent('no')}
                    className={`p-3 border-2 rounded-md text-center text-sm font-medium transition-colors ${
                      consent === 'no'
                        ? 'border-red-600 bg-red-50 text-red-600'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    ✕ No
                  </button>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={() => goStep(0)}
                  className="px-4 py-2 border border-gray-300 rounded-full text-sm font-medium hover:border-gray-400"
                >
                  ← Back
                </button>
                <button
                  onClick={handleConsent}
                  disabled={consent === null}
                  className="px-6 py-2 bg-gray-900 text-white rounded-full text-sm font-medium disabled:opacity-50 hover:bg-gray-800"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-gray-100 text-gray-700 mb-4">
                {branch === 'self' ? '👤 Adding myself' : '🌟 Nominating someone'}
              </span>
              <h2 className="text-lg font-medium mb-4">Basic Information</h2>
              <div className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      First Name *
                    </label>
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Your first name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Last Name *
                    </label>
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Your last name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Job Title / Role *
                  </label>
                  <input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Chief Digital Health Officer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Organisation *
                  </label>
                  <input
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    placeholder="e.g. Ministry of Health, Kenya"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Your photo
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        '👤'
                      )}
                    </div>
                    <div>
                      <label className="inline-block px-4 py-2 border border-gray-900 rounded-full text-xs font-semibold text-gray-900 cursor-pointer hover:bg-gray-50">
                        Upload photo
                        <input
                          type="file"
                          accept="image/png,image/jpeg"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                      {photoName && (
                        <p className="text-xs text-gray-400 mt-1.5">{photoName}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">JPEG or PNG, max 5MB — auto-compressed before upload</p>
                </div>
              </div>

              <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => goStep(1)}
                  className="px-4 py-2 border border-gray-300 rounded-full text-sm font-medium hover:border-gray-400"
                >
                  ← Back
                </button>
                <button
                  onClick={() => goStep(3)}
                  disabled={!firstName || !lastName || !role || !org}
                  className="px-6 py-2 bg-gray-900 text-white rounded-full text-sm font-medium disabled:opacity-50 hover:bg-gray-800"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-gray-100 text-gray-700 mb-4">
                {branch === 'self' ? '👤 Adding myself' : '🌟 Nominating someone'}
              </span>
              <h2 className="text-lg font-medium mb-4">Profile Details</h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Areas of expertise * <span className="normal-case tracking-normal text-gray-400 font-normal">(select up to 3)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {EXPERTISE_TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleExpertise(tag)}
                        disabled={
                          !expertise.includes(tag) && expertise.length >= 3
                        }
                        className={`px-3 py-1.5 border rounded-full text-xs font-medium transition-colors ${
                          expertise.includes(tag)
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-300 text-gray-600 hover:border-gray-400 disabled:opacity-40'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">
                    {expertise.length} of 3 selected
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Geographic scope *
                  </label>
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => setGeoScope(geoScope === 'global' ? '' : 'global')}
                      className={`px-3 py-1.5 border rounded-full text-xs font-medium transition-colors ${
                        geoScope === 'global'
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {geoScope === 'global' ? '✓ ' : ''}Global / Multicountry
                    </button>
                    <button
                      onClick={() => setGeoScope(geoScope === 'national' ? '' : 'national')}
                      className={`px-3 py-1.5 border rounded-full text-xs font-medium transition-colors ${
                        geoScope === 'national'
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {geoScope === 'national' ? '✓ ' : ''}National
                    </button>
                  </div>
                  {geoScope === 'national' && (
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-400"
                    >
                      <option value="">Select country…</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Short bio * <span className="normal-case tracking-normal text-gray-400 font-normal">(100–150 words)</span>
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Brief description of your work in digital health…"
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none text-sm resize-none ${
                      bioWordWarning()
                        ? 'border-red-300 focus:border-red-400'
                        : 'border-gray-300 focus:border-gray-400'
                    }`}
                  />
                  <div className="flex gap-3 mt-1.5">
                    <span className="text-xs text-gray-400">{wordCount} words</span>
                    {bioWordWarning() && (
                      <span className="text-xs text-red-500">
                        Please keep bio between 100–150 words.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => goStep(2)}
                  className="px-4 py-2 border border-gray-300 rounded-full text-sm font-medium hover:border-gray-400"
                >
                  ← Back
                </button>
                <button
                  onClick={() => goStep(4)}
                  disabled={nextDisabled}
                  className="px-6 py-2 bg-gray-900 text-white rounded-full text-sm font-medium disabled:opacity-50 hover:bg-gray-800"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-gray-100 text-gray-700 mb-4">
                {branch === 'self' ? '👤 Adding myself' : '🌟 Nominating someone'}
              </span>
              <h2 className="text-lg font-medium mb-4">Visibility & Links</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    LinkedIn profile or professional website
                  </label>
                  <input
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/…"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => goStep(3)}
                  className="px-4 py-2 border border-gray-300 rounded-full text-sm font-medium hover:border-gray-400"
                >
                  ← Back
                </button>
                <button
                  onClick={submit}
                  disabled={status === 'submitting'}
                  className="px-6 py-2 bg-gray-900 text-white rounded-full text-sm font-medium disabled:opacity-50 hover:bg-gray-800"
                >
                  {status === 'submitting' ? 'Submitting...' : 'Submit Profile →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
