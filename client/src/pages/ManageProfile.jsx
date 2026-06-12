import React, { useState, useEffect } from "react";
import { api } from "../api/leaders";

const INPUT_CLASS =
  "w-full px-[1.6rem] py-5 border-[1.5px] border-gray-300 rounded-lg text-1.5 outline-none bg-brand-blue-tint";
const LABEL_CLASS = "block text-1.5 text-brand-dark mb-2";
const NAV_CLASS = "flex justify-between items-center pt-5 mt-2";
const BACK_CLASS =
  "bg-transparent border-0 cursor-pointer text-1.4 font-bold text-brand-dark inline-flex items-center gap-2 tracking-[0.06em] uppercase";

function ContinueBtn({ disabled, onClick, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`bg-transparent border-0 text-1.4 font-bold tracking-[0.06em] uppercase inline-flex items-center gap-2 ${
        disabled
          ? "cursor-not-allowed text-gray-300"
          : "cursor-pointer text-brand-orange"
      }`}
    >
      {children}
    </button>
  );
}

export default function ManageProfile({ prefill, onBack, fromMagicLink, tokenMode }) {
  const isMagicLink = !!fromMagicLink;

  // Mode A: send-link flow
  const [step, setStep] = useState("identify");
  const [firstName, setFirstName] = useState(prefill?.first_name || "");
  const [lastName, setLastName] = useState(prefill?.last_name || "");
  const [email, setEmail] = useState("");
  const [linkedin, setLinkedin] = useState(prefill?.linkedin || "");
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [foundProfile, setFoundProfile] = useState(null);
  const [selectedMode, setSelectedMode] = useState("");

  // Mode B: magic-link landing flow
  const [leaderData, setLeaderData] = useState(null);
  const [leaderLoading, setLeaderLoading] = useState(isMagicLink);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editOrg, setEditOrg] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editLinkedin, setEditLinkedin] = useState("");
  const [editExpertise, setEditExpertise] = useState("");
  const [editPhoto, setEditPhoto] = useState(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState(null);
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [fallbackUrl, setFallbackUrl] = useState("");

  useEffect(() => {
    if (isMagicLink && fromMagicLink?.leaderId) {
      api.getLeaderById(fromMagicLink.leaderId)
        .then((data) => {
          if (!data) throw new Error("Profile not found");
          setLeaderData(data);
          setEditFirstName(data.first_name || "");
          setEditLastName(data.last_name || "");
          setEditRole(data.role || "");
          setEditOrg(data.organisation || "");
          setEditBio(data.bio || "");
          setEditLinkedin(data.linkedin || "");
          const exp = Array.isArray(data.expertise)
            ? data.expertise.join(", ")
            : data.expertise || "";
          setEditExpertise(exp);
          setStep(tokenMode === "delete" ? "delete-magic" : "edit-magic");
        })
        .catch((err) => {
          console.error("Failed to fetch leader:", err);
          setStatus("error");
          setErrorMsg(
            "Could not load your profile. The link may be invalid or expired."
          );
        })
        .finally(() => setLeaderLoading(false));
    }
  }, []);

  async function lookupProfile() {
    if (!firstName.trim() || !lastName.trim()) return;
    setLinkLoading(true);
    setLinkError("");
    setNotFound(false);
    setFoundProfile(null);
    try {
      const match = await api.findLeader({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      });
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
    if (isMagicLink) {
      onBack();
      return;
    }
    if (step === "send-link") {
      setSelectedMode("");
      setStep("identify");
    } else {
      onBack();
    }
  }

  async function sendMagicLink() {
    if (!foundProfile) return;
    setLinkLoading(true);
    setLinkError("");
    try {
      const result = await api.requestManage({
        leaderId: foundProfile.id,
        firstName: foundProfile.first_name,
        lastName: foundProfile.last_name,
        linkedin: foundProfile.linkedin || "",
        photo_url: foundProfile.photo_url || "",
        expertise: foundProfile.expertise || [],
        mode: selectedMode,
      });
      if (result.ok) {
        setStep("sent");
      } else {
        setStep("sent");
        setErrorMsg(result.message || "Email service unavailable.");
        setFallbackUrl(result.url || "");
      }
    } catch (err) {
      setLinkError("Failed to send magic link. Please try again.");
    } finally {
      setLinkLoading(false);
    }
  }

  async function saveViaMagicLink() {
    if (!leaderData) return;
    setStatus("submitting");
    setErrorMsg("");
    try {
      if (tokenMode === "delete") {
        await api.deleteByLeader(leaderData.id, reason.trim() || null);
        await api.logSelfService({
          leaderId: leaderData.id,
          firstName: leaderData.first_name,
          lastName: leaderData.last_name,
          action: "delete",
          details: reason.trim() || null,
        });
        await api.notifyAdmin({
          subject: "Profile deleted (self-service)",
          html: `<p>${leaderData.first_name} ${leaderData.last_name} has removed their profile from the Transform Health Women Leaders Directory.</p>${
            reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""
          }`,
        });
      } else {
        const updates = {};
        if (editFirstName !== (leaderData.first_name || ""))
          updates.first_name = editFirstName || null;
        if (editLastName !== (leaderData.last_name || ""))
          updates.last_name = editLastName || null;
        if (editRole !== (leaderData.role || ""))
          updates.role = editRole || null;
        if (editOrg !== (leaderData.organisation || ""))
          updates.organisation = editOrg || null;
        if (editBio !== (leaderData.bio || ""))
          updates.bio = editBio || null;
        if (editLinkedin !== (leaderData.linkedin || ""))
          updates.linkedin = editLinkedin || null;
        const newExp = editExpertise
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const oldExp = Array.isArray(leaderData.expertise)
          ? leaderData.expertise
          : [];
        if (JSON.stringify(newExp) !== JSON.stringify(oldExp))
          updates.expertise = newExp;

        if (editPhoto) {
          try {
            const photoUrl = await api.uploadPhoto(editPhoto);
            updates.photo_url = photoUrl;
          } catch (e) {
            console.error("Photo upload failed:", e);
          }
        }

        if (Object.keys(updates).length > 0) {
          await api.updateLeader(leaderData.id, updates);
          await api.logSelfService({
            leaderId: leaderData.id,
            firstName: leaderData.first_name,
            lastName: leaderData.last_name,
            action: "update",
            details: updates,
          });
        }
        await api.notifyAdmin({
          subject: "Profile updated (self-service)",
          html: `<p>${leaderData.first_name} ${leaderData.last_name} has updated their profile.</p><pre>${JSON.stringify(
            updates,
            null,
            2
          )}</pre>`,
        });
      }
      setStep("done");
    } catch (err) {
      console.error("Save failed:", err);
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  }

  // Auto-reload page after profile update/delete so data is fresh
  useEffect(() => {
    if (step === "done") {
      const timer = setTimeout(() => {
        window.location.href = `${window.location.origin}${window.location.pathname.split('?')[0]}`;
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // ---- SENT SCREEN (magic link sent) ----
  if (step === "sent") {
    return (
      <div className="bg-brand-cream min-h-[60vh] flex items-center justify-center p-6 font-sans">
        <div className="text-center max-w-[420px]">
          <div className="text-[4.8rem] mb-4">✉</div>
          <h2 className="text-3xl font-bold text-brand-navy mb-3">
            Check your email
          </h2>
          <p className="text-1.5 text-gray-600 leading-[1.7] mb-5">
            We&apos;ve sent a magic link to <strong>{email}</strong>.
            Click the link to{" "}
            {selectedMode === "delete" ? "remove" : "update"} your profile.
          </p>
          {errorMsg && (
            <div className="text-1.3 text-red-500 mb-4 bg-red-50 rounded-lg px-4 py-3">
              <p className="mb-2">{errorMsg}</p>
              {fallbackUrl && (
                <a
                  href={fallbackUrl}
                  className="inline-block text-1.2 font-semibold text-brand-navy underline break-all hover:text-brand-orange"
                >
                  {fallbackUrl}
                </a>
              )}
            </div>
          )}
          <button onClick={onBack} className={`${BACK_CLASS} mx-auto`}>
            ← CLOSE
          </button>
        </div>
      </div>
    );
  }

  // ---- DONE SCREEN (profile saved via magic link) ----
  if (step === "done") {
    return (
      <div className="bg-brand-cream min-h-[60vh] flex items-center justify-center p-6 font-sans">
        <div className="text-center max-w-[420px]">
          <div className="text-[4.8rem] mb-4">✓</div>
          <h2 className="text-3xl font-bold text-brand-navy mb-3">
            Profile {tokenMode === "delete" ? "removed" : "updated"}
          </h2>
          <p className="text-1.5 text-gray-600 leading-[1.7] mb-5">
            {tokenMode === "delete"
              ? "Your profile has been removed from the directory."
              : "Your profile changes have been saved."}
          </p>
          <button onClick={onBack} className={`${BACK_CLASS} mx-auto`}>
            ← CLOSE
          </button>
        </div>
      </div>
    );
  }

  // ---- ERROR / LOADING (magic link landing) ----
  if (isMagicLink && status === "error" && !leaderData) {
    return (
      <div className="bg-brand-cream min-h-[60vh] flex items-center justify-center p-6 font-sans">
        <div className="text-center max-w-[420px]">
          <div className="text-[4.8rem] mb-4">!</div>
          <h2 className="text-3xl font-bold text-brand-navy mb-3">
            Link invalid
          </h2>
          <p className="text-1.5 text-gray-600 leading-[1.7] mb-5">
            {errorMsg}
          </p>
          <button onClick={onBack} className={`${BACK_CLASS} mx-auto`}>
            ← CLOSE
          </button>
        </div>
      </div>
    );
  }

  if (leaderLoading) {
    return (
      <div className="bg-brand-cream min-h-[40vh] flex items-center justify-center p-6 font-sans">
        <p className="text-1.5 text-gray-500">Loading your profile...</p>
      </div>
    );
  }

  // ---- MAIN RENDER ----
  return (
    <div className="bg-brand-cream font-sans">
      <div className="max-w-[640px] mx-auto px-6 py-8">
        {/* MODE A: IDENTIFY / FIND PROFILE */}
        {!isMagicLink && step === "identify" && (
          <div>
            <h2 className="text-[2.6rem] font-bold text-brand-navy mb-2">
              Manage your profile
            </h2>
            <p className="text-1.4 text-gray-600 leading-[1.7] mb-7">
              Enter your details to find your profile. We&apos;ll send a magic
              link to your email so you can update or remove it.
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
                placeholder="Used to verify your identity and send your profile link"
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
                  We couldn&apos;t find a profile matching those details. Try
                  your LinkedIn URL or contact the admin team.
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
                disabled={
                  !firstName.trim() ||
                  !lastName.trim() ||
                  !email.trim() ||
                  linkLoading
                }
                onClick={lookupProfile}
              >
                {linkLoading ? "SEARCHING..." : "FIND MY PROFILE →"}
              </ContinueBtn>
            </div>

            {foundProfile && (
              <div className="mt-6 pt-5 border-t border-gray-200">
                <p className="text-1.3 text-gray-500 mb-4 text-center">
                  What would you like to do?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setSelectedMode("update");
                      setStep("send-link");
                    }}
                    disabled={!email.trim()}
                    className={`px-4 py-5 rounded-lg border-[1.5px] bg-white text-1.4 font-bold tracking-[0.04em] transition-colors ${
                      email.trim()
                        ? "border-brand-navy text-brand-navy cursor-pointer hover:bg-brand-blue-tint"
                        : "border-gray-300 text-gray-400 cursor-not-allowed opacity-50"
                    }`}
                  >
                    Update profile
                  </button>
                  <button
                    onClick={() => {
                      setSelectedMode("delete");
                      setStep("send-link");
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

        {/* MODE A: SEND MAGIC LINK CONFIRMATION */}
        {!isMagicLink && step === "send-link" && foundProfile && (
          <div>
            <h2 className="text-[2.6rem] font-bold text-brand-navy mb-2">
              {selectedMode === "delete"
                ? "Remove your profile"
                : "Update your profile"}
            </h2>
            <p className="text-1.4 text-gray-600 leading-[1.7] mb-6">
              We&apos;ll send a magic link to your email address. Click the link
              to {selectedMode === "delete" ? "remove" : "update"} your profile
              directly — no admin needed.
            </p>

            <div className="border-[1.5px] border-gray-300 rounded-lg px-7 py-5 mb-7 bg-brand-blue-tint">
              <p className="text-1.5 font-bold text-brand-dark mb-0.5">
                {foundProfile.first_name} {foundProfile.last_name}
              </p>
              <p className="text-1.3 text-gray-600">
                {foundProfile.role} · {foundProfile.organisation}
              </p>
              <p className="text-1.3 text-gray-400 mt-2">
                Magic link will be sent to: <strong>{email}</strong>
              </p>
            </div>

            {linkError && (
              <p className="text-1.3 text-red-500 mb-4">{linkError}</p>
            )}

            <div className={NAV_CLASS}>
              <button onClick={() => setStep("identify")} className={BACK_CLASS}>
                ← BACK
              </button>
              <ContinueBtn disabled={linkLoading} onClick={sendMagicLink}>
                {linkLoading ? "SENDING..." : "SEND MAGIC LINK →"}
              </ContinueBtn>
            </div>
          </div>
        )}

        {/* MODE B: EDIT FORM (via magic link) */}
        {isMagicLink && step === "edit-magic" && leaderData && (
          <div>
            <h2 className="text-[2.6rem] font-bold text-brand-navy mb-2">
              Update your profile
            </h2>
            <p className="text-1.4 text-gray-600 leading-[1.7] mb-6">
              Make your changes below. All fields are optional.
            </p>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS}>First name</label>
                  <input
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Last name</label>
                  <input
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
              <div>
                <label className={LABEL_CLASS}>Role / Title</label>
                <input
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Organisation</label>
                <input
                  value={editOrg}
                  onChange={(e) => setEditOrg(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Profile photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setEditPhoto(f);
                      setEditPhotoPreview(URL.createObjectURL(f));
                    }
                  }}
                  className={`${INPUT_CLASS} cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[1.3rem] file:font-semibold file:bg-brand-blue-tint file:text-brand-navy hover:file:bg-blue-100`}
                />
                {editPhotoPreview && (
                  <div className="mt-3">
                    <img
                      src={editPhotoPreview}
                      alt="Preview"
                      className="w-24 h-24 rounded-full object-cover border-2 border-brand-pink"
                    />
                    <button
                      onClick={() => { setEditPhoto(null); setEditPhotoPreview(null); }}
                      className="ml-3 text-[1.3rem] text-red-500 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className={LABEL_CLASS}>Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={4}
                  className={`${INPUT_CLASS} resize-none`}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>LinkedIn URL</label>
                <input
                  value={editLinkedin}
                  onChange={(e) => setEditLinkedin(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>
                  Expertise{" "}
                  <span className="text-1.3 text-gray-400 font-normal">
                    (comma-separated)
                  </span>
                </label>
                <input
                  value={editExpertise}
                  onChange={(e) => setEditExpertise(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            {errorMsg && (
              <p className="text-1.3 text-red-500 mt-4">{errorMsg}</p>
            )}

            <div className={NAV_CLASS}>
              <button onClick={onBack} className={BACK_CLASS}>
                ← CLOSE
              </button>
              <ContinueBtn
                disabled={status === "submitting"}
                onClick={saveViaMagicLink}
              >
                {status === "submitting" ? "SAVING..." : "SAVE CHANGES →"}
              </ContinueBtn>
            </div>
          </div>
        )}

        {/* MODE B: DELETE CONFIRMATION (via magic link) */}
        {isMagicLink && step === "delete-magic" && leaderData && (
          <div>
            <h2 className="text-[2.6rem] font-bold text-red-500 mb-2">
              Remove your profile
            </h2>
            <p className="text-1.4 text-gray-600 leading-[1.7] mb-6">
              Are you sure you want to remove your profile from the directory?
              This action is permanent.
            </p>

            <div className="border-[1.5px] border-gray-300 rounded-lg px-7 py-5 mb-6 bg-brand-blue-tint">
              <p className="text-1.5 font-bold text-brand-dark mb-0.5">
                {leaderData.first_name} {leaderData.last_name}
              </p>
              <p className="text-1.3 text-gray-600">
                {leaderData.role} · {leaderData.organisation}
              </p>
            </div>

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

            {errorMsg && (
              <p className="text-1.3 text-red-500 mb-4">{errorMsg}</p>
            )}

            <div className={NAV_CLASS}>
              <button onClick={onBack} className={BACK_CLASS}>
                ← CLOSE
              </button>
              <ContinueBtn
                disabled={status === "submitting"}
                onClick={saveViaMagicLink}
              >
                {status === "submitting"
                  ? "REMOVING..."
                  : "REMOVE MY PROFILE →"}
              </ContinueBtn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
