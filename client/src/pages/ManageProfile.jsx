import React, { useState } from "react";
import axios from "axios";
import { MOCK_LEADERS } from "../data/mockData";

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  border: "1.5px solid #d1d5db",
  borderRadius: 10,
  fontSize: 15,
  outline: "none",
  background: "rgb(238, 243, 251)",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  fontSize: 15,
  color: "#111",
  marginBottom: 8,
};

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
  const [linkSent, setLinkSent] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [foundProfile, setFoundProfile] = useState(null);

  async function requestMagicLink() {
    if (!email) return;
    setLinkLoading(true);
    setLinkError("");
    try {
      const url = import.meta.env.VITE_APPS_SCRIPT_URL || "";
      if (!url) {
        setLinkSent(true);
        return;
      }
      const r = await axios.post(
        url,
        { action: "sendProfileLink", firstName, lastName, email, linkedin },
        { headers: { "Content-Type": "application/json" } }
      );
      if (r.data?.ok) setLinkSent(true);
      else if (r.data?.error === "not_found")
        setLinkError("We couldn't find a profile matching those details.");
      else setLinkError("Something went wrong. Please try again.");
    } catch {
      setLinkError("Something went wrong. Please try again.");
    } finally {
      setLinkLoading(false);
    }
  }

  function lookupProfile() {
    if (!firstName.trim() || !lastName.trim()) return;
    const q = firstName.trim().toLowerCase();
    const match = MOCK_LEADERS.find(
      (l) =>
        l.first_name.toLowerCase().includes(q) ||
        l.last_name.toLowerCase().includes(q) ||
        (l.first_name + " " + l.last_name)
          .toLowerCase()
          .includes(q + " " + lastName.trim().toLowerCase())
    );
    if (match) {
      setFoundProfile(match);
      setNotFound(false);
    } else {
      setNotFound(true);
      setFoundProfile(null);
    }
  }

  function back() {
    if (step === "edit" || step === "remove") setStep("identify");
    else onBack();
  }

  async function submit() {
    setStatus("submitting");
    try {
      const url = import.meta.env.VITE_APPS_SCRIPT_URL || "";
      if (!url) {
        setTimeout(() => setStatus("submitted"), 1000);
        return;
      }
      const payload = {
        action: "profileRequest",
        requestType,
        firstName: foundProfile?.first_name || firstName,
        lastName: foundProfile?.last_name || lastName,
        email,
        linkedin: foundProfile?.linkedin || linkedin,
        changes: requestType === "update" ? changes : "",
        reason: requestType === "delete" ? reason : "",
      };
      const r = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
      });
      if (r.data?.ok) setStatus("submitted");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  const navStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 20,
    marginTop: 8,
  };
  const backBtn = {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    color: "#111",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  };
  const continueBtn = (disabled) => ({
    background: "none",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    color: disabled ? "#ccc" : "#E8571D",
  });

  if (status === "submitted") {
    return (
      <div
        style={{
          background: "rgb(255, 255, 244)",
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          fontFamily: "'Montserrat', sans-serif",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>
            {requestType === "delete" ? "✓" : "★"}
          </div>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#02598e",
              marginBottom: 12,
            }}
          >
            Request received
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "#444",
              lineHeight: 1.7,
              marginBottom: 20,
            }}
          >
            {requestType === "delete"
              ? "Your removal request has been sent. The admin team will process it shortly."
              : "Your update request has been sent. The admin team will review and apply the changes shortly."}
          </p>
          <p style={{ fontSize: 13, color: "#9ca3af" }}>
            You'll be notified by email at {email}
          </p>
        </div>
      </div>
    );
  }

  if (linkSent) {
    return (
      <div
        style={{
          background: "rgb(255, 255, 244)",
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          fontFamily: "'Montserrat', sans-serif",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✉</div>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#02598e",
              marginBottom: 12,
            }}
          >
            Check your inbox
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "#444",
              lineHeight: 1.7,
              marginBottom: 8,
            }}
          >
            We've sent your profile link to <strong>{email}</strong>.
          </p>
          <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 20 }}>
            The link can only be used once. Check your spam folder if you don't
            see it.
          </p>
          <button
            onClick={() => {
              setLinkSent(false);
              setLinkError("");
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              color: "#02598e",
              textDecoration: "underline",
            }}
          >
            Try again with a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "rgb(255, 255, 244)",
        fontFamily: "'Montserrat', sans-serif",
      }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 24px" }}>
        {step === "identify" && (
          <div>
            <h2
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: "#02598e",
                marginBottom: 8,
              }}
            >
              Manage your profile
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "#444",
                lineHeight: 1.7,
                marginBottom: 28,
              }}
            >
              Enter your details to find and update or remove your profile from
              the database.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: 20,
              }}
            >
              <div>
                <label style={labelStyle}>First name</label>
                <input
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setNotFound(false);
                  }}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Last name</label>
                <input
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    setNotFound(false);
                  }}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="We'll send your profile link here — not stored"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>
                LinkedIn profile{" "}
                <span
                  style={{ fontSize: 13, color: "#9ca3af", fontWeight: 400 }}
                >
                  (optional — helps us find you)
                </span>
              </label>
              <input
                value={linkedin}
                onChange={(e) => {
                  setLinkedin(e.target.value);
                  setNotFound(false);
                }}
                style={inputStyle}
              />
            </div>

            {notFound && (
              <div
                style={{
                  borderLeft: "4px solid #d1d5db",
                  background: "#f9fafb",
                  borderRadius: 8,
                  padding: "14px 18px",
                  marginBottom: 20,
                }}
              >
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#111",
                    marginBottom: 4,
                  }}
                >
                  Profile not found
                </p>
                <p style={{ fontSize: 13, color: "#666" }}>
                  We couldn't find a profile matching those details. Try your
                  LinkedIn URL or contact the admin team.
                </p>
              </div>
            )}

            {foundProfile && (
              <div
                style={{
                  border: "1.5px solid #02598e",
                  borderRadius: 10,
                  padding: "16px 20px",
                  marginBottom: 20,
                  background: "#eef3fb",
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#02598e",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 10,
                  }}
                >
                  Profile found
                </p>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#111",
                    marginBottom: 4,
                  }}
                >
                  {foundProfile.first_name} {foundProfile.last_name}
                </p>
                <p style={{ fontSize: 13, color: "#555" }}>
                  {foundProfile.role} · {foundProfile.organisation}
                </p>
              </div>
            )}

            <div style={navStyle}>
              <button onClick={onBack} style={backBtn}>
                ← BACK
              </button>
              <button
                onClick={lookupProfile}
                disabled={!firstName || !lastName}
                style={continueBtn(!firstName || !lastName)}
              >
                FIND MY PROFILE →
              </button>
            </div>

            {foundProfile && (
              <div
                style={{
                  marginTop: 24,
                  paddingTop: 20,
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    color: "#666",
                    marginBottom: 16,
                    textAlign: "center",
                  }}
                >
                  What would you like to do?
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <button
                    onClick={() => {
                      setRequestType("update");
                      setStep("edit");
                    }}
                    style={{
                      padding: "14px 16px",
                      borderRadius: 10,
                      border: "1.5px solid #02598e",
                      background: "#fff",
                      color: "#02598e",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Update profile
                  </button>
                  <button
                    onClick={() => {
                      setRequestType("delete");
                      setStep("remove");
                    }}
                    style={{
                      padding: "14px 16px",
                      borderRadius: 10,
                      border: "1.5px solid #ef4444",
                      background: "#fff",
                      color: "#ef4444",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Remove profile
                  </button>
                </div>
              </div>
            )}

            {foundProfile && (
              <div style={{ marginTop: 16, textAlign: "center" }}>
                <button
                  onClick={requestMagicLink}
                  disabled={linkLoading || !email}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    color: "#02598e",
                    textDecoration: "underline",
                    opacity: !email || linkLoading ? 0.4 : 1,
                  }}
                >
                  {linkLoading
                    ? "Sending..."
                    : "Or send my profile to this email instead →"}
                </button>
                {linkError && (
                  <p style={{ fontSize: 13, color: "#ef4444", marginTop: 6 }}>
                    {linkError}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {(step === "edit" || step === "remove") && (
          <div>
            {foundProfile && (
              <div
                style={{
                  border: "1.5px solid #d1d5db",
                  borderRadius: 10,
                  padding: "14px 18px",
                  marginBottom: 28,
                  background: "rgb(238, 243, 251)",
                }}
              >
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#111",
                    marginBottom: 2,
                  }}
                >
                  {foundProfile.first_name} {foundProfile.last_name}
                </p>
                <p style={{ fontSize: 13, color: "#555" }}>
                  {foundProfile.role} · {foundProfile.organisation}
                </p>
              </div>
            )}

            {step === "edit" ? (
              <>
                <h2
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: "#02598e",
                    marginBottom: 8,
                  }}
                >
                  Update your profile
                </h2>
                <p
                  style={{
                    fontSize: 14,
                    color: "#444",
                    lineHeight: 1.7,
                    marginBottom: 24,
                  }}
                >
                  Describe what you'd like to change — role, organisation, bio,
                  expertise, or LinkedIn.
                </p>

                {foundProfile && (
                  <div
                    style={{
                      borderLeft: "4px solid #d1d5db",
                      background: "#f9fafb",
                      borderRadius: 8,
                      padding: "14px 18px",
                      marginBottom: 20,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 12,
                        color: "#9ca3af",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginBottom: 8,
                      }}
                    >
                      Current details
                    </p>
                    {foundProfile.role && (
                      <p
                        style={{ fontSize: 13, color: "#555", marginBottom: 4 }}
                      >
                        <strong>Role:</strong> {foundProfile.role}
                      </p>
                    )}
                    {foundProfile.organisation && (
                      <p
                        style={{ fontSize: 13, color: "#555", marginBottom: 4 }}
                      >
                        <strong>Organisation:</strong>{" "}
                        {foundProfile.organisation}
                      </p>
                    )}
                    {foundProfile.bio && (
                      <p
                        style={{ fontSize: 13, color: "#555", marginBottom: 4 }}
                      >
                        <strong>Bio:</strong> {foundProfile.bio}
                      </p>
                    )}
                    {foundProfile.expertise && (
                      <p style={{ fontSize: 13, color: "#555" }}>
                        <strong>Expertise:</strong> {foundProfile.expertise}
                      </p>
                    )}
                  </div>
                )}

                <div style={{ marginBottom: 24 }}>
                  <label style={labelStyle}>
                    What would you like to change?
                  </label>
                  <textarea
                    value={changes}
                    onChange={(e) => setChanges(e.target.value)}
                    placeholder="e.g. New role: Chief Digital Officer at WHO. Update bio to: ..."
                    rows={6}
                    style={{ ...inputStyle, resize: "none" }}
                  />
                </div>

                <div style={navStyle}>
                  <button onClick={back} style={backBtn}>
                    ← BACK
                  </button>
                  <button
                    onClick={() => setStep("review")}
                    disabled={!changes}
                    style={continueBtn(!changes)}
                  >
                    REVIEW →
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: "#ef4444",
                    marginBottom: 8,
                  }}
                >
                  Remove your profile
                </h2>
                <p
                  style={{
                    fontSize: 14,
                    color: "#444",
                    lineHeight: 1.7,
                    marginBottom: 24,
                  }}
                >
                  Optional — let us know why. This helps us improve the
                  database.
                </p>

                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>
                    Reason{" "}
                    <span
                      style={{
                        fontSize: 13,
                        color: "#9ca3af",
                        fontWeight: 400,
                      }}
                    >
                      (optional)
                    </span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. No longer in this role, prefer not to be listed..."
                    rows={4}
                    style={{ ...inputStyle, resize: "none" }}
                  />
                </div>

                <div
                  style={{
                    borderLeft: "4px solid #fca5a5",
                    background: "#fef2f2",
                    borderRadius: 8,
                    padding: "14px 18px",
                    marginBottom: 24,
                  }}
                >
                  <p style={{ fontSize: 13, color: "#666" }}>
                    Your profile will be removed from the public database after
                    admin review.
                  </p>
                </div>

                <div style={navStyle}>
                  <button onClick={back} style={backBtn}>
                    ← BACK
                  </button>
                  <button
                    onClick={() => setStep("review")}
                    style={continueBtn(false)}
                  >
                    REVIEW →
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {step === "review" && (
          <div>
            <h2
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: "#02598e",
                marginBottom: 28,
              }}
            >
              Review your request
            </h2>

            {(foundProfile || firstName) && (
              <div
                style={{
                  border: "1.5px solid #d1d5db",
                  borderRadius: 10,
                  padding: "14px 18px",
                  marginBottom: 20,
                  background: "rgb(238, 243, 251)",
                }}
              >
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#111",
                    marginBottom: 2,
                  }}
                >
                  {foundProfile?.first_name || firstName}{" "}
                  {foundProfile?.last_name || lastName}
                </p>
                <p style={{ fontSize: 13, color: "#9ca3af" }}>{email}</p>
              </div>
            )}

            <div
              style={{
                border: "1.5px solid #d1d5db",
                borderRadius: 10,
                overflow: "hidden",
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 18px",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <span style={{ fontSize: 14, color: "#666" }}>
                  Request type
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: requestType === "delete" ? "#ef4444" : "#02598e",
                  }}
                >
                  {requestType === "delete"
                    ? "Remove profile"
                    : "Update profile"}
                </span>
              </div>
              {requestType === "update" && changes && (
                <div style={{ padding: "14px 18px" }}>
                  <p style={{ fontSize: 13, color: "#666", marginBottom: 6 }}>
                    Changes requested
                  </p>
                  <p style={{ fontSize: 14, color: "#111", lineHeight: 1.6 }}>
                    {changes}
                  </p>
                </div>
              )}
              {requestType === "delete" && reason && (
                <div style={{ padding: "14px 18px" }}>
                  <p style={{ fontSize: 13, color: "#666", marginBottom: 6 }}>
                    Reason
                  </p>
                  <p style={{ fontSize: 14, color: "#111", lineHeight: 1.6 }}>
                    {reason}
                  </p>
                </div>
              )}
            </div>

            {status === "error" && (
              <p style={{ fontSize: 13, color: "#ef4444", marginBottom: 16 }}>
                Something went wrong. Please try again.
              </p>
            )}

            <div style={navStyle}>
              <button
                onClick={() =>
                  setStep(requestType === "delete" ? "remove" : "edit")
                }
                style={backBtn}
              >
                ← BACK
              </button>
              <button
                onClick={submit}
                disabled={status === "submitting"}
                style={continueBtn(status === "submitting")}
              >
                {status === "submitting" ? "SUBMITTING..." : "SUBMIT REQUEST →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
