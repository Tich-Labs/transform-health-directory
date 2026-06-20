import React, {
  useState,
  useEffect,
  lazy,
  Suspense,
  startTransition,
} from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const Database = lazy(() => import("./pages/Database"));
const Submit = lazy(() => import("./pages/Submit"));
const Admin = lazy(() => import("./pages/Admin"));
const Analytics = lazy(() => import("./pages/Analytics"));
const ManageProfile = lazy(() => import("./pages/ManageProfile"));
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";

const queryClient = new QueryClient();

const VALID_ROUTES = ["database", "analytics", "submit", "admin"];

function parseHash() {
  // Accept #database, #/database, /database — always returns clean slug
  const raw = window.location.hash
    .replace(/^#\/?/, "")
    .toLowerCase()
    .split("?")[0];
  return VALID_ROUTES.includes(raw) ? raw : "database";
}

const NAV_ITEMS = [
  { id: "database", label: "Database", display: "DATABASE" },
  { id: "analytics", label: "Analytics", display: "ANALYTICS" },
  { id: "submit", label: "Submit", display: "SUBMIT PROFILE" },
];

function App() {
  const [route, setRoute] = useState(parseHash);
  const [managePrefill, setManagePrefill] = useState(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [chromeHidden, setChromeHidden] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("chrome") === "hidden") return true;
    if (params.get("chrome") === "visible") return false;
    return localStorage.getItem("th-chrome-hidden") !== "false";
  });
  const [manageTokenData, setManageTokenData] = useState(null);

  // Keep URL in sync when route changes programmatically
  function navigate(to) {
    window.location.hash = to;
    setRoute(to);
  }

  // Sync state when user hits back/forward or types in URL bar
  useEffect(() => {
    function onHashChange() {
      setRoute(parseHash());
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Parse ?manage= token on mount for self-service magic link landing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("manage");
    if (t) {
      try {
        const decoded = JSON.parse(atob(t));
        if (decoded?.leaderId) {
          setManageTokenData(decoded);
          setShowManageModal(true);
        }
      } catch {
        // invalid token, ignore
      }
    }
  }, []);

  function toggleChrome() {
    setChromeHidden((prev) => {
      const next = !prev;
      localStorage.setItem("th-chrome-hidden", String(next));
      return next;
    });
  }

  function openManageModal(profile = null) {
    startTransition(() => {
      setManagePrefill(profile);
      setShowManageModal(true);
    });
  }

  function closeManageModal() {
    setShowManageModal(false);
    setManagePrefill(null);
    setManageTokenData(null);
    const url = new URL(window.location);
    url.searchParams.delete("manage");
    url.searchParams.delete("profile");
    window.history.replaceState({}, "", url);
  }

  return (
    <div className="min-h-screen bg-brand-sand">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      {route !== "admin" && !chromeHidden && <SiteHeader />}

      {route !== "admin" && !chromeHidden && <div className="h-[6.4rem]" />}

      {route === "database" && (
        <div className="relative bg-brand-sand font-sans">
          <div className="relative z-10 w-full max-w-[1440px] mx-auto flex flex-col gap-8 items-center px-8 py-16 pb-40 md:flex-row md:items-end md:px-8 md:pt-24 md:pb-48">
            <div className="w-20 sm:w-[220px] flex-shrink-0 flex items-center justify-center">
              <img
                src="./illustrations/db1-hero.png"
                alt=""
                className="h-auto max-w-full"
              />
            </div>
            <div className="flex-1 text-left">
              <div className="font-bold uppercase text-[clamp(2.8rem,6vw,7rem)] leading-[1.1] text-brand-blue-bright tracking-heading">
                <div>Women Leaders</div>
                <div>Bridging the Gap in Digital Health</div>
              </div>
            </div>
            <div className="w-20 sm:w-[220px] flex-shrink-0 flex items-center justify-center md:mb-8 md:-translate-x-12">
              <img
                src="./illustrations/db2-hero.png"
                alt=""
                className="h-auto max-w-full"
              />
            </div>
          </div>
          <img
            src="./illustrations/Rectangle 6709.svg"
            alt=""
            className="absolute bottom-0 left-0 w-full block pointer-events-none"
          />
        </div>
      )}

      {route === "analytics" && (
        <div className="relative bg-brand-sand font-sans">
          <div className="relative z-10 w-full max-w-[1440px] mx-auto flex flex-col gap-8 items-center px-8 py-16 pb-40 md:flex-row md:items-end md:px-8 md:pt-24 md:pb-48">
            <div className="w-20 sm:w-[220px] flex-shrink-0 flex items-center justify-center">
              <img
                src="./illustrations/network2-hero.png"
                alt=""
                className="h-auto max-w-full"
              />
            </div>
            <div className="flex-1 text-left">
              <div className="font-bold uppercase text-[clamp(2.8rem,6vw,7rem)] leading-[1.1] tracking-heading">
                <div className="text-brand-navy">Global</div>
                <div className="text-brand-pink">Network</div>
              </div>
              <p className="mt-6 text-[clamp(1.4rem,1.6vw,2rem)] leading-[1.5] text-brand-dark">
                A curated community of health leaders driving digital
                transformation
              </p>
            </div>
            <div className="w-20 sm:w-[220px] flex-shrink-0 flex items-center justify-center md:mb-8 md:-translate-x-12">
              <img
                src="./illustrations/network1-hero.png"
                alt=""
                className="h-auto max-w-full"
              />
            </div>
          </div>
          <img
            src="./illustrations/Rectangle 6709.svg"
            alt=""
            className="absolute bottom-0 left-0 w-full block pointer-events-none"
          />
        </div>
      )}

      {route === "submit" && (
        <div className="relative bg-brand-sand font-sans">
          <div className="relative z-10 w-full max-w-[1440px] mx-auto flex flex-col gap-8 items-center px-8 py-16 pb-40 md:flex-row md:items-end md:px-8 md:pt-24 md:pb-48">
            <div className="w-20 sm:w-[220px] flex-shrink-0 flex items-center justify-center">
              <img
                src="./illustrations/hero-left.png"
                alt=""
                className="h-auto max-w-full"
              />
            </div>
            <div className="flex-1 text-left">
              <div className="font-bold uppercase text-[clamp(2.8rem,6vw,7rem)] leading-[1.1] tracking-heading">
                <div className="text-brand-navy">Join</div>
                <div className="text-brand-pink">The</div>
                <div className="text-brand-pink">Database</div>
              </div>
            </div>
            <div className="w-20 sm:w-[220px] flex-shrink-0 flex items-center justify-center md:mb-8 md:-translate-x-12">
              <img
                src="./illustrations/hero-right.png"
                alt=""
                className="h-auto max-w-full"
              />
            </div>
          </div>
          <img
            src="./illustrations/Rectangle 6709.svg"
            alt=""
            className="absolute bottom-0 left-0 w-full block pointer-events-none"
          />
        </div>
      )}

      {route !== "admin" && (
        <nav
          className={`sticky z-50 bg-brand-yellow ${chromeHidden ? "top-0" : "top-[6.4rem]"}`}
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 pt-3 sm:pt-6 pb-0 flex justify-between items-end overflow-x-auto">
            {/* Main tabs */}
            <div className="flex gap-1 sm:gap-6 items-end" role="tablist">
              {NAV_ITEMS.map((item) => {
                const active = route === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    role="tab"
                    aria-selected={active}
                    className={`font-['Montserrat'] font-medium text-[1.3rem] sm:text-[2rem] tracking-[0.03em] px-3 sm:px-8 h-[3.6rem] sm:h-[4.4rem] whitespace-nowrap cursor-pointer ${
                      active
                        ? "text-white bg-brand-orange -skew-x-[10deg] rounded-t-lg"
                        : "text-black bg-transparent"
                    }`}
                  >
                    <span
                      className={active ? "inline-block skew-x-[10deg]" : ""}
                    >
                      {item.display}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>
        </nav>
      )}
      <main id="main-content">
        <Suspense
          fallback={
            <div className="min-h-screen bg-brand-sand flex items-center justify-center">
              <div className="text-gray-600 text-[1.8rem]">Loading...</div>
            </div>
          }
        >
          {route === "database" && (
            <Database onManageProfile={openManageModal} />
          )}
          {route === "analytics" && (
            <Analytics
              onManageProfile={openManageModal}
              onGoToDirectory={() => navigate("database")}
            />
          )}
          {route === "submit" && (
            <Submit
              onManageProfile={openManageModal}
              onGoToDirectory={() => navigate("database")}
            />
          )}
          {route === "admin" && (
            <Admin onGoToDirectory={() => navigate("database")} />
          )}
        </Suspense>

        {showManageModal && (
          <div
            className="fixed inset-0 z-[1100] flex items-end md:items-center bg-black/40"
            onClick={closeManageModal}
          >
            <div
              className="relative w-full max-w-2xl mx-auto max-h-[85vh] overflow-y-auto rounded-t-2xl md:rounded-2xl shadow-2xl bg-brand-cream"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex justify-end p-4 bg-brand-cream">
                <button
                  onClick={closeManageModal}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 cursor-pointer text-[2rem] leading-none"
                  aria-label="Close profile"
                >
                  ✕
                </button>
              </div>
              <ManageProfile
                prefill={managePrefill}
                onBack={closeManageModal}
                fromMagicLink={manageTokenData}
                tokenMode={manageTokenData?.mode}
              />
            </div>
          </div>
        )}
      </main>
      {route !== "admin" && !chromeHidden && <SiteFooter />}

      {/* Admin link — subtle, fixed bottom-right above chrome toggle */}
      {route !== "admin" && (
        <button
          onClick={() => navigate("admin")}
          className="fixed bottom-[5.5rem] right-5 z-[9999] text-[1.1rem] text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          admin
        </button>
      )}

      {/* Chrome toggle — fixed bottom-right, always visible */}
      {route !== "admin" && (
        <div className="fixed bottom-5 right-5 z-[9999] flex items-center gap-2 group">
          <span className="pointer-events-none text-[1.2rem] text-white bg-brand-navy/80 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {chromeHidden
              ? "Show site header & footer"
              : "Hide site header & footer"}
          </span>
          <button
            onClick={toggleChrome}
            title={
              chromeHidden
                ? "Show site header & footer"
                : "Hide site header & footer"
            }
            aria-label={
              chromeHidden
                ? "Show site header & footer"
                : "Hide site header & footer"
            }
            className="w-10 h-10 rounded-full bg-brand-navy text-white shadow-lg flex items-center justify-center hover:bg-brand-navy-dark transition-colors"
          >
          {chromeHidden ? (
            /* eye-open */
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          ) : (
            /* eye-off */
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          )}
        </button>
        </div>
      )}
    </div>
  );
}

// Wrapper with React Query provider
export default function AppWithQuery() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}
