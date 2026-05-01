import React from "react";

export function LinkedInIcon({ className = "", ...props }) {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className={className} {...props}>
      <path d="M10.5 5.5C11.563 5.5 12.583 5.921 13.334 6.672C14.085 7.423 14.5 8.437 14.5 9.5V14H12.5V9.5C12.5 8.97 12.289 8.461 11.914 8.086C11.539 7.711 11.03 7.5 10.5 7.5C9.97 7.5 9.461 7.711 9.086 8.086C8.711 8.461 8.5 8.97 8.5 9.5V14H6.5V9.5C6.5 8.437 6.915 7.423 7.666 6.672C8.417 5.921 9.437 5.5 10.5 5.5Z" stroke="#0A66C2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4.5 5.5V14" stroke="#0A66C2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3.5 3.5C3.5 3.897 3.342 4.269 3.061 4.561C2.78 4.853 2.398 5.011 2 5.011C1.602 5.011 1.22 4.853 0.939 4.561C0.658 4.269 0.5 3.897 0.5 3.5C0.5 3.103 0.658 2.731 0.939 2.439C1.22 2.147 1.602 1.989 2 1.989C2.398 1.989 2.78 2.147 3.061 2.439C3.342 2.731 3.5 3.103 3.5 3.5Z" stroke="#0A66C2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function PersonIcon({ className = "", ...props }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#02598E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

export function OrgIcon({ className = "", ...props }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#02598E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  );
}

export function LocationIcon({ className = "", ...props }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#02598E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}
