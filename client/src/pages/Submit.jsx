import React, { useState } from "react";
import axios from "axios";
import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { compressImage } from "../utils/compressImage";
import ManageProfile from "./ManageProfile";

const EXPERTISE_TAGS = [
  "AI & Automation",
  "Digital health policy",
  "Health financing",
  "Health systems",
  "Data & analytics",
  "mHealth",
  "Telemedicine",
  "Research",
  "Health information systems",
  "Health systems strengthening",
  "Digital health strategy",
  "Digital health advocacy",
  "Digital health innovation",
  "Digital health transformation",
  "Digital health philanthropy",
  "Health workforce",
];

const COUNTRIES = [
  "Kenya",
  "Nigeria",
  "South Africa",
  "Tanzania",
  "Uganda",
  "Ghana",
  "Ethiopia",
  "Rwanda",
  "Senegal",
  "India",
  "Brazil",
  "Malaysia",
  "United States",
  "United Kingdom",
  "France",
  "Switzerland",
  "Germany",
  "Australia",
  "Japan",
  "China",
];

export default function Submit({ onManageProfile }) {
  const [step, setStep] = useState(0);
  const [branch, setBranch] = useState("self");
  const [nominateLink, setNominateLink] = useState("");
  const [consent, setConsent] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [org, setOrg] = useState("");
  const [expertise, setExpertise] = useState([]);
  const [geoScope, setGeoScope] = useState("");
  const [country, setCountry] = useState("");
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [bio, setBio] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [notableText, setNotableText] = useState("");
  const [notableItems, setNotableItems] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoName, setPhotoName] = useState("");
  const [yearsExp, setYearsExp] = useState("");
  const [status, setStatus] = useState("");
  const [showNoConsentModal, setShowNoConsentModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);

  const charCount = bio.length;

  function goStep(n) {
    if (n >= 0 && n <= 5) setStep(n);
  }

  function selectBranch(b) {
    setBranch(b);
  }

  function handleStep0Continue() {
    if (branch === "nominate" && nominateLink) {
      goStep(5);
      return;
    }
    goStep(1);
  }

  function handleConsent() {
    if (consent === "no") {
      setShowNoConsentModal(true);
    } else if (consent === "yes") {
      goStep(2);
    }
  }

  function toggleExpertise(tag) {
    if (expertise.includes(tag)) {
      setExpertise(expertise.filter((e) => e !== tag));
    } else if (expertise.length < 3) {
      setExpertise([...expertise, tag]);
    }
  }

  function bioCharWarning() {
    return charCount > 0 && (charCount < 100 || charCount > 150);
  }

  function updateNotableItem(index, field, value) {
    setNotableItems((current) =>
      current.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  }

  function addNotableItem() {
    if (notableItems.length >= 3) return;
    setNotableItems((current) => [
      ...current,
      { title: "", link: "", type: "" },
    ]);
  }

  function removeNotableItem(index) {
    setNotableItems((current) => current.filter((_, i) => i !== index));
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return;

    try {
      const compressed = await compressImage(file);
      setPhoto(compressed);
      setPhotoName(
        compressed.name + " (" + Math.round(compressed.size / 1024) + "KB)"
      );
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target.result);
      reader.readAsDataURL(compressed);
    } catch (err) {
      console.error("Compression failed:", err);
    }
  }

  async function uploadPhoto(file) {
    const fileName = Date.now() + "-" + file.name.replace(/\s+/g, "-");
    const storageRef = ref(storage, "profile-photos/" + fileName);
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
  }

  function resetForm() {
    setFirstName("");
    setLastName("");
    setRole("");
    setOrg("");
    setExpertise([]);
    setYearsExp("");
    setSelectedCountries([]);
    setBio("");
    setLinkedin("");
    setPhoto(null);
    setPhotoPreview(null);
    setPhotoName("");
    setConsent(null);
    setStep(0);
    setStatus("");
  }

  async function submit() {
    setStatus("submitting");
    try {
      let photoUrl = "";
      if (photo) {
        const hasFirebase = import.meta.env.VITE_FIREBASE_API_KEY;
        if (hasFirebase) {
          photoUrl = await uploadPhoto(photo);
        }
      }

      const url = import.meta.env.VITE_APPS_SCRIPT_URL || "";
      if (!url) {
        setTimeout(() => setStatus("submitted"), 1000);
        return;
      }

      const payload = {
        branch,
        firstName,
        lastName,
        role,
        organisation: org,
        expertise: expertise.join(", "),
        yearsExp,
        countries: selectedCountries.join(", "),
        bio,
        linkedin,
        notableText,
        notableItems: notableItems.filter(
          (item) => item.title || item.link || item.type
        ),
        photoUrl,
      };

      const r = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
      });
      if (r.data && r.data.ok) setStatus("submitted");
      else setStatus("error");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  if (status === "submitted") {
    return (
      <div
        style={{
          background: "#f5efe0",
          minHeight: "100vh",
          fontFamily: "'Montserrat', sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 600,
            margin: "0 auto",
            padding: "6.4rem 2.4rem 0",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <p
              style={{
                fontSize: "1.4rem",
                color: "#F85A8E",
                fontWeight: 600,
                letterSpacing: "0.04em",
                marginBottom: 12,
                margin: "0 0 1.2rem",
              }}
            >
              Submission received
            </p>
            <h2
              style={{
                fontSize: "3.6rem",
                fontWeight: 700,
                color: "#111",
                marginBottom: 20,
                margin: "0 0 2rem",
                letterSpacing: "-0.042em",
              }}
            >
              Thank you for contributing
            </h2>
            <p
              style={{
                fontSize: "1.8rem",
                color: "#333",
                lineHeight: 1.7,
                maxWidth: 480,
                margin: "0 auto",
              }}
            >
              Your submission helps advance gender equity and representation in
              digital health leadership worldwide.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              marginBottom: 48,
            }}
          >
            <div
              style={{
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                padding: "2.4rem 2.8rem",
                display: "flex",
                gap: 20,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "3px solid #02598e",
                  borderTopColor: "transparent",
                  flexShrink: 0,
                  marginTop: 2,
                }}
              />
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "1.8rem",
                    color: "#111",
                    marginBottom: 8,
                  }}
                >
                  Profile under review
                </div>
                <p
                  style={{
                    fontSize: "1.6rem",
                    color: "#444",
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  The Transform Health team reviews all submissions before they
                  go live. This typically takes 3–5 business days.
                </p>
              </div>
            </div>

            <div
              style={{
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                padding: "2.4rem 2.8rem",
                display: "flex",
                gap: 20,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "3px solid #02598e",
                  borderTopColor: "transparent",
                  flexShrink: 0,
                  marginTop: 2,
                }}
              />
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "1.8rem",
                    color: "#111",
                    marginBottom: 8,
                  }}
                >
                  Once approved
                </div>
                <p
                  style={{
                    fontSize: "1.6rem",
                    color: "#444",
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  Your full profile card will appear in the public directory at
                  transformhealthcoalition.org/leaders
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            maxWidth: 600,
            margin: "0 auto",
            padding: "2rem 2.4rem",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <button
            onClick={resetForm}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.4rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: "#E8571D",
            }}
          >
            SUBMIT ANOTHER PROFILE →
          </button>
        </div>
      </div>
    );
  }

  const stepLabels = ["Start", "Consent", "Basic Info", "Profile", "Links"];

  const nextDisabled =
    (step === 2 && (!firstName || !lastName || !country)) ||
    (step === 3 &&
      (!yearsExp ||
        expertise.length === 0 ||
        selectedCountries.length === 0 ||
        !bio ||
        charCount < 100 ||
        charCount > 150));

  return (
    <div style={{ background: "#f5efe0" }}>
      <div className="max-w-[1440px] mx-auto px-8 py-6">
        {step >= 1 && step <= 4 && (
          <div className="mb-6">
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3, 4].map((s) => (
                <React.Fragment key={s}>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[1.4rem] font-medium ${
                      s < step
                        ? "bg-gray-800 text-white"
                        : s === step
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {s < step ? "✓" : s + 1}
                  </div>
                  <div
                    className={`flex-1 h-0.5 ${
                      s < step ? "bg-gray-800" : "bg-gray-200"
                    } ${s === 4 ? "hidden" : ""}`}
                  />
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[1.2rem] text-gray-600">
              {stepLabels.map((label, i) => (
                <span key={i}>{label}</span>
              ))}
            </div>
          </div>
        )}

        <div className="bg-transparent rounded-lg p-6 md:p-8">
          {step === 0 && (
            <div style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <h2
                style={{
                  fontSize: "3.0rem",
                  fontWeight: 700,
                  color: "#02598e",
                  marginBottom: 16,
                  letterSpacing: "-0.042em",
                }}
              >
                Women Leaders in Digital Health Database
              </h2>
              <p
                style={{
                  fontSize: "1.8rem",
                  color: "#333",
                  lineHeight: 1.8,
                  marginBottom: 24,
                }}
              >
                Transform Health is building a global database of women leaders
                in digital health to increase visibility, representation, and
                engagement in leadership, policy, and technical spaces.
              </p>

              {/* Info box */}
              <div
                style={{
                  borderLeft: "4px solid #02598e",
                  background: "#eef3fb",
                  borderRadius: 8,
                  padding: "2rem 2.4rem",
                  marginBottom: 32,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <p
                  style={{
                    fontSize: "1.6rem",
                    color: "#222",
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  Information submitted may be featured in a publicly accessible
                  database.
                </p>
                <p
                  style={{
                    fontSize: "1.6rem",
                    color: "#222",
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  By consenting, you agree that your name, role, organisation,
                  biography, and relevant links may be publicly displayed.
                </p>
                <p
                  style={{
                    fontSize: "1.6rem",
                    color: "#222",
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  <strong>
                    Your email address will not be publicly displayed.
                  </strong>
                </p>
              </div>

              {/* Selection cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                <button
                  onClick={() => selectBranch("self")}
                  style={{
                    padding: "3.6rem 2.4rem 2.8rem",
                    borderRadius: 12,
                    textAlign: "center",
                    cursor: "pointer",
                    background: "#fff",
                    border:
                      branch === "self"
                        ? "2px solid #02598e"
                        : "2px solid #e5e7eb",
                  }}
                >
                  <img
                    src="./illustrations/self.png"
                    alt=""
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: "contain",
                      margin: "0 auto 2rem",
                      display: "block",
                    }}
                  />
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "1.8rem",
                      color: "#111",
                      marginBottom: 8,
                    }}
                  >
                    I am nominating myself
                  </div>
                  <div
                    style={{
                      fontSize: "1.6rem",
                      color: "#444",
                      lineHeight: 1.5,
                    }}
                  >
                    Submit your own profile to the database
                  </div>
                </button>

                <button
                  onClick={() => selectBranch("nominate")}
                  style={{
                    padding: "3.6rem 2.4rem 2.8rem",
                    borderRadius: 12,
                    textAlign: "center",
                    cursor: "pointer",
                    background: "#fff",
                    border:
                      branch === "nominate"
                        ? "2px solid #02598e"
                        : "2px solid #e5e7eb",
                  }}
                >
                  <img
                    src="./illustrations/nominate.png"
                    alt=""
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: "contain",
                      margin: "0 auto 2rem",
                      display: "block",
                    }}
                  />
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "1.8rem",
                      color: "#111",
                      marginBottom: 8,
                    }}
                  >
                    I am nominating someone else
                  </div>
                  <div
                    style={{
                      fontSize: "1.6rem",
                      color: "#444",
                      lineHeight: 1.5,
                    }}
                  >
                    Nominate another woman leader you know
                  </div>
                </button>
              </div>

              {branch === "nominate" && (
                <div style={{ marginBottom: 20 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "1.6rem",
                      color: "#111",
                      marginBottom: 8,
                    }}
                  >
                    Public profile link of the person you are nominating *
                  </label>
                  <p
                    style={{
                      fontSize: "1.4rem",
                      color: "#666",
                      marginBottom: 8,
                    }}
                  >
                    e.g. LinkedIn URL or professional website
                  </p>
                  <input
                    value={nominateLink}
                    onChange={(e) => setNominateLink(e.target.value)}
                    placeholder="https://linkedin.com/in/…"
                    style={{
                      width: "100%",
                      padding: "1.4rem 1.6rem",
                      border: "1.5px solid #d1d5db",
                      borderRadius: 10,
                      fontSize: "1.6rem",
                      outline: "none",
                      background: "rgb(238, 243, 251)",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 8,
                }}
              >
                <p
                  style={{
                    fontSize: "1.4rem",
                    color: "#444",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span>⏱</span> This form takes 3–5 minutes.
                </p>
                <button
                  onClick={handleStep0Continue}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    color: "#E8571D",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {branch === "nominate" ? "SUBMIT NOMINATION →" : "CONTINUE →"}
                </button>
              </div>

              <div
                style={{
                  marginTop: 24,
                  paddingTop: 20,
                  borderTop: "1px solid #e5e7eb",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: "1.4rem", color: "#444" }}>
                  Already in the database?{" "}
                  <button
                    onClick={() => setShowManageModal(true)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#02598e",
                      fontWeight: 600,
                      fontSize: "1.4rem",
                      textDecoration: "underline",
                      padding: 0,
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    Manage or remove your profile
                  </button>
                </p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <h2
                style={{
                  fontSize: "3.0rem",
                  fontWeight: 700,
                  color: "#02598e",
                  marginBottom: 16,
                  letterSpacing: "-0.042em",
                }}
              >
                Consent &amp; permissions
              </h2>
              <p
                style={{
                  fontSize: "1.8rem",
                  color: "#333",
                  marginBottom: 28,
                  lineHeight: 1.7,
                }}
              >
                Your profile may be publicly displayed. By consenting, you agree
                that the following will be visible in the directory.
              </p>

              {/* Pink info box */}
              <div
                style={{
                  borderLeft: "4px solid #F85A8E",
                  background: "#fff0f6",
                  borderRadius: 8,
                  padding: "1.6rem 2rem",
                  marginBottom: 32,
                }}
              >
                <p
                  style={{ fontSize: "1.6rem", color: "#333", marginBottom: 8 }}
                >
                  <span style={{ color: "#F85A8E", fontWeight: 600 }}>
                    Public:{" "}
                  </span>
                  Name, role, organisation, expertise areas, bio, and LinkedIn
                  profile.
                </p>
                <p style={{ fontSize: "1.6rem", color: "#333", margin: 0 }}>
                  <span style={{ color: "#F85A8E", fontWeight: 600 }}>
                    Private:{" "}
                  </span>
                  Email address — used for follow-up only, never published.
                </p>
              </div>

              {/* Consent options */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  marginBottom: 32,
                }}
              >
                <button
                  onClick={() => setConsent("yes")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "1.6rem 2rem",
                    borderRadius: 10,
                    textAlign: "left",
                    cursor: "pointer",
                    border:
                      consent === "yes"
                        ? "2px solid #02598e"
                        : "2px solid #e5e7eb",
                    background: consent === "yes" ? "#f0f7ff" : "#fff",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "#02598e",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        color: "#fff",
                        fontSize: "1.8rem",
                        fontWeight: 700,
                      }}
                    >
                      ✓
                    </span>
                  </div>
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "1.6rem",
                        color: "#111",
                        marginBottom: 2,
                      }}
                    >
                      Yes, I consent
                    </div>
                    <div style={{ fontSize: "1.4rem", color: "#444" }}>
                      Add my profile to the Transform Health directory
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setConsent("no")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "1.6rem 2rem",
                    borderRadius: 10,
                    textAlign: "left",
                    cursor: "pointer",
                    border:
                      consent === "no"
                        ? "2px solid #dc2626"
                        : "2px solid #e5e7eb",
                    background: consent === "no" ? "#fff5f5" : "#f9fafb",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "#dc2626",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        color: "#fff",
                        fontSize: "1.8rem",
                        fontWeight: 700,
                      }}
                    >
                      ✕
                    </span>
                  </div>
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "1.6rem",
                        color: "#111",
                        marginBottom: 2,
                      }}
                    >
                      No, I do not consent
                    </div>
                    <div style={{ fontSize: "1.4rem", color: "#444" }}>
                      I prefer not to be included at this time
                    </div>
                  </div>
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 20,
                }}
              >
                <button
                  onClick={() => goStep(0)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    color: "#111",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  ← BACK
                </button>
                <button
                  onClick={handleConsent}
                  disabled={consent === null}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    color: consent === null ? "#9ca3af" : "#E8571D",
                  }}
                >
                  CONTINUE →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <h2
                style={{
                  fontSize: "3.0rem",
                  fontWeight: 700,
                  color: "#02598e",
                  marginBottom: 8,
                  letterSpacing: "-0.042em",
                }}
              >
                Basic information
              </h2>
              <p
                style={{
                  fontSize: "1.6rem",
                  color: "#333",
                  marginBottom: 28,
                  lineHeight: 1.7,
                }}
              >
                Tell us who you are. Your email will never be published — it's
                used only for profile updates.
              </p>

              {/* First + Last name */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "1.6rem",
                      color: "#111",
                      marginBottom: 8,
                    }}
                  >
                    First name *
                  </label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g Anet"
                    style={{
                      width: "100%",
                      padding: "1.4rem 1.6rem",
                      border: "1.5px solid #d1d5db",
                      borderRadius: 10,
                      fontSize: "1.6rem",
                      outline: "none",
                      background: "rgb(238, 243, 251)",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "1.6rem",
                      color: "#111",
                      marginBottom: 8,
                    }}
                  >
                    Last name *
                  </label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g Clinton"
                    style={{
                      width: "100%",
                      padding: "1.4rem 1.6rem",
                      border: "1.5px solid #d1d5db",
                      borderRadius: 10,
                      fontSize: "1.6rem",
                      outline: "none",
                      background: "rgb(238, 243, 251)",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Photo upload */}
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "1.6rem",
                    color: "#111",
                    marginBottom: 8,
                  }}
                >
                  Profile photo (optional)
                </label>
                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#eef3fb",
                    border: "1.5px solid #d1d9ec",
                    borderRadius: 12,
                    padding: "5.2rem 2.4rem",
                    cursor: "pointer",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginBottom: 12,
                      }}
                    />
                  ) : (
                    <svg
                      width="44"
                      height="44"
                      viewBox="0 0 44 44"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ marginBottom: 12 }}
                    >
                      <rect
                        x="7"
                        y="4"
                        width="30"
                        height="36"
                        rx="4"
                        stroke="#9ca3af"
                        strokeWidth="1.8"
                        fill="none"
                      />
                      <circle
                        cx="22"
                        cy="19"
                        r="6"
                        stroke="#9ca3af"
                        strokeWidth="1.8"
                        fill="none"
                      />
                      <path
                        d="M10 38c0-6.627 5.373-10 12-10s12 3.373 12 10"
                        stroke="#9ca3af"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                  )}
                  <span
                    style={{
                      fontSize: "1.6rem",
                      fontWeight: 600,
                      color: "#111",
                      marginBottom: 4,
                    }}
                  >
                    Upload a photo
                  </span>
                  <span style={{ fontSize: "1.4rem", color: "#666" }}>
                    JPEG or PNG .max 5MB
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handlePhotoUpload}
                    style={{ display: "none" }}
                  />
                </label>
              </div>

              {/* Country */}
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "1.6rem",
                    color: "#111",
                    marginBottom: 8,
                  }}
                >
                  Country of residence *
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "1.4rem 1.6rem",
                    border: "1.5px solid #d1d5db",
                    borderRadius: 10,
                    fontSize: "1.6rem",
                    outline: "none",
                    background: "rgb(238, 243, 251)",
                    boxSizing: "border-box",
                    color: country ? "#111" : "#666",
                  }}
                >
                  <option value="">Select a country...</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Org + Role */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  marginBottom: 32,
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "1.6rem",
                      color: "#111",
                      marginBottom: 8,
                    }}
                  >
                    Organisation / Institution
                  </label>
                  <input
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    placeholder="e.g WHO"
                    style={{
                      width: "100%",
                      padding: "1.4rem 1.6rem",
                      border: "1.5px solid #d1d5db",
                      borderRadius: 10,
                      fontSize: "1.6rem",
                      outline: "none",
                      background: "rgb(238, 243, 251)",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "1.6rem",
                      color: "#111",
                      marginBottom: 8,
                    }}
                  >
                    Current role / title
                  </label>
                  <input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g Director"
                    style={{
                      width: "100%",
                      padding: "1.4rem 1.6rem",
                      border: "1.5px solid #d1d5db",
                      borderRadius: 10,
                      fontSize: "1.6rem",
                      outline: "none",
                      background: "rgb(238, 243, 251)",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 20,
                }}
              >
                <button
                  onClick={() => goStep(1)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    color: "#111",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  ← BACK
                </button>
                <button
                  onClick={() => goStep(3)}
                  disabled={!firstName || !lastName || !country}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    color:
                      !firstName || !lastName || !country
                        ? "#9ca3af"
                        : "#E8571D",
                  }}
                >
                  CONTINUE →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <h2
                style={{
                  fontSize: "3.0rem",
                  fontWeight: 700,
                  color: "#02598e",
                  marginBottom: 28,
                  letterSpacing: "-0.042em",
                }}
              >
                Profile details
              </h2>

              {/* Years of experience */}
              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "1.6rem",
                    color: "#111",
                    marginBottom: 12,
                  }}
                >
                  Years of experience in digital health *
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 12,
                  }}
                >
                  {["0-2 yrs", "3-7 yrs", "8-15 yrs", "15+ yrs"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setYearsExp(opt)}
                      style={{
                        padding: "1.4rem 0.8rem",
                        borderRadius: 10,
                        fontSize: "1.6rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        border:
                          yearsExp === opt
                            ? "1.5px solid #02598e"
                            : "1.5px solid #d1d5db",
                        background: yearsExp === opt ? "#02598e" : "#fff",
                        color: yearsExp === opt ? "#fff" : "#111",
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Areas of expertise */}
              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "1.6rem",
                    color: "#111",
                    marginBottom: 12,
                  }}
                >
                  Areas of expertise *{" "}
                  <span
                    style={{
                      fontSize: "1.4rem",
                      color: "#666",
                      fontWeight: 400,
                    }}
                  >
                    (select up to 3)
                  </span>
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {EXPERTISE_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleExpertise(tag)}
                      disabled={
                        !expertise.includes(tag) && expertise.length >= 3
                      }
                      style={{
                        padding: "0.8rem 1.4rem",
                        borderRadius: 20,
                        fontSize: "1.4rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        border: expertise.includes(tag)
                          ? "1.5px solid #02598e"
                          : "1.5px solid #d1d5db",
                        background: expertise.includes(tag)
                          ? "#02598e"
                          : "#fff",
                        color: expertise.includes(tag) ? "#fff" : "#333",
                        opacity:
                          !expertise.includes(tag) && expertise.length >= 3
                            ? 0.4
                            : 1,
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: "1.4rem", color: "#666", marginTop: 8 }}>
                  {expertise.length} of 3 selected
                </p>
              </div>

              {/* Which country/countries */}
              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "1.6rem",
                    color: "#111",
                    marginBottom: 12,
                  }}
                >
                  Which country/countries? *
                </label>
                <select
                  value=""
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val && !selectedCountries.includes(val)) {
                      setSelectedCountries([...selectedCountries, val]);
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "1.4rem 1.6rem",
                    border: "1.5px solid #d1d5db",
                    borderRadius: 10,
                    fontSize: "1.6rem",
                    outline: "none",
                    background: "rgb(238, 243, 251)",
                    boxSizing: "border-box",
                    color: "#111",
                  }}
                >
                  <option value="">Add a country...</option>
                  {COUNTRIES.filter((c) => !selectedCountries.includes(c)).map(
                    (c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    )
                  )}
                </select>
                {selectedCountries.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      marginTop: 10,
                    }}
                  >
                    {selectedCountries.map((c) => (
                      <span
                        key={c}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "0.6rem 1.2rem",
                          borderRadius: 20,
                          background: "#02598e",
                          color: "#fff",
                          fontSize: "1.4rem",
                          fontWeight: 500,
                        }}
                      >
                        {c}
                        <button
                          onClick={() =>
                            setSelectedCountries(
                              selectedCountries.filter((x) => x !== c)
                            )
                          }
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#fff",
                            fontSize: "1.4rem",
                            lineHeight: 1,
                            padding: 0,
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Short bio */}
              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "1.6rem",
                    color: "#111",
                    marginBottom: 12,
                  }}
                >
                  Short bio *{" "}
                  <span
                    style={{
                      fontSize: "1.4rem",
                      color: "#666",
                      fontWeight: 400,
                    }}
                  >
                    (100–150 characters)
                  </span>
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Brief description of your work in digital health…"
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "1.4rem 1.6rem",
                    fontSize: "1.6rem",
                    borderRadius: 10,
                    resize: "none",
                    outline: "none",
                    boxSizing: "border-box",
                    background: "rgb(238, 243, 251)",
                    border: bioCharWarning()
                      ? "1.5px solid #ef4444"
                      : "1.5px solid #d1d5db",
                  }}
                />
                <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                  <span style={{ fontSize: "1.4rem", color: "#666" }}>
                    {charCount} characters
                  </span>
                  {bioCharWarning() && (
                    <span style={{ fontSize: "1.4rem", color: "#ef4444" }}>
                      Please keep bio between 100–150 characters.
                    </span>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 20,
                  marginTop: 8,
                }}
              >
                <button
                  onClick={() => goStep(2)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    color: "#111",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  ← BACK
                </button>
                <button
                  onClick={() => goStep(4)}
                  disabled={nextDisabled}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    color: nextDisabled ? "#9ca3af" : "#E8571D",
                  }}
                >
                  CONTINUE →
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <h2
                style={{
                  fontSize: "3.0rem",
                  fontWeight: 700,
                  color: "#02598e",
                  marginBottom: 8,
                  letterSpacing: "-0.042em",
                }}
              >
                Links & achievements
              </h2>
              <p
                style={{
                  fontSize: "1.6rem",
                  color: "#333",
                  marginBottom: 28,
                  lineHeight: 1.7,
                }}
              >
                Add your LinkedIn and up to 3 notable publications, projects, or
                achievements.
              </p>

              {/* LinkedIn */}
              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "1.6rem",
                    color: "#111",
                    marginBottom: 8,
                  }}
                >
                  LinkedIn profile or professional website
                </label>
                <input
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/…"
                  style={{
                    width: "100%",
                    padding: "1.4rem 1.6rem",
                    border: "1.5px solid #d1d5db",
                    borderRadius: 10,
                    fontSize: "1.6rem",
                    outline: "none",
                    background: "rgb(238, 243, 251)",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Achievements */}
              <div style={{ marginBottom: 28 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "1.6rem",
                        color: "#111",
                      }}
                    >
                      Notable achievements{" "}
                      <span
                        style={{
                          fontSize: "1.4rem",
                          color: "#666",
                          fontWeight: 400,
                        }}
                      >
                        (optional, up to 3)
                      </span>
                    </label>
                    <p
                      style={{
                        fontSize: "1.4rem",
                        color: "#666",
                        marginTop: 4,
                      }}
                    >
                      Publications, projects, awards, or initiatives
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addNotableItem}
                    disabled={notableItems.length >= 3}
                    style={{
                      padding: "0.8rem 1.6rem",
                      borderRadius: 10,
                      fontSize: "1.4rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: "1.5px solid #02598e",
                      background: "#fff",
                      color: "#02598e",
                      opacity: notableItems.length >= 3 ? 0.4 : 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    + Add item
                  </button>
                </div>

                {notableItems.length === 0 && (
                  <p style={{ fontSize: "1.4rem", color: "#666" }}>
                    No items added yet.
                  </p>
                )}

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  {notableItems.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        border: "1.5px solid #d1d5db",
                        borderRadius: 10,
                        padding: "2rem 2rem 1.6rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 16,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "1.6rem",
                            fontWeight: 600,
                            color: "#02598e",
                          }}
                        >
                          Achievement {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeNotableItem(index)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "1.4rem",
                            color: "#ef4444",
                            fontWeight: 500,
                          }}
                        >
                          Remove
                        </button>
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr",
                          gap: 12,
                        }}
                      >
                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: "1.4rem",
                              color: "#111",
                              marginBottom: 6,
                            }}
                          >
                            Title
                          </label>
                          <input
                            value={item.title}
                            onChange={(e) =>
                              updateNotableItem(index, "title", e.target.value)
                            }
                            placeholder="e.g. Global Health Report"
                            style={{
                              width: "100%",
                              padding: "1.2rem 1.4rem",
                              border: "1.5px solid #d1d5db",
                              borderRadius: 10,
                              fontSize: "1.6rem",
                              outline: "none",
                              background: "rgb(238, 243, 251)",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>
                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: "1.4rem",
                              color: "#111",
                              marginBottom: 6,
                            }}
                          >
                            Link
                          </label>
                          <input
                            value={item.link}
                            onChange={(e) =>
                              updateNotableItem(index, "link", e.target.value)
                            }
                            placeholder="https://…"
                            style={{
                              width: "100%",
                              padding: "1.2rem 1.4rem",
                              border: "1.5px solid #d1d5db",
                              borderRadius: 10,
                              fontSize: "1.6rem",
                              outline: "none",
                              background: "rgb(238, 243, 251)",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>
                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: "1.4rem",
                              color: "#111",
                              marginBottom: 6,
                            }}
                          >
                            Type
                          </label>
                          <select
                            value={item.type}
                            onChange={(e) =>
                              updateNotableItem(index, "type", e.target.value)
                            }
                            style={{
                              width: "100%",
                              padding: "1.2rem 1.4rem",
                              border: "1.5px solid #d1d5db",
                              borderRadius: 10,
                              fontSize: "1.6rem",
                              outline: "none",
                              background: "rgb(238, 243, 251)",
                              boxSizing: "border-box",
                            }}
                          >
                            <option value="">Select type</option>
                            <option value="Publication">Publication</option>
                            <option value="Project">Project</option>
                            <option value="Achievement">Achievement</option>
                            <option value="Award">Award</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 20,
                }}
              >
                <button
                  onClick={() => goStep(3)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    color: "#111",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  ← BACK
                </button>
                <button
                  onClick={submit}
                  disabled={status === "submitting"}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    color: status === "submitting" ? "#9ca3af" : "#E8571D",
                  }}
                >
                  {status === "submitting"
                    ? "SUBMITTING..."
                    : "SUBMIT PROFILE →"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showManageModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Dimmed backdrop — clicking it closes */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
            }}
            onClick={() => setShowManageModal(false)}
          />
          {/* Modal panel slides up from bottom, takes most of the screen */}
          <div
            style={{
              position: "relative",
              marginTop: "auto",
              background: "rgb(255,255,244)",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              zIndex: 1,
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1.8rem 2.4rem",
                borderBottom: "1px solid #e5e7eb",
                fontFamily: "'Montserrat', sans-serif",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: "1.6rem",
                  fontWeight: 700,
                  color: "#02598e",
                }}
              >
                Manage profile
              </span>
              <button
                onClick={() => setShowManageModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "2.2rem",
                  color: "#666",
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                ×
              </button>
            </div>
            {/* Scrollable content */}
            <div style={{ overflowY: "auto", flex: 1 }}>
              <ManageProfile
                prefill={null}
                onBack={() => setShowManageModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {showNoConsentModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.45)" }}
        >
          <div
            className="bg-white rounded-2xl p-10 text-center max-w-md w-full shadow-xl"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            <img
              src="./illustrations/thank-you.png"
              alt=""
              style={{
                width: 90,
                height: 90,
                objectFit: "contain",
                margin: "0 auto 2rem",
                display: "block",
              }}
            />
            <h2
              style={{
                fontSize: "2.4rem",
                fontWeight: 700,
                color: "#02598e",
                marginBottom: 16,
                letterSpacing: "-0.042em",
              }}
            >
              Thank you for your time
            </h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginBottom: 32,
              }}
            >
              <p
                style={{
                  fontSize: "1.6rem",
                  color: "#333",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                We cannot proceed without your consent.
              </p>
              <p
                style={{
                  fontSize: "1.6rem",
                  color: "#333",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                You are welcome to return and submit your profile anytime.
              </p>
            </div>
            <button
              onClick={() => {
                setShowNoConsentModal(false);
                goStep(0);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "1.4rem",
                fontWeight: 600,
                color: "#333",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              ← BACK TO START
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
