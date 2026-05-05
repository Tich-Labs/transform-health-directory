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
        className="bg-brand-sand rounded-2xl w-full max-w-3xl relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
      >
        {/* Colour bar at top */}
        <div className="h-2 rounded-t-2xl bg-brand-navy" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:text-brand-navy hover:bg-brand-parchment transition-colors text-[1.8rem] leading-none cursor-pointer"
          aria-label="Close profile"
        >
          ✕
        </button>

        {/* ── HEADER ── */}
        <div className="px-10 pt-8 pb-6 flex items-start gap-7">
          {/* Photo */}
          <div className="flex-shrink-0">
            {leader.photo_url ? (
              <img
                src={leader.photo_url}
                alt={`${leader.first_name} ${leader.last_name}`}
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-brand-navy flex items-center justify-center text-[2.8rem] font-bold text-white border-4 border-white shadow-md">
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
                >
                  <LinkedInIcon />
                </a>
              )}
            </h2>
            {leader.role && (
              <p className="text-[1.6rem] font-semibold text-brand-dark mb-1">{leader.role}</p>
            )}
            {leader.organisation && (
              <p className="text-[1.5rem] text-gray-600">{leader.organisation}</p>
            )}
          </div>
        </div>

        {/* ── META STRIP ── */}
        {(leader.country || yearsExp || countriesList.length > 0) && (
          <div className="mx-10 mb-6 bg-brand-parchment rounded-xl px-6 py-4 flex flex-wrap gap-x-8 gap-y-3 border border-brand-parchment-border">
            {leader.country && (
              <div>
                <div className="text-[1.1rem] font-bold uppercase tracking-[0.1em] text-brand-navy mb-0.5">Based in</div>
                <div className="text-[1.4rem] text-brand-dark">{leader.country}</div>
              </div>
            )}
            {yearsExp && (
              <div>
                <div className="text-[1.1rem] font-bold uppercase tracking-[0.1em] text-brand-navy mb-0.5">Experience</div>
                <div className="text-[1.4rem] text-brand-dark">{yearsExp}</div>
              </div>
            )}
            {countriesList.length > 0 && (
              <div>
                <div className="text-[1.1rem] font-bold uppercase tracking-[0.1em] text-brand-navy mb-0.5">Works across</div>
                <div className="text-[1.4rem] text-brand-dark">{countriesList.join(", ")}</div>
              </div>
            )}
          </div>
        )}

        {/* ── EXPERTISE TAGS ── */}
        {expertiseTags.length > 0 && (
          <div className="px-10 mb-6">
            <SectionLabel>Expertise</SectionLabel>
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
          </div>
        )}

        {/* ── BIO ── */}
        {leader.bio && (
          <div className="px-10 mb-6">
            <SectionLabel>About</SectionLabel>
            <p className="text-[1.6rem] text-brand-dark leading-[1.8]">{leader.bio}</p>
          </div>
        )}

        {/* ── NOTABLE ACHIEVEMENTS ── */}
        {notableItems.length > 0 && (
          <div className="px-10 mb-6">
            <SectionLabel>Notable achievements</SectionLabel>
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
          </div>
        )}

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
