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

export default function Database({ onManageProfile }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expertiseFilter, setExpertiseFilter] = useState("");
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

    return result;
  }, [items, search, expertiseFilter]);

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
    setVisibleCount(INITIAL_VISIBLE);
    setCurrentPage(1);
  }

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
        }}
      >
        <div className="max-w-[1440px] mx-auto px-8 py-3 flex flex-wrap gap-3 items-center">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-full bg-gray-50 focus:bg-white focus:outline-none focus:border-gray-400 text-[1.6rem]"
            />
          </div>

          <select
            value={expertiseFilter}
            onChange={(e) => {
              setExpertiseFilter(e.target.value);
              setVisibleCount(INITIAL_VISIBLE);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-full bg-white focus:outline-none focus:border-gray-400 text-[1.6rem]"
          >
            <option value="">All Expertise</option>
            {EXPERTISE_OPTIONS.map((exp) => (
              <option key={exp} value={exp}>
                {exp}
              </option>
            ))}
          </select>

          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-dashed border-gray-300 text-gray-600 hover:border-gray-400 rounded-full text-[1.4rem]"
          >
            Clear ×
          </button>

          <div className="ml-auto text-[1.4rem] text-gray-600">
            {filteredItems.length} of {stats.total} leaders
          </div>
        </div>
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
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer flex flex-col"
                >
                  <div className="mb-3">
                    <div className="font-medium text-gray-900 text-[1.6rem] leading-tight">
                      {it.first_name} {it.last_name}
                    </div>
                    <div className="text-[1.4rem] text-gray-700 mt-0.5 leading-tight">
                      {it.role}
                    </div>
                  </div>

                  {it.expertise && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {it.expertise
                        .split(", ")
                        .slice(0, 2)
                        .map((tag) => (
                          <span
                            key={tag}
                            className="text-[1.4rem] text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      {it.expertise.split(", ").length > 2 && (
                        <span className="text-[1.4rem] text-gray-600">
                          +{it.expertise.split(", ").length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-auto flex items-center justify-between gap-2">
                    {it.linkedin ? (
                      <a
                        href={it.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[1.4rem] text-blue-600 hover:underline"
                      >
                        LinkedIn →
                      </a>
                    ) : (
                      <span />
                    )}
                    <span className="text-[1.4rem] text-blue-600 font-medium">
                      Read more →
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {visibleCount < EXPANDED_VISIBLE &&
              visibleCount < filteredItems.length && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={loadMore}
                    className="px-6 py-3 bg-[#E8571D] text-white rounded-full text-[1.6rem] font-medium hover:bg-[#d64d1f] transition-colors"
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
