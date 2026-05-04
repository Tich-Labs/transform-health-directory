import React, { useState, useEffect, lazy, Suspense } from "react";
import axios from "axios";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const Database = lazy(() => import("./pages/Database"));
const Submit = lazy(() => import("./pages/Submit"));
const Admin = lazy(() => import("./pages/Admin"));
const Analytics = lazy(() => import("./pages/Analytics"));
const ManageProfile = lazy(() => import("./pages/ManageProfile"));
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";

const queryClient = new QueryClient();

const NAV_ITEMS = [
  { id: "database", label: "Database", display: "DATABASE" },
  { id: "analytics", label: "Analytics", display: "ANALYTICS" },
  { id: "submit", label: "Submit", display: "SUBMIT PROFILE" },
  { id: "admin", label: "Admin", display: "ADMIN" },
];

function App() {
  const [route, setRoute] = useState("database");
  const [managePrefill, setManagePrefill] = useState(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [chromeHidden, setChromeHidden] = useState(
    () => localStorage.getItem("th-chrome-hidden") === "true"
  );

  function toggleChrome() {
    setChromeHidden((prev) => {
      const next = !prev;
      localStorage.setItem("th-chrome-hidden", String(next));
      return next;
    });
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) return;

    const url = import.meta.env.VITE_APPS_SCRIPT_URL;
    if (!url) return;

    setTokenLoading(true);
    window.history.replaceState({}, "", window.location.pathname);

    axios
      .get(`${url}?api=profile&token=${token}`)
      .then((r) => {
        if (r.data?.ok && r.data?.profile) {
          setManagePrefill({ ...r.data.profile, _verified: true });
          setShowManageModal(true);
        } else {
          setTokenError(
            r.data?.error === "token_used"
              ? "This link has already been used. Please request a new one."
              : "This link is invalid or has expired. Please request a new one."
          );
        }
      })
      .catch(() => {
        setTokenError("Could not load your profile. Please try again.");
      })
      .finally(() => setTokenLoading(false));
  }, []);

  function openManageModal(profile = null) {
    setManagePrefill(profile);
    setShowManageModal(true);
  }

  function closeManageModal() {
    setShowManageModal(false);
    setManagePrefill(null);
  }

  return (
    <div className="min-h-screen bg-brand-sand">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      {route !== "admin" && !chromeHidden && <SiteHeader />}

      {route === "database" && (
        <div className="relative bg-brand-sand font-sans">
          <div className="relative z-10 w-full max-w-[1440px] mx-auto flex flex-col gap-8 items-center justify-center px-8 py-16 pb-40 md:flex-row md:items-end md:justify-between md:px-8 md:pt-24 md:pb-48">
            <img
              src="./illustrations/db1-hero.png"
              alt=""
              className="w-full max-w-[160px] sm:max-w-[220px] flex-shrink-0 h-auto"
            />
            <div className="text-center md:text-left">
              <div className="font-bold uppercase text-[clamp(2.8rem,6vw,7rem)] leading-[1.1] text-brand-blue-bright tracking-heading">
                <div>Women Leaders Bridging the Gap</div>
                <div>in Digital Health</div>
              </div>
            </div>
            <img
              src="./illustrations/db2-hero.png"
              alt=""
              className="w-full max-w-[160px] sm:max-w-[240px] flex-shrink-0 md:mb-8 h-auto md:-translate-x-12"
            />
          </div>
          <img
            src="./illustrations/Rectangle 6709-green.svg"
            alt=""
            className="absolute bottom-0 left-0 w-full block pointer-events-none"
          />
        </div>
      )}

      {route === "analytics" && (
        <div className="relative bg-brand-sand font-sans">
          <div className="relative z-10 w-full max-w-[1440px] mx-auto flex flex-col gap-8 items-center justify-center px-8 py-16 pb-40 md:flex-row md:items-end md:justify-between md:px-8 md:pt-24 md:pb-48">
            <img
              src="./illustrations/network2-hero.png"
              alt=""
              className="w-full max-w-[160px] sm:max-w-[220px] flex-shrink-0 h-auto"
            />
            <div className="text-center md:text-left">
              <div className="font-bold uppercase text-[clamp(2.8rem,6vw,7rem)] leading-[1.1] tracking-heading">
                <div className="text-brand-navy">Global</div>
                <div className="text-brand-pink">Network</div>
              </div>
              <p className="mt-6 text-[clamp(1.4rem,1.6vw,2rem)] leading-[1.5] text-brand-dark">
                A curated community of health leaders driving digital
                transformation
              </p>
            </div>
            <img
              src="./illustrations/network1-hero.png"
              alt=""
              className="w-full max-w-[160px] sm:max-w-[240px] flex-shrink-0 md:mb-8 h-auto md:-translate-x-12"
            />
          </div>
          <img
            src="./illustrations/Rectangle 6709-blue.svg"
            alt=""
            className="absolute bottom-0 left-0 w-full block pointer-events-none"
          />
        </div>
      )}

      {route === "submit" && (
        <div className="relative bg-brand-sand font-sans">
          <div className="relative z-10 w-full max-w-[1440px] mx-auto flex flex-col gap-8 items-center justify-center px-8 py-16 pb-40 md:flex-row md:items-end md:justify-between md:px-8 md:pt-24 md:pb-48">
            <img
              src="./illustrations/hero-left.png"
              alt=""
              className="w-full max-w-[160px] sm:max-w-[220px] flex-shrink-0 h-auto"
            />
            <div className="text-center md:text-left">
              <div className="font-bold uppercase text-[clamp(2.8rem,6vw,7rem)] leading-[1.1] tracking-heading">
                <div className="text-brand-navy">Join</div>
                <div className="text-brand-pink">The</div>
                <div className="text-brand-pink">Database</div>
              </div>
            </div>
            <img
              src="./illustrations/hero-right.png"
              alt=""
              className="w-full max-w-[160px] sm:max-w-[240px] flex-shrink-0 md:mb-8 h-auto md:-translate-x-12"
            />
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
          className="sticky top-0 z-50 bg-brand-yellow"
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 pt-3 sm:pt-6 pb-0 flex justify-between items-end overflow-x-auto">
            {/* Main tabs */}
            <div className="flex gap-1 sm:gap-6 items-end" role="tablist">
              {NAV_ITEMS.filter((item) => item.id !== "admin").map((item) => {
                const active = route === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setRoute(item.id)}
                    role="tab"
                    aria-selected={active}
                    className={`font-['Montserrat'] font-medium text-[1.3rem] sm:text-[2rem] tracking-[0.03em] px-3 sm:px-8 h-[3.6rem] sm:h-[4.4rem] whitespace-nowrap cursor-pointer ${
                      active
                        ? "text-white bg-brand-orange -skew-x-[10deg] rounded-t-lg"
                        : "text-black bg-transparent"
                    }`}
                  >
                    <span className={active ? "inline-block skew-x-[10deg]" : ""}>
                      {item.display}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Admin — tucked to the right, smaller */}
            <button
              onClick={() => setRoute("admin")}
              className={`font-['Montserrat'] font-medium text-[1.2rem] tracking-[0.08em] uppercase px-3.5 py-1.5 mb-1.5 cursor-pointer rounded flex-shrink-0 ${
                route === "admin"
                  ? "text-white border-transparent bg-brand-orange"
                  : "text-brand-dark border border-gray-500 bg-transparent"
              }`}
            >
              Admin
            </button>
          </div>
        </nav>
      )}
      <main id="main-content">
        {tokenLoading ? (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p className="text-gray-600 text-[1.8rem]">
              Loading your profile...
            </p>
          </div>
        ) : tokenError ? (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center max-w-md">
              <div className="text-[3rem] mb-4" aria-hidden="true">
                ⚠
              </div>
              <h2 className="text-[1.8rem] font-semibold text-gray-900 mb-2">
                Link unavailable
              </h2>
              <p className="text-gray-600 text-[1.4rem] mb-4">{tokenError}</p>
              <button
                onClick={() => {
                  setTokenError("");
                  setManagePrefill(null);
                  setShowManageModal(true);
                }}
                className="px-4 py-2 bg-gray-800 text-white rounded-full text-[1.4rem] font-medium hover:bg-gray-700"
              >
                Request a new link
              </button>
            </div>
          </div>
          ) : (
            <Suspense fallback={
              <div className="min-h-screen bg-brand-sand flex items-center justify-center">
                <div className="text-gray-600 text-[1.8rem]">Loading...</div>
              </div>
            }>
              {route === "database" && (
                <Database onManageProfile={openManageModal} />
              )}
              {route === "analytics" && (
                <Analytics
                  onManageProfile={openManageModal}
                  onGoToDirectory={() => setRoute("database")}
                />
              )}
              {route === "submit" && (
                <Submit
                  onManageProfile={openManageModal}
                  onGoToDirectory={() => setRoute("database")}
                />
              )}
              {route === "admin" && (
                <Admin onGoToDirectory={() => setRoute("database")} />
              )}
            </Suspense>
          )}

        {showManageModal && (
          <div
            className="fixed inset-0 z-[100] flex items-end bg-black/40"
            onClick={closeManageModal}
          >
            <div
              className="relative w-full max-w-2xl mx-auto max-h-[85vh] overflow-y-auto rounded-t-2xl shadow-2xl bg-brand-cream"
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
              />
            </div>
          </div>
        )}
       </main>
      {route !== "admin" && !chromeHidden && <SiteFooter />}

      {/* Chrome toggle — fixed bottom-right, always visible */}
      {route !== "admin" && (
        <button
          onClick={toggleChrome}
          title={chromeHidden ? "Show site header & footer" : "Hide site header & footer"}
          aria-label={chromeHidden ? "Show site header & footer" : "Hide site header & footer"}
          className="fixed bottom-5 right-5 z-[9999] w-10 h-10 rounded-full bg-brand-navy text-white shadow-lg flex items-center justify-center hover:bg-brand-navy-dark transition-colors"
        >
          {chromeHidden ? (
            /* eye-open */
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          ) : (
            /* eye-off */
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          )}
        </button>
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
