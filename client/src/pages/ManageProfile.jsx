import React, { useState } from "react";
import { api } from "../api/leaders";

const INPUT_CLASS = "w-full px-[1.6rem] py-5 border-[1.5px] border-gray-300 rounded-lg text-1.5 outline-none bg-brand-blue-tint";
const LABEL_CLASS = "block text-1.5 text-brand-dark mb-2";
const NAV_CLASS  = "flex justify-between items-center pt-5 mt-2";
const BACK_CLASS = "bg-transparent border-0 cursor-pointer text-1.4 font-bold text-brand-dark inline-flex items-center gap-2 tracking-[0.06em] uppercase";

function ContinueBtn({ disabled, onClick, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`bg-transparent border-0 text-1.4 font-bold tracking-[0.06em] uppercase inline-flex items-center gap-2 ${
        disabled ? "cursor-not-allowed text-gray-300" : "cursor-pointer text-brand-orange"
      }`}
    >
      {children}
    </button>
  );
}

export default function ManageProfile({ prefill, onBack }) {
  const isVerified = prefill?._verified === true;

  const [step, setStep] = useState(isVerified ? "edit" : "identify");
  const [requestType, setRequestType] = useState("");
  const [firstName, setFirstName] = useState(prefill?.first_name || "");
  const [lastName, setLastName] = useState(prefill?.last_name || "");
  const [email, setEmail] = useState("");
  const [linkedin, setLinkedin] = useState(prefill?.linkedin || "");
  const [changes, setChanges] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("");
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [foundProfile, setFoundProfile] = useState(null);

  async function lookupProfile() {
    if (!firstName.trim() || !lastName.trim()) return;
    setLinkLoading(true);
    setLinkError("");
    setNotFound(false);
    setFoundProfile(null);
    try {
      const all = await api.getLeaders("live");
      const fn = firstName.trim().toLowerCase();
      const ln = lastName.trim().toLowerCase();
      const linkedinUrl = linkedin.trim().toLowerCase();
      
      // Primary: exact name match
      let match = all.find(
        (l) =>
          String(l.first_name || "").toLowerCase() === fn &&
          String(l.last_name  || "").toLowerCase() === ln
      );
      
      // Fallback 1: LinkedIn URL match
      if (!match && linkedinUrl) {
        match = all.find(
          (l) => String(l.linkedin || "").toLowerCase().includes(linkedinUrl.replace(/\/$/, ""))
        );
      }
      
      // Fallback 2: Partial name match (first name + last name contains search term)
      if (!match) {
        match = all.find(
          (l) =>
            (String(l.first_name || "").toLowerCase().includes(fn) ||
             String(l.last_name || "").toLowerCase().includes(ln)) &&
            (String(l.first_name || "").toLowerCase().includes(fn.split(" ")[0]) ||
             String(l.last_name || "").toLowerCase().includes(ln.split(" ")[0]))
        );
      }
      
      if (match) setFoundProfile(match);
      else setNotFound(true);
    } catch (err) {
      console.error("Profile lookup error:", err);
      setNotFound(true);
    } finally {
      setLinkLoading(false);
    }
  }

  function back() {
    if (step === "edit" || step === "remove") setStep("identify");
    else onBack();
  }

  async function submit() {
    // Validate email is not empty
    if (!email.trim()) {
      setStatus("error");
      setLinkError("Email address is required");
      return;
    }
    
    setStatus("submitting");
    try {
      await api.submitRequest({
        requestType,
        firstName: (foundProfile?.first_name || firstName).trim(),
        lastName: (foundProfile?.last_name || lastName).trim(),
        email: email.trim(),
        linkedin: (foundProfile?.linkedin || linkedin).trim(),
        changes: requestType === "update" ? changes.trim() : null,
        reason: requestType === "delete" ? reason.trim() : null,
        leaderId: foundProfile?.id || null,
      });
      setStatus("submitted");
    } catch (err) {
      console.error("Submit error:", err);
      setStatus("error");
      setLinkError("Failed to submit request. Please try again.");
    }
  }

  if (status === "submitted") {
    return (
      <div className="bg-brand-cream min-h-[60vh] flex items-center justify-center p-6 font-sans">
        <div className="text-center max-w-[420px]">
          <div className="text-[4.8rem] mb-4">
            {requestType === "delete" ? "✓" : "★"}
          </div>
          <h2 className="text-3xl font-bold text-brand-navy mb-3">
            Request received
          </h2>
          <p className="text-1.5 text-gray-600 leading-[1.7] mb-5">
            {requestType === "delete"
              ? "Your removal request has been sent. The admin team will process it shortly."
              : "Your update request has been sent. The admin team will review and apply the changes shortly."}
          </p>
          <p className="text-1.3 text-gray-400">
            You'll be notified by email at {email}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-cream font-sans">
      <div className="max-w-[640px] mx-auto px-6 py-8">
        {step === "identify" && (
          <div>
            <h2 className="text-[2.6rem] font-bold text-brand-navy mb-2">
              Manage your profile
            </h2>
            <p className="text-1.4 text-gray-600 leading-[1.7] mb-7">
              Enter your details to find and update or remove your profile from
              the database.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className={LABEL_CLASS}>First name</label>
                <input
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setNotFound(false);
                  }}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Last name</label>
                <input
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    setNotFound(false);
                  }}
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            <div className="mb-5">
              <label className={LABEL_CLASS}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="We'll send your profile link here — not stored"
                required
                className={INPUT_CLASS}
              />
            </div>

            <div className="mb-6">
              <label className={LABEL_CLASS}>
                LinkedIn profile{" "}
                <span className="text-1.3 text-gray-400 font-normal">
                  (optional — helps us find you)
                </span>
              </label>
              <input
                value={linkedin}
                onChange={(e) => {
                  setLinkedin(e.target.value);
                  setNotFound(false);
                }}
                className={INPUT_CLASS}
              />
            </div>

            {notFound && (
              <div className="border-l-4 border-gray-300 bg-gray-50 rounded-lg px-7 py-5 mb-5">
                <p className="text-1.4 font-semibold text-brand-dark mb-1">
                  Profile not found
                </p>
                <p className="text-1.3 text-gray-500">
                  We couldn't find a profile matching those details. Try your
                  LinkedIn URL or contact the admin team.
                </p>
              </div>
            )}

            {foundProfile && (
              <div className="border-[1.5px] border-brand-navy rounded-lg px-5 py-4 mb-5 bg-brand-blue-tint">
                <p className="text-1.2 font-semibold text-brand-navy uppercase tracking-[0.06em] mb-2.5">
                  Profile found
                </p>
                <p className="text-1.5 font-bold text-brand-dark mb-1">
                  {foundProfile.first_name} {foundProfile.last_name}
                </p>
                <p className="text-1.3 text-gray-600">
                  {foundProfile.role} · {foundProfile.organisation}
                </p>
              </div>
            )}

            <div className={NAV_CLASS}>
              <button onClick={onBack} className={BACK_CLASS}>
                ← BACK
              </button>
              <ContinueBtn
                disabled={!firstName.trim() || !lastName.trim() || !email.trim() || linkLoading}
                onClick={lookupProfile}
              >
                {linkLoading ? "SEARCHING..." : "FIND MY PROFILE →"}
              </ContinueBtn>
            </div>

            {foundProfile && (
              <div className="mt-6 pt-5 border-t border-gray-200">
                {!email.trim() && (
                  <div className="border-l-4 border-red-300 bg-red-50 rounded-lg px-7 py-5 mb-5">
                    <p className="text-1.3 text-red-600 font-semibold">⚠ Email required</p>
                    <p className="text-1.2 text-red-500 mt-1">Please enter your email address to continue.</p>
                  </div>
                )}
                <p className="text-1.3 text-gray-500 mb-4 text-center">
                  What would you like to do?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      if (!email.trim()) return;
                      setRequestType("update");
                      setStep("edit");
                    }}
                    disabled={!email.trim()}
                    className={`px-4 py-5 rounded-lg border-[1.5px] border-brand-navy bg-white text-1.4 font-bold tracking-[0.04em] transition-colors ${
                      email.trim()
                        ? "text-brand-navy cursor-pointer hover:bg-brand-blue-tint"
                        : "text-gray-400 cursor-not-allowed opacity-50"
                    }`}
                  >
                    Update profile
                  </button>
                  <button
                    onClick={() => {
                      if (!email.trim()) return;
                      setRequestType("delete");
                      setStep("remove");
                    }}
                    disabled={!email.trim()}
                    className={`px-4 py-5 rounded-lg border-[1.5px] bg-white text-1.4 font-bold tracking-[0.04em] transition-colors ${
                      email.trim()
                        ? "border-red-500 text-red-500 cursor-pointer hover:bg-red-50"
                        : "border-gray-300 text-gray-400 cursor-not-allowed opacity-50"
                    }`}
                  >
                    Remove profile
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {(step === "edit" || step === "remove") && (
          <div>
            {foundProfile && (
              <div className="border-[1.5px] border-gray-300 rounded-lg px-7 py-5 mb-7 bg-brand-blue-tint">
                <p className="text-1.5 font-bold text-brand-dark mb-0.5">
                  {foundProfile.first_name} {foundProfile.last_name}
                </p>
                <p className="text-1.3 text-gray-600">
                  {foundProfile.role} · {foundProfile.organisation}
                </p>
              </div>
            )}

            {step === "edit" ? (
              <>
                <h2 className="text-[2.6rem] font-bold text-brand-navy mb-2">
                  Update your profile
                </h2>
                <p className="text-1.4 text-gray-600 leading-[1.7] mb-6">
                  Describe what you'd like to change — role, organisation, bio,
                  expertise, or LinkedIn.
                </p>

                {foundProfile && (
                  <div className="border-l-4 border-gray-300 bg-gray-50 rounded-lg px-7 py-5 mb-5">
                    <p className="text-1.2 text-gray-400 font-semibold uppercase tracking-[0.06em] mb-2">
                      Current details
                    </p>
                    {foundProfile.role && (
                      <p className="text-1.3 text-gray-600 mb-1">
                        <strong>Role:</strong> {foundProfile.role}
                      </p>
                    )}
                    {foundProfile.organisation && (
                      <p className="text-1.3 text-gray-600 mb-1">
                        <strong>Organisation:</strong>{" "}
                        {foundProfile.organisation}
                      </p>
                    )}
                    {foundProfile.bio && (
                      <p className="text-1.3 text-gray-600 mb-1">
                        <strong>Bio:</strong> {foundProfile.bio}
                      </p>
                    )}
                    {foundProfile.expertise && (
                      <p className="text-1.3 text-gray-600">
                        <strong>Expertise:</strong> {foundProfile.expertise}
                      </p>
                    )}
                  </div>
                )}

                <div className="mb-6">
                  <label className={LABEL_CLASS}>
                    What would you like to change?
                  </label>
                  <textarea
                    value={changes}
                    onChange={(e) => setChanges(e.target.value)}
                    placeholder="e.g. New role: Chief Digital Officer at WHO. Update bio to: ..."
                    rows={6}
                    className={`${INPUT_CLASS} resize-none`}
                  />
                </div>

                <div className={NAV_CLASS}>
                  <button onClick={back} className={BACK_CLASS}>
                    ← BACK
                  </button>
                  <ContinueBtn disabled={!changes} onClick={() => setStep("review")}>
                    REVIEW →
                  </ContinueBtn>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-[2.6rem] font-bold text-red-500 mb-2">
                  Remove your profile
                </h2>
                <p className="text-1.4 text-gray-600 leading-[1.7] mb-6">
                  Optional — let us know why. This helps us improve the
                  database.
                </p>

                <div className="mb-5">
                  <label className={LABEL_CLASS}>
                    Reason{" "}
                    <span className="text-1.3 text-gray-400 font-normal">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. No longer in this role, prefer not to be listed..."
                    rows={4}
                    className={`${INPUT_CLASS} resize-none`}
                  />
                </div>

                <div className="border-l-4 border-red-300 bg-red-50 rounded-lg px-7 py-5 mb-6">
                  <p className="text-1.3 text-gray-500">
                    Your profile will be removed from the public database after
                    admin review.
                  </p>
                </div>

                <div className={NAV_CLASS}>
                  <button onClick={back} className={BACK_CLASS}>
                    ← BACK
                  </button>
                  <ContinueBtn disabled={false} onClick={() => setStep("review")}>
                    REVIEW →
                  </ContinueBtn>
                </div>
              </>
            )}
          </div>
        )}

        {step === "review" && (
          <div>
            <h2 className="text-[2.6rem] font-bold text-brand-navy mb-7">
              Review your request
            </h2>

            {(foundProfile || firstName) && (
              <div className="border-[1.5px] border-gray-300 rounded-lg px-7 py-5 mb-5 bg-brand-blue-tint">
                <p className="text-1.5 font-bold text-brand-dark mb-0.5">
                  {foundProfile?.first_name || firstName}{" "}
                  {foundProfile?.last_name || lastName}
                </p>
                <p className="text-1.3 text-gray-400">{email}</p>
              </div>
            )}

            <div className="border-[1.5px] border-gray-300 rounded-lg overflow-hidden mb-6">
              <div className="flex justify-between items-center px-7 py-5 border-b border-gray-200">
                <span className="text-1.4 text-gray-500">Request type</span>
                <span
                  className={`text-1.3 font-bold ${
                    requestType === "delete" ? "text-red-500" : "text-brand-navy"
                  }`}
                >
                  {requestType === "delete"
                    ? "Remove profile"
                    : "Update profile"}
                </span>
              </div>
              {requestType === "update" && changes && (
                <div className="px-7 py-5">
                  <p className="text-1.3 text-gray-500 mb-1.5">
                    Changes requested
                  </p>
                  <p className="text-1.4 text-brand-dark leading-[1.6]">
                    {changes}
                  </p>
                </div>
              )}
              {requestType === "delete" && reason && (
                <div className="px-7 py-5">
                  <p className="text-1.3 text-gray-500 mb-1.5">Reason</p>
                  <p className="text-1.4 text-brand-dark leading-[1.6]">
                    {reason}
                  </p>
                </div>
              )}
            </div>

            {status === "error" && (
              <p className="text-1.3 text-red-500 mb-4">
                Something went wrong. Please try again.
              </p>
            )}

            <div className={NAV_CLASS}>
              <button
                onClick={() =>
                  setStep(requestType === "delete" ? "remove" : "edit")
                }
                className={BACK_CLASS}
              >
                ← BACK
              </button>
              <ContinueBtn
                disabled={status === "submitting"}
                onClick={submit}
              >
                {status === "submitting" ? "SUBMITTING..." : "SUBMIT REQUEST →"}
              </ContinueBtn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
