import React, { useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Annotation,
} from "react-simple-maps";
import { useLeaders } from "../hooks/useLeaders";
import { COUNTRY_TO_REGION, REGION_LABELS, REGION_MARKERS, ATLAS_TO_CANONICAL } from "../utils/countries";
import LeaderCard from "../components/LeaderCard";
import ProfileModal from "../components/ProfileModal";

const BAR_COLORS = ["#F97316","#18181B","#1E3A5F","#EAB308","#22C55E","#38BDF8","#EC4899","#166534"];

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function toTags(expertise) {
  if (!expertise) return [];
  if (Array.isArray(expertise)) return expertise.filter(Boolean);
  return expertise.split(/,\s*/).filter(Boolean);
}

function toTitleCase(str) {
  return str.replace(/\b\w+/g, (word) => {
    if (word.toUpperCase() === "AI") return "AI";
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

export default function Analytics({ onManageProfile, onGoToDirectory }) {
  const [selectedRegion, setSelectedRegion] = useState("latin_america");
  const [selectedSpecialisation, setSelectedSpecialisation] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const { allLeaders, loading } = useLeaders();

  const stats = useMemo(() => {
    const orgSet = new Set();
    allLeaders.forEach((l) => {
      if (l.organisation) orgSet.add(l.organisation);
    });
    return { total: allLeaders.length, orgs: orgSet.size };
  }, [allLeaders]);

   const barData = useMemo(() => {
     const source = selectedRegion
       ? allLeaders.filter((l) => (l.region || COUNTRY_TO_REGION[l.country?.trim()]) === selectedRegion)
       : allLeaders;
     const expertiseCounts = {};
     source.forEach((l) => {
       const tags = toTags(l.expertise);
       tags.forEach((tag) => {
         // Normalize "Other: X" tags to just "Other" for the chart
         const normalized = tag.trim().startsWith("Other") ? "Other" : tag.trim();
         expertiseCounts[normalized] = (expertiseCounts[normalized] || 0) + 1;
       });
     });
     const entries = Object.entries(expertiseCounts).sort((a, b) => b[1] - a[1]);
     const max = entries[0]?.[1] || 1;
     return entries.map(([name, count], i) => ({
       name, count,
       barPct: Math.round((count / max) * 100),
       color: BAR_COLORS[i % BAR_COLORS.length],
     }));
   }, [allLeaders, selectedRegion]);

  // Canonical country names that have leaders in the selected region.
  // Intentionally only stores canonical names (not atlas names) so the region
  // double-check below prevents overseas territories from being falsely highlighted.
  const highlightedCountryNames = useMemo(() => {
    const names = new Set();
    allLeaders.forEach((l) => {
      if (!l.country) return;
      const canonical = l.country.trim();
      const r = COUNTRY_TO_REGION[canonical];
      if (!r) return;
      if (!selectedRegion || r === selectedRegion) names.add(canonical);
    });
    return names;
  }, [allLeaders, selectedRegion]);

  const regionTotals = useMemo(() => {
    const totals = { north_america: 0, latin_america: 0, europe: 0, sub_saharan_africa: 0, south_asia: 0 };
    allLeaders.forEach((l) => {
      const key = l.region || COUNTRY_TO_REGION[l.country?.trim()];
      if (key && key in totals) totals[key]++;
    });
    return totals;
  }, [allLeaders]);

  const latestLeaders = useMemo(() => {
    return [...allLeaders]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3);
  }, [allLeaders]);

  const filteredLeaders = useMemo(() => {
    return allLeaders.filter((l) => {
      const matchRegion = !selectedRegion ||
        (l.region || COUNTRY_TO_REGION[l.country?.trim()]) === selectedRegion;
      const matchSpec = !selectedSpecialisation ||
        toTags(l.expertise).some((e) => {
          const trimmed = e.trim();
          if (selectedSpecialisation === "Other") {
            return trimmed === "Other" || trimmed.startsWith("Other:");
          }
          return trimmed === selectedSpecialisation;
        });
      return matchRegion && matchSpec;
    });
  }, [allLeaders, selectedRegion, selectedSpecialisation]);


  if (loading) {
    return (
      <div className="min-h-screen bg-brand-sand flex items-center justify-center">
        <div className="text-gray-600 text-[1.8rem]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-sand">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-8">

        {/* Section heading */}
        <div className="mb-8">
          <h2 className="text-[2rem] sm:text-[3rem] font-bold text-gray-900 tracking-heading">
            Key Highlights from the Database
          </h2>
          <p className="text-1.6 text-gray-600 mt-2 leading-relaxed">
            Overview of expertise distribution, demographic representation, and leadership density across the network.
          </p>
        </div>

        {/* Map + Specialisation + Region Leaders */}
        <div className="flex flex-col lg:grid lg:grid-cols-5 lg:gap-6 lg:items-start mb-8">

      {/* Map column */}
      <div className="order-1 lg:col-span-3 lg:row-start-1 flex flex-col bg-transparent">
        <ComposableMap
          projectionConfig={{ scale: 215, center: [5, 5] }}
          width={900}
          height={440}
          style={{ width: "100%", height: "auto", backgroundColor: "transparent" }}
        >
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const atlasName = geo.properties.name;
                    const canonicalName = ATLAS_TO_CANONICAL[atlasName] || atlasName;
                    // Double-check region membership so overseas territories (e.g. French Guiana
                    // sharing the "France" atlas name) don't get falsely highlighted.
                    const geoRegion = COUNTRY_TO_REGION[canonicalName];
                    const isHighlighted =
                      highlightedCountryNames.has(canonicalName) &&
                      (!selectedRegion || geoRegion === selectedRegion);
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={isHighlighted ? "#F97A1A" : "#D4D4D8"}
                        stroke="#FFFFFF"
                        strokeWidth={0.7}
                        style={{
                          default: { outline: "none" },
                          hover:   { outline: "none", opacity: 0.85 },
                          pressed: { outline: "none" },
                        }}
                      />
                    );
                  })
                }
              </Geographies>

              {REGION_MARKERS.map((marker) => {
                if (marker.key !== selectedRegion) return null;
                const count = selectedSpecialisation
                  ? filteredLeaders.filter((l) =>
                      (l.region || COUNTRY_TO_REGION[l.country?.trim()]) === marker.key
                    ).length
                  : regionTotals[marker.key] || 0;
                if (!count) return null;
                return (
                  <Annotation
                    key={marker.key}
                    subject={marker.oceanCoords}
                    connectorProps={{ stroke: "transparent", strokeWidth: 0 }}
                  >
                    <g>
                      <rect x="-68" y="-26" width="136" height="52" rx="10" fill="#F8571D" />
                      <text textAnchor="middle" y="-6" style={{ fontSize: 13, fontWeight: 700, fill: "#ffffff", fontFamily: "system-ui" }}>
                        {REGION_LABELS[marker.key]}
                      </text>
                      <text textAnchor="middle" y="14" style={{ fontSize: 11, fill: "#ffffff", fontFamily: "system-ui" }}>
                        {count} Leaders
                      </text>
                    </g>
                  </Annotation>
                );
              })}
        </ComposableMap>

        {/* Region selector */}
            <div className="mt-5 pt-5">
              <p className="text-center text-[1.1rem] text-gray-400 mb-4 tracking-wide uppercase">
                Select a region to explore
              </p>
              {/* Dot-on-line layout — line only shown on md+ where all 5 fit in one row */}
              <div className="relative">
                <div className="absolute inset-x-0 bottom-[20px] hidden md:block pointer-events-none">
                  <div className="border-t-2 border-dashed border-brand-orange" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 relative z-10">
                  {REGION_MARKERS.map((region) => {
                    const active = selectedRegion === region.key;
                    return (
                      <button
                        key={region.key}
                        type="button"
                        onClick={() => setSelectedRegion(region.key)}
                        className="flex flex-col items-center gap-1.5 text-center py-3 px-2 rounded-lg hover:bg-brand-orange-light/10 transition-colors cursor-pointer"
                      >
                        <span className={`text-[1.1rem] font-semibold transition-colors leading-tight ${active ? "text-brand-orange" : "text-gray-700"}`}>
                          {REGION_LABELS[region.key]}
                        </span>
                        <span className="text-[1rem] text-gray-400">
                          {regionTotals[region.key] || 0} leaders
                        </span>
                        {/* Dot sits on the dashed line — always orange, ring when active */}
                        <span className={`w-4 h-4 rounded-full bg-brand-orange transition-all ${active ? "ring-2 ring-brand-orange ring-offset-2" : ""}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Specialisation sidebar */}
          <div className="order-3 lg:col-span-2 lg:row-start-1 bg-white border border-gray-200 rounded-lg p-6 flex flex-col mt-6 lg:mt-0 lg:self-start">
            <div className="text-1.2 font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Specialisation
            </div>
            <div className="text-[1.8rem] font-bold leading-snug mb-4 text-brand-blue">
              {selectedRegion
                ? `${regionTotals[selectedRegion] || 0} leaders in ${REGION_LABELS[selectedRegion]}`
                : `Based on the ${stats.total} verified profiles`}
            </div>
            <p className="text-[1.1rem] text-gray-400 mb-3">Click a bar to highlight on the map</p>
            <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
              {barData.map((d) => {
                const isSelected = selectedSpecialisation === d.name;
                const isDimmed = selectedSpecialisation && !isSelected;
                return (
                  <button
                    key={d.name}
                    type="button"
                    onClick={() => setSelectedSpecialisation(isSelected ? null : d.name)}
                    className={`w-full text-left rounded-md px-1 py-0.5 -mx-1 hover:bg-gray-50 cursor-pointer transition-opacity ${isDimmed ? "opacity-35" : "opacity-100"}`}
                  >
                    <div className="flex justify-between items-baseline text-[1.35rem] mb-1">
                      <span className={`font-medium ${isSelected ? "text-brand-orange" : "text-gray-800"}`}>{toTitleCase(d.name)}</span>
                      <span className={`font-bold flex-shrink-0 ml-3 ${isSelected ? "text-brand-orange" : "text-gray-900"}`}>{d.count}</span>
                    </div>
                    <div className="h-[5px] bg-gray-100 rounded-full overflow-hidden">
                      {/* width is a dynamic value — inline style required here */}
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${d.barPct}%`, backgroundColor: isSelected ? "#F97316" : d.color }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Latest additions — shown only when no filter is active */}
          {!selectedRegion && !selectedSpecialisation && latestLeaders.length > 0 && (
            <div className="order-2 lg:col-span-5 lg:row-start-2 mt-6 lg:mt-8">
              <h3 className="text-[1.6rem] font-bold text-brand-navy mb-4">Latest additions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {latestLeaders.map((l) => (
                  <LeaderCard key={l.id} leader={l} onSelect={setSelectedProfile} />
                ))}
              </div>
            </div>
          )}

          {/* Region / Specialisation results */}
          {(selectedRegion || selectedSpecialisation) && (
            <div className="order-2 lg:col-span-5 lg:row-start-2 mt-6 lg:mt-8">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h3 className="text-1.6 font-bold text-brand-navy">
                  {[selectedRegion && REGION_LABELS[selectedRegion], selectedSpecialisation && toTitleCase(selectedSpecialisation)]
                    .filter(Boolean).join(" · ")}
                  {filteredLeaders.length > 0 && <span> &middot; {filteredLeaders.length} Leaders</span>}
                </h3>
                <div className="flex items-center gap-2">
                  {selectedRegion && (
                    <button
                      onClick={() => setSelectedRegion(null)}
                      className="flex items-center gap-1 px-[1.2rem] py-[0.55rem] border-[1.5px] border-red-400 rounded-[10px] bg-white text-red-400 text-[1.2rem] font-bold cursor-pointer tracking-[0.02em]"
                    >
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M12 4L4 12M4 4l8 8"/>
                      </svg>
                      Clear region
                    </button>
                  )}
                  {selectedSpecialisation && (
                    <button
                      onClick={() => setSelectedSpecialisation(null)}
                      className="flex items-center gap-1 px-[1.2rem] py-[0.55rem] border-[1.5px] border-red-400 rounded-[10px] bg-white text-red-400 text-[1.2rem] font-bold cursor-pointer tracking-[0.02em]"
                    >
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M12 4L4 12M4 4l8 8"/>
                      </svg>
                      Clear specialisation
                    </button>
                  )}
                </div>
              </div>
              {filteredLeaders.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredLeaders.map((l) => (
                    <LeaderCard key={l.id} leader={l} onSelect={setSelectedProfile} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-[1.4rem] py-6 text-center">No leaders found for this selection.</p>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-1.1 text-gray-600 mt-6">
          Data sourced from the Transform Health Women Leaders Database · {stats.total} verified profiles
        </p>
      </div>

      {selectedProfile && (
        <ProfileModal
          leader={selectedProfile}
          onClose={() => setSelectedProfile(null)}
          onManage={onManageProfile}
        />
      )}

      {/* Manage profile footer */}
      <div className="text-center pt-[2.4rem] pb-[3.2rem] font-sans">
        <p className="text-1.4 text-gray-500">
          Already in the database?{" "}
          <button
            onClick={() => onManageProfile(null)}
            className="bg-transparent border-0 cursor-pointer text-brand-navy font-semibold text-1.4 underline p-0"
          >
            Manage or remove your profile
          </button>
        </p>
      </div>
    </div>
  );
}
