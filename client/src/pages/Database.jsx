import React, { useState, useMemo } from "react";
import { useLeaders } from "../hooks/useLeaders";
import { COUNTRY_TO_CONTINENT, ALL_COUNTRIES } from "../utils/countries";
import LeaderCard from "../components/LeaderCard";
import ProfileModal from "../components/ProfileModal";

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

const CONTINENTS = [
  "Africa",
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Oceania",
];
const INITIAL_VISIBLE = 6;
const EXPANDED_VISIBLE = 9;
const PAGE_SIZE = 9;

const SELECT_CLASS =
  "px-[1.6rem] py-[1.0rem] border-[1.5px] border-gray-300 rounded-[10px] text-[1.4rem] outline-none bg-brand-blue-tint cursor-pointer font-semibold text-brand-dark";

export default function Database({ onManageProfile }) {
  const [search, setSearch] = useState("");
  const [expertiseFilter, setExpertiseFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [continentFilter, setContinentFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const { leaders, allLeaders, loading, error } = useLeaders({
    search,
    expertise: expertiseFilter,
    country: countryFilter,
    continent: continentFilter,
    sort: sortBy,
  });

  const isFiltered = !!(
    search ||
    sortBy ||
    continentFilter ||
    countryFilter ||
    expertiseFilter
  );

  function resetFilters() {
    setSearch("");
    setSortBy("");
    setContinentFilter("");
    setCountryFilter("");
    setExpertiseFilter("");
    setVisibleCount(INITIAL_VISIBLE);
    setCurrentPage(1);
  }

  function handleSearch(e) {
    setSearch(e.target.value);
    setVisibleCount(INITIAL_VISIBLE);
    setCurrentPage(1);
  }
  function handleSort(e) {
    setSortBy(e.target.value);
    setVisibleCount(INITIAL_VISIBLE);
    setCurrentPage(1);
  }
  function handleContinent(e) {
    setContinentFilter(e.target.value);
    setCountryFilter("");
    setCurrentPage(1);
  }
  function handleCountry(e) {
    setCountryFilter(e.target.value);
    setCurrentPage(1);
  }
  function handleExpertise(e) {
    setExpertiseFilter(e.target.value);
    setCurrentPage(1);
  }

  const visibleCountries = continentFilter
    ? ALL_COUNTRIES.filter((c) => COUNTRY_TO_CONTINENT[c] === continentFilter)
    : ALL_COUNTRIES;

  const paginationActive =
    visibleCount >= EXPANDED_VISIBLE && leaders.length > EXPANDED_VISIBLE;
  const totalPages = Math.max(1, Math.ceil(leaders.length / PAGE_SIZE));

  const visibleItems = useMemo(() => {
    if (paginationActive) {
      const start = (currentPage - 1) * PAGE_SIZE;
      return leaders.slice(start, start + PAGE_SIZE);
    }
    return leaders.slice(0, visibleCount);
  }, [leaders, visibleCount, currentPage, paginationActive]);

  function loadMore() {
    setVisibleCount((n) => Math.min(n + INITIAL_VISIBLE, leaders.length));
    setCurrentPage(1);
  }

  function goToPage(page) {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600 text-[1.8rem]">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-[2rem] text-gray-700 mb-2">
            Couldn't load the database
          </div>
          <div className="text-[1.4rem] text-gray-500">
            Check your connection and try again.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page title */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-8">
        <h1 className="text-[2rem] sm:text-[3rem] font-bold text-brand-navy tracking-heading">
          Women Leaders in Digital Health Database
        </h1>
      </div>

      {/* Sticky filter bar */}
      <div className="bg-brand-sand sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-3">
          {/*
            Layout strategy:
            • Mobile  — flex-col: two stacked rows. Inner divs are normal flex rows.
            • Desktop — the two inner divs become `display:contents` so their
              children join the outer sm:flex-row as a single line (original layout).
          */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            {/* ── Row 1 on mobile / flattened on desktop ── */}
            <div className="flex items-center gap-3 mb-2 sm:mb-0 sm:contents">
              <label htmlFor="leader-search" className="sr-only">
                Search leaders
              </label>
              <input
                id="leader-search"
                type="text"
                placeholder="Search..."
                value={search}
                onChange={handleSearch}
                className="flex-1 sm:flex-none sm:min-w-[180px] sm:max-w-[280px] px-[1.6rem] py-[1.0rem] border-[1.5px] border-gray-300 rounded-[10px] text-[1.6rem] outline-none bg-brand-blue-tint"
                aria-label="Search leaders by name, role, organisation, or bio"
              />
              {/* Count: inline on mobile, pushed to far right on desktop */}
              <div className="flex-shrink-0 sm:order-last sm:ml-auto text-[1.3rem] sm:text-[1.4rem] text-gray-600 font-medium">
                {leaders.length} of {allLeaders.length}
              </div>
            </div>

            {/* ── Row 2 on mobile / flattened on desktop ── */}
            <div className="flex flex-wrap items-center gap-2 sm:contents">
              <select
                value={sortBy}
                onChange={handleSort}
                className={SELECT_CLASS + " flex-1 sm:flex-none"}
                aria-label="Sort leaders"
              >
                <option value="">Sort by</option>
                <option value="az">A → Z</option>
                <option value="za">Z → A</option>
                <option value="latest">Latest</option>
              </select>

              <select
                value={continentFilter}
                onChange={handleContinent}
                className={SELECT_CLASS + " flex-1 sm:flex-none"}
                aria-label="Filter by continent"
              >
                <option value="">Continent: All</option>
                {CONTINENTS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={countryFilter}
                onChange={handleCountry}
                className={SELECT_CLASS + " flex-1 sm:flex-none"}
                aria-label="Filter by country"
              >
                <option value="">Country: All</option>
                {visibleCountries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={expertiseFilter}
                onChange={handleExpertise}
                className={SELECT_CLASS + " flex-1 sm:flex-none"}
                aria-label="Filter by expertise"
              >
                <option value="">Expertise: All</option>
                {EXPERTISE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              {/* Clear button: full-width on its own row on mobile, normal size on desktop */}
              {isFiltered && (
                <button
                  onClick={resetFilters}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-[1.8rem] py-[1.0rem] border-[1.5px] border-red-400 rounded-[10px] bg-white text-red-400 text-[1.4rem] font-bold cursor-pointer tracking-[0.02em] flex-shrink-0"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M12 4L4 12M4 4l8 8" />
                  </svg>
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card grid */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6">
        {leaders.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <div className="text-[3rem] mb-2">No leaders found</div>
            <div className="text-[1.4rem]">Try adjusting your filters</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleItems.map((leader) => (
                <LeaderCard
                  key={leader.id}
                  leader={leader}
                  onSelect={setSelectedProfile}
                />
              ))}
            </div>

            {/* Load more — shows before pagination kicks in */}
            {visibleCount < EXPANDED_VISIBLE &&
              visibleCount < leaders.length && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={loadMore}
                    className="px-6 py-3 bg-brand-orange text-white rounded-lg text-[1.6rem] font-medium hover:bg-brand-orange-hover transition-colors"
                  >
                    Load more leaders
                  </button>
                </div>
              )}

            {/* Pagination — activates after "Load more" is clicked */}
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

      {/* Manage profile footer */}
      <div className="text-center pt-[2.4rem] pb-[3.2rem] font-sans">
        <p className="text-[1.4rem] text-gray-500">
          Already in the database?{" "}
          <button
            onClick={() => onManageProfile(null)}
            className="bg-transparent border-0 cursor-pointer text-brand-navy font-semibold text-[1.4rem] underline p-0"
          >
            Manage or remove your profile
          </button>
        </p>
      </div>

      <ProfileModal
        leader={selectedProfile}
        onClose={() => setSelectedProfile(null)}
        onManage={onManageProfile}
      />
    </div>
  );
}
