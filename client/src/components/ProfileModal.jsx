import React, { useRef, useEffect } from "react";
import { LinkedInIcon } from "./icons";
import { useFocusTrap } from "../hooks/useFocusTrap";

function getInitials(first, last) {
  return ((first?.[0] || "") + (last?.[0] || "")).toUpperCase();
}

function toTags(expertise) {
  if (!expertise) return [];
  if (Array.isArray(expertise)) return expertise.filter(Boolean);
  return expertise.split(/,\s*/).filter(Boolean);
}

function toList(field) {
  if (!field) return [];
  if (Array.isArray(field)) return field.filter(Boolean);
  return field.split(/,\s*/).filter(Boolean);
}

function SectionLabel({ children }) {
  return (
    <div className="text-[1.1rem] font-bold uppercase tracking-[0.12em] text-brand-navy mb-3">
      {children}
    </div>
  );
}

function TBC() {
  return <span className="text-[1.4rem] text-gray-400 italic">TBC</span>;
}

export default function ProfileModal({ leader, onClose, onManage }) {
  const modalRef = useFocusTrap(true);
  const previousFocus = useRef(null);

  useEffect(() => {
    previousFocus.current = document.activeElement;
    return () => previousFocus.current?.focus();
  }, []);

  if (!leader) return null;

  const expertiseTags  = toTags(leader.expertise);
  const countriesList  = toList(leader.countries || leader.selectedCountries);
  const yearsExp       = leader.years_experience || leader.yearsExp;
  const notableItems   = leader.notable_items || leader.notableItems || [];
  const isFeatured     = leader.featured === true || leader.featured === "true";

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[1000] flex items-start justify-center overflow-y-auto py-8 px-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl w-full max-w-4xl relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
      >
        {/* ── ILLUSTRATION STRIP — same as grid card ── */}
        <div className="relative">
          <img
            src="./illustrations/Card-top.svg"
            alt=""
            className="w-full h-[120px] object-cover rounded-t-2xl"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 text-gray-600 hover:text-brand-navy hover:bg-white transition-colors text-[1.8rem] leading-none cursor-pointer shadow-sm"
            aria-label="Close profile"
          >
            ✕
          </button>
        </div>

        {/* ── HEADER ── */}
        <div className="px-10 pt-6 pb-6 flex items-start gap-7">
          {/* Photo — overlaps strip bottom */}
          <div className="flex-shrink-0 -mt-[52px] relative z-10">
            {leader.photo_url ? (
              <img
                src={leader.photo_url}
                alt={`${leader.first_name} ${leader.last_name}`}
                className="w-40 h-40 rounded-full object-cover border-4 border-brand-pink shadow-md"
              />
            ) : (
              <div className="w-40 h-40 rounded-full bg-brand-navy flex items-center justify-center text-[3.2rem] font-bold text-white border-4 border-brand-pink shadow-md">
                {getInitials(leader.first_name, leader.last_name)}
              </div>
            )}
          </div>

          {/* Name + role + org */}
          <div className="flex-1 min-w-0 pt-1">
            {isFeatured && (
              <span className="text-[1.1rem] font-semibold bg-brand-navy text-white px-3 py-1 rounded-full mb-3 inline-block tracking-wide">
                ★ Featured
              </span>
            )}
            <h2
              id="profile-modal-title"
              className="text-[2.8rem] font-bold text-brand-navy leading-[1.1] tracking-heading mb-2 flex items-center gap-3 flex-wrap"
            >
              {leader.first_name} {leader.last_name}
              {leader.linkedin?.trim() && (
                <a
                  href={leader.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="LinkedIn Profile"
                  className="inline-flex opacity-80 hover:opacity-100 transition-opacity"
                  onClick={() => {
                    import("../api/leaders").then(({ api }) => api.trackLinkedInClick(leader.id));
                  }}
                >
                  <LinkedInIcon />
                </a>
              )}
            </h2>
            <p className="text-[1.6rem] font-semibold text-brand-dark mb-1">
              {leader.role || <TBC />}
            </p>
            <p className="text-[1.5rem] text-gray-600">
              {leader.organisation || <TBC />}
            </p>
          </div>
        </div>

        {/* ── META STRIP — always shown ── */}
        <div className="mx-10 mb-6 bg-brand-parchment rounded-xl px-6 py-4 flex flex-wrap gap-x-8 gap-y-3 border border-brand-parchment-border">
          <div>
            <div className="text-[1.1rem] font-bold uppercase tracking-[0.1em] text-brand-navy mb-0.5">Based in</div>
            {leader.country
              ? <div className="text-[1.4rem] text-brand-dark">{leader.country}</div>
              : <TBC />}
          </div>
          <div>
            <div className="text-[1.1rem] font-bold uppercase tracking-[0.1em] text-brand-navy mb-0.5">Experience</div>
            {yearsExp
              ? <div className="text-[1.4rem] text-brand-dark">{yearsExp}</div>
              : <TBC />}
          </div>
          <div>
            <div className="text-[1.1rem] font-bold uppercase tracking-[0.1em] text-brand-navy mb-0.5">Works across</div>
            {countriesList.length > 0
              ? <div className="text-[1.4rem] text-brand-dark">{countriesList.join(", ")}</div>
              : <TBC />}
          </div>
        </div>

        {/* ── EXPERTISE TAGS — always shown ── */}
        <div className="px-10 mb-6">
          <SectionLabel>Expertise</SectionLabel>
          {expertiseTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {expertiseTags.map((tag) => (
                <span
                  key={tag}
                  className="text-[1.3rem] font-medium bg-brand-blue-light text-brand-navy px-3 py-1.5 rounded-full border border-brand-blue-border"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <TBC />
          )}
        </div>

        {/* ── BIO — always shown ── */}
        <div className="px-10 mb-6">
          <SectionLabel>About</SectionLabel>
          {leader.bio
            ? <p className="text-[1.6rem] text-brand-dark leading-[1.8]">{leader.bio}</p>
            : <TBC />}
        </div>

        {/* ── PUBLICATIONS — always shown, "None" when empty ── */}
        <div className="px-10 mb-6">
          <SectionLabel>Publications</SectionLabel>
          {notableItems.length > 0 ? (
            <div className="flex flex-col gap-3">
              {notableItems.map((item, i) => (
                <div key={i} className="flex gap-4 bg-brand-parchment rounded-xl px-5 py-4 border border-brand-parchment-border">
                  <span className="text-[1.4rem] font-bold text-brand-navy flex-shrink-0 w-6">{i + 1}.</span>
                  <div>
                    <div className="text-[1.5rem] font-semibold text-brand-dark">
                      {item.link ? (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline text-brand-navy">
                          {item.title}
                        </a>
                      ) : (
                        item.title
                      )}
                    </div>
                    {item.type && <div className="text-[1.3rem] text-gray-600 mt-0.5">{item.type}</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-[1.4rem] text-gray-400 italic">None</span>
          )}
        </div>

        {/* ── FOOTER CTA ── */}
        <div className="px-10 py-6 border-t border-brand-parchment-border">
          <p className="text-[1.4rem] text-gray-600 mb-3 text-center">Is this your profile?</p>
          <button
            onClick={() => { onClose(); onManage(leader); }}
            className="w-full px-6 py-3 border-2 border-brand-navy text-brand-navy text-[1.5rem] font-semibold rounded-full hover:bg-brand-navy hover:text-white transition-colors cursor-pointer"
          >
            Update or remove my profile
          </button>
        </div>
      </div>
    </div>
  );
}
