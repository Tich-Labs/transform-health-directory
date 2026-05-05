import React, { useRef, useEffect } from "react";
import { LinkedInIcon, PersonIcon, OrgIcon } from "./icons";
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
        className="bg-white rounded-2xl w-full max-w-4xl relative shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
      >
        {/* ── ILLUSTRATION STRIP — same as LeaderCard ── */}
        <div className="relative">
          <img
            src="./illustrations/Card-top.svg"
            alt=""
            className="w-full h-[200px] object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 text-gray-600 hover:text-brand-navy hover:bg-white transition-colors text-[1.8rem] leading-none cursor-pointer shadow-sm"
            aria-label="Close profile"
          >
            ✕
          </button>
        </div>

        {/* ── PHOTO — overlaps strip bottom ── */}
        <div className="flex justify-center -mt-[80px] mb-4 relative z-10">
          {leader.photo_url ? (
            <img
              src={leader.photo_url}
              alt={`${leader.first_name} ${leader.last_name}`}
              className="w-[160px] h-[160px] rounded-full object-cover border-4 border-brand-pink shadow-lg"
            />
          ) : (
            <div className="w-[160px] h-[160px] rounded-full bg-gray-300 border-4 border-brand-pink flex items-center justify-center text-[3.6rem] font-semibold text-gray-600 shadow-lg">
              {getInitials(leader.first_name, leader.last_name)}
            </div>
          )}
        </div>

        {/* ── NAME + ROLE + ORG ── */}
        <div className="text-center px-8 mb-5">
          {isFeatured && (
            <span className="text-[1.1rem] font-semibold bg-brand-pink text-white px-3 py-1 rounded-full mb-3 inline-block tracking-wide">
              ★ Featured
            </span>
          )}
          <h2
            id="profile-modal-title"
            className="text-[2.6rem] font-bold text-brand-navy leading-tight tracking-heading mb-1 flex items-center justify-center gap-3 flex-wrap"
          >
            {leader.first_name} {leader.last_name}
            {leader.linkedin?.trim() && (
              <a
                href={leader.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn Profile"
                className="inline-flex opacity-70 hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <LinkedInIcon />
              </a>
            )}
          </h2>
          {leader.role && (
            <div className="text-[1.4rem] text-gray-700 flex items-center justify-center gap-1.5 mt-1">
              <PersonIcon /> <span>{leader.role}</span>
            </div>
          )}
          {leader.organisation && (
            <div className="text-[1.3rem] text-gray-600 flex items-center justify-center gap-1.5 mt-0.5">
              <OrgIcon /> <span>{leader.organisation}</span>
            </div>
          )}
        </div>

        {/* ── META ROW ── */}
        {(leader.country || yearsExp || countriesList.length > 0) && (
          <div className="mx-8 mb-5 bg-gray-50 rounded-xl px-6 py-4 flex flex-wrap gap-x-8 gap-y-3 border border-gray-100">
            {leader.country && (
              <div>
                <div className="text-[1.0rem] font-bold uppercase tracking-[0.1em] text-gray-400 mb-0.5">Based in</div>
                <div className="text-[1.4rem] text-brand-navy font-medium">{leader.country}</div>
              </div>
            )}
            {yearsExp && (
              <div>
                <div className="text-[1.0rem] font-bold uppercase tracking-[0.1em] text-gray-400 mb-0.5">Experience</div>
                <div className="text-[1.4rem] text-brand-navy font-medium">{yearsExp}</div>
              </div>
            )}
            {countriesList.length > 0 && (
              <div>
                <div className="text-[1.0rem] font-bold uppercase tracking-[0.1em] text-gray-400 mb-0.5">Works across</div>
                <div className="text-[1.4rem] text-brand-navy font-medium">{countriesList.join(", ")}</div>
              </div>
            )}
          </div>
        )}

        {/* ── EXPERTISE TAGS ── */}
        {expertiseTags.length > 0 && (
          <div className="px-8 mb-5">
            <SectionLabel>Expertise</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {expertiseTags.map((tag) => (
                <span
                  key={tag}
                  className="text-[1.2rem] text-gray-700 bg-gray-100 px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── BIO ── */}
        {leader.bio && (
          <div className="px-8 mb-5">
            <SectionLabel>About</SectionLabel>
            <p className="text-[1.6rem] text-gray-700 leading-[1.8]">{leader.bio}</p>
          </div>
        )}

        {/* ── PUBLICATIONS ── */}
        {notableItems.length > 0 && (
          <div className="px-8 mb-5">
            <SectionLabel>Publications</SectionLabel>
            <div className="flex flex-col gap-3">
              {notableItems.map((item, i) => (
                <div key={i} className="flex gap-4 bg-gray-50 rounded-xl px-5 py-4 border border-gray-100">
                  <span className="text-[1.4rem] font-bold text-brand-navy flex-shrink-0 w-6">{i + 1}.</span>
                  <div>
                    <div className="text-[1.4rem] font-semibold text-gray-800">
                      {item.link ? (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline text-brand-navy">
                          {item.title}
                        </a>
                      ) : (
                        item.title
                      )}
                    </div>
                    {item.type && <div className="text-[1.2rem] text-gray-500 mt-0.5">{item.type}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── FOOTER CTA ── */}
        <div className="px-8 py-6 border-t border-gray-100">
          <p className="text-[1.3rem] text-gray-500 mb-3 text-center">Is this your profile?</p>
          <button
            onClick={() => { onClose(); onManage(leader); }}
            className="w-full px-6 py-3 border-2 border-brand-navy text-brand-navy text-[1.4rem] font-semibold rounded-full hover:bg-brand-navy hover:text-white transition-colors cursor-pointer"
          >
            Update or remove my profile
          </button>
        </div>
      </div>
    </div>
  );
}
