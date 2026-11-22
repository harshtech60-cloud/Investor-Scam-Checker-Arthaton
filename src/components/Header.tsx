import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, Globe, Menu, X } from 'lucide-react';
import type { Language, NavSection } from '../types/check';
import { LANGUAGE_OPTIONS, getCopy } from '../data/translations';

interface HeaderProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  language: Language;
  onChangeLanguage: (lang: Language) => void;
}

function BrandEditorialMark() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className="shrink-0 transition-transform duration-200 group-hover:scale-105"
    >
      <rect x="1.5" y="1.5" width="29" height="29" rx="8" fill="#214D41" />
      <path
        d="M16 7.5L9.5 10.2V15.6C9.5 20.1 12.4 23.9 16 25.2C19.6 23.9 22.5 20.1 22.5 15.6V10.2L16 7.5Z"
        fill="#D8EBDF"
        fillOpacity="0.22"
        stroke="#D8EBDF"
        strokeWidth="1.5"
      />
      <path
        d="M13.5 15.8L15.3 17.6L19 13.7"
        stroke="#FFFEFA"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Header({
  activeSection,
  onSelectSection,
  language,
  onChangeLanguage,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const copy = getCopy(language);

  const navItems: Array<{ id: NavSection; label: string }> = [
    { id: 'check-message', label: copy.nav.checkMessage },
    { id: 'group-chat', label: copy.nav.reviewGroupChat },
    { id: 'check-payment', label: copy.nav.checkPayment },
    { id: 'how-it-works', label: copy.nav.howItWorks },
    { id: 'about', label: copy.nav.about },
  ];

  const handleNavClick = (section: NavSection) => {
    onSelectSection(section);
    setMobileMenuOpen(false);
  };

  return (
    <header className="relative z-40 bg-[#FFFEFA] border-b border-[#DFDAD0]">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNavClick('check-message')}
          className="group flex items-center gap-2 sm:gap-2.5 text-left min-w-0 lg:shrink-0 rounded-[var(--radius-sm)] isc-focus-ring py-1 pr-1 cursor-pointer active:scale-[0.985] transition-transform duration-150"
        >
          <BrandEditorialMark />
          <span className="font-editorial text-[15px] sm:text-lg font-semibold tracking-tight text-[#183A32] truncate lg:overflow-visible">
            {copy.brandName}
          </span>
        </button>

        {/* Zone 2: Clean Typographic Primary Navigation with Shared Active Underline */}
        <nav
          aria-label="Primary"
          className="hidden lg:flex items-center gap-1.5 xl:gap-3 min-w-0"
        >
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <motion.button
                key={item.id}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                data-nav-section={item.id}
                className={`group relative px-2.5 py-2 text-sm whitespace-nowrap shrink-0 cursor-pointer transition-colors duration-150 isc-focus-ring rounded-[var(--radius-sm)] ${
                  isActive
                    ? 'font-semibold text-[#183A32] bg-[#EAF4EE]/65'
                    : 'font-medium text-[#566B64] hover:text-[#183A32] hover:bg-[#F4F2EB]'
                }`}
              >
                <span>{item.label}</span>
                {isActive ? (
                  <motion.span
                    layoutId="isc-header-active-underline"
                    aria-hidden="true"
                    transition={{ type: 'spring', stiffness: 460, damping: 36 }}
                    className="absolute inset-x-2 bottom-0.5 h-[2.5px] bg-[#214D41] rounded-full"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-2.5 bottom-0.5 h-[2px] bg-[#9BC4AC] rounded-full scale-x-0 group-hover:scale-x-100 origin-center transition-transform duration-180 ease-out"
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Zone 3: Visible 12-Language Selector + Mobile Menu Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="relative flex items-center">
            <label htmlFor="isc-language-select" className="sr-only">
              {copy.languageLabel}
            </label>
            <Globe
              className="w-3.5 h-3.5 text-[#214D41] absolute left-2 sm:left-3 pointer-events-none"
              aria-hidden="true"
            />
            <select
              id="isc-language-select"
              aria-label={copy.languageLabel}
              value={language}
              onChange={(e) => onChangeLanguage(e.target.value as Language)}
              className="appearance-none h-9 max-w-[104px] sm:max-w-[180px] pl-6.5 sm:pl-8 pr-6 sm:pr-8 py-1 rounded-[var(--radius-md)] bg-[#F4F2EB] border border-[#C9C2B4] text-xs sm:text-sm font-medium text-[#183A32] hover:border-[#214D41] hover:bg-[#EAF4EE]/55 transition-colors cursor-pointer truncate isc-focus-ring"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option
                  key={opt.code}
                  value={opt.code}
                  className="bg-[#FFFEFA] text-[#183A32]"
                >
                  {opt.code === 'en' || opt.code === 'en-easy'
                    ? opt.nativeLabel
                    : `${opt.nativeLabel} · ${opt.englishName}`}
                </option>
              ))}
            </select>
            <ChevronDown
              className="w-3.5 h-3.5 text-[#566B64] absolute right-1.5 sm:right-2.5 pointer-events-none"
              aria-hidden="true"
            />
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? copy.menuClose : copy.menuOpen}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-[var(--radius-md)] bg-[#F4F2EB] border border-[#C9C2B4] text-[#183A32] hover:border-[#214D41] hover:bg-[#EAF4EE]/60 active:scale-95 transition-all duration-150 isc-focus-ring shrink-0"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Mobile / Tablet Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            aria-label="Mobile navigation"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden border-t border-[#DFDAD0] bg-[#FFFEFA] px-4 py-3 space-y-1.5"
          >
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full min-h-[44px] px-3.5 py-2 rounded-[var(--radius-md)] text-left text-sm transition-all duration-150 flex items-center justify-between isc-focus-ring active:scale-[0.985] ${
                    isActive
                      ? 'bg-[#D8EBDF] text-[#183A32] font-semibold border border-[#9BC4AC]'
                      : 'bg-transparent text-[#355049] font-medium hover:bg-[#F4F2EB]'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
