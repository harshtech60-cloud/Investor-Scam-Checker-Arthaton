import { useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  HelpCircle,
  Info,
  Layers,
  LifeBuoy,
  Loader2,
  Lock,
  MessageSquareText,
  MessagesSquare,
  RotateCcw,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import type {
  AiReviewUnavailableReason,
  GroupChatAiApiResponse,
  GroupChatReviewResult,
  Language,
} from '../types/check';
import { GROUP_CHAT_PRESETS } from '../data/presets';
import { getCopy } from '../data/translations';
import { redactGroupChatText } from '../utils/aiReviewHelpers';
import { analyzeGroupChat, buildGroupChatCopySummary } from '../utils/groupChatAnalyzer';
import { OFFICIAL_PORTAL_LINKS, OfficialSourcesCard } from './OfficialSourcesCard';
import { ScrollReveal } from './ScrollReveal';

interface GroupChatReviewViewProps {
  language: Language;
  onNavigateToMessage: () => void;
  onNavigateToPayment: () => void;
  onOpenPostIncidentHelp: () => void;
}

type GroupChatAiUiStatus = 'idle' | 'consent' | 'loading' | 'unavailable';

export function GroupChatReviewView({
  language,
  onNavigateToMessage,
  onNavigateToPayment,
  onOpenPostIncidentHelp,
}: GroupChatReviewViewProps) {
  const copy = getCopy(language);
  const gc = copy.groupChat;

  const [conversationText, setConversationText] = useState<string>('');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [result, setResult] = useState<GroupChatReviewResult | null>(null);
  const [resultLanguage, setResultLanguage] = useState<Language>(language);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<GroupChatAiUiStatus>('idle');
  const [aiUnavailableReason, setAiUnavailableReason] =
    useState<AiReviewUnavailableReason | null>(null);
  const [isCheckingDemo, setIsCheckingDemo] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const activeResult =
    result && result.mode === 'demo' && resultLanguage !== language
      ? analyzeGroupChat(conversationText, language)
      : result;

  const handleSelectPreset = (presetId: string) => {
    const preset = GROUP_CHAT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setConversationText(preset.conversationText);
    setSelectedPresetId(preset.id);
    setValidationError(null);
    setCopiedSummary(false);
    setAiStatus('idle');
    setAiUnavailableReason(null);
    setResult(analyzeGroupChat(preset.conversationText, language));
    setResultLanguage(language);
  };

  const handleTextChange = (value: string) => {
    setConversationText(value);
    setSelectedPresetId(null);
    setCopiedSummary(false);
    if (validationError) setValidationError(null);
    if (aiStatus !== 'idle') {
      setAiStatus('idle');
      setAiUnavailableReason(null);
    }
  };

  const handleClear = () => {
    setConversationText('');
    setSelectedPresetId(null);
    setResult(null);
    setValidationError(null);
    setCopiedSummary(false);
    setAiStatus('idle');
    setAiUnavailableReason(null);
  };

  const runDemoCheck = () => {
    const trimmed = conversationText.trim();
    setAiStatus('idle');
    setAiUnavailableReason(null);
    if (!trimmed) {
      setValidationError(gc.validationError);
      setResult(null);
      return;
    }
    setValidationError(null);
    setCopiedSummary(false);
    setIsCheckingDemo(true);
    window.setTimeout(() => {
      setResult(analyzeGroupChat(trimmed, language));
      setResultLanguage(language);
      setIsCheckingDemo(false);
    }, 120);
  };

  const handleRequestAiConsent = () => {
    if (!conversationText.trim()) {
      setValidationError(gc.validationError);
      return;
    }
    setValidationError(null);
    setAiUnavailableReason(null);
    setAiStatus('consent');
  };

  const handleContinueAiConsent = async () => {
    const trimmed = conversationText.trim();
    if (!trimmed) {
      setAiStatus('idle');
      setValidationError(gc.validationError);
      return;
    }

    const redactedText = redactGroupChatText(trimmed);
    setAiStatus('loading');
    setAiUnavailableReason(null);

    const ensureLocalFallback = () => {
      setResult((prev) => {
        if (prev) return prev;
        return analyzeGroupChat(trimmed, language);
      });
      setResultLanguage(language);
    };

    try {
      const statusRes = await fetch('/api/ai-review/status');
      if (statusRes.ok) {
        const statusJson = (await statusRes.json()) as { available?: boolean };
        if (statusJson.available === false) {
          ensureLocalFallback();
          setAiUnavailableReason('not_configured');
          setAiStatus('unavailable');
          return;
        }
      }

      const res = await fetch('/api/group-chat-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationText: redactedText,
          language,
          labels: {
            verdictWarningSigns: gc.verdictWarningSigns,
            verdictNoListedSigns: gc.verdictNoListedSigns,
            noSafeProofNote: gc.noSafeProofNote,
            singlePhraseNote: gc.singlePhraseNote,
            stageSupportedBadge: gc.stageSupportedBadge,
            stageNotEnoughInfoBadge: gc.stageNotEnoughInfoBadge,
            stageNotEnoughInfoDesc: gc.stageNotEnoughInfoDesc,
            stageTitles: gc.stageTitles,
            cannotVerifyDirectlyLabel: gc.cannotVerifyDirectlyLabel,
            defaultUncheckedItems: [
              gc.uncheckedItems.liveSebi,
              gc.uncheckedItems.liveSebiCheck,
              gc.uncheckedItems.liveAppsAndDomain,
            ],
            defaultNextSteps: gc.nextStepsList,
            disclaimerNote: gc.disclaimerNote,
          },
        }),
      });

      const data = (await res.json()) as GroupChatAiApiResponse;
      if (res.ok && data.ok) {
        setResult(data.review);
        setResultLanguage(language);
        setAiStatus('idle');
      } else if (!data.ok) {
        ensureLocalFallback();
        setAiUnavailableReason(data.reason);
        setAiStatus('unavailable');
      } else {
        ensureLocalFallback();
        setAiUnavailableReason('upstream_error');
        setAiStatus('unavailable');
      }
    } catch {
      ensureLocalFallback();
      setAiUnavailableReason('upstream_error');
      setAiStatus('unavailable');
    }
  };

  const handleCopySummary = async () => {
    if (!activeResult) return;
    const text = buildGroupChatCopySummary(activeResult, language);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSummary(true);
      window.setTimeout(() => setCopiedSummary(false), 3500);
    } catch {
      setCopiedSummary(true);
    }
  };

  const officialVerifyLinks = [
    {
      id: 'gc-sebi-spot',
      label: copy.officialVerify.spotScamLabel,
      url: OFFICIAL_PORTAL_LINKS.spotScam,
    },
    {
      id: 'gc-sebi-fake-apps',
      label: copy.officialVerify.fakeAppsPdfLabel,
      url: OFFICIAL_PORTAL_LINKS.fakeAppsPdf,
    },
    {
      id: 'gc-sebi-support',
      label: copy.officialVerify.appsListLabel,
      url: OFFICIAL_PORTAL_LINKS.appsList,
    },
    {
      id: 'gc-sebi-check',
      label: copy.officialVerify.sebiCheckLabel,
      url: OFFICIAL_PORTAL_LINKS.sebiCheck,
    },
    {
      id: 'gc-cyber-crime',
      label: copy.officialVerify.cyberCrimeLabel,
      url: OFFICIAL_PORTAL_LINKS.cyberCrime,
    },
  ];

  const supportedStageCount = activeResult
    ? activeResult.stages.filter((s) => s.status === 'supported').length
    : 0;

  return (
    <div className="space-y-8 isc-no-print print:hidden">
      {/* Top Mode Switcher beside Message Checker */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label={copy.nav.checkMessage}
          className="inline-flex flex-wrap items-center gap-1 p-1 rounded-[var(--radius-md)] bg-[#EAE6DC] border border-[#DFDAD0]"
        >
          <button
            type="button"
            role="tab"
            aria-selected={false}
            onClick={onNavigateToMessage}
            data-testid="switch-to-single-message-btn"
            className="min-h-[38px] px-4 py-1.5 rounded-[var(--radius-sm)] text-xs sm:text-sm font-semibold text-[#355049] hover:text-[#183A32] hover:bg-[#FFFEFA]/70 active:translate-y-px cursor-pointer transition-all duration-150 flex items-center gap-2 isc-focus-ring"
          >
            <MessageSquareText className="w-4 h-4 text-[#214D41] shrink-0" aria-hidden="true" />
            <span>{copy.nav.checkMessage}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={true}
            data-testid="switch-to-group-chat-active-btn"
            className="min-h-[38px] px-4 py-1.5 rounded-[var(--radius-sm)] text-xs sm:text-sm font-semibold bg-[#214D41] text-[#FFFEFA] shadow-sm cursor-pointer transition-all duration-150 flex items-center gap-2 isc-focus-ring"
          >
            <MessagesSquare className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{copy.nav.reviewGroupChat}</span>
          </button>
        </div>

        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#566B64]">
          <Lock className="w-3.5 h-3.5 text-[#214D41] shrink-0" aria-hidden="true" />
          <span>{gc.privacyBadge}</span>
        </span>
      </div>

      {/* Editorial Header */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl space-y-2.5"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-[#214D41]">
          {gc.kicker}
        </p>
        <h1 className="font-editorial text-3xl sm:text-[2.3rem] font-semibold tracking-tight text-[#183A32] text-balance leading-[1.14]">
          {gc.title}
        </h1>
        <p className="text-sm sm:text-base text-[#355049] leading-relaxed">
          {gc.subtitle}
        </p>
      </motion.section>

      {/* Sample Conversations (Clearly Labeled as Examples) */}
      <motion.section
        aria-labelledby="gc-presets-heading"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-3"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2
            id="gc-presets-heading"
            className="text-xs font-semibold uppercase tracking-wider text-[#566B64]"
          >
            {gc.presetsTitle}
          </h2>
          <span className="text-xs text-[#566B64]">{gc.presetsHint}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {GROUP_CHAT_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            const exampleTag =
              preset.id === 'gc-mixed-chat'
                ? gc.exampleTagMixed
                : preset.isSuspiciousExample
                  ? gc.exampleTagSuspicious
                  : gc.exampleTagGenuine;

            const tagColorClass =
              preset.id === 'gc-mixed-chat'
                ? 'text-[#794D0C]'
                : preset.isSuspiciousExample
                  ? 'text-[#8A3727]'
                  : 'text-[#214D41]';

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id)}
                aria-pressed={isSelected}
                data-testid={`gc-preset-${preset.id}`}
                className={`p-4 rounded-[var(--radius-md)] border text-left isc-interactive-card flex flex-col justify-between gap-2 isc-focus-ring ${
                  isSelected
                    ? 'isc-selected-choice text-[#183A32]'
                    : 'bg-[#FFFEFA] border-[#DFDAD0] hover:bg-[#EAF4EE]/55 hover:border-[#214D41]'
                }`}
              >
                <div className="space-y-1">
                  <span className={`block text-[11px] font-semibold uppercase tracking-wider ${tagColorClass}`}>
                    {exampleTag}
                  </span>
                  <div className="text-sm font-semibold text-[#183A32] leading-snug">
                    {preset.title[language]}
                  </div>
                </div>
                <p className="text-xs text-[#566B64] leading-snug">
                  {preset.subtitle[language]}
                </p>
              </button>
            );
          })}
        </div>
      </motion.section>

      {/* Main Input Form + Verdict Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Privacy Notice + Single Multiline Conversation Input */}
        <section
          aria-labelledby="gc-input-heading"
          className="lg:col-span-7 isc-sheet p-5 sm:p-6 space-y-4 min-w-0"
        >
          {/* Privacy Reminder BEFORE Input */}
          <div
            data-testid="gc-privacy-notice"
            style={{
              backgroundColor: 'var(--status-caution-bg)',
              borderColor: 'var(--status-caution-border)',
            }}
            className="p-3.5 rounded-[var(--radius-md)] border flex items-start gap-3"
          >
            <Lock
              className="w-4 h-4 shrink-0 mt-0.5"
              style={{ color: 'var(--status-caution-icon)' }}
              aria-hidden="true"
            />
            <div className="space-y-1 min-w-0">
              <p
                className="text-xs sm:text-sm font-semibold"
                style={{ color: 'var(--status-caution-text)' }}
              >
                {gc.privacyTitle}
              </p>
              <p className="text-xs text-[#355049] leading-relaxed">
                {gc.privacyBody}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <label
              id="gc-input-heading"
              htmlFor="gc-conversation-input"
              className="text-sm sm:text-base font-semibold text-[#183A32]"
            >
              {gc.inputLabel}
            </label>
            <button
              type="button"
              onClick={handleClear}
              disabled={!conversationText.trim() && !activeResult}
              data-testid="gc-clear-btn"
              className="isc-btn-secondary !min-h-[34px] !px-3 !text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{gc.clearBtn}</span>
            </button>
          </div>

          <textarea
            id="gc-conversation-input"
            data-testid="gc-textarea"
            rows={8}
            value={conversationText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={gc.inputPlaceholder}
            className="isc-field px-3.5 py-3 text-sm sm:text-base leading-relaxed font-sans"
          />

          {/* Optional Speaker Labels & Approximate Dates Guide */}
          <div className="p-3.5 rounded-[var(--radius-md)] bg-[#F7F5EE] border border-[#DFDAD0] space-y-2">
            <div className="text-xs font-semibold text-[#183A32]">
              {gc.formatHintTitle}
            </div>
            <p className="text-xs text-[#355049] leading-relaxed">
              {gc.formatHintBody}
            </p>
            <div className="flex flex-wrap gap-2 pt-0.5">
              {gc.formatExamples.map((ex, i) => (
                <code
                  key={i}
                  className="text-[11px] font-mono-data text-[#183A32] bg-[#FFFEFA] border border-[#C9C2B4] px-2.5 py-1 rounded-[var(--radius-sm)] break-all"
                >
                  {ex}
                </code>
              ))}
            </div>
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

          {/* Action Buttons: Demo Check Only vs Gemini AI Review */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={runDemoCheck}
              disabled={isCheckingDemo || aiStatus === 'loading'}
              data-testid="gc-demo-only-btn"
              className="isc-btn-primary w-full"
            >
              {isCheckingDemo ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
                  <span>{gc.checkingBtn}</span>
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{gc.demoOnlyBtn}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleRequestAiConsent}
              disabled={aiStatus === 'loading'}
              data-testid="gc-ai-trigger-btn"
              className="isc-btn-secondary w-full !min-h-[46px] !text-sm !border-[#9BC4AC] hover:!bg-[#D8EBDF]/55"
            >
              <Sparkles className="w-4 h-4 text-[#214D41] shrink-0" aria-hidden="true" />
              <span>{gc.aiReviewBtn}</span>
            </button>
          </div>

          {/* Gemini AI Consent Notice (Required Before Sending Text) */}
          {aiStatus === 'consent' && (
            <div
              role="region"
              aria-labelledby="gc-consent-heading"
              data-testid="gc-ai-consent-gate"
              className="p-4 sm:p-5 rounded-[var(--radius-md)] bg-[#EAF4EE] border border-[#9BC4AC] space-y-4 isc-panel-reveal"
            >
              <div className="flex items-start gap-3">
                <Info
                  className="w-4 h-4 text-[#214D41] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div className="space-y-1.5 min-w-0">
                  <h3
                    id="gc-consent-heading"
                    className="text-sm sm:text-base font-semibold text-[#183A32]"
                  >
                    {gc.consentTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#355049] leading-relaxed">
                    {gc.consentBody}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 sm:pl-7">
                <button
                  type="button"
                  onClick={handleContinueAiConsent}
                  data-testid="gc-ai-consent-continue"
                  className="isc-btn-primary !min-h-[40px]"
                >
                  <span>{gc.consentContinueBtn}</span>
                </button>
                <button
                  type="button"
                  onClick={runDemoCheck}
                  data-testid="gc-ai-consent-demo"
                  className="isc-btn-secondary !min-h-[40px] !px-4 !text-sm"
                >
                  <span>{gc.consentDemoOnlyBtn}</span>
                </button>
              </div>
            </div>
          )}

          {aiStatus === 'loading' && (
            <div className="p-4 rounded-[var(--radius-md)] bg-[#F7F5EE] border border-[#DFDAD0] flex items-center gap-3 text-sm text-[#355049]">
              <Loader2
                className="w-4 h-4 text-[#214D41] animate-spin shrink-0"
                aria-hidden="true"
              />
              <span>{gc.aiLoadingBtn}</span>
            </div>
          )}

          {aiStatus === 'unavailable' && (
            <div
              role="status"
              data-testid="gc-ai-unavailable"
              style={{
                backgroundColor: 'var(--status-caution-bg)',
                borderColor: 'var(--status-caution-border)',
              }}
              className="p-4 rounded-[var(--radius-md)] border space-y-3 isc-panel-reveal"
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle
                  className="w-4 h-4 shrink-0 mt-0.5"
                  style={{ color: 'var(--status-caution-icon)' }}
                  aria-hidden="true"
                />
                <div className="space-y-1 min-w-0">
                  <h3
                    className="text-sm font-semibold"
                    style={{ color: 'var(--status-caution-text)' }}
                  >
                    {gc.unavailableTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#355049] leading-relaxed">
                    {aiUnavailableReason === 'not_configured'
                      ? gc.unavailableNotConfigured
                      : gc.unavailableError}
                  </p>
                </div>
              </div>
              <div className="sm:pl-6">
                <button
                  type="button"
                  onClick={runDemoCheck}
                  data-testid="gc-unavailable-use-demo-btn"
                  className="isc-btn-secondary !min-h-[36px]"
                >
                  <span>{gc.consentDemoOnlyBtn}</span>
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Right: Calm Verdict Overview Card */}
        <aside className="lg:col-span-5 space-y-4 min-w-0">
          <div
            className={`rounded-[var(--radius-lg)] border p-5 sm:p-6 shadow-[var(--shadow-card)] space-y-3.5 ${
              activeResult?.verdict === 'warning_signs_found'
                ? 'bg-[#FBF1EE] border-[#C86F5C]'
                : 'bg-[#FFFEFA] border-[#DFDAD0]'
            }`}
          >
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#DFDAD0]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#566B64]">
                {copy.nav.reviewGroupChat}
              </span>
              {activeResult && (
                <span className="text-xs font-medium text-[#214D41]">
                  {activeResult.mode === 'ai' ? gc.modeAiBadge : gc.modeDemoBadge}
                </span>
              )}
            </div>

            {!activeResult ? (
              <div className="space-y-1.5 py-2">
                <h2 className="font-editorial text-xl font-semibold text-[#183A32]">
                  {gc.emptyTitle}
                </h2>
                <p className="text-sm text-[#355049] leading-relaxed">{gc.emptyBody}</p>
              </div>
            ) : (
              <motion.div
                key={`${activeResult.mode}-${activeResult.verdict}-${activeResult.warningSigns.length}`}
                initial={{ opacity: 0.72, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-3"
                data-testid="gc-verdict-card"
              >
                <span
                  data-testid="gc-verdict-label"
                  style={
                    activeResult.verdict === 'warning_signs_found'
                      ? {
                          backgroundColor: '#F6DFDA',
                          borderColor: '#C86F5C',
                          color: '#7C2D1E',
                        }
                      : {
                          backgroundColor: '#EFECE3',
                          borderColor: '#C4BEB2',
                          color: '#3F4744',
                        }
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-sm)] border text-xs font-semibold"
                >
                  {activeResult.verdict === 'warning_signs_found' ? (
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  )}
                  <span>{activeResult.verdictLabel}</span>
                </span>

                <p className="text-sm text-[#183A32] leading-relaxed font-medium">
                  {activeResult.verdict === 'warning_signs_found'
                    ? activeResult.conversationSummary
                    : activeResult.noSafeProofNote}
                </p>

                {activeResult.mode === 'ai' && (
                  <p
                    data-testid="gc-ai-uncertain-note"
                    className="text-xs font-medium text-[#566B64] pt-2 border-t border-[#DFDAD0]"
                  >
                    {copy.aiReview.uncertainNote}
                  </p>
                )}

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    data-testid="gc-copy-summary-btn"
                    className="isc-btn-secondary !min-h-[36px]"
                  >
                    {copiedSummary ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#214D41]" aria-hidden="true" />
                        <span>{gc.copiedSummaryBtn}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#214D41]" aria-hidden="true" />
                        <span>{gc.copySummaryBtn}</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {activeResult && (
            <div className="isc-sheet p-5 space-y-3 text-xs sm:text-sm text-[#355049]">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-[#183A32]">
                  {gc.section2StagesTitle}
                </span>
                <span className="font-mono-data font-semibold text-[#214D41]">
                  {supportedStageCount}/5
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-[#183A32]">
                  {gc.section3WarningsTitle}
                </span>
                <span className="font-mono-data font-semibold text-[#214D41]">
                  {activeResult.warningSigns.length}
                </span>
              </div>
              <p className="text-xs text-[#566B64] pt-2.5 border-t border-[#DFDAD0] leading-relaxed">
                {activeResult.disclaimerNote}
              </p>
            </div>
          )}
        </aside>
      </div>

      {/* 5 STRUCTURED SECTIONS IN EXACT REQUIRED ORDER */}
      {activeResult && (
        <div className="space-y-6" data-testid="gc-results-sections">
          {/* 1. Conversation summary */}
          <ScrollReveal>
          <section
            aria-labelledby="gc-sec-1"
            data-testid="gc-section-summary"
            className="isc-sheet p-5 sm:p-6 space-y-3"
          >
            <h2
              id="gc-sec-1"
              className="font-editorial text-lg font-semibold text-[#183A32]"
            >
              1. {gc.section1SummaryTitle}
            </h2>
            <p className="text-sm sm:text-base text-[#355049] leading-relaxed max-w-4xl">
              {activeResult.conversationSummary}
            </p>
            {activeResult.contextUnclearNote && (
              <div
                style={{
                  backgroundColor: 'var(--status-neutral-bg)',
                  borderColor: 'var(--status-neutral-border)',
                }}
                className="p-3.5 rounded-[var(--radius-md)] border text-xs sm:text-sm text-[#3F4744] leading-relaxed flex items-start gap-2.5"
              >
                <HelpCircle
                  className="w-4 h-4 text-[#565E5A] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>{activeResult.contextUnclearNote}</span>
              </div>
            )}
          </section>
          </ScrollReveal>

          {/* 2. Possible stages (Visually separating possible pattern from proof) */}
          <ScrollReveal delay={0.04}>
          <section
            aria-labelledby="gc-sec-2"
            data-testid="gc-section-stages"
            className="isc-sheet p-5 sm:p-6 space-y-4"
          >
            <div className="space-y-1 pb-3 border-b border-[#DFDAD0]">
              <h2
                id="gc-sec-2"
                className="font-editorial text-lg font-semibold text-[#183A32]"
              >
                2. {gc.section2StagesTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[#355049] leading-relaxed max-w-4xl">
                {gc.stagesIntro}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {activeResult.stages.map((stage) => {
                const supported = stage.status === 'supported';
                return (
                  <div
                    key={stage.id}
                    data-testid={`gc-stage-${stage.id}`}
                    data-stage-status={stage.status}
                    className={`p-4 rounded-[var(--radius-md)] border space-y-2.5 ${
                      supported
                        ? 'bg-[#FDF6E7]/75 border-[#DBA14B]'
                        : 'bg-[#F7F5EE] border-[#DFDAD0]'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-[#183A32] leading-snug">
                        {stage.title}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[var(--radius-sm)] text-xs font-semibold border shrink-0 ${
                          supported
                            ? 'bg-[#F8E8C6] border-[#DBA14B] text-[#794D0C]'
                            : 'bg-[#EFECE3] border-[#C4BEB2] text-[#3F4744]'
                        }`}
                      >
                        {supported ? (
                          <AlertTriangle className="w-3 h-3 shrink-0" aria-hidden="true" />
                        ) : (
                          <HelpCircle className="w-3 h-3 shrink-0" aria-hidden="true" />
                        )}
                        <span>{stage.statusLabel}</span>
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#355049] leading-relaxed">
                      {stage.explanation}
                    </p>

                    {supported && stage.supportingPhrases.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#DFDAD0]/70">
                        {stage.messageRefs.length > 0 && (
                          <span className="text-xs font-mono-data text-[#214D41] font-semibold">
                            {stage.messageRefs.map((r) => `#${r}`).join(', ')}
                          </span>
                        )}
                        {stage.supportingPhrases.map((phrase, idx) => (
                          <span
                            key={idx}
                            className="text-xs font-mono-data text-[#183A32] bg-[#FFFEFA] border border-[#C9C2B4] px-2 py-0.5 rounded-[var(--radius-sm)] break-words"
                          >
                            &ldquo;{phrase}&rdquo;
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
          </ScrollReveal>

          {/* 3. Warning signs */}
          <ScrollReveal delay={0.04}>
          <section
            aria-labelledby="gc-sec-3"
            data-testid="gc-section-warnings"
            className="isc-sheet p-5 sm:p-6 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#DFDAD0]">
              <h2
                id="gc-sec-3"
                className="font-editorial text-lg font-semibold text-[#183A32]"
              >
                3. {gc.section3WarningsTitle}
              </h2>
              <span className="text-xs font-semibold text-[#566B64]">
                {activeResult.verdictLabel}
              </span>
            </div>

            {activeResult.warningSigns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {activeResult.warningSigns.map((sign, idx) => (
                  <div
                    key={`${sign.id}-${idx}`}
                    data-testid="gc-warning-item"
                    className="p-4 rounded-[var(--radius-md)] bg-[#FBF1EE]/65 border border-[#C86F5C] space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-[#183A32]">
                        {sign.title}
                      </span>
                      <span className="text-xs font-mono-data font-medium text-[#214D41]">
                        {sign.sourceMessageLabel}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-medium text-[#566B64] block">
                        {gc.warningPhraseLabel}
                      </span>
                      <span className="inline-block text-xs font-mono-data text-[#183A32] bg-[#FFFEFA] border border-[#C9C2B4] px-2.5 py-1 rounded-[var(--radius-sm)] break-words">
                        &ldquo;{sign.supportingPhrase}&rdquo;
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#355049] leading-relaxed">
                      {sign.explanation}
                    </p>

                    {sign.contextUnclearNote && (
                      <p className="text-xs text-[#566B64] leading-relaxed">
                        {sign.contextUnclearNote}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: 'var(--status-neutral-bg)',
                  borderColor: 'var(--status-neutral-border)',
                }}
                className="p-4 rounded-[var(--radius-md)] border space-y-2"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-[#183A32]">
                  <CheckCircle2 className="w-4 h-4 text-[#214D41] shrink-0" aria-hidden="true" />
                  <span>{activeResult.verdictLabel}</span>
                </div>
                <p className="text-xs sm:text-sm text-[#183A32] leading-relaxed">
                  {gc.noWarningsBody}
                </p>
                <p className="text-xs text-[#355049] leading-relaxed">
                  {activeResult.noSafeProofNote}
                </p>
              </div>
            )}
          </section>
          </ScrollReveal>

          {/* 4. What could not be checked */}
          <ScrollReveal delay={0.04}>
          <section
            aria-labelledby="gc-sec-4"
            data-testid="gc-section-unchecked"
            className="isc-sheet p-5 sm:p-6 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#DFDAD0]">
              <h2
                id="gc-sec-4"
                className="font-editorial text-lg font-semibold text-[#183A32]"
              >
                4. {gc.section4UncheckedTitle}
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[var(--radius-sm)] bg-[#EFECE3] border border-[#C4BEB2] text-xs font-semibold text-[#3F4744]">
                <HelpCircle className="w-3.5 h-3.5 text-[#565E5A]" aria-hidden="true" />
                <span>{activeResult.cannotVerifyDirectlyLabel}</span>
              </span>
            </div>

            <ul className="space-y-2.5">
              {activeResult.couldNotBeChecked.map((item, idx) => (
                <li
                  key={idx}
                  className="p-3.5 rounded-[var(--radius-md)] bg-[#F7F5EE] border border-[#DFDAD0] text-xs sm:text-sm text-[#355049] leading-relaxed flex items-start gap-2.5"
                >
                  <Info
                    className="w-4 h-4 text-[#214D41] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
              {officialVerifyLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-gc-official-link={link.id}
                  className="group p-3 rounded-[var(--radius-sm)] bg-[#FFFEFA] border border-[#C9C2B4] hover:border-[#214D41] hover:bg-[#EAF4EE] text-xs font-semibold text-[#183A32] isc-interactive-card flex items-center justify-between gap-2 isc-focus-ring"
                >
                  <span className="leading-snug">{link.label}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#214D41] shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </section>
          </ScrollReveal>

          {/* 5. Next steps */}
          <ScrollReveal delay={0.04}>
          <section
            aria-labelledby="gc-sec-5"
            data-testid="gc-section-next-steps"
            className="isc-sheet p-5 sm:p-6 space-y-4"
          >
            <h2
              id="gc-sec-5"
              className="font-editorial text-lg font-semibold text-[#183A32]"
            >
              5. {gc.section5NextStepsTitle}
            </h2>

            <ol className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeResult.nextSteps.map((step, idx) => (
                <li
                  key={idx}
                  className="p-3.5 rounded-[var(--radius-md)] bg-[#F7F5EE] border border-[#DFDAD0] flex items-start gap-3 text-xs sm:text-sm text-[#183A32] leading-relaxed"
                >
                  <span className="font-mono-data text-xs font-semibold text-[#214D41] pt-0.5 shrink-0">
                    0{idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            {/* Guided Post-Incident Help Trigger near next steps */}
            <div className="isc-mint-surface p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <span className="w-9 h-9 rounded-[var(--radius-md)] bg-[#FFFEFA] border border-[#9BC4AC] text-[#214D41] flex items-center justify-center shrink-0">
                  <LifeBuoy className="w-4 h-4" aria-hidden="true" />
                </span>
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-[#183A32]">
                    {copy.postIncidentHelp.triggerBtn}
                  </p>
                  <p className="text-xs text-[#355049] leading-relaxed">
                    {copy.postIncidentHelp.triggerHint}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenPostIncidentHelp}
                data-testid="gc-open-post-incident-help-btn"
                className="isc-btn-primary shrink-0"
              >
                <LifeBuoy className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{copy.postIncidentHelp.triggerBtn}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#DFDAD0]">
              <p className="text-xs text-[#566B64] leading-relaxed max-w-2xl">
                {activeResult.disclaimerNote}
              </p>
              <button
                type="button"
                onClick={onNavigateToPayment}
                className="isc-btn-secondary !min-h-[38px] !px-4 !text-xs shrink-0"
              >
                <span>{copy.nav.checkPayment}</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </section>
          </ScrollReveal>
        </div>
      )}

      <ScrollReveal>
        <OfficialSourcesCard language={language} />
      </ScrollReveal>
    </div>
  );
}
