import React from "react";
import { LinkedInIcon, PersonIcon, OrgIcon } from "./icons";

function TBC() {
  return <span className="italic text-gray-400">TBC</span>;
}

function getInitials(first, last) {
  return ((first?.[0] || "") + (last?.[0] || "")).toUpperCase();
}

function MetaRow({ label, children }) {
  return (
    <>
      <div className="text-[1.2rem] font-medium text-gray-600 uppercase tracking-wide">{label}</div>
      <div className="text-gray-800 text-[1.4rem]">{children}</div>
    </>
  );
}

export default function ProfileModal({ leader, onClose, onManage }) {
  if (!leader) return null;

  const isFeatured = leader.featured === true || leader.featured === "true";

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[1000] flex items-start justify-center overflow-y-auto py-10 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-2xl w-full p-6 relative max-h-[calc(100vh-4rem)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-[2rem] leading-none"
          aria-label="Close profile"
        >
          ✕
        </button>

        {/* Header — photo + name + role */}
        <div className="flex items-start gap-5 mb-6">
          <div className="flex-shrink-0">
            {leader.photo_url ? (
              <img
                src={leader.photo_url}
                alt={`${leader.first_name} ${leader.last_name}`}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-[2rem] font-bold text-gray-700">
                {getInitials(leader.first_name, leader.last_name)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {isFeatured && (
              <span className="text-[1.2rem] font-medium bg-gray-800 text-white px-2 py-0.5 rounded-full mb-2 inline-block">
                ★ Featured
              </span>
            )}
            <h2 className="text-[2rem] font-bold text-gray-900 flex items-center gap-2">
              {leader.first_name} {leader.last_name}
              {leader.linkedin?.trim() && (
                <a href={leader.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn Profile" className="inline-flex">
                  <LinkedInIcon />
                </a>
              )}
            </h2>
            <p className="text-[1.4rem] text-gray-800 mt-1 flex items-center gap-2">
              <PersonIcon /> <span>{leader.role || <TBC />}</span>
            </p>
            <p className="text-[1.4rem] text-gray-700 mt-0.5 flex items-center gap-2">
              <OrgIcon /> <span>{leader.organisation || <TBC />}</span>
            </p>
          </div>
        </div>

        {/* Key facts grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-6">
          <MetaRow label="Years of experience">{leader.yearsExp || <TBC />}</MetaRow>
          <MetaRow label="Country of residence">{leader.country || <TBC />}</MetaRow>
          <MetaRow label="Countries of operation">{leader.selectedCountries || <TBC />}</MetaRow>
          <MetaRow label="LinkedIn">
            {leader.linkedin ? (
              <a href={leader.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                View profile →
              </a>
            ) : (
              <TBC />
            )}
          </MetaRow>
        </div>

        {/* Bio */}
        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="text-[1.2rem] font-medium text-gray-600 uppercase tracking-wide mb-2">Bio</div>
          {leader.bio ? (
            <p className="text-gray-800 leading-relaxed text-[1.6rem]">{leader.bio}</p>
          ) : (
            <TBC />
          )}
        </div>

        {/* Expertise */}
        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="text-[1.2rem] font-medium text-gray-600 uppercase tracking-wide mb-2">Expertise</div>
          {leader.expertise ? (
            <div className="flex flex-wrap gap-1">
              {leader.expertise.split(", ").map((tag) => (
                <span key={tag} className="text-[1.4rem] bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <TBC />
          )}
        </div>

        {/* Notable achievements */}
        {leader.notableItems?.length > 0 && (
          <div className="border-t border-gray-200 pt-4 mb-4">
            <div className="text-[1.2rem] font-medium text-gray-600 uppercase tracking-wide mb-2">
              Notable achievements
            </div>
            <div className="space-y-2">
              {leader.notableItems.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-[1.6rem]">
                  <span className="text-[1.2rem] font-bold text-gray-600 mt-0.5 w-5">{i + 1}.</span>
                  <div className="flex-1">
                    <div className="text-gray-900 font-medium">
                      {item.link ? (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {item.title}
                        </a>
                      ) : (
                        item.title
                      )}
                    </div>
                    {item.type && <span className="text-[1.2rem] text-gray-600">{item.type}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Manage CTA */}
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <p className="text-[1.4rem] text-gray-600 mb-2">Is this you?</p>
          <button
            onClick={() => { onClose(); onManage(leader); }}
            className="w-full px-4 py-2 border border-gray-300 text-gray-800 text-[1.6rem] font-medium rounded-full hover:border-gray-400 hover:bg-gray-50 transition-colors"
          >
            Update or remove my profile
          </button>
        </div>
      </div>
    </div>
  );
}
