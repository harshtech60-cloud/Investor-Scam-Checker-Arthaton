import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  KeyRound,
  Landmark,
  LifeBuoy,
  MessageSquareOff,
  PhoneCall,
  ShieldAlert,
  Smartphone,
  X,
} from 'lucide-react';
import type { Language, PostIncidentChoice } from '../types/check';
import { getCopy } from '../data/translations';
import { POST_INCIDENT_CHOICES, getPostIncidentGuidance } from '../utils/postIncidentHelp';

interface PostIncidentHelpModalProps {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
  onBackToMessageChecker: () => void;
}

const CHOICE_ICONS: Record<PostIncidentChoice, typeof Landmark> = {
  paid: Landmark,
  shared_secret: KeyRound,
  clicked_or_installed: Smartphone,
  not_acted: MessageSquareOff,
};

export function PostIncidentHelpModal({
  isOpen,
  language,
  onClose,
  onBackToMessageChecker,
}: PostIncidentHelpModalProps) {
  const [selectedChoice, setSelectedChoice] = useState<PostIncidentChoice | null>(null);
  const copy = getCopy(language);
  const h = copy.postIncidentHelp;

  useEffect(() => {
    if (!isOpen) {
      setSelectedChoice(null);
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const guidance = selectedChoice ? getPostIncidentGuidance(selectedChoice, language) : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="post-incident-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#183A32]/55 backdrop-blur-xs isc-no-print print:hidden"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="post-incident-modal-title"
            data-testid="post-incident-modal"
            initial={{ opacity: 0, y: 14, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.985 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-[var(--radius-lg)] bg-[#FFFEFA] border border-[#C9C2B4] shadow-[0_24px_60px_rgba(24,58,50,0.22)] p-5 sm:p-7 space-y-5"
          >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#DFDAD0]">
          <div className="space-y-1.5 min-w-0">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#214D41]">
              <LifeBuoy className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{h.privacyBadge}</span>
            </div>
            <h2
              id="post-incident-modal-title"
              className="font-editorial text-xl sm:text-2xl font-semibold text-[#183A32] leading-snug"
            >
              {h.modalTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#355049] leading-relaxed">
              {h.modalSubtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={h.closeBtn}
            data-testid="post-incident-close-btn"
            className="w-9 h-9 rounded-[var(--radius-md)] bg-[#F4F2EB] hover:bg-[#EAE6DC] border border-[#C9C2B4] text-[#183A32] flex items-center justify-center shrink-0 transition-colors isc-focus-ring"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* 4 Guided Choice Cards (zero input fields, zero storage, zero AI) */}
        <div className="space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#566B64]">
            {h.selectPrompt}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {POST_INCIDENT_CHOICES.map((choiceId, idx) => {
              const Icon = CHOICE_ICONS[choiceId];
              const choiceCopy = h.choices[choiceId];
              const isSelected = selectedChoice === choiceId;
              return (
                <button
                  key={choiceId}
                  type="button"
                  aria-pressed={isSelected}
                  data-testid={`post-incident-choice-${choiceId}`}
                  onClick={() => setSelectedChoice(choiceId)}
                  className={`w-full min-h-[58px] p-3.5 rounded-[var(--radius-md)] border text-left isc-interactive-card flex items-start gap-3 isc-focus-ring ${
                    isSelected
                      ? 'isc-selected-choice text-[#183A32]'
                      : 'bg-[#F7F5EE] border-[#DFDAD0] hover:bg-[#EAF4EE]/60 hover:border-[#214D41] text-[#183A32]'
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0 mt-0.5 border ${
                      isSelected
                        ? 'bg-[#214D41] text-[#FFFEFA] border-[#214D41]'
                        : 'bg-[#FFFEFA] text-[#214D41] border-[#C9C2B4]'
                    }`}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <div className="space-y-1 min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-[#183A32] leading-snug">
                      <span className="font-mono-data text-[#214D41] mr-1.5">
                        {idx + 1}.
                      </span>
                      {choiceCopy.label}
                    </div>
                    <p className="text-xs text-[#566B64] leading-relaxed">
                      {choiceCopy.shortHint}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action-First Tailored Steps & Official Reporting Panel */}
        <AnimatePresence mode="wait">
        {guidance && (
          <motion.div
            key={guidance.choice}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            data-testid="post-incident-guidance"
            data-choice={guidance.choice}
            className="p-4 sm:p-5 rounded-[var(--radius-lg)] bg-[#F7F5EE] border border-[#C9C2B4] space-y-4"
          >
            {/* Urgent Rule Note */}
            <div
              style={{
                backgroundColor: 'var(--status-caution-bg)',
                borderColor: 'var(--status-caution-border)',
                color: 'var(--status-caution-text)',
              }}
              className="p-3.5 rounded-[var(--radius-md)] border flex items-start gap-2.5 text-xs sm:text-sm font-medium leading-relaxed"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{guidance.urgentRuleNote}</span>
            </div>

            {guidance.reporting && (
              <div
                data-testid="post-incident-reporting-box"
                className="p-4 rounded-[var(--radius-md)] bg-[#EBF5EF] border border-[#9BC4AC] space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#183A32]">
                    <PhoneCall
                      className="w-4 h-4 text-[#214D41] shrink-0"
                      aria-hidden="true"
                    />
                    <span>{guidance.reporting.title}</span>
                  </div>
                  <span className="font-mono-data text-sm font-semibold px-2.5 py-0.5 rounded-[var(--radius-sm)] bg-[#FFFEFA] border border-[#9BC4AC] text-[#183A32]">
                    {guidance.reporting.helpline}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#355049] leading-relaxed">
                  {guidance.reporting.body}
                </p>
                <div>
                  <a
                    href={guidance.reporting.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="post-incident-cybercrime-link"
                    className="isc-btn-primary w-full sm:w-auto"
                  >
                    <span>{guidance.reporting.portalLabel}</span>
                    <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
                  </a>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <h3 className="font-editorial text-lg font-semibold text-[#183A32]">
                {guidance.heading}
              </h3>
              <p className="text-xs sm:text-sm text-[#355049] leading-relaxed">
                {guidance.summary}
              </p>
            </div>

            {guidance.deviceNotCheckedNote && (
              <div className="p-3.5 rounded-[var(--radius-md)] bg-[#FFFEFA] border border-[#C9C2B4] flex items-start gap-2.5 text-xs sm:text-sm text-[#355049] leading-relaxed">
                <ShieldAlert
                  className="w-4 h-4 text-[#214D41] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>{guidance.deviceNotCheckedNote}</span>
              </div>
            )}

            <ol className="space-y-2.5">
              {guidance.steps.map((step, index) => (
                <li
                  key={index}
                  style={{ ['--stagger-index' as string]: index }}
                  className="p-3.5 rounded-[var(--radius-md)] bg-[#FFFEFA] border border-[#DFDAD0] flex items-start gap-3 text-xs sm:text-sm text-[#183A32] leading-relaxed isc-clue-stagger"
                >
                  <span className="font-mono-data text-xs font-semibold text-[#214D41] pt-0.5 shrink-0">
                    0{index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            {guidance.showBackToChecker && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={onBackToMessageChecker}
                  data-testid="post-incident-back-to-checker-btn"
                  className="isc-btn-primary w-full sm:w-auto"
                >
                  <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{h.backToCheckerBtn}</span>
                </button>
              </div>
            )}

            {/* Official Sources Strip */}
            <div className="pt-3 border-t border-[#DFDAD0] space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#566B64]">
                {h.sourcesTitle}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {guidance.officialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-post-incident-source={link.id}
                    className="p-2.5 rounded-[var(--radius-sm)] bg-[#FFFEFA] border border-[#C9C2B4] hover:border-[#214D41] hover:bg-[#EAF4EE] text-xs font-semibold text-[#183A32] isc-interactive-card flex items-center justify-between gap-2 isc-focus-ring"
                  >
                    <span className="leading-snug">{link.label}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#214D41] shrink-0" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Permanent Accuracy & Privacy Disclosure */}
        <p className="text-xs text-[#566B64] pt-2 border-t border-[#DFDAD0] leading-relaxed">
          {h.disclaimerNote}
        </p>
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  );
}
