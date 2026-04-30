import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { MOCK_LEADERS } from "../data/mockData";

function TBC() {
  return <span className="text-gray-600 italic text-[1.4rem]">TBC</span>;
}

const EXPERTISE_OPTIONS = [
  "AI",
  "Digital health",
  "Health financing",
  "Health information systems",
  "Health systems strengthening",
  "mHealth",
  "Digital health policy",
  "Digital health strategy",
  "Digital health advocacy",
  "Digital health innovation",
  "Digital health transformation",
  "Digital health philanthropy",
  "Research",
  "Telemedicine",
  "Health workforce",
];

const INITIAL_VISIBLE = 6;
const EXPANDED_VISIBLE = 9;
const PAGE_SIZE = 9;

const CONTINENTS = [
  "Africa",
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Oceania",
];

const COUNTRY_TO_CONTINENT = {
  "South Africa": "Africa",
  Nigeria: "Africa",
  Kenya: "Africa",
  Tanzania: "Africa",
  Uganda: "Africa",
  Ghana: "Africa",
  Ethiopia: "Africa",
  Rwanda: "Africa",
  Senegal: "Africa",
  India: "Asia",
  Malaysia: "Asia",
  China: "Asia",
  Japan: "Asia",
  France: "Europe",
  "United Kingdom": "Europe",
  Germany: "Europe",
  Switzerland: "Europe",
  "United States": "North America",
  Canada: "North America",
  Brazil: "South America",
  Australia: "Oceania",
};

export default function Database({ onManageProfile }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expertiseFilter, setExpertiseFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [continentFilter, setContinentFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    setLoading(true);
    try {
      const url = import.meta.env.VITE_APPS_SCRIPT_URL || "";
      if (!url) {
        setItems(MOCK_LEADERS);
      } else {
        const r = await axios.get(url + "?api=entries&status=live");
        setItems(r.data || []);
      }
    } catch (e) {
      console.error(e);
      setItems(MOCK_LEADERS);
    } finally {
      setLoading(false);
    }
  }

  const filteredItems = useMemo(() => {
    let result = items;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (it) =>
          (it.first_name || "").toLowerCase().includes(q) ||
          (it.last_name || "").toLowerCase().includes(q) ||
          (it.role || "").toLowerCase().includes(q) ||
          (it.organisation || "").toLowerCase().includes(q) ||
          (it.bio || "").toLowerCase().includes(q)
      );
    }

    if (expertiseFilter) {
      result = result.filter((it) =>
        (it.expertise || "").includes(expertiseFilter)
      );
    }

    if (countryFilter) {
      result = result.filter((it) => it.country === countryFilter);
    }

    if (continentFilter) {
      result = result.filter((it) => {
        const continent = it.country ? COUNTRY_TO_CONTINENT[it.country] : null;
        return continent === continentFilter;
      });
    }

    if (sortBy === "az") {
      result = [...result].sort((a, b) =>
        (a.first_name || "").localeCompare(b.first_name || "")
      );
    } else if (sortBy === "za") {
      result = [...result].sort((a, b) =>
        (b.first_name || "").localeCompare(a.first_name || "")
      );
    } else if (sortBy === "latest") {
      result = [...result].reverse();
    }

    return result;
  }, [items, search, expertiseFilter, countryFilter, continentFilter, sortBy]);

  const paginationActive =
    visibleCount >= EXPANDED_VISIBLE && filteredItems.length > EXPANDED_VISIBLE;

  const visibleItems = useMemo(() => {
    if (paginationActive) {
      const start = (currentPage - 1) * PAGE_SIZE;
      return filteredItems.slice(start, start + PAGE_SIZE);
    }
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount, currentPage, paginationActive]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));

  const stats = useMemo(() => {
    const expertiseCounts = {};
    items.forEach((it) => {
      const exp = it.expertise || "Other";
      expertiseCounts[exp] = (expertiseCounts[exp] || 0) + 1;
    });
    return {
      total: items.length,
      expertise: Object.keys(expertiseCounts).length,
      expertiseCounts,
    };
  }, [items]);

  function clearFilters() {
    setSearch("");
    setExpertiseFilter("");
    setCountryFilter("");
    setContinentFilter("");
    setSortBy("");
    setVisibleCount(INITIAL_VISIBLE);
    setCurrentPage(1);
    setShowFilters(false);
  }

  function toggleFilter(type, value) {
    if (type === "continent") {
      setContinentFilter(continentFilter === value ? "" : value);
      if (continentFilter !== value) {
        setCountryFilter("");
      }
    } else if (type === "country") {
      setCountryFilter(countryFilter === value ? "" : value);
    } else if (type === "expertise") {
      setExpertiseFilter(expertiseFilter === value ? "" : value);
    }
    setVisibleCount(INITIAL_VISIBLE);
    setCurrentPage(1);
  }

  const activeFilterCount = [continentFilter, countryFilter, expertiseFilter].filter(Boolean).length;

  const allCountries = Object.keys(COUNTRY_TO_CONTINENT).sort();
  const visibleCountries = continentFilter
    ? allCountries.filter((c) => COUNTRY_TO_CONTINENT[c] === continentFilter)
    : allCountries;

  function loadMore() {
    setVisibleCount((count) =>
      Math.min(count + INITIAL_VISIBLE, filteredItems.length)
    );
    setCurrentPage(1);
  }

  function goToPage(page) {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }

  function getInitials(first, last) {
    return ((first?.[0] || "") + (last?.[0] || "")).toUpperCase();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-[1.8rem]">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-[1440px] mx-auto px-8 py-6">
        <h1
          style={{
            fontSize: "3.0rem",
            fontWeight: 700,
            color: "rgb(2, 89, 142)",
            marginBottom: "1.6rem",
            letterSpacing: "-0.042em",
          }}
        >
          Women Leaders in Digital Health Database
        </h1>
      </div>
      <div
        style={{
          background: "#f5efe0",
          position: "sticky",
          top: 0,
          zIndex: 40,
          borderBottom: showFilters ? "none" : "1px solid #e5e7eb",
        }}
      >
        {/* Row 1 — always visible */}
        <div className="max-w-[1440px] mx-auto px-8 py-3 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] max-w-[420px]">
            <input
              type="text"
              placeholder="Search name, organisation, role..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setVisibleCount(INITIAL_VISIBLE);
                setCurrentPage(1);
              }}
              style={{
                width: "100%",
                padding: "1.0rem 1.6rem",
                border: "1.5px solid #d1d5db",
                borderRadius: 10,
                fontSize: "1.6rem",
                outline: "none",
                background: "rgb(238, 243, 251)",
                boxSizing: "border-box",
              }}
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setVisibleCount(INITIAL_VISIBLE);
              setCurrentPage(1);
            }}
            style={{
              padding: "1.0rem 1.6rem",
              border: "1.5px solid #d1d5db",
              borderRadius: 10,
              fontSize: "1.4rem",
              outline: "none",
              background: "rgb(238, 243, 251)",
              cursor: "pointer",
              fontWeight: 600,
              color: "#333",
            }}
          >
            <option value="">Sort by</option>
            <option value="az">A → Z</option>
            <option value="za">Z → A</option>
            <option value="latest">Latest</option>
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: "1.0rem 1.8rem",
              border: "1.5px solid #02598e",
              borderRadius: 10,
              background: showFilters ? "#02598e" : "#fff",
              color: showFilters ? "#fff" : "#02598e",
              fontSize: "1.4rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              letterSpacing: "0.02em",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
              <path d="M2 3h12M4 6.5h8M6 10h4M7.5 13h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span style={{
                background: showFilters ? "rgba(255,255,255,0.25)" : "#02598e",
                color: showFilters ? "#fff" : "#fff",
                borderRadius: 10,
                padding: "0.1rem 0.55rem",
                fontSize: "1.2rem",
                fontWeight: 700,
                minWidth: 18,
                textAlign: "center",
              }}>
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="ml-auto text-[1.4rem] text-gray-600" style={{ fontWeight: 500 }}>
            {filteredItems.length} of {stats.total} leaders
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="max-w-[1440px] mx-auto px-8 pb-3 flex flex-wrap items-center gap-2">
            <span style={{ fontSize: "1.3rem", color: "#666", fontWeight: 500 }}>Active:</span>
            {continentFilter && (
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "0.4rem 1.0rem",
                borderRadius: 20,
                background: "#02598e",
                color: "#fff",
                fontSize: "1.3rem",
                fontWeight: 500,
              }}>
                {continentFilter}
                <button
                  onClick={() => toggleFilter("continent", continentFilter)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", fontSize: "1.4rem", lineHeight: 1, padding: 0 }}
                >×</button>
              </span>
            )}
            {countryFilter && (
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "0.4rem 1.0rem",
                borderRadius: 20,
                background: "#02598e",
                color: "#fff",
                fontSize: "1.3rem",
                fontWeight: 500,
              }}>
                {countryFilter}
                <button
                  onClick={() => toggleFilter("country", countryFilter)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", fontSize: "1.4rem", lineHeight: 1, padding: 0 }}
                >×</button>
              </span>
            )}
            {expertiseFilter && (
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "0.4rem 1.0rem",
                borderRadius: 20,
                background: "#02598e",
                color: "#fff",
                fontSize: "1.3rem",
                fontWeight: 500,
              }}>
                {expertiseFilter}
                <button
                  onClick={() => toggleFilter("expertise", expertiseFilter)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", fontSize: "1.4rem", lineHeight: 1, padding: 0 }}
                >×</button>
              </span>
            )}
            <button
              onClick={clearFilters}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "1.3rem",
                color: "#02598e",
                fontWeight: 600,
                textDecoration: "underline",
                padding: "0.4rem 0",
              }}
            >
              Clear all
            </button>
          </div>
        )}

        {/* Row 2 — collapsible filter panel */}
        {showFilters && (
          <div style={{
            background: "rgb(255, 255, 244)",
            borderTop: "1px solid #e5e7eb",
            padding: "2.4rem 2.4rem 2rem",
          }}>
            <div className="max-w-[1440px] mx-auto space-y-5">
              {/* Continent */}
              <div>
                <label style={{
                  display: "block",
                  fontSize: "1.6rem",
                  color: "#111",
                  marginBottom: 12,
                  fontWeight: 600,
                }}>
                  Continent
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {CONTINENTS.map((c) => (
                    <button
                      key={c}
                      onClick={() => toggleFilter("continent", c)}
                      style={{
                        padding: "0.8rem 1.4rem",
                        borderRadius: 20,
                        fontSize: "1.4rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        border: continentFilter === c
                          ? "1.5px solid #02598e"
                          : "1.5px solid #d1d5db",
                        background: continentFilter === c ? "#02598e" : "#fff",
                        color: continentFilter === c ? "#fff" : "#333",
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Country */}
              <div>
                <label style={{
                  display: "block",
                  fontSize: "1.6rem",
                  color: "#111",
                  marginBottom: 12,
                  fontWeight: 600,
                }}>
                  Country{continentFilter ? ` — ${continentFilter}` : ""}
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {visibleCountries.map((c) => (
                    <button
                      key={c}
                      onClick={() => toggleFilter("country", c)}
                      style={{
                        padding: "0.8rem 1.4rem",
                        borderRadius: 20,
                        fontSize: "1.4rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        border: countryFilter === c
                          ? "1.5px solid #02598e"
                          : "1.5px solid #d1d5db",
                        background: countryFilter === c ? "#02598e" : "#fff",
                        color: countryFilter === c ? "#fff" : "#333",
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Expertise */}
              <div>
                <label style={{
                  display: "block",
                  fontSize: "1.6rem",
                  color: "#111",
                  marginBottom: 12,
                  fontWeight: 600,
                }}>
                  Expertise
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {EXPERTISE_OPTIONS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleFilter("expertise", tag)}
                      style={{
                        padding: "0.8rem 1.4rem",
                        borderRadius: 20,
                        fontSize: "1.4rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        border: expertiseFilter === tag
                          ? "1.5px solid #02598e"
                          : "1.5px solid #d1d5db",
                        background: expertiseFilter === tag ? "#02598e" : "#fff",
                        color: expertiseFilter === tag ? "#fff" : "#333",
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-[1440px] mx-auto px-8 py-6">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <div className="text-[3rem] mb-2">No leaders found</div>
            <div className="text-[1.4rem]">Try adjusting your filters</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleItems.map((it) => (
                <div
                  key={it.id}
                  onClick={() => setSelectedProfile(it)}
                  className="relative cursor-pointer rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                  style={{ border: "1px solid #e5e7eb" }}
                >
                  {/* Dark header */}
                  <div className="h-[120px]" style={{ background: "#333333" }} />

                  {/* Profile photo — straddles header/body boundary */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2"
                    style={{ top: 60, zIndex: 2 }}
                  >
                    <div className="relative">
                      {it.photo_url ? (
                        <img
                          src={it.photo_url}
                          alt={`${it.first_name} ${it.last_name}`}
                          className="w-[76px] h-[76px] rounded-full object-cover"
                          style={{ border: "2px solid #F85A8E" }}
                        />
                      ) : (
                        <div
                          className="w-[76px] h-[76px] rounded-full bg-[#D9D9D9] flex items-center justify-center text-[2rem] font-semibold text-gray-600"
                          style={{ border: "2px solid #F85A8E" }}
                        >
                          {getInitials(it.first_name, it.last_name)}
                        </div>
                      )}
                      {it.linkedin && (
                        <a
                          href={it.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="absolute bottom-0 right-[-4px] w-[28px] h-[28px] rounded-full bg-[#02598E] flex items-center justify-center hover:bg-[#024a75] transition-colors"
                          aria-label="LinkedIn"
                        >
                          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                            <path d="M10.5 5.5C11.563 5.5 12.583 5.921 13.334 6.672C14.085 7.423 14.5 8.437 14.5 9.5V14H12.5V9.5C12.5 8.97 12.289 8.461 11.914 8.086C11.539 7.711 11.03 7.5 10.5 7.5C9.97 7.5 9.461 7.711 9.086 8.086C8.711 8.461 8.5 8.97 8.5 9.5V14H6.5V9.5C6.5 8.437 6.915 7.423 7.666 6.672C8.417 5.921 9.437 5.5 10.5 5.5Z" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M1.5 6H4.5V14H1.5V6Z" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="3" cy="3" r="1.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* White body */}
                  <div
                    className="bg-white flex flex-col"
                    style={{ paddingTop: 52, paddingLeft: 20, paddingRight: 20, paddingBottom: 20 }}
                  >
                    {/* Name + role + org */}
                    <div className="text-center mb-3">
                      <div className="font-semibold text-gray-900 text-[1.6rem] leading-tight">
                        {it.first_name} {it.last_name}
                      </div>
                      <div className="text-[1.3rem] text-gray-500 mt-1 leading-snug">
                        {it.role || <TBC />}
                      </div>
                      {it.organisation && (
                        <div className="text-[1.2rem] text-gray-400 mt-0.5">{it.organisation}</div>
                      )}
                    </div>

                    {/* Expertise tags */}
                    {it.expertise && (
                      <div className="flex flex-wrap gap-1 justify-center mb-4">
                        {it.expertise.split(", ").slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[1.2rem] text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {it.expertise.split(", ").length > 3 && (
                          <span className="text-[1.2rem] text-gray-500">
                            +{it.expertise.split(", ").length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Footer: country + read more */}
                    <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                      {it.country ? (
                        <span className="text-[1.2rem] text-gray-400">{it.country}</span>
                      ) : (
                        <span />
                      )}
                      <span className="text-[1.3rem] text-[#02598E] font-medium">
                        Read more →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {visibleCount < EXPANDED_VISIBLE &&
              visibleCount < filteredItems.length && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={loadMore}
                    className="px-6 py-3 bg-[#E8571D] text-white rounded-lg text-[1.6rem] font-medium hover:bg-[#d64d1f] transition-colors"
                  >
                    Load more leaders
                  </button>
                </div>
              )}

            {paginationActive && (
              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-200 flex-wrap justify-center">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-gray-300 rounded text-[1.4rem] font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:border-gray-400"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => goToPage(i + 1)}
                    className={`px-3 py-1.5 border rounded text-[1.4rem] font-medium ${
                      currentPage === i + 1
                        ? "bg-gray-800 text-white border-gray-800"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-gray-300 rounded text-[1.4rem] font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:border-gray-400"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div
        style={{
          textAlign: "center",
          padding: "2.4rem 0 3.2rem",
          fontFamily: "'Montserrat', sans-serif",
        }}
      >
        <p style={{ fontSize: "1.4rem", color: "#555" }}>
          Already in the database?{" "}
          <button
            onClick={() => onManageProfile(null)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#02598e",
              fontWeight: 600,
              fontSize: "1.4rem",
              textDecoration: "underline",
              padding: 0,
            }}
          >
            Manage or remove your profile
          </button>
        </p>
      </div>

      {selectedProfile && (
        <div
          className="fixed inset-0 bg-black/50 z-[1000] flex items-start justify-center overflow-y-auto py-10 px-4"
          onClick={() => setSelectedProfile(null)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full p-6 relative max-h-[calc(100vh-4rem)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProfile(null)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-[2rem] leading-none"
              aria-label="Close profile"
            >
              ✕
            </button>

            <div className="flex items-start gap-5 mb-6">
              <div className="flex-shrink-0">
                {selectedProfile.photo_url ? (
                  <img
                    src={selectedProfile.photo_url}
                    alt={`${selectedProfile.first_name} ${selectedProfile.last_name}`}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-[2rem] font-semibold text-gray-700">
                    {getInitials(
                      selectedProfile.first_name,
                      selectedProfile.last_name
                    )}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                {(selectedProfile.featured === true ||
                  selectedProfile.featured === "true") && (
                  <span className="text-[1.2rem] font-medium bg-gray-800 text-white px-2 py-0.5 rounded-full mb-2 inline-block">
                    ★ Featured
                  </span>
                )}
                <h2 className="text-[2rem] font-semibold text-gray-900">
                  {selectedProfile.first_name} {selectedProfile.last_name}
                </h2>
                <p className="text-[1.4rem] text-gray-700 mt-1">
                  {selectedProfile.role || <TBC />}
                </p>
                <p className="text-[1.4rem] text-gray-600 mt-0.5">
                  {selectedProfile.organisation || <TBC />}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-1 mb-6 text-[1.6rem]">
              <div className="text-[1.2rem] font-medium text-gray-600 uppercase tracking-wide">
                Years of experience
              </div>
              <div className="text-gray-800">
                {selectedProfile.yearsExp || <TBC />}
              </div>

              <div className="text-[1.2rem] font-medium text-gray-600 uppercase tracking-wide">
                Country of residence
              </div>
              <div className="text-gray-800">
                {selectedProfile.country || <TBC />}
              </div>

              <div className="text-[1.2rem] font-medium text-gray-600 uppercase tracking-wide">
                Countries of operation
              </div>
              <div className="text-gray-800">
                {selectedProfile.selectedCountries || <TBC />}
              </div>

              <div className="text-[1.2rem] font-medium text-gray-600 uppercase tracking-wide">
                LinkedIn
              </div>
              <div>
                {selectedProfile.linkedin ? (
                  <a
                    href={selectedProfile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View profile →
                  </a>
                ) : (
                  <TBC />
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="text-[1.2rem] font-medium text-gray-600 uppercase tracking-wide mb-2">
                Bio
              </div>
              {selectedProfile.bio ? (
                <p className="text-gray-800 leading-relaxed text-[1.6rem]">
                  {selectedProfile.bio}
                </p>
              ) : (
                <TBC />
              )}
            </div>

            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="text-[1.2rem] font-medium text-gray-600 uppercase tracking-wide mb-2">
                Expertise
              </div>
              {selectedProfile.expertise ? (
                <div className="flex flex-wrap gap-1">
                  {selectedProfile.expertise.split(", ").map((tag) => (
                    <span
                      key={tag}
                      className="text-[1.4rem] bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <TBC />
              )}
            </div>

            {selectedProfile.notableItems &&
              selectedProfile.notableItems.length > 0 && (
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="text-[1.2rem] font-medium text-gray-600 uppercase tracking-wide mb-2">
                    Notable achievements
                  </div>
                  <div className="space-y-2">
                    {selectedProfile.notableItems.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-[1.6rem]"
                      >
                        <span className="text-[1.2rem] font-semibold text-gray-600 mt-0.5 w-5">
                          {i + 1}.
                        </span>
                        <div className="flex-1">
                          <div className="text-gray-900 font-medium">
                            {item.link ? (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {item.title}
                              </a>
                            ) : (
                              item.title
                            )}
                          </div>
                          {item.type && (
                            <span className="text-[1.2rem] text-gray-600">
                              {item.type}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <div className="mt-4 pt-4 border-t border-gray-200 text-center">
              <p className="text-[1.4rem] text-gray-600 mb-2">Is this you?</p>
              <button
                onClick={() => {
                  setSelectedProfile(null);
                  onManageProfile(selectedProfile);
                }}
                className="w-full px-4 py-2 border border-gray-300 text-gray-800 text-[1.6rem] font-medium rounded-full hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                Update or remove my profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
