import React, { createContext, useContext } from "react";
import { LinkedInIcon, PersonIcon, OrgIcon, LocationIcon } from "./icons";

// ─── Context ────────────────────────────────────────────────────────
const CardCtx = createContext(null);
const useCard = () => useContext(CardCtx);

// ─── Internal helpers ────────────────────────────────────────────────────────
function TBC() {
  return <span className="italic text-gray-400 text-[1.4rem]">TBC</span>;
}

function getInitials(first, last) {
  return ((first?.[0] || "") + (last?.[0] || "")).toUpperCase();
}

// ─── Sub-components ────────────────────────────────────────────────────────

/**
 * Shell — outer wrapper. Provides context to all children.
 * Conditionally clickable: only adds cursor + click handler when onSelect is provided.
 */
function Shell({ leader, onSelect, className = "", children }) {
  return (
    <CardCtx.Provider value={{ leader, onSelect }}>
      <div
        onClick={onSelect ? () => onSelect(leader) : undefined}
        className={`relative rounded-xl overflow-hidden border border-gray-200 shadow-sm transition-shadow ${onSelect ? "cursor-pointer hover:shadow-lg" : ""} ${className}`}
      >
        {children}
      </div>
    </CardCtx.Provider>
  );
}

/**
 * Header — the dark decorative SVG strip at the top of the card.
 */
function Header() {
  return (
    <img
      src="./illustrations/Card-top.svg"
      alt=""
      className="w-full h-[120px] object-cover"
    />
  );
}

/**
 * Avatar — photo or initials circle, straddling the header/body boundary.
 * LinkedIn badge overlays bottom-right when a URL is present.
 * Must be rendered as a direct child of Shell (uses absolute positioning).
 */
function Avatar() {
  const { leader: l } = useCard();
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-[60px] z-[2]">
      <div className="relative">
        {l.photo_url ? (
          <img
            src={l.photo_url}
            alt={`${l.first_name} ${l.last_name}`}
            className="w-[76px] h-[76px] rounded-full object-cover border-2 border-brand-pink"
          />
        ) : (
          <div className="w-[76px] h-[76px] rounded-full bg-gray-300 border-2 border-brand-pink flex items-center justify-center text-[2rem] font-semibold text-gray-600">
            {getInitials(l.first_name, l.last_name)}
          </div>
        )}
        {l.linkedin?.trim() && (
          <a
            href={l.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              import("../api/leaders").then(({ api }) => api.trackLinkedInClick(l.id));
            }}
            className="absolute bottom-0 right-[-4px] w-[28px] h-[28px] rounded-full bg-brand-navy flex items-center justify-center hover:bg-navy-dark transition-colors"
            aria-label="LinkedIn profile"
            title="Open LinkedIn profile"
          >
            <LinkedInIcon />
          </a>
        )}
      </div>
    </div>
  );
}

/**
 * Body — white section below the header.
 * Adds top padding to clear the Avatar that overhangs from above.
 */
function Body({ children }) {
  return (
    <div className="bg-white flex flex-col pt-[52px] px-5 pb-5">
      {children}
    </div>
  );
}

/** Meta — name, role (with person icon), org (with building icon). */
function Meta() {
  const { leader: l } = useCard();
  return (
    <div className="text-center mb-3 px-2">
      <div className="font-semibold text-gray-900 text-[1.6rem] leading-tight">
        {l.first_name} {l.last_name}
      </div>
      <div className="text-[1.3rem] text-gray-700 mt-1 leading-snug flex items-center justify-center gap-1.5">
        <PersonIcon /> <span>{l.role || <TBC />}</span>
      </div>
      {l.organisation && (
        <div className="text-[1.2rem] text-gray-600 mt-0.5 flex items-center justify-center gap-1.5">
          <OrgIcon /> <span>{l.organisation}</span>
        </div>
      )}
    </div>
  );
}

/** Tags — up to 3 expertise chips, with overflow count. */
function Tags() {
  const { leader: l } = useCard();
  const tags = (Array.isArray(l.expertise) ? l.expertise : (l.expertise || "").split(/,\s*/)).filter(Boolean);
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-1 justify-center mb-4">
      {tags.slice(0, 3).map((tag) => (
        <span key={tag} className="text-[1.2rem] text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
          {tag}
        </span>
      ))}
      {tags.length > 3 && (
        <span className="text-[1.2rem] text-gray-500">+{tags.length - 3}</span>
      )}
    </div>
  );
}

/**
 * Footer — country with location icon on the left, "Read more" CTA on the right.
 * CTA fires onSelect from context when present.
 */
function Footer() {
  const { leader: l, onSelect } = useCard();
  return (
    <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
      {l.country ? (
        <span className="text-[1.2rem] text-gray-600 flex items-center gap-1.5">
          <LocationIcon /> <span>{l.country}</span>
        </span>
      ) : (
        <span />
      )}
      <button
        type="button"
        onClick={onSelect ? (e) => { e.stopPropagation(); onSelect(l); } : undefined}
        className="inline-flex items-center justify-center w-[134px] h-[40px] bg-brand-pink rounded-[20px] text-white text-[1.3rem] font-medium flex-shrink-0"
      >
        Read more →
      </button>
    </div>
  );
}

// ─── Default export — full standard card ────────────────────────────────────
/**
 * LeaderCard — renders the complete card in the standard layout.
 * Pass onSelect to make the card clickable and wire up "Read more".
 * Omit onSelect for display-only (e.g. Analytics featured section).
 *
 * For custom layouts, use the sub-components directly:
 *   <LeaderCard.Shell leader={l} onSelect={fn}>
 *     <LeaderCard.Header />
 *     <LeaderCard.Avatar />
 *     <LeaderCard.Body>
 *       <LeaderCard.Meta />
 *       <LeaderCard.Tags />
 *       <LeaderCard.Footer />
 *     </LeaderCard.Body>
 *   </LeaderCard.Shell>
 */
export default function LeaderCard({ leader, onSelect }) {
  return (
    <Shell leader={leader} onSelect={onSelect}>
      <Header />
      <Avatar />
      <Body>
        <Meta />
        <Tags />
        <Footer />
      </Body>
    </Shell>
  );
}

LeaderCard.Shell  = Shell;
LeaderCard.Header = Header;
LeaderCard.Avatar = Avatar;
LeaderCard.Body   = Body;
LeaderCard.Meta   = Meta;
LeaderCard.Tags   = Tags;
LeaderCard.Footer = Footer;
