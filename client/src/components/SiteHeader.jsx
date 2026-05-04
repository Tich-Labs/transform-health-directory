import { useState } from "react";

const NAV_LINKS = ["Home", "About", "Our Work", "Partners", "Insights", "National Coalitions"];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-brand-cream px-[2.5rem] py-[1.5rem] w-full sticky top-0 z-[999] font-sans">
      <div className="flex justify-between items-center max-w-[1400px] mx-auto">
        <div className="logo">
          <img
            src="https://transformhealthcoalition.org/wp-content/themes/th/assets/images/main_logo.svg"
            alt="Transform Health"
            className="h-[3.2rem] sm:h-[4rem] block"
          />
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:block">
          <ul className="flex list-none m-0 p-0">
            {NAV_LINKS.map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className="text-1.6 uppercase px-6 text-brand-dark no-underline font-medium tracking-[0.03em]"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-2 cursor-pointer bg-transparent border-0"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <span className={`block w-6 h-[2px] bg-brand-dark transition-transform duration-200 ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
          <span className={`block w-6 h-[2px] bg-brand-dark transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-[2px] bg-brand-dark transition-transform duration-200 ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
        </button>
      </div>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <nav className="md:hidden mt-3 border-t border-gray-200 pt-3">
          <ul className="list-none m-0 p-0 flex flex-col gap-1">
            {NAV_LINKS.map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className="block text-1.6 uppercase px-2 py-3 text-brand-dark no-underline font-medium tracking-[0.03em]"
                  onClick={() => setMenuOpen(false)}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
