import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/leaders";
import { COUNTRY_TO_CONTINENT } from "../utils/countries";

/**
 * useLeaders — single source of truth for leader data.
 *
 * Uses TanStack Query for caching, stale-while-revalidate, and background updates.
 *
 * All params are optional primitives so useMemo deps stay stable
 * across renders without needing deep-equality.
 *
 * Returns:
 *   leaders    — filtered + sorted array (no pagination; UI slices this)
 *   allLeaders — raw unfiltered array (for Analytics stats)
 *   loading    — true while initial fetch is in flight
 *   error      — fetch error, or null
 */
export function useLeaders({
  search    = "",
  expertise = "",
  country   = "",
  continent = "",
  sort      = "",
} = {}) {
  const { data: allLeaders = [], isLoading: loading, error } = useQuery({
    queryKey: ["leaders"],
    queryFn: () => api.getLeaders(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const leaders = useMemo(() => {
    let result = allLeaders;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((l) =>
        [l.first_name, l.last_name, l.role, l.organisation, l.bio]
          .some((f) => (f || "").toLowerCase().includes(q))
      );
    }

    if (expertise) result = result.filter((l) => (l.expertise || "").includes(expertise));
    if (country)   result = result.filter((l) => l.country === country);
    if (continent) result = result.filter((l) => COUNTRY_TO_CONTINENT[l.country] === continent);

    if (sort === "az")     return [...result].sort((a, b) => (a.first_name || "").localeCompare(b.first_name || ""));
    if (sort === "za")     return [...result].sort((a, b) => (b.first_name || "").localeCompare(a.first_name || ""));
    if (sort === "latest") return [...result].reverse();

    return result;
  }, [allLeaders, search, expertise, country, continent, sort]);

  return { leaders, allLeaders, loading, error: error || null };
}
