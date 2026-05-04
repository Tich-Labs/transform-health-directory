import React from "react";
import Button from "../components/Button";
import { Input, Textarea, Select } from "../components/Input";

export const EXPERTISE_TAGS = [
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
  "Other",
];

export const COUNTRIES = [
  "Kenya", "Nigeria", "South Africa", "Tanzania", "Uganda", "Ghana",
  "Ethiopia", "Rwanda", "Senegal", "India", "Brazil", "Malaysia",
  "United States", "United Kingdom", "France", "Switzerland", "Germany",
  "Australia", "Japan", "China",
];

// Shared class overrides to match the submit form's visual design
const F_INPUT = "bg-brand-blue-tint text-lg py-5 px-[1.6rem]";
const LABEL_CLASS = "block text-lg text-brand-dark mb-2";
const BACK_CLS   = "font-bold tracking-[0.06em] text-1.4 text-gray-900 hover:no-underline";
const CONT_CLS   = "font-bold tracking-[0.06em] text-1.4";

// ─── Step 0: Branch selection ────────────────────────────────────────────────
export function Step0Branch({ branch, setBranch, nominateLink, setNominateLink, onContinue, onManageProfile }) {
  return (
    <div>
      <h2 className="text-4xl font-bold text-brand-navy mb-4 tracking-heading">
        Women Leaders in Digital Health Database
      </h2>
      <p className="text-xl text-dark leading-[1.8] mb-6">
        Transform Health is building a global database of women leaders
        in digital health to increase visibility, representation, and
        engagement in leadership, policy, and technical spaces.
      </p>

      <div className="border-l-4 border-brand-navy bg-brand-blue-tint rounded-lg px-[2.4rem] py-[2rem] mb-8 flex flex-col gap-[10px]">
        <p className="text-lg text-gray-800 leading-[1.7] m-0">
          Information submitted may be featured in a publicly accessible database.
        </p>
        <p className="text-lg text-gray-800 leading-[1.7] m-0">
          By consenting, you agree that your name, role, organisation,
          biography, and relevant links may be publicly displayed.
        </p>
        <p className="text-lg text-gray-800 leading-[1.7] m-0">
          <strong>Your email address will not be publicly displayed.</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <button
          onClick={() => setBranch("self")}
          className={`pt-[3.6rem] px-[2.4rem] pb-[2.8rem] rounded-xl text-center cursor-pointer bg-white border-2 ${
            branch === "self" ? "border-brand-navy" : "border-gray-200"
          }`}
        >
          <img src="./illustrations/self.png" alt="" className="w-[80px] h-[80px] object-contain mx-auto mb-8 block" />
          <div className="font-bold text-xl text-brand-dark mb-2">I am nominating myself</div>
          <div className="text-lg text-gray-600 leading-[1.5]">Submit your own profile to the database</div>
        </button>

        <button
          onClick={() => setBranch("nominate")}
          className={`pt-[3.6rem] px-[2.4rem] pb-[2.8rem] rounded-xl text-center cursor-pointer bg-white border-2 ${
            branch === "nominate" ? "border-brand-navy" : "border-gray-200"
          }`}
        >
          <img src="./illustrations/nominate.png" alt="" className="w-[80px] h-[80px] object-contain mx-auto mb-8 block" />
          <div className="font-bold text-xl text-brand-dark mb-2">I am nominating someone else</div>
          <div className="text-lg text-gray-600 leading-[1.5]">Nominate another woman leader you know</div>
        </button>
      </div>

      {branch === "nominate" && (
        <div className="mb-5">
          <label className={LABEL_CLASS}>Public profile link of the person you are nominating *</label>
          <p className="text-1.4 text-gray-500 mb-2">e.g. LinkedIn URL or professional website</p>
          <Input
            value={nominateLink}
            onChange={(e) => setNominateLink(e.target.value)}
            placeholder="https://linkedin.com/in/…"
            className={F_INPUT}
          />
        </div>
      )}

      <div className="flex justify-between items-center mt-2">
        <p className="text-1.4 text-gray-600 flex items-center gap-1.5">
          <span>⏱</span> This form takes 3–5 minutes.
        </p>
        <Button variant="ghost" size="sm" className={CONT_CLS} onClick={onContinue}>
          {branch === "nominate" ? "SUBMIT NOMINATION →" : "CONTINUE →"}
        </Button>
      </div>

      <div className="mt-6 pt-5 border-t border-gray-200 text-center">
        <p className="text-1.4 text-gray-600">
          Already in the database?{" "}
          {/* Inline link — intentionally raw <button> */}
          <button
            onClick={() => onManageProfile(null)}
            className="bg-transparent border-0 cursor-pointer text-brand-navy font-semibold text-1.4 underline p-0"
          >
            Manage or remove your profile
          </button>
        </p>
      </div>
    </div>
  );
}

// ─── Step 1: Consent ─────────────────────────────────────────────────────────
export function Step1Consent({ consent, setConsent, onBack, onContinue }) {
  return (
    <div>
      <h2 className="text-4xl font-bold text-brand-navy mb-4 tracking-heading">
        Consent &amp; permissions
      </h2>
      <p className="text-xl text-dark mb-7 leading-[1.7]">
        Your profile may be publicly displayed. By consenting, you agree
        that the following will be visible in the directory.
      </p>

      <div className="border-l-4 border-brand-pink bg-brand-pink-light rounded-lg px-8 py-6 mb-8">
        <p className="text-lg text-dark mb-2">
          <span className="text-brand-pink font-semibold">Public: </span>
          Name, role, organisation, expertise areas, bio, and LinkedIn profile.
        </p>
        <p className="text-lg text-dark m-0">
          <span className="text-brand-pink font-semibold">Private: </span>
          Email address — used for follow-up only, never published.
        </p>
      </div>

      <div className="flex flex-col gap-3 mb-8">
        {/* Consent option cards — custom layout, intentionally raw <button> */}
        <button
          onClick={() => setConsent("yes")}
          className={`flex items-center gap-4 px-8 py-6 rounded-lg text-left cursor-pointer border-2 ${
            consent === "yes" ? "border-brand-navy bg-brand-blue-light" : "border-gray-200 bg-white"
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-brand-navy flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xl font-bold">✓</span>
          </div>
          <div>
            <div className="font-bold text-lg text-brand-dark mb-0.5">Yes, I consent</div>
            <div className="text-1.4 text-gray-600">Add my profile to the Transform Health directory</div>
          </div>
        </button>

        <button
          onClick={() => setConsent("no")}
          className={`flex items-center gap-4 px-8 py-6 rounded-lg text-left cursor-pointer border-2 ${
            consent === "no" ? "border-red-600 bg-brand-red-light" : "border-gray-200 bg-gray-50"
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xl font-bold">✕</span>
          </div>
          <div>
            <div className="font-bold text-lg text-brand-dark mb-0.5">No, I do not consent</div>
            <div className="text-1.4 text-gray-600">I prefer not to be included at this time</div>
          </div>
        </button>
      </div>

      <div className="flex justify-between items-center pt-5">
        <Button variant="ghost" size="sm" className={BACK_CLS} onClick={onBack}>← BACK</Button>
        <Button variant="ghost" size="sm" className={CONT_CLS} disabled={consent === null} onClick={onContinue}>CONTINUE →</Button>
      </div>
    </div>
  );
}

// ─── Step 2: Basic information ────────────────────────────────────────────────
export function Step2BasicInfo({ firstName, setFirstName, lastName, setLastName, email, setEmail, photoPreview, onPhotoUpload, country, setCountry, org, setOrg, role, setRole, onBack, onContinue }) {
  return (
    <div>
      <h2 className="text-4xl font-bold text-brand-navy mb-2 tracking-heading">Basic information</h2>
      <p className="text-lg text-dark mb-7 leading-[1.7]">
        Tell us who you are. Your email will never be published — it's used only for profile updates.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label className={LABEL_CLASS}>First name *</label>
          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="e.g Anet" className={F_INPUT} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Last name *</label>
          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="e.g Clinton" className={F_INPUT} />
        </div>
      </div>

      <div className="mb-5">
        <label className={LABEL_CLASS}>Email * <span className="text-1.4 text-gray-500 font-normal">(not publicly displayed)</span></label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your.email@example.com" className={F_INPUT} />
      </div>

      <div className="mb-5">
        <label className={LABEL_CLASS}>Profile photo (optional)</label>
        <label className="flex flex-col items-center justify-center bg-brand-blue-tint border-[1.5px] border-brand-blue-border rounded-xl py-[5.2rem] px-[2.4rem] cursor-pointer w-full">
          {photoPreview ? (
            <img src={photoPreview} alt="Preview" className="w-[80px] h-[80px] rounded-full object-cover mb-3" />
          ) : (
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-3">
              <rect x="7" y="4" width="30" height="36" rx="4" stroke="#9ca3af" strokeWidth="1.8" fill="none" />
              <circle cx="22" cy="19" r="6" stroke="#9ca3af" strokeWidth="1.8" fill="none" />
              <path d="M10 38c0-6.627 5.373-10 12-10s12 3.373 12 10" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            </svg>
          )}
          <span className="text-lg font-semibold text-brand-dark mb-1">Upload a photo</span>
          <span className="text-1.4 text-gray-500">JPEG or PNG · max 5MB</span>
          {/* Native file input — no component equivalent */}
          <input type="file" accept="image/png,image/jpeg" onChange={onPhotoUpload} className="hidden" />
        </label>
      </div>

      <div className="mb-5">
        <label className={LABEL_CLASS}>Country of residence *</label>
        <Select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className={`${F_INPUT} ${country ? "text-gray-900" : "text-gray-400"}`}
        >
          <option value="">Select a country...</option>
          {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div>
          <label className={LABEL_CLASS}>Organisation / Institution</label>
          <Input value={org} onChange={(e) => setOrg(e.target.value)} placeholder="e.g WHO" className={F_INPUT} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Current role / title</label>
          <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g Director" className={F_INPUT} />
        </div>
      </div>

      <div className="flex justify-between items-center pt-5">
        <Button variant="ghost" size="sm" className={BACK_CLS} onClick={onBack}>← BACK</Button>
        <Button variant="ghost" size="sm" className={CONT_CLS} disabled={!firstName || !lastName || !email || !country} onClick={onContinue}>CONTINUE →</Button>
      </div>
    </div>
  );
}

// ─── Step 3: Profile details ──────────────────────────────────────────────────
export function Step3ProfileDetails({ yearsExp, setYearsExp, expertise, toggleExpertise, otherExpertise, setOtherExpertise, selectedCountries, setSelectedCountries, bio, setBio, charCount, bioCharWarning, onBack, onContinue, nextDisabled }) {
  return (
    <div>
      <h2 className="text-4xl font-bold text-brand-navy mb-7 tracking-heading">Profile details</h2>

      <div className="mb-6">
        <label className={`${LABEL_CLASS} mb-3`}>Years of experience in digital health *</label>
        {/* Segmented pill selector — custom layout, intentionally raw <button> */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {["0-2 yrs", "3-7 yrs", "8-15 yrs", "15+ yrs"].map((opt) => (
            <button
              key={opt}
              onClick={() => setYearsExp(opt)}
              className={`py-5 px-[0.8rem] rounded-lg text-lg font-medium cursor-pointer border-[1.5px] ${
                yearsExp === opt ? "border-brand-navy bg-brand-navy text-white" : "border-gray-300 bg-white text-brand-dark"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className={`${LABEL_CLASS} mb-3`}>
          Areas of expertise *{" "}
          <span className="text-1.4 text-gray-500 font-normal">(select up to 5)</span>
        </label>
        {/* Tag pill selector — custom layout, intentionally raw <button> */}
        <div className="flex flex-wrap gap-2">
          {EXPERTISE_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleExpertise(tag)}
              disabled={!expertise.includes(tag) && expertise.length >= 5}
              className={`py-[0.8rem] px-[1.4rem] rounded-[20px] text-1.4 font-medium cursor-pointer border-[1.5px] transition-opacity ${
                expertise.includes(tag) ? "border-brand-navy bg-brand-navy text-white" : "border-gray-300 bg-white text-dark"
              } ${!expertise.includes(tag) && expertise.length >= 5 ? "opacity-40" : "opacity-100"}`}
            >
              {tag}
            </button>
          ))}
        </div>
        <p className="text-1.4 text-gray-500 mt-2">{expertise.length} of 5 selected</p>
      </div>

      {expertise.includes("Other") && (
        <div className="mb-6">
          <label className={`${LABEL_CLASS} mb-3`}>Please specify other expertise *</label>
          <Input
            type="text"
            value={otherExpertise}
            onChange={(e) => setOtherExpertise(e.target.value)}
            placeholder="Enter your area of expertise"
            className={F_INPUT}
          />
        </div>
      )}

      <div className="mb-6">
        <label className={`${LABEL_CLASS} mb-3`}>Which country/countries? *</label>
        <Select
          value=""
          onChange={(e) => {
            const val = e.target.value;
            if (val && !selectedCountries.includes(val))
              setSelectedCountries([...selectedCountries, val]);
          }}
          className={`${F_INPUT} text-gray-900`}
        >
          <option value="">Add a country...</option>
          {COUNTRIES.filter((c) => !selectedCountries.includes(c)).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
        {selectedCountries.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2.5">
            {selectedCountries.map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 px-[1.2rem] py-[0.6rem] rounded-[20px] bg-brand-navy text-white text-1.4 font-medium">
                {c}
                {/* Inline chip remove — intentionally raw <button> */}
                <button
                  onClick={() => setSelectedCountries(selectedCountries.filter((x) => x !== c))}
                  className="bg-transparent border-0 cursor-pointer text-white text-1.4 leading-none p-0"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <label className={`${LABEL_CLASS} mb-3`}>
          Short bio *{" "}
          <span className="text-1.4 text-gray-500 font-normal">(300–500 characters)</span>
        </label>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Brief description of your work in digital health…"
          rows={4}
          error={bioCharWarning() ? "Please keep bio between 300–500 characters." : ""}
          className={F_INPUT}
        />
        <span className="text-1.4 text-gray-500 mt-1.5 block">{charCount} characters</span>
      </div>

      <div className="flex justify-between items-center pt-5 mt-2">
        <Button variant="ghost" size="sm" className={BACK_CLS} onClick={onBack}>← BACK</Button>
        <Button variant="ghost" size="sm" className={CONT_CLS} disabled={nextDisabled} onClick={onContinue}>CONTINUE →</Button>
      </div>
    </div>
  );
}

// ─── Step 4: Links & achievements ────────────────────────────────────────────
export function Step4Links({ linkedin, setLinkedin, notableItems, addNotableItem, removeNotableItem, updateNotableItem, status, onBack, onSubmit }) {
  return (
    <div>
      <h2 className="text-4xl font-bold text-brand-navy mb-2 tracking-heading">
        Links &amp; achievements
      </h2>
      <p className="text-lg text-dark mb-7 leading-[1.7]">
        Add your LinkedIn and up to 3 notable publications, projects, or achievements.
      </p>

      <div className="mb-6">
        <label className={LABEL_CLASS}>LinkedIn profile or professional website</label>
        <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/…" className={F_INPUT} />
      </div>

      <div className="mb-7">
        <div className="flex justify-between items-center mb-3">
          <div>
            <label className={`${LABEL_CLASS} mb-0`}>
              Notable achievements{" "}
              <span className="text-1.4 text-gray-500 font-normal">(optional, up to 3)</span>
            </label>
            <p className="text-1.4 text-gray-500 mt-1">Publications, projects, awards, or initiatives</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            disabled={notableItems.length >= 3}
            onClick={addNotableItem}
            className="whitespace-nowrap"
          >
            + Add item
          </Button>
        </div>

        {notableItems.length === 0 && (
          <p className="text-1.4 text-gray-500">No items added yet.</p>
        )}

        <div className="flex flex-col gap-4">
          {notableItems.map((item, index) => (
            <div key={index} className="border-[1.5px] border-gray-300 rounded-lg px-5 pt-5 pb-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-brand-navy">Achievement {index + 1}</span>
                <Button variant="ghost" size="sm" className="text-red-500 hover:no-underline" onClick={() => removeNotableItem(index)}>
                  Remove
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-1.4 text-brand-dark mb-1.5">Title</label>
                  <Input value={item.title} onChange={(e) => updateNotableItem(index, "title", e.target.value)} placeholder="e.g. Global Health Report" className={F_INPUT} />
                </div>
                <div>
                  <label className="block text-1.4 text-brand-dark mb-1.5">Link</label>
                  <Input value={item.link} onChange={(e) => updateNotableItem(index, "link", e.target.value)} placeholder="https://…" className={F_INPUT} />
                </div>
                <div>
                  <label className="block text-1.4 text-brand-dark mb-1.5">Type</label>
                  <Select value={item.type} onChange={(e) => updateNotableItem(index, "type", e.target.value)} className={F_INPUT}>
                    <option value="">Select type</option>
                    <option value="Publication">Publication</option>
                    <option value="Project">Project</option>
                    <option value="Achievement">Achievement</option>
                    <option value="Award">Award</option>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center pt-5">
        <Button variant="ghost" size="sm" className={BACK_CLS} onClick={onBack}>← BACK</Button>
        <Button variant="ghost" size="sm" className={CONT_CLS} disabled={status === "submitting"} onClick={onSubmit}>
          {status === "submitting" ? "SUBMITTING..." : "SUBMIT PROFILE →"}
        </Button>
      </div>
    </div>
  );
}
