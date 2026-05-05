import React, { useState } from "react";
import { api } from "../api/leaders";
import { compressImage } from "../utils/compressImage";
import Button from "../components/Button";
import {
  Step0Branch,
  Step1Consent,
  Step2BasicInfo,
  Step3ProfileDetails,
  Step4Links,
} from "./SubmitSteps";

const STEP_LABELS = ["Start", "Consent", "Basic Info", "Profile", "Links"];

export default function Submit({ onManageProfile }) {
  const [step,              setStep]              = useState(0);
  const [branch,            setBranch]            = useState("self");
  const [nominateLink,      setNominateLink]      = useState("");
  const [nominatorName,     setNominatorName]     = useState("");
  const [nominatorEmail,    setNominatorEmail]    = useState("");
  const [nomineeFirstName,  setNomineeFirstName]  = useState("");
  const [nomineeLastName,   setNomineeLastName]   = useState("");
  const [consent,           setConsent]           = useState(null);
  const [firstName,         setFirstName]         = useState("");
  const [lastName,          setLastName]          = useState("");
  const [role,              setRole]              = useState("");
  const [org,               setOrg]               = useState("");
  const [expertise,         setExpertise]         = useState([]);
  const [otherExpertise,    setOtherExpertise]    = useState("");
  const [country,           setCountry]           = useState("");
  const [geoScope,          setGeoScope]          = useState("");
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [bio,               setBio]               = useState("");
  const [email,             setEmail]             = useState("");
  const [linkedin,          setLinkedin]          = useState("");
  const [notableText,       setNotableText]       = useState("");
  const [notableItems,      setNotableItems]      = useState([]);
  const [photo,             setPhoto]             = useState(null);
  const [photoPreview,      setPhotoPreview]      = useState(null);
  const [yearsExp,          setYearsExp]          = useState("");
  const [status,            setStatus]            = useState("");
  const [showNoConsentModal, setShowNoConsentModal] = useState(false);

  const charCount = bio.length;

  function goStep(n) { if (n >= 0 && n <= 5) setStep(n); }

  function handleStep0Continue() {
    if (branch === "nominate") { submitNomination(); return; }
    goStep(1);
  }

  async function submitNomination() {
    setStatus("submitting");
    try {
      await api.submitProfile({
        branch: "nominate",
        firstName: nomineeFirstName,
        lastName: nomineeLastName,
        nominateLink,
        nominatorName,
        email: nominatorEmail,
      });
      setStatus("submitted");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  function handleConsent() {
    if (consent === "no") setShowNoConsentModal(true);
    else if (consent === "yes") goStep(2);
  }

  function toggleExpertise(tag) {
    if (expertise.includes(tag)) setExpertise(expertise.filter((e) => e !== tag));
    else if (expertise.length < 5) setExpertise([...expertise, tag]);
  }

  function bioCharWarning() { return charCount > 0 && (charCount < 300 || charCount > 500); }

  function updateNotableItem(index, field, value) {
    setNotableItems((cur) => cur.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }

  function addNotableItem() {
    if (notableItems.length >= 3) return;
    setNotableItems((cur) => [...cur, { title: "", link: "", type: "" }]);
  }

  function removeNotableItem(index) {
    setNotableItems((cur) => cur.filter((_, i) => i !== index));
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file || file.size > 5 * 1024 * 1024) return;
    try {
      const compressed = await compressImage(file);
      setPhoto(compressed);
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target.result);
      reader.readAsDataURL(compressed);
    } catch (err) {
      console.error("Compression failed:", err);
    }
  }

  function resetForm() {
    setFirstName(""); setLastName(""); setRole(""); setOrg("");
    setExpertise([]); setYearsExp(""); setSelectedCountries([]);
    setBio(""); setLinkedin(""); setPhoto(null);
    setPhotoPreview(null); setConsent(null);
    setStep(0); setStatus("");
  }

  async function submit() {
    setStatus("submitting");
    try {
      let photoUrl = "";
      if (photo) {
        photoUrl = await api.uploadPhoto(photo);
      }

      const payload = {
        branch, firstName, lastName, email, role,
        organisation: org,
        country,
        geo_scope: geoScope || null,
        nominateLink: branch === "nominate" ? nominateLink : null,
        expertise: [...expertise.filter(e => e !== "Other"), otherExpertise ? `Other: ${otherExpertise}` : ""].filter(Boolean).join(", "),
        yearsExp,
        countries: selectedCountries.join(", "),
        bio, linkedin,
        notableItems: notableItems.filter((item) => item.title || item.link || item.type),
        photoUrl,
      };

      await api.submitProfile(payload);
      setStatus("submitted");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  const step3Invalid =
    !yearsExp || expertise.length === 0 || selectedCountries.length === 0 ||
    !bio || charCount < 300 || charCount > 500 || !photo;

  if (status === "submitted") {
    return (
      <div className="bg-brand-sand min-h-screen font-sans">
        <div className="max-w-[600px] mx-auto px-4 sm:px-[2.4rem] pt-[6.4rem]">
          <div className="text-center mb-10">
            <p className="text-1.4 text-brand-pink font-semibold tracking-[0.04em] mb-3">
              Submission received
            </p>
            <h2 className="text-[3.6rem] font-bold text-brand-dark mb-8 tracking-heading">
              Thank you for contributing
            </h2>
            <p className="text-[1.8rem] text-dark leading-[1.7] max-w-[480px] mx-auto">
              Your submission helps advance gender equity and representation in
              digital health leadership worldwide.
            </p>
          </div>

          <div className="flex flex-col gap-4 mb-12">
            {[
              { title: "Profile under review", body: "The Transform Health team reviews all submissions before they go live. This typically takes 3–5 business days." },
              { title: "Once approved",        body: "Your full profile card will appear in the public directory at transformhealthcoalition.org/leaders" },
            ].map(({ title, body }) => (
              <div key={title} className="bg-gray-50 border border-gray-200 rounded-xl px-11 py-9 flex gap-5 items-start">
                <div className="w-9 h-9 rounded-full border-[3px] border-brand-navy border-t-transparent flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[1.8rem] text-brand-dark mb-2">{title}</div>
                  <p className="text-1.6 text-gray-600 leading-[1.7] m-0">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end items-center max-w-[600px] mx-auto px-4 sm:px-[2.4rem] py-8 border-t border-gray-200">
          <Button variant="ghost" size="sm" className="font-bold tracking-[0.06em] uppercase" onClick={resetForm}>
            SUBMIT ANOTHER PROFILE →
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-sand overflow-x-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6">
        <div className="max-w-[1000px] mx-auto">

        {/* Progress bar (steps 1–4) */}
        {step >= 1 && step <= 4 && (
          <div className="mb-6">
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3, 4].map((s) => (
                <React.Fragment key={s}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-1.4 font-medium ${s <= step ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600"}`}>
                    {s < step ? "✓" : s + 1}
                  </div>
                  <div className={`flex-1 h-0.5 ${s < step ? "bg-gray-800" : "bg-gray-200"} ${s === 4 ? "hidden" : ""}`} />
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[1rem] sm:text-1.2 text-gray-600">
              {STEP_LABELS.map((label, i) => <span key={i}>{label}</span>)}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10 items-start">
        <div className="min-w-0 max-w-[640px]">
          {step === 0 && (
            <Step0Branch
              branch={branch} setBranch={setBranch}
              nominateLink={nominateLink} setNominateLink={setNominateLink}
              nominatorName={nominatorName} setNominatorName={setNominatorName}
              nominatorEmail={nominatorEmail} setNominatorEmail={setNominatorEmail}
              nomineeFirstName={nomineeFirstName} setNomineeFirstName={setNomineeFirstName}
              nomineeLastName={nomineeLastName} setNomineeLastName={setNomineeLastName}
              onContinue={handleStep0Continue}
              onManageProfile={onManageProfile}
            />
          )}
          {step === 1 && (
            <Step1Consent
              consent={consent} setConsent={setConsent}
              onBack={() => goStep(0)} onContinue={handleConsent}
            />
          )}
          {step === 2 && (
            <Step2BasicInfo
              firstName={firstName} setFirstName={setFirstName}
              lastName={lastName} setLastName={setLastName}
              email={email} setEmail={setEmail}
              photoPreview={photoPreview} onPhotoUpload={handlePhotoUpload}
              country={country} setCountry={setCountry}
              org={org} setOrg={setOrg}
              role={role} setRole={setRole}
              onBack={() => goStep(1)} onContinue={() => goStep(3)}
            />
          )}
          {step === 3 && (
            <Step3ProfileDetails
              yearsExp={yearsExp} setYearsExp={setYearsExp}
              expertise={expertise} toggleExpertise={toggleExpertise}
              otherExpertise={otherExpertise} setOtherExpertise={setOtherExpertise}
              selectedCountries={selectedCountries} setSelectedCountries={setSelectedCountries}
              geoScope={geoScope} setGeoScope={setGeoScope}
              bio={bio} setBio={setBio}
              charCount={charCount} bioCharWarning={bioCharWarning}
              onBack={() => goStep(2)} onContinue={() => goStep(4)}
              nextDisabled={step === 3 && step3Invalid}
            />
          )}
          {step === 4 && (
            <Step4Links
              linkedin={linkedin} setLinkedin={setLinkedin}
              notableItems={notableItems}
              addNotableItem={addNotableItem}
              removeNotableItem={removeNotableItem}
              updateNotableItem={updateNotableItem}
              status={status}
              onBack={() => goStep(3)} onSubmit={submit}
            />
          )}
        </div>

        {step >= 0 && step <= 4 && (
          <div className="hidden lg:flex flex-col items-end justify-center sticky top-8 self-stretch py-8">
            <img
              src="./illustrations/card-top-texture-0.png"
              alt=""
              className="w-[380px] max-w-none h-auto ml-[40px] mr-[-144px] opacity-60"
            />
          </div>
        )}
      </div>
        </div>{/* max-w-[1000px] */}
      </div>

      {showNoConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/[0.45]">
          <div className="bg-white rounded-2xl p-10 text-center max-w-md w-full shadow-xl font-sans">
            <img src="./illustrations/thank-you.png" alt="" className="w-[90px] h-[90px] object-contain mx-auto mb-8 block" />
            <h2 className="text-2.4 font-bold text-brand-navy mb-4 tracking-heading">
              Thank you for your time
            </h2>
            <div className="flex flex-col gap-[10px] mb-8">
              <p className="text-1.6 text-dark leading-[1.7] m-0">We cannot proceed without your consent.</p>
              <p className="text-1.6 text-dark leading-[1.7] m-0">You are welcome to return and submit your profile anytime.</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="font-semibold tracking-[0.05em] uppercase text-brand-dark hover:text-brand-dark hover:no-underline"
              onClick={() => { setShowNoConsentModal(false); goStep(0); }}
            >
              ← BACK TO START
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
