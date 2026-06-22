// Guard against JS null, undefined, empty string, and the literal string "null" from DB
export function hasValue(v) {
  return !!v && v !== "null" && typeof v === "string" && v.trim() !== "";
}

export function getInitials(first, last) {
  return ((first?.[0] || "") + (last?.[0] || "")).toUpperCase();
}

// expertise is stored as text[] in Supabase — normalise to array for all comparisons
export function toTags(expertise) {
  if (!expertise) return [];
  if (Array.isArray(expertise)) return expertise.filter(Boolean);
  return expertise.split(/,\s*/).filter(Boolean);
}

export function toTitleCase(str) {
  if (!str) return "";
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

// Returns null for JS null/undefined AND the literal string "null" that sometimes comes from the DB
export function val(v) {
  if (v === null || v === undefined || v === "null" || v === "") return null;
  return v;
}

export function toCsv(rows) {
  if (!rows || rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v) => {
    if (v === null || v === undefined) return "";
    const str = typeof v === "object" ? JSON.stringify(v) : String(v);
    if (str.includes(",") || str.includes("\n") || str.includes('"')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
}

export function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getMissingFields(item) {
  const fields = [];
  if (!item.country) fields.push("Country");
  if (!item.years_experience) fields.push("Years of experience");
  if (!item.bio) fields.push("Biography");
  if (!item.geo_scope) fields.push("Geographical scope");
  if (!item.photo_url) fields.push("Profile photo");
  if (!item.expertise || item.expertise.length === 0) fields.push("Expertise tags");
  if (!item.countries || item.countries.length === 0) fields.push("Countries of work");
  if (!item.notable_items || item.notable_items.length === 0) fields.push("Notable items");
  return fields;
}
