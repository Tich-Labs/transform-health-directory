import React, { useState, useEffect } from "react";
import axios from "axios";
import Database from "./pages/Database";
import Submit from "./pages/Submit";
import Admin from "./pages/Admin";
import Analytics from "./pages/Analytics";
import ManageProfile from "./pages/ManageProfile";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";

const NAV_ITEMS = [
  { id: "database", label: "Database", display: "DATABASE" },
  { id: "analytics", label: "Analytics", display: "ANALYTICS" },
  { id: "submit", label: "Submit", display: "SUBMIT PROFILE" },
  { id: "admin", label: "Admin", display: "ADMIN" },
];

export default function App() {
  const [route, setRoute] = useState("database");
  const [managePrefill, setManagePrefill] = useState(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenError, setTokenError] = useState("");

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
    <div className="min-h-screen" style={{ background: "#f5efe0" }}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      {route !== "admin" && <SiteHeader />}

      {route === "database" && (
        <div className="relative bg-[#f5efe0] font-['Montserrat']">
          <div className="relative z-10 w-full max-w-[1440px] mx-auto flex flex-col gap-8 items-center justify-center px-8 py-16 pb-40 md:flex-row md:items-end md:justify-between md:px-8 md:pt-24 md:pb-48">
            <img
              src="./illustrations/db1-hero.png"
              alt=""
              className="w-full max-w-[220px] flex-shrink-0"
              style={{ height: "auto" }}
            />
            <div className="text-center md:text-left">
              <div
                className="font-bold uppercase text-[clamp(3.6rem,6vw,7rem)] leading-[1.1] text-[#00AAFF]"
                style={{ letterSpacing: "-0.042em" }}
              >
                <div>Women Leaders Bridging the Gap</div>
                <div>in Digital Health</div>
              </div>
            </div>
            <img
              src="./illustrations/db2-hero.png"
              alt=""
              className="w-full max-w-[240px] flex-shrink-0 md:mb-8"
              style={{ height: "auto", transform: "translateX(-3rem)" }}
            />
          </div>
          <img
            src="./illustrations/Rectangle 6709-green.svg"
            alt=""
            className="absolute bottom-0 left-0 w-full"
            style={{ display: "block", pointerEvents: "none" }}
          />
        </div>
      )}

      {route === "analytics" && (
        <div className="relative bg-[#f5efe0] font-['Montserrat']">
          <div className="relative z-10 w-full max-w-[1440px] mx-auto flex flex-col gap-8 items-center justify-center px-8 py-16 pb-40 md:flex-row md:items-end md:justify-between md:px-8 md:pt-24 md:pb-48">
            <img
              src="./illustrations/network2-hero.png"
              alt=""
              className="w-full max-w-[220px] flex-shrink-0"
              style={{ height: "auto" }}
            />
            <div className="text-center md:text-left">
              <div
                className="font-bold uppercase text-[clamp(3.6rem,6vw,7rem)] leading-[1.1]"
                style={{ letterSpacing: "-0.042em" }}
              >
                <div className="text-[#02598e]">Global</div>
                <div className="text-[#F85A8E]">Network</div>
              </div>
              <p className="mt-6 text-[clamp(1.4rem,1.6vw,2rem)] leading-[1.5] text-[#333]">
                A curated community of health leaders driving digital
                transformation
              </p>
            </div>
            <img
              src="./illustrations/network1-hero.png"
              alt=""
              className="w-full max-w-[240px] flex-shrink-0 md:mb-8"
              style={{ height: "auto", transform: "translateX(-3rem)" }}
            />
          </div>
          <img
            src="./illustrations/Rectangle 6709-blue.svg"
            alt=""
            className="absolute bottom-0 left-0 w-full"
            style={{ display: "block", pointerEvents: "none" }}
          />
        </div>
      )}

      {route === "submit" && (
        <div className="relative bg-[#f5efe0] font-['Montserrat']">
          <div className="relative z-10 w-full max-w-[1440px] mx-auto flex flex-col gap-8 items-center justify-center px-8 py-16 pb-40 md:flex-row md:items-end md:justify-between md:px-8 md:pt-24 md:pb-48">
            <img
              src="./illustrations/hero-left.png"
              alt=""
              className="w-full max-w-[220px] flex-shrink-0"
              style={{ height: "auto" }}
            />
            <div className="text-center md:text-left">
              <div
                className="font-bold uppercase text-[clamp(3.6rem,6vw,7rem)] leading-[1.1]"
                style={{ letterSpacing: "-0.042em" }}
              >
                <div className="text-[#02598e]">Join</div>
                <div className="text-[#F85A8E]">The</div>
                <div className="text-[#F85A8E]">Database</div>
              </div>
            </div>
            <img
              src="./illustrations/hero-right.png"
              alt=""
              className="w-full max-w-[240px] flex-shrink-0 md:mb-8"
              style={{ height: "auto", transform: "translateX(-3rem)" }}
            />
          </div>
          <img
            src="./illustrations/Rectangle 6709.svg"
            alt=""
            className="absolute bottom-0 left-0 w-full"
            style={{ display: "block", pointerEvents: "none" }}
          />
        </div>
      )}

      {route !== "admin" && (
        <nav
          className="sticky top-0 z-50"
          style={{ background: "#FADF56" }}
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="max-w-[1440px] mx-auto px-8 pt-6 pb-0 flex justify-between items-end">
            {/* Main tabs */}
            <div className="flex gap-6 items-end" role="tablist">
              {NAV_ITEMS.filter((item) => item.id !== "admin").map((item) => {
                const active = route === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setRoute(item.id)}
                    role="tab"
                    aria-selected={active}
                    className={`font-['Montserrat'] font-medium text-[2rem] tracking-[0.03em] px-8 h-[4.4rem] whitespace-nowrap cursor-pointer ${
                      active
                        ? "text-white bg-[#E8571D]"
                        : "text-black bg-transparent"
                    }`}
                    style={
                      active
                        ? {
                            transform: "skewX(-10deg)",
                            borderTopLeftRadius: 8,
                            borderTopRightRadius: 8,
                          }
                        : {}
                    }
                  >
                    <span
                      style={
                        active
                          ? {
                              display: "inline-block",
                              transform: "skewX(10deg)",
                            }
                          : {}
                      }
                    >
                      {item.display}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Admin — tucked to the right, smaller */}
            <button
              onClick={() => setRoute("admin")}
              className={`font-['Montserrat'] font-medium text-[1.2rem] tracking-[0.08em] uppercase px-3.5 py-1.5 mb-1.5 cursor-pointer rounded ${
                route === "admin"
                  ? "text-white border-transparent"
                  : "text-[#333] border border-[#555]"
              }`}
              style={{
                background: route === "admin" ? "#E8571D" : "transparent",
              }}
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
          <>
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
          </>
        )}

        {showManageModal && (
          <div
            className="fixed inset-0 z-[100] flex items-end"
            style={{ background: "rgba(0,0,0,0.4)" }}
            onClick={closeManageModal}
          >
            <div
              className="relative w-full max-w-2xl mx-auto max-h-[85vh] overflow-y-auto rounded-t-2xl shadow-2xl"
              style={{ background: "rgb(255, 255, 244)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex justify-end p-4" style={{ background: "rgb(255, 255, 244)" }}>
                <button
                  onClick={closeManageModal}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                  style={{ fontSize: 20 }}
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
      {route !== "admin" && <SiteFooter />}
    </div>
  );
}
