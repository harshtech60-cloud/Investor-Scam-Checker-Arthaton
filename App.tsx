import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { MotionConfig, motion } from 'motion/react';
import { Info } from 'lucide-react';
import type { Language, NavSection } from './types/check';
import { getBcp47, getCopy } from './data/translations';
import { Header } from './components/Header';
import { MessageCheckView } from './components/MessageCheckView';

const GroupChatReviewView = lazy(() =>
  import('./components/GroupChatReviewView').then((module) => ({
    default: module.GroupChatReviewView,
  }))
);
const PaymentCheckView = lazy(() =>
  import('./components/PaymentCheckView').then((module) => ({
    default: module.PaymentCheckView,
  }))
);
const HowItWorksView = lazy(() =>
  import('./components/HowItWorksView').then((module) => ({
    default: module.HowItWorksView,
  }))
);
const AboutView = lazy(() =>
  import('./components/AboutView').then((module) => ({
    default: module.AboutView,
  }))
);
const PostIncidentHelpModal = lazy(() =>
  import('./components/PostIncidentHelpModal').then((module) => ({
    default: module.PostIncidentHelpModal,
  }))
);

export default function App() {
  const [activeSection, setActiveSection] = useState<NavSection>('check-message');
  const [language, setLanguage] = useState<Language>('en');
  const [isPostIncidentHelpOpen, setIsPostIncidentHelpOpen] = useState(false);
  const copy = getCopy(language);

  useEffect(() => {
    document.documentElement.lang = getBcp47(language);
  }, [language]);

  const handleSelectSection = useCallback((section: NavSection) => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="isc-outer-frame min-h-screen bg-[#F4F2EB] text-[#183A32] overflow-x-clip flex flex-col">
        {/* Shared Compact Header + Quiet Demo Notice */}
        <div className="isc-no-print print:hidden">
          <Header
            activeSection={activeSection}
            onSelectSection={handleSelectSection}
            language={language}
            onChangeLanguage={setLanguage}
          />

          {/* Prominent but quiet Demo-Only Notice Bar */}
          <div className="bg-[#ECE8DD] border-b border-[#DFDAD0]">
            <div className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-start sm:items-center gap-2 text-xs sm:text-[13px] text-[#355049]">
              <Info
                className="w-4 h-4 text-[#214D41] shrink-0 mt-0.5 sm:mt-0"
                aria-hidden="true"
              />
              <p className="leading-snug">{copy.demoBanner}</p>
            </div>
          </div>
        </div>

        {/* Main content; secondary screens load when selected */}
        <main className="flex-1 w-full max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 print:p-0 print:max-w-none">
          <Suspense
            fallback={
              <div
                className="min-h-[40vh] grid place-items-center text-sm text-[#566B64]"
                role="status"
              >
                Loading…
              </div>
            }
          >
            <motion.div
              key={activeSection}
              data-active-section={activeSection}
              initial={{ opacity: 0.08, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeSection === 'check-message' && (
                <MessageCheckView
                  language={language}
                  onNavigateToGroupChat={() => handleSelectSection('group-chat')}
                  onNavigateToPayment={() => handleSelectSection('check-payment')}
                  onNavigateToHowItWorks={() => handleSelectSection('how-it-works')}
                  onNavigateToAbout={() => handleSelectSection('about')}
                  onOpenPostIncidentHelp={() => setIsPostIncidentHelpOpen(true)}
                />
              )}

              {activeSection === 'group-chat' && (
                <GroupChatReviewView
                  language={language}
                  onNavigateToMessage={() => handleSelectSection('check-message')}
                  onNavigateToPayment={() => handleSelectSection('check-payment')}
                  onOpenPostIncidentHelp={() => setIsPostIncidentHelpOpen(true)}
                />
              )}

              {activeSection === 'check-payment' && (
                <PaymentCheckView
                  language={language}
                  onNavigateToMessage={() => handleSelectSection('check-message')}
                  onOpenPostIncidentHelp={() => setIsPostIncidentHelpOpen(true)}
                />
              )}

              {activeSection === 'how-it-works' && (
                <HowItWorksView
                  language={language}
                  onStartCheck={() => handleSelectSection('check-message')}
                />
              )}

              {activeSection === 'about' && (
                <AboutView
                  language={language}
                  onStartCheck={() => handleSelectSection('check-message')}
                />
              )}
            </motion.div>
          </Suspense>
        </main>

        {/* Quiet Editorial Footer */}
        <footer className="isc-no-print print:hidden border-t border-[#DFDAD0] bg-[#EFECE3]">
          <div className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-[#566B64]">
            <p className="leading-relaxed">{copy.footer.note}</p>
            <p className="font-semibold text-[#183A32] whitespace-nowrap shrink-0">
              {copy.footerTag}
            </p>
          </div>
        </footer>

        <Suspense fallback={null}>
          <PostIncidentHelpModal
            isOpen={isPostIncidentHelpOpen}
            language={language}
            onClose={() => setIsPostIncidentHelpOpen(false)}
            onBackToMessageChecker={() => {
              setIsPostIncidentHelpOpen(false);
              handleSelectSection('check-message');
            }}
          />
        </Suspense>
      </div>
    </MotionConfig>
  );
}