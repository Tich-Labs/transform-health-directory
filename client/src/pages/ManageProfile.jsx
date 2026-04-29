import React, { useState } from 'react'
import axios from 'axios'

export default function ManageProfile({ prefill, onBack }) {
  const isVerified = prefill?._verified === true

  const [step, setStep] = useState(1)
  const [requestType, setRequestType] = useState('')
  const [firstName, setFirstName] = useState(prefill?.first_name || '')
  const [lastName, setLastName] = useState(prefill?.last_name || '')
  const [email, setEmail] = useState('')
  const [linkedin, setLinkedin] = useState(prefill?.linkedin || '')
  const [changes, setChanges] = useState('')
  const [reason, setReason] = useState('')
  const [status, setStatus] = useState('')
  const [linkSent, setLinkSent] = useState(false)
  const [linkLoading, setLinkLoading] = useState(false)
  const [linkError, setLinkError] = useState('')

  async function requestMagicLink() {
    if (!firstName || !lastName || !email) return
    setLinkLoading(true)
    setLinkError('')
    try {
      const url = import.meta.env.VITE_APPS_SCRIPT_URL || ''
      if (!url) {
        setLinkSent(true)
        return
      }
      const r = await axios.post(
        url,
        { action: 'sendProfileLink', firstName, lastName, email, linkedin },
        { headers: { 'Content-Type': 'application/json' } }
      )
      if (r.data?.ok) {
        setLinkSent(true)
      } else if (r.data?.error === 'not_found') {
        setLinkError("We couldn't find a profile matching that name. Check the spelling or add your LinkedIn URL below.")
      } else {
        setLinkError('Something went wrong. Please try again.')
      }
    } catch (err) {
      console.error(err)
      setLinkError('Something went wrong. Please try again.')
    } finally {
      setLinkLoading(false)
    }
  }

  function next() {
    if (step < 4) setStep(step + 1)
  }

  function back() {
    if (step > 1) setStep(step - 1)
    else onBack()
  }

  async function submit() {
    setStatus('submitting')
    try {
      const url = import.meta.env.VITE_APPS_SCRIPT_URL || ''
      if (!url) {
        setTimeout(() => setStatus('submitted'), 1000)
        return
      }
      const payload = {
        action: 'profileRequest',
        requestType,
        firstName,
        lastName,
        email,
        linkedin,
        changes: requestType === 'update' ? changes : '',
        reason: requestType === 'delete' ? reason : '',
      }
      const r = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
      })
      if (r.data?.ok) setStatus('submitted')
      else setStatus('error')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  if (status === 'submitted') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center max-w-md">
          <div className="text-4xl mb-4">{requestType === 'delete' ? '✓' : '★'}</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Request received</h2>
          <p className="text-gray-600 mb-4">
            {requestType === 'delete'
              ? 'Your removal request has been sent. The admin team will process it shortly.'
              : 'Your update request has been sent. The admin team will review and apply the changes shortly.'}
          </p>
          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
            You'll be notified by email at {email}
          </div>
        </div>
      </div>
    )
  }

  const stepLabels = [
    'Type',
    'Your details',
    requestType === 'delete' ? 'Reason' : 'Changes',
    'Review',
  ]

  const nextDisabled =
    (step === 2 && (!firstName || !lastName || !email)) ||
    (step === 3 && requestType === 'update' && !changes)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Update or Remove My Profile
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

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {step === 1 && (
            <div>
              <h2 className="text-lg font-medium mb-4">What would you like to do?</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setRequestType('update'); next() }}
                  className="p-4 border-2 border-gray-200 rounded-lg text-center hover:border-gray-400 transition-colors"
                >
                  <div className="text-2xl mb-2">✎</div>
                  <div className="font-medium">Update my profile</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Change my role, bio, or details
                  </div>
                </button>
                <button
                  onClick={() => { setRequestType('delete'); next() }}
                  className="p-4 border-2 border-gray-200 rounded-lg text-center hover:border-red-300 transition-colors"
                >
                  <div className="text-2xl mb-2">✕</div>
                  <div className="font-medium">Remove me</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Remove my profile from the database
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 2 && linkSent ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">✉</div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Check your inbox</h2>
              <p className="text-gray-600 text-sm mb-4">
                We've sent a link to <span className="font-medium">{email}</span>. Click it to open your profile with all your current details pre-filled, ready to edit.
              </p>
              <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded">
                The link can only be used once. If you don't see it, check your spam folder.
              </div>
              <button
                onClick={() => setLinkSent(false)}
                className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Wrong email? Try again
              </button>
            </div>
          ) : step === 2 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-medium">Confirm your details</h2>
                {isVerified && (
                  <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    ✓ Verified via email
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-4">
                So we can locate your profile in the database.
              </p>
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
                    Email address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="For admin to contact you"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn profile (optional)
                  </label>
                  <input
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400"
                  />
                </div>

                {!isVerified && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">
                      Want to see your current profile details before editing?
                    </p>
                    {linkError && (
                      <p className="text-xs text-red-600 mb-2">{linkError}</p>
                    )}
                    <button
                      type="button"
                      onClick={requestMagicLink}
                      disabled={linkLoading || !firstName || !lastName || !email}
                      className="w-full px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-full hover:border-gray-400 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                    >
                      {linkLoading ? 'Sending...' : 'Send my profile to this email →'}
                    </button>
                    <p className="text-xs text-gray-400 mt-1.5 text-center">
                      Or fill in your changes below and submit directly
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && requestType === 'update' && (
            <div>
              <h2 className="text-lg font-medium mb-1">What needs to change?</h2>
              <p className="text-sm text-gray-500 mb-4">
                Describe what you'd like updated — role, organisation, bio, expertise, or LinkedIn.
              </p>
              {isVerified && prefill && !changes && (
                <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 space-y-1">
                  <p className="font-medium text-gray-500 mb-1">Current profile:</p>
                  <p><span className="font-medium">Role:</span> {prefill.role || '—'}</p>
                  <p><span className="font-medium">Organisation:</span> {prefill.organisation || '—'}</p>
                  <p><span className="font-medium">Bio:</span> {prefill.bio || '—'}</p>
                  <p><span className="font-medium">Expertise:</span> {prefill.expertise || '—'}</p>
                </div>
              )}
              <textarea
                value={changes}
                onChange={(e) => setChanges(e.target.value)}
                placeholder="e.g. New role: Chief Digital Officer at WHO. Update bio to: ..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 resize-none"
              />
            </div>
          )}

          {step === 3 && requestType === 'delete' && (
            <div>
              <h2 className="text-lg font-medium mb-1">Reason for removal</h2>
              <p className="text-sm text-gray-500 mb-4">
                Optional — helps us improve the database.
              </p>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. No longer in this role, prefer not to be listed..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 resize-none"
              />
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                Your profile will be removed from the public database after admin review.
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-lg font-medium mb-4">Review your request</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Request type</span>
                  <span
                    className={`font-medium px-2 py-0.5 rounded-full text-xs ${
                      requestType === 'delete'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {requestType === 'delete' ? 'Remove profile' : 'Update profile'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Name</span>
                  <span className="font-medium">
                    {firstName} {lastName}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium">{email}</span>
                </div>
                {linkedin && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">LinkedIn</span>
                    <span className="font-medium truncate max-w-[200px]">{linkedin}</span>
                  </div>
                )}
                {requestType === 'update' && changes && (
                  <div className="py-2 border-b">
                    <span className="text-gray-500 block mb-1">Requested changes</span>
                    <p className="text-gray-700 text-xs bg-gray-50 p-2 rounded">{changes}</p>
                  </div>
                )}
                {requestType === 'delete' && reason && (
                  <div className="py-2 border-b">
                    <span className="text-gray-500 block mb-1">Reason</span>
                    <p className="text-gray-700 text-xs bg-gray-50 p-2 rounded">{reason}</p>
                  </div>
                )}
              </div>

              {status === 'error' && (
                <div className="mt-4 text-red-600 text-sm">
                  Error submitting. Please try again.
                </div>
              )}

              <button
                onClick={submit}
                disabled={status === 'submitting'}
                className={`w-full mt-6 px-6 py-2.5 rounded-full font-medium text-sm disabled:opacity-50 transition-colors ${
                  requestType === 'delete'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                {status === 'submitting'
                  ? 'Submitting...'
                  : requestType === 'delete'
                    ? 'Submit removal request'
                    : 'Submit update request'}
              </button>
            </div>
          )}

          {step < 4 && (
            <div className="flex justify-between mt-6 pt-4 border-t">
              <button
                onClick={back}
                className="px-4 py-2 border border-gray-300 rounded-full text-sm font-medium hover:border-gray-400"
              >
                ← Back
              </button>
              {step > 1 && (
                <button
                  onClick={next}
                  disabled={nextDisabled}
                  className="px-4 py-2 bg-gray-800 text-white rounded-full text-sm font-medium disabled:opacity-50 hover:bg-gray-700"
                >
                  Next →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
