import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  Lock,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import type {
  AiMessageReviewResult,
  AiReviewUnavailableReason,
  Language,
} from '../types/check';
import { getCopy } from '../data/translations';

export type AiReviewUiStatus = 'idle' | 'consent' | 'loading' | 'success' | 'unavailable';

interface AiReviewCardProps {
  id?: string;
  language: Language;
  status: AiReviewUiStatus;
  result: AiMessageReviewResult | null;
  unavailableReason: AiReviewUnavailableReason | null;
  validationError: string | null;
  onRequestReview: () => void;
  onContinueConsent: () => void;
  onUseDemoOnly: () => void;
}

export function AiReviewCard({
  id = 'ai-review-section',
  language,
  status,
  result,
  unavailableReason,
  validationError,
  onRequestReview,
  onContinueConsent,
  onUseDemoOnly,
}: AiReviewCardProps) {
  const copy = getCopy(language);
  const ar = copy.aiReview;

  return (
    <section
      id={id}
      aria-labelledby="ai-review-heading"
      aria-live="polite"
      data-testid="ai-review-card"
      className="isc-sheet p-5 sm:p-6 space-y-4"
    >
      {/* Header Row */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-[#DFDAD0]">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#214D41] shrink-0" aria-hidden="true" />
            <h3
              id="ai-review-heading"
              className="font-editorial text-lg font-semibold text-[#183A32]"
            >
              {ar.panelTitle}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#355049] leading-relaxed max-w-3xl">
            {ar.panelSubtitle}
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#566B64] shrink-0">
          <Lock className="w-3.5 h-3.5 text-[#214D41] shrink-0" aria-hidden="true" />
          <span>{ar.privacyBadge}</span>
        </span>
      </div>

      {validationError && (
        <div
          role="alert"
          style={{
            backgroundColor: 'var(--status-caution-bg)',
            borderColor: 'var(--status-caution-border)',
            color: 'var(--status-caution-text)',
          }}
          className="p-3.5 rounded-[var(--radius-md)] border text-xs sm:text-sm font-medium"
        >
          {validationError}
        </div>
      )}
      
      {/* Idle State: Trigger Button */}
      {status === 'idle' && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onRequestReview}
            data-testid="ai-review-trigger-btn"
            className="isc-btn-secondary !min-h-[42px] !px-4 !text-sm !border-[#9BC4AC] hover:!bg-[#D8EBDF]/50"
          >
            <Sparkles className="w-4 h-4 text-[#214D41] shrink-0" aria-hidden="true" />
            <span>{ar.triggerBtn}</span>
          </button>
        </div>
      )}

      {/* Consent Gate Before Sending Message Text */}
      {status === 'consent' && (
        <div
          role="region"
          aria-labelledby="ai-consent-heading"
          data-testid="ai-consent-gate"
          className="p-4 sm:p-5 rounded-[var(--radius-md)] bg-[#EAF4EE] border border-[#9BC4AC] space-y-4 isc-panel-reveal"
        >
          <div className="flex items-start gap-3">
            <Info
              className="w-4 h-4 text-[#214D41] shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="space-y-1.5 min-w-0">
              <h4
                id="ai-consent-heading"
                className="text-sm sm:text-base font-semibold text-[#183A32]"
              >
                {ar.consentTitle}
              </h4>
              
