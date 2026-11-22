import { useState, type ChangeEvent, type FormEvent } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  FileText,
  Globe,
  HelpCircle,
  IndianRupee,
  LifeBuoy,
  Link2,
  Loader2,
  MessageSquareText,
  MessagesSquare,
  Printer,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react';
import type {
  AiMessageReviewResult,
  AiReviewApiResponse,
  AiReviewUnavailableReason,
  Language,
  MessageCheckInput,
  PillarFinding,
  ScreenshotApiResponse,
  UnifiedCheckResult,
} from '../types/check';
import { MESSAGE_DEMO_PRESETS } from '../data/presets';
import { getCopy } from '../data/translations';
import { redactGroupChatText } from '../utils/aiReviewHelpers';
import { fileToDownscaledJpegBase64 } from '../utils/imageUtils';
import { analyzeUnifiedCheck, buildFamilySummaryText, getCheckBasisLabel } from '../utils/analyzer';
import { splitHeadlineLines } from '../utils/editorialMotion';
import { buildPrintableMessageSummary } from '../utils/printSummary';
import { useCardTilt } from '../utils/useCardTilt';
import { AiReviewCard, type AiReviewUiStatus } from './AiReviewCard';
import { ConnectedResultTiles } from './ConnectedResultTiles';
import { FourClueGraph } from './FourClueGraph';
import { OfficialSourcesCard } from './OfficialSourcesCard';
import { PauseVerifyToken3D, type HeroClueId } from './PauseVerifyToken3D';
import { PrintableFamilySummary } from './PrintableFamilySummary';
import { ScrollReveal } from './ScrollReveal';
import { StatusIndicator, getBannerStyles } from './StatusIndicator';

interface MessageCheckViewProps {
  language: Language;
  onNavigateToGroupChat: () => void;
  onNavigateToPayment: () => void;
  onNavigateToHowItWorks?: () => void;
  onNavigateToAbout?: () => void;
  onOpenPostIncidentHelp: () => void;
}

const EMPTY_INPUT: MessageCheckInput = {
  messageText: '',
  sebiClaim: '',
  websiteLink: '',
  paymentDetail: '',
  requestedAmountInr: '',
};

const PILLAR_ICONS = {
  message: MessageSquareText,
  sebi: BadgeCheck,
  link: Globe,
  payment: Wallet,
} as const;

function serializeMessageInput(input: MessageCheckInput): string {
  return JSON.stringify([
    input.messageText.trim(),
    input.sebiClaim.trim(),
    input.websiteLink.trim(),
    input.paymentDetail.trim(),
    input.requestedAmountInr.trim(),
  ]);
}

function EditorialActionCard({
  kicker,
  title,
  description,
  cta,
  Icon,
  onClick,
  testId,
}: {
  kicker: string;
  title: string;
  description: string;
  cta: string;
  Icon: typeof Wallet;
  onClick: () => void;
  testId?: string;
}) {
  const { tiltStyle, tiltHandlers } = useCardTilt(2.6);

  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      style={tiltStyle}
      {...tiltHandlers}
      className="group isc-sheet isc-interactive-card p-5 sm:p-6 text-left hover:border-[#214D41] hover:bg-[#EAF4EE]/45 flex flex-col justify-between gap-4 isc-focus-ring"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono-data text-[11px] font-semibold uppercase tracking-wider text-[#566B64]">
            {kicker}
          </span>
          <span className="w-9 h-9 rounded-[var(--radius-md)] bg-[#D8EBDF] border border-[#9BC4AC] text-[#183A32] flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-105">
            <Icon className="w-4 h-4" aria-hidden="true" />
          </span>
        </div>

        <div className="space-y-1.5">
          <h3 className="font-editorial text-xl font-semibold text-[#183A32] group-hover:text-[#214D41] transition-colors leading-snug">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-[#355049] leading-relaxed">{description}</p>
        </div>
      </div>

      <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#214D41] pt-1">
        <span>{cta}</span>
        <ArrowRight
          className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1"
          aria-hidden="true"
        />
      </span>
    </button>
  );
}

export function MessageCheckView({
  language,
  onNavigateToGroupChat,
  onNavigateToPayment,
  onNavigateToHowItWorks,
  onNavigateToAbout,
  onOpenPostIncidentHelp,
}: MessageCheckViewProps) {
  const copy = getCopy(language);
  const [formInput, setFormInput] = useState<MessageCheckInput>(EMPTY_INPUT);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [result, setResult] = useState<UnifiedCheckResult | null>(null);
  const [reviewedSnapshot, setReviewedSnapshot] = useState<string | null>(null);
  const [expandedPillarIds, setExpandedPillarIds] = useState<PillarFinding['id'][]>([]);
  const [activeTileId, setActiveTileId] = useState<PillarFinding['id'] | null>(null);
  const [activeHeroClueId, setActiveHeroClueId] = useState<HeroClueId | null>(null);
  const [highlightedFieldId, setHighlightedFieldId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [justUpdated, setJustUpdated] = useState(false);
  const [aiStatus, setAiStatus] = useState<AiReviewUiStatus>('idle');
  const [aiResult, setAiResult] = useState<AiMessageReviewResult | null>(null);
  const [aiUnavailableReason, setAiUnavailableReason] =
    useState<AiReviewUnavailableReason | null>(null);
  const [aiValidationError, setAiValidationError] = useState<string | null>(null);
  const [shotFile, setShotFile] = useState<File | null>(null);
  const [shotStatus, setShotStatus] = useState<'idle' | 'consent' | 'reading'>('idle');
  const [shotNote, setShotNote] = useState<string | null>(null);
  const [shotError, setShotError] = useState<string | null>(null);

  const heroLines = splitHeadlineLines(copy.hero.title);

  const resetAiReviewState = () => {
    setAiStatus('idle');
    setAiResult(null);
    setAiUnavailableReason(null);
    setAiValidationError(null);
  };

  const handleFieldChange = (field: keyof MessageCheckInput, value: string) => {
    setFormInput((prev) => ({ ...prev, [field]: value }));
    setSelectedPresetId(null);
    setJustUpdated(false);
    if (validationError) setValidationError(null);
    if (field === 'messageText') {
      resetAiReviewState();
    }
  };

  const handleSelectPreset = (presetId: string) => {
    const preset = MESSAGE_DEMO_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const analysis = analyzeUnifiedCheck(preset.input);
    setFormInput(preset.input);
    setSelectedPresetId(presetId);
    setValidationError(null);
    setCopiedSummary(false);
    setJustUpdated(true);
    setResult(analysis);
    setReviewedSnapshot(serializeMessageInput(preset.input));
    setExpandedPillarIds([]);
    setActiveTileId(null);
    resetAiReviewState();
  };

  const handleClear = () => {
    setFormInput(EMPTY_INPUT);
    setSelectedPresetId(null);
    setValidationError(null);
    setCopiedSummary(false);
    setJustUpdated(false);
    setResult(null);
    setReviewedSnapshot(null);
    setExpandedPillarIds([]);
    setActiveTileId(null);
    setActiveHeroClueId(null);
    setHighlightedFieldId(null);
    resetAiReviewState();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const analysis = analyzeUnifiedCheck(formInput);
    if (analysis.overallLevel === 'insufficient_data') {
      setValidationError(copy.messageCheck.validationError);
      setJustUpdated(false);
      setResult(null);
      setReviewedSnapshot(null);
      setExpandedPillarIds([]);
      setActiveTileId(null);
      return;
    }
    const snapshot = serializeMessageInput(formInput);
    setValidationError(null);
    setCopiedSummary(false);
    setIsChecking(true);
    window.setTimeout(() => {
      setResult(analysis);
      setReviewedSnapshot(snapshot);
      setExpandedPillarIds([]);
      setActiveTileId(null);
      setIsChecking(false);
      setJustUpdated(true);
    }, 150);
  };

  const handleCopySummary = async () => {
    if (!result) return;
    const summaryText = buildFamilySummaryText(result, language);
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopiedSummary(true);
      window.setTimeout(() => setCopiedSummary(false), 3500);
    } catch {
      setCopiedSummary(true);
    }
  };

  const scrollToAiSection = () => {
    window.requestAnimationFrame(() => {
      document.getElementById('ai-review-section')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });
  };

  const ensureLocalAnalysisPresent = () => {
    const snapshot = serializeMessageInput(formInput);
    if (!result || reviewedSnapshot !== snapshot) {
      const analysis = analyzeUnifiedCheck(formInput);
      if (analysis.overallLevel !== 'insufficient_data') {
        setResult(analysis);
        setReviewedSnapshot(snapshot);
        setValidationError(null);
        setJustUpdated(true);
      }
    }
  };

  const handleRequestAiReview = () => {
    if (!formInput.messageText.trim()) {
      setAiValidationError(copy.aiReview.missingMessageError);
      scrollToAiSection();
      return;
    }
    ensureLocalAnalysisPresent();
    setAiValidationError(null);
    setAiUnavailableReason(null);
    setAiStatus('consent');
    scrollToAiSection();
  };

  const handleUseDemoOnly = () => {
    setAiStatus('idle');
    setAiValidationError(null);
    ensureLocalAnalysisPresent();
  };

  const handleContinueAiConsent = async () => {
    const rawMessage = formInput.messageText.trim();
    if (!rawMessage) {
      setAiStatus('idle');
      setAiValidationError(copy.aiReview.missingMessageError);
      return;
    }

    const sanitizedMessage = redactGroupChatText(rawMessage);
    setAiValidationError(null);
    setAiUnavailableReason(null);
    setAiStatus('loading');

    try {
      const statusRes = await fetch('/api/ai-review/status');
      if (statusRes.ok) {
        const statusJson = (await statusRes.json()) as { available?: boolean };
        if (statusJson.available === false) {
          setAiUnavailableReason('not_configured');
          setAiStatus('unavailable');
          return;
        }
      }

      const res = await fetch('/api/ai-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageText: sanitizedMessage,
          language,
          labels: {
            verdictWarningSigns: copy.aiReview.verdictWarningSigns,
            verdictNoListedSigns: copy.aiReview.verdictNoListedSigns,
            noSignsFoundNote: copy.aiReview.noSignsFoundNote,
            limitationsBody: copy.aiReview.limitationsBody,
            demoDisclaimer: copy.footer.note,
          },
        }),
      });

      const data = (await res.json()) as AiReviewApiResponse;
      if (res.ok && data.ok) {
        setAiResult(data.review);
        setAiStatus('success');
      } else if (!data.ok) {
        setAiUnavailableReason(data.reason);
        setAiStatus('unavailable');
      } else {
        setAiUnavailableReason('upstream_error');
        setAiStatus('unavailable');
      }
    } catch {
      setAiUnavailableReason('upstream_error');
      setAiStatus('unavailable');
    }
  };

  const handleShotPicked = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) {
      setShotError('Please choose a PNG, JPG or WebP image.');
      return;
    }
    setShotError(null);
    setShotNote(null);
    setShotFile(file);
    setShotStatus('consent');
  };

  const handleShotContinue = async () => {
    if (!shotFile) return;
    setShotStatus('reading');
    try {
      const imageBase64 = await fileToDownscaledJpegBase64(shotFile);
      const res = await fetch('/api/extract-screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mimeType: 'image/jpeg' }),
      });
      const data = (await res.json()) as ScreenshotApiResponse;
      if (!data.ok) throw new Error(data.message);
      const x = data.extracted;
      setFormInput((prev) => ({
        ...prev,
        messageText: x.messageText || prev.messageText,
        sebiClaim: prev.sebiClaim || x.sebiNumbers[0] || '',
        websiteLink: prev.websiteLink || x.links[0] || '',
        paymentDetail: prev.paymentDetail || x.upiIds[0] || '',
        requestedAmountInr: prev.requestedAmountInr || x.amountInr || '',
      }));
      setSelectedPresetId(null);
      resetAiReviewState();
      setShotNote('Filled from your screenshot. Check the fields, then press Review risk indicators.');
    } catch (err) {
      setShotError(err instanceof Error && err.message ? err.message : 'Could not read the screenshot.');
    } finally {
      setShotStatus('idle');
      setShotFile(null);
    }
  };

  const handlePrintSummary = () => {
    if (!result) return;
    window.print();
  };

  const isFormEmpty =
    !formInput.messageText.trim() &&
    !formInput.sebiClaim.trim() &&
    !formInput.websiteLink.trim() &&
    !formInput.paymentDetail.trim() &&
    !formInput.requestedAmountInr.trim();

  const currentSnapshot = serializeMessageInput(formInput);
  const isResultCurrent = Boolean(result && reviewedSnapshot === currentSnapshot);

  const filledCount = [
    Boolean(formInput.messageText.trim()),
    Boolean(formInput.sebiClaim.trim()),
    Boolean(formInput.websiteLink.trim()),
    Boolean(formInput.paymentDetail.trim() || formInput.requestedAmountInr.trim()),
  ].filter(Boolean).length;

  const jumpToField = (fieldId: string, clueId?: HeroClueId) => {
    if (clueId) {
      setActiveHeroClueId(clueId);
    }
    setHighlightedFieldId(fieldId);
    window.setTimeout(() => {
      setHighlightedFieldId((prev) => (prev === fieldId ? null : prev));
    }, 1500);
    const el = document.getElementById(fieldId);
    if (el) {
      el.focus({ preventScroll: true });
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSelectHeroClue = (clueId: HeroClueId) => {
    setActiveHeroClueId((prev) => (prev === clueId ? null : clueId));
    if (isResultCurrent) {
      setActiveTileId(clueId);
    }
  };

  const handleSelectTile = (pillarId: PillarFinding['id']) => {
    setActiveTileId(pillarId);
    setExpandedPillarIds((prev) => (prev.includes(pillarId) ? prev : [...prev, pillarId]));
    window.requestAnimationFrame(() => {
      const target = document.getElementById(`pillar-detail-${pillarId}`);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.focus({ preventScroll: true });
      }
    });
  };

  const handleTogglePillar = (pillarId: PillarFinding['id']) => {
    setActiveTileId(pillarId);
    setExpandedPillarIds((prev) =>
      prev.includes(pillarId) ? prev.filter((id) => id !== pillarId) : [...prev, pillarId]
    );
  };

  const printableSummary = result
    ? buildPrintableMessageSummary(result, language, aiStatus === 'success' ? aiResult : null)
    : null;

  return (
    <>
      <div className="space-y-11 sm:space-y-13 isc-no-print print:hidden">
        {/* SECTION 01: OVERSIZED EDITORIAL HERO + VERIFICATION LENS + QUICK MESSAGE ENTRY */}
        <section aria-labelledby="hero-display-heading" className="space-y-3">
          {/* Top Mode Switcher: Single Message vs Group Chat Review */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#DFDAD0]">
            <div
              role="tablist"
              aria-label={copy.nav.checkMessage}
              className="inline-flex flex-wrap items-center gap-1 p-1 rounded-[var(--radius-md)] bg-[#EAE6DC] border border-[#DFDAD0]"
            >
              <button
                type="button"
                role="tab"
                aria-selected={true}
                data-testid="switch-to-single-message-active-btn"
                className="min-h-[34px] px-3.5 py-1 rounded-[var(--radius-sm)] text-xs sm:text-sm font-semibold bg-[#214D41] text-[#FFFEFA] shadow-sm flex items-center gap-2 cursor-pointer transition-all duration-150 isc-focus-ring"
              >
                <MessageSquareText className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{copy.nav.checkMessage}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={false}
                onClick={onNavigateToGroupChat}
                data-testid="open-group-chat-review-btn"
                className="min-h-[34px] px-3.5 py-1 rounded-[var(--radius-sm)] text-xs sm:text-sm font-semibold text-[#355049] hover:text-[#183A32] hover:bg-[#FFFEFA]/70 active:translate-y-px cursor-pointer transition-all duration-150 flex items-center gap-2 isc-focus-ring"
              >
                <MessagesSquare className="w-4 h-4 text-[#214D41] shrink-0" aria-hidden="true" />
                <span>{copy.nav.reviewGroupChat}</span>
              </button>
            </div>

            <span className="text-xs text-[#566B64] hidden sm:inline">
              {copy.groupChat.entryHint}
            </span>
          </div>

          {/* Editorial Headline Band (Oversized Fraunces with Line-by-Line Reveal) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-start">
            <div className="lg:col-span-7 space-y-2.5 min-w-0">
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#214D41]">
                  {copy.hero.kicker}
                </p>

                <h1
                  id="hero-display-heading"
                  data-testid="hero-editorial-headline"
                  className="isc-editorial-display font-semibold text-[#183A32] text-balance"
                >
                  {heroLines.map((line, index) => (
                    <span key={`${language}-line-${index}`} className="block overflow-hidden">
                      <motion.span
                        className="block"
                        initial={{ opacity: 0.15, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.34,
                          delay: index * 0.08,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      >
                        {line}
                      </motion.span>
                    </span>
                  ))}
                </h1>

                <motion.p
                  initial={{ opacity: 0.2, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
                  className="text-xs sm:text-sm text-[#355049] leading-relaxed max-w-2xl"
                >
                  {copy.hero.subtitle}
                </motion.p>
              </div>

              {/* Sample Message Choices */}
              <motion.section
                aria-labelledby="demo-presets-heading"
                initial={{ opacity: 0.2, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.26, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-1.5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2
                    id="demo-presets-heading"
                    className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#566B64]"
                  >
                    {copy.messageCheck.presetsTitle}
                  </h2>
                  <span className="text-[11px] text-[#566B64] hidden sm:inline">
                    {copy.messageCheck.presetsHint}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {MESSAGE_DEMO_PRESETS.map((preset) => {
                    const isSelected = selectedPresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset.id)}
                        aria-pressed={isSelected}
                        title={preset.subtitle[language]}
                        className={`min-h-[34px] px-3 py-1 rounded-[var(--radius-md)] text-xs font-medium border isc-interactive-card isc-focus-ring text-left max-w-full ${
                          isSelected
                            ? 'bg-[#214D41] text-[#FFFEFA] border-[#214D41] shadow-sm'
                            : 'bg-[#FFFEFA] border-[#C9C2B4] text-[#183A32] hover:bg-[#EAF4EE] hover:border-[#214D41]'
                        }`}
                      >
                        {preset.title[language]}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={handleClear}
                    disabled={isFormEmpty && !result}
                    className="isc-btn-secondary !min-h-[34px] !px-2.5 !text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{copy.messageCheck.clearBtn}</span>
                  </button>
                </div>
              </motion.section>

              {/* Message Check Entry Form (Visibly Optional Fields Included) */}
              <motion.section
                aria-labelledby="message-form-heading"
                initial={{ opacity: 0.2, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="isc-sheet p-3.5 sm:p-4"
              >
                <div className="mb-2 pb-1.5 border-b border-[#DFDAD0] flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <h2
                      id="message-form-heading"
                      className="font-editorial text-base sm:text-lg font-semibold text-[#183A32]"
                    >
                      {copy.messageCheck.formTitle}
                    </h2>
                    <p className="text-xs text-[#355049]">
                      {copy.messageCheck.formSubtitle}
                    </p>
                  </div>
                  <span className="text-xs font-semibold font-mono-data text-[#214D41] whitespace-nowrap shrink-0">
                    {copy.messageCheck.cluesCount(filledCount)}
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-2" noValidate>
                  <div>
                    <label
                      htmlFor="msg-pitch"
                      className="block text-xs font-semibold text-[#183A32] mb-1"
                    >
                      {copy.messageCheck.fields.messageLabel}
                    </label>
                    <textarea
                      id="msg-pitch"
                      rows={2}
                      value={formInput.messageText}
                      onChange={(e) => handleFieldChange('messageText', e.target.value)}
                      placeholder={copy.messageCheck.fields.messagePlaceholder}
                      className={`isc-field px-3 py-1.5 text-[13px] leading-snug ${
                        highlightedFieldId === 'msg-pitch'
                          ? 'ring-2 ring-[#214D41]/40 bg-[#EAF4EE]/40 border-[#214D41]'
                          : ''
                      }`}
                    />
                    <div className="mt-1.5 space-y-1.5">
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[#CFC9BB] bg-white px-2.5 py-1 text-xs font-semibold text-[#183A32] hover:bg-[#F4F2EB]">
                        <Camera className="w-3.5 h-3.5" aria-hidden="true" />
                        Read a screenshot instead
                        <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={handleShotPicked} />
                      </label>
                      {shotStatus === 'consent' && (
                        <div role="alert" className="rounded-md border border-[#DBA14B] bg-[#FFF8EA] p-2.5 text-xs text-[#183A32]">
                          <p>
                            This sends your screenshot to Google Gemini to read the text. Nothing is stored here. Names,
                            phone numbers or account numbers visible in the image cannot be hidden first, so crop them out if you can.
                          </p>
                          <div className="mt-2 flex gap-2">
                            <button type="button" onClick={handleShotContinue} className="rounded-md bg-[#214D41] px-2.5 py-1 font-semibold text-white">Continue</button>
                            <button type="button" onClick={() => { setShotStatus('idle'); setShotFile(null); }} className="rounded-md border border-[#CFC9BB] px-2.5 py-1 font-semibold">Cancel</button>
                          </div>
                        </div>
                      )}
                      {shotStatus === 'reading' && (
                        <p role="status" className="flex items-center gap-1.5 text-xs text-[#566B64]">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> Reading screenshot…
                        </p>
                      )}
                      {shotNote && <p role="status" className="text-xs text-[#214D41]">{shotNote}</p>}
                      {shotError && <p role="alert" className="text-xs text-[#9B2C2C]">{shotError}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-end">
                    <div>
                      <label
                        htmlFor="msg-sebi"
                        className="block text-xs font-semibold text-[#183A32] mb-1"
                      >
                        {copy.messageCheck.fields.sebiLabel}
                      </label>
                      <input
                        id="msg-sebi"
                        type="text"
                        value={formInput.sebiClaim}
                        onChange={(e) => handleFieldChange('sebiClaim', e.target.value)}
                        placeholder={copy.messageCheck.fields.sebiPlaceholder}
                        className={`isc-field px-3 py-1.5 text-sm font-mono-data placeholder:font-sans ${
                          highlightedFieldId === 'msg-sebi'
                            ? 'ring-2 ring-[#214D41]/40 bg-[#EAF4EE]/40 border-[#214D41]'
                            : ''
                        }`}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="msg-link"
                        className="block text-xs font-semibold text-[#183A32] mb-1"
                      >
                        {copy.messageCheck.fields.linkLabel}
                      </label>
                      <div className="relative">
                        <Link2
                          className="w-4 h-4 text-[#566B64] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                          aria-hidden="true"
                        />
                        <input
                          id="msg-link"
                          type="url"
                          value={formInput.websiteLink}
                          onChange={(e) => handleFieldChange('websiteLink', e.target.value)}
                          placeholder={copy.messageCheck.fields.linkPlaceholder}
                          className={`isc-field pl-9 pr-3 py-1.5 text-sm ${
                            highlightedFieldId === 'msg-link'
                              ? 'ring-2 ring-[#214D41]/40 bg-[#EAF4EE]/40 border-[#214D41]'
                              : ''
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#566B64] -mt-1 leading-snug">
                    {copy.messageCheck.fields.sebiHelper}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end">
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="msg-payment"
                        className="block text-xs font-semibold text-[#183A32] mb-1"
                      >
                        {copy.messageCheck.fields.paymentLabel}
                      </label>
                      <input
                        id="msg-payment"
                        type="text"
                        value={formInput.paymentDetail}
                        onChange={(e) => handleFieldChange('paymentDetail', e.target.value)}
                        placeholder={copy.messageCheck.fields.paymentPlaceholder}
                        className={`isc-field px-3 py-1.5 text-sm font-mono-data placeholder:font-sans ${
                          highlightedFieldId === 'msg-payment'
                            ? 'ring-2 ring-[#214D41]/40 bg-[#EAF4EE]/40 border-[#214D41]'
                            : ''
                        }`}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="msg-amount"
                        className="block text-xs font-semibold text-[#183A32] mb-1"
                      >
                        {copy.messageCheck.fields.amountLabel}
                      </label>
                      <div className="relative">
                        <IndianRupee
                          className="w-4 h-4 text-[#566B64] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                          aria-hidden="true"
                        />
                        <input
                          id="msg-amount"
                          type="text"
                          inputMode="numeric"
                          value={formInput.requestedAmountInr}
                          onChange={(e) => handleFieldChange('requestedAmountInr', e.target.value)}
                          placeholder={copy.messageCheck.fields.amountPlaceholder}
                          className="isc-field pl-8 pr-3 py-1.5 text-sm font-mono-data placeholder:font-sans"
                        />
                      </div>
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
                      className="p-3 rounded-[var(--radius-md)] border text-sm font-medium"
                    >
                      {validationError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
                    <button
                      type="submit"
                      disabled={isChecking}
                      data-testid="check-message-btn"
                      className="w-full isc-btn-primary !min-h-[42px]"
                    >
                      {isChecking ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                          <span>{copy.messageCheck.checkingBtn}</span>
                        </>
                      ) : (
                        <>
                          <span>{copy.messageCheck.submitBtn}</span>
                          <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleRequestAiReview}
                      data-testid="form-ai-review-btn"
                      className="w-full isc-btn-secondary !min-h-[42px] !text-sm !border-[#9BC4AC] hover:!bg-[#D8EBDF]/55"
                    >
                      <Sparkles className="w-4 h-4 text-[#214D41] shrink-0" aria-hidden="true" />
                      <span className="truncate">{copy.aiReview.triggerBtn}</span>
                    </button>
                  </div>
                </form>
              </motion.section>
            </div>

            {/* RIGHT COLUMN (5/12): Central 3D Verification Lens + Calm Post-Incident Help */}
            <motion.div
              initial={{ opacity: 0.2, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 space-y-5 min-w-0"
            >
              <PauseVerifyToken3D
                language={language}
                formInput={formInput}
                result={result}
                isResultCurrent={isResultCurrent}
                activeClueId={activeHeroClueId}
                onSelectClue={handleSelectHeroClue}
                onFocusClue={jumpToField}
              />

              {/* Immediate Calm Help Entry When User Already Acted */}
              <section
                aria-label={copy.postIncidentHelp.triggerBtn}
                className="isc-sheet p-5 bg-[#FFFEFA] space-y-3"
              >
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-[var(--radius-md)] bg-[#D8EBDF] border border-[#9BC4AC] text-[#183A32] flex items-center justify-center shrink-0 mt-0.5">
                    <LifeBuoy className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <div className="space-y-1 min-w-0">
                    <h2 className="text-sm font-semibold text-[#183A32]">
                      {copy.postIncidentHelp.triggerBtn}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#355049] leading-relaxed">
                      {copy.postIncidentHelp.triggerHint}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenPostIncidentHelp}
                  data-testid="hero-open-post-incident-help-btn"
                  className="isc-btn-secondary w-full !border-[#9BC4AC] hover:!bg-[#D8EBDF]/50"
                >
                  <LifeBuoy className="w-4 h-4 text-[#214D41] shrink-0" aria-hidden="true" />
                  <span>{copy.postIncidentHelp.triggerBtn}</span>
                </button>
              </section>
            </motion.div>
          </div>
        </section>

        {/* SECTION 02: SEQUENTIAL RESULT CHOREOGRAPHY (VERDICT FIRST -> 4 CLUES -> EVIDENCE & NEXT STEPS) */}
        <section
          id="message-result-section"
          aria-labelledby="message-result-heading"
          aria-live="polite"
          className="isc-section-rule space-y-6"
        >
          {!result ? (
            <div className="isc-sheet p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-11 h-11 rounded-[var(--radius-md)] bg-[#D8EBDF] border border-[#9BC4AC] text-[#183A32] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h2
                  id="message-result-heading"
                  className="font-editorial text-xl font-semibold text-[#183A32]"
                >
                  {copy.messageCheck.emptyTitle}
                </h2>
                <p className="text-sm text-[#355049] leading-relaxed max-w-2xl">
                  {copy.messageCheck.emptyBody}
                </p>
              </div>
            </div>
          ) : (
            (() => {
              const banner = getBannerStyles(result.overallLevel, language);
              const BannerIcon = banner.Icon;
              return (
                <>
                  {/* Step 1: Calm, Stable Verdict First (Zero Flashing, Shaking, or Urgency Animation) */}
                  <motion.div
                    key={reviewedSnapshot ?? 'verdict'}
                    initial={{ opacity: 0.25, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                    style={banner.containerStyle}
                    className="rounded-[var(--radius-lg)] border p-6 sm:p-7 shadow-[var(--shadow-card)] space-y-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-2.5 max-w-3xl">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span
                            style={banner.tagStyle}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-sm)] border text-xs font-semibold"
                          >
                            <BannerIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            <span>{banner.verdictTag}</span>
                          </span>

                          {result.overallLevel === 'cant_verify' && (
                            <span
                              data-testid="message-not-verified-badge"
                              style={{
                                backgroundColor: 'var(--status-neutral-bg)',
                                borderColor: 'var(--status-neutral-border)',
                                color: 'var(--status-neutral-text)',
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-sm)] border text-xs font-semibold"
                            >
                              <HelpCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                              <span>{copy.statusTags.notVerifiedBadge}</span>
                            </span>
                          )}

                          <span
                            data-testid="local-rules-badge"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] bg-[#EBF5EF] border border-[#9BC4AC] text-xs font-semibold text-[#214D41]"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            <span>{copy.aiReview.localOnlyBadge}</span>
                          </span>

                          {justUpdated && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#214D41]">
                              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>{copy.messageCheck.updatedBadge}</span>
                            </span>
                          )}
                        </div>

                        <h2
                          id="message-result-heading"
                          className="font-editorial text-2xl sm:text-[1.9rem] font-semibold leading-snug text-[#183A32]"
                        >
                          {result.overallTitle[language]}
                        </h2>
                        <p className="text-sm sm:text-base text-[#355049] leading-relaxed">
                          {result.overallSummary[language]}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={handleCopySummary}
                          className="isc-btn-secondary !min-h-[38px]"
                        >
                          {copiedSummary ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#214D41]" aria-hidden="true" />
                              <span>{copy.messageCheck.shareCopied}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-[#214D41]" aria-hidden="true" />
                              <span>{copy.messageCheck.shareBtn}</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={handlePrintSummary}
                          data-testid="message-print-summary-btn"
                          className="isc-btn-secondary !min-h-[38px]"
                        >
                          <Printer className="w-3.5 h-3.5 text-[#214D41]" aria-hidden="true" />
                          <span>{copy.printSummary.printBtn}</span>
                        </button>
                      </div>
                    </div>

                    {/* Immediate Connection / Plain-Language Takeaway */}
                    <div className="p-4 rounded-[var(--radius-md)] bg-[#EBF5EF] border border-[#9BC4AC] space-y-1">
                      <div className="text-xs font-semibold uppercase tracking-wider text-[#214D41]">
                        {copy.messageCheck.connectionHeading}
                      </div>
                      <p className="text-xs sm:text-sm text-[#183A32] leading-relaxed">
                        {result.connectionInsight[language]}
                      </p>
                    </div>
                  </motion.div>

                  {/* Step 2: Four Clues Reveal (Graph + Clickable Tiles) */}
                  <ScrollReveal delay={0.05} className="space-y-4">
                    <FourClueGraph
                      language={language}
                      formInput={formInput}
                      pillars={result.pillars}
                      isResultCurrent={isResultCurrent}
                      staggerKey={reviewedSnapshot}
                      onFocusField={jumpToField}
                    />

                    <div className="isc-sheet p-5 sm:p-6">
                      <ConnectedResultTiles
                        language={language}
                        pillars={result.pillars}
                        selectedPillarId={activeTileId}
                        expandedPillarIds={expandedPillarIds}
                        staggerKey={reviewedSnapshot}
                        onSelectPillar={handleSelectTile}
                      />
                    </div>
                  </ScrollReveal>

                  {/* Step 3: Detailed Evidence Phrases & Smooth Accordion Explanations */}
                  <ScrollReveal delay={0.08}>
                    <section
                      aria-labelledby="pillars-breakdown-heading"
                      className="isc-sheet p-5 sm:p-6 space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#DFDAD0]">
                        <h3
                          id="pillars-breakdown-heading"
                          className="font-editorial text-xl font-semibold text-[#183A32]"
                        >
                          {copy.messageCheck.pillarsHeading}
                        </h3>
                        <p className="text-xs text-[#566B64]">
                          {copy.messageCheck.tileInspectHint}
                        </p>
                      </div>

                      <div className="space-y-3">
                        {result.pillars.map((pillar) => {
                          const PillarIcon = PILLAR_ICONS[pillar.id];
                          const isExpanded = expandedPillarIds.includes(pillar.id);
                          const isConnectedTarget = activeTileId === pillar.id;
                          const basisLabel = getCheckBasisLabel(pillar.checkBasis, copy);
                          return (
                            <div
                              key={pillar.id}
                              id={`pillar-detail-${pillar.id}`}
                              data-connected-target={String(isConnectedTarget)}
                              tabIndex={-1}
                              className={`rounded-[var(--radius-md)] border transition-all duration-200 isc-focus-ring overflow-hidden ${
                                isConnectedTarget
                                  ? 'bg-[#EAF4EE]/75 border-[#214D41] ring-2 ring-[#214D41]/25 shadow-[0_10px_24px_rgba(24,58,50,0.09)]'
                                  : isExpanded
                                    ? 'bg-[#EAF4EE]/55 border-[#214D41] shadow-[0_6px_18px_rgba(24,58,50,0.06)]'
                                    : 'bg-[#FFFEFA] border-[#DFDAD0] hover:border-[#214D41] hover:shadow-[0_6px_16px_rgba(24,58,50,0.06)]'
                              }`}
                            >
                              <button
                                type="button"
                                aria-expanded={isExpanded}
                                aria-controls={`pillar-panel-${pillar.id}`}
                                onClick={() => handleTogglePillar(pillar.id)}
                                className="w-full p-4 sm:p-5 text-left flex flex-col gap-2.5 cursor-pointer isc-focus-ring active:bg-[#EAF4EE]/60 transition-colors"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2 w-full">
                                  <div className="flex items-center gap-2.5 text-sm sm:text-base font-semibold text-[#183A32]">
                                    <PillarIcon
                                      className="w-4 h-4 text-[#214D41] shrink-0"
                                      aria-hidden="true"
                                    />
                                    <span>{copy.messageCheck.pillarTitles[pillar.id]}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <StatusIndicator
                                      status={pillar.status}
                                      label={pillar.statusLabel[language]}
                                    />
                                    <ChevronDown
                                      className={`w-4 h-4 text-[#566B64] transition-transform duration-200 ease-out ${
                                        isExpanded ? 'rotate-180 text-[#214D41]' : ''
                                      }`}
                                      aria-hidden="true"
                                    />
                                  </div>
                                </div>

                                {basisLabel && (
                                  <p className="text-xs font-medium text-[#566B64]">
                                    {basisLabel}
                                  </p>
                                )}

                                <p className="text-xs sm:text-sm text-[#355049] leading-relaxed">
                                  {pillar.headline[language]}
                                </p>

                                {pillar.warnings &&
                                pillar.warnings.length > 0 &&
                                (pillar.status === 'high_risk' || pillar.status === 'caution') ? (
                                  <div data-warnings-for={pillar.id} className="space-y-2 pt-1">
                                    <div className="text-xs font-semibold text-[#566B64]">
                                      {copy.messageCheck.evidenceLabel}
                                    </div>
                                    <div
                                      className={`grid grid-cols-1 ${
                                        pillar.warnings.length > 1 ? 'md:grid-cols-2' : ''
                                      } gap-2.5`}
                                    >
                                      {pillar.warnings.map((warning) => (
                                        <div
                                          key={warning.id}
                                          className="p-3 rounded-[var(--radius-sm)] bg-[#F7F5EE] border border-[#DFDAD0] space-y-1.5"
                                        >
                                          <span className="inline-block text-xs font-mono-data text-[#183A32] bg-[#FFFEFA] border border-[#C9C2B4] px-2 py-0.5 rounded-[var(--radius-sm)] break-words">
                                            &ldquo;{warning.phrase}&rdquo;
                                          </span>
                                          <p className="text-xs text-[#355049] leading-relaxed">
                                            {warning.explanation[language]}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  pillar.evidencePhrases &&
                                  pillar.evidencePhrases.length > 0 &&
                                  (pillar.status === 'high_risk' || pillar.status === 'caution') && (
                                    <div
                                      data-evidence-for={pillar.id}
                                      className="flex flex-wrap items-center gap-1.5 pt-0.5"
                                    >
                                      <span className="text-xs font-medium text-[#566B64]">
                                        {copy.messageCheck.evidenceLabel}
                                      </span>
                                      {pillar.evidencePhrases.map((phrase) => (
                                        <span
                                          key={phrase}
                                          className="text-xs font-mono-data text-[#183A32] bg-[#F7F5EE] border border-[#C9C2B4] px-2 py-0.5 rounded-[var(--radius-sm)] break-words"
                                        >
                                          &ldquo;{phrase}&rdquo;
                                        </span>
                                      ))}
                                    </div>
                                  )
                                )}
                              </button>

                              <motion.div
                                id={`pillar-panel-${pillar.id}`}
                                data-open={String(isExpanded)}
                                aria-hidden={!isExpanded}
                                initial={false}
                                animate={
                                  isExpanded
                                    ? { height: 'auto', opacity: 1 }
                                    : { height: 0, opacity: 0 }
                                }
                                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                                style={{ overflow: 'hidden', visibility: isExpanded ? 'visible' : 'hidden' }}
                              >
                                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3 border-t border-[#DFDAD0] bg-[#FFFEFA] space-y-2.5">
                                  {pillar.extractedDetail && (
                                    <div>
                                      <span className="text-xs font-mono-data text-[#183A32] bg-[#F7F5EE] border border-[#DFDAD0] px-2.5 py-1 rounded-[var(--radius-sm)] inline-block break-all">
                                        {pillar.extractedDetail}
                                      </span>
                                    </div>
                                  )}

                                  {pillar.evidencePhrases &&
                                    pillar.evidencePhrases.length > 0 &&
                                    pillar.status !== 'high_risk' &&
                                    pillar.status !== 'caution' && (
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="text-xs font-medium text-[#566B64]">
                                          {copy.messageCheck.evidenceLabel}
                                        </span>
                                        {pillar.evidencePhrases.map((phrase) => (
                                          <span
                                            key={phrase}
                                            className="text-xs font-mono-data text-[#183A32] bg-[#F7F5EE] border border-[#C9C2B4] px-2 py-0.5 rounded-[var(--radius-sm)] break-words"
                                          >
                                            &ldquo;{phrase}&rdquo;
                                          </span>
                                        ))}
                                      </div>
                                    )}

                                  <p className="text-xs sm:text-sm text-[#355049] leading-relaxed max-w-4xl">
                                    {pillar.explanation[language]}
                                  </p>

                                  {pillar.isDemoOnlyNote && (
                                    <p className="text-xs text-[#566B64] leading-relaxed">
                                      {pillar.isDemoOnlyNote[language]}
                                    </p>
                                  )}
                                </div>
                              </motion.div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  </ScrollReveal>

                  {/* Practical Next Steps */}
                  <ScrollReveal delay={0.1}>
                    <section
                      aria-labelledby="next-steps-heading"
                      className="isc-sheet p-5 sm:p-6 space-y-4"
                    >
                      <h3
                        id="next-steps-heading"
                        className="font-editorial text-xl font-semibold text-[#183A32]"
                      >
                        {copy.messageCheck.nextStepsHeading}
                      </h3>
                      <ol className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {result.nextSteps.map((step, index) => (
                          <li
                            key={index}
                            className="p-3.5 rounded-[var(--radius-md)] bg-[#F7F5EE] border border-[#DFDAD0] flex items-start gap-3 text-xs sm:text-sm text-[#183A32]"
                          >
                            <span className="font-mono-data text-xs font-semibold text-[#214D41] pt-0.5 shrink-0">
                              0{index + 1}
                            </span>
                            <span className="leading-relaxed">{step[language]}</span>
                          </li>
                        ))}
                      </ol>

                      <p className="text-xs text-[#566B64] pt-3 border-t border-[#DFDAD0] leading-relaxed">
                        {result.demoLimitNote[language]}
                      </p>
                    </section>
                  </ScrollReveal>

                  {/* Guided Post-Incident Help Trigger near results & next steps */}
                  <ScrollReveal>
                    <section
                      aria-label={copy.postIncidentHelp.triggerBtn}
                      className="isc-mint-surface p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="w-10 h-10 rounded-[var(--radius-md)] bg-[#FFFEFA] border border-[#9BC4AC] text-[#214D41] flex items-center justify-center shrink-0 mt-0.5">
                          <LifeBuoy className="w-5 h-5" aria-hidden="true" />
                        </span>
                        <div className="space-y-1 min-w-0">
                          <h3 className="font-editorial text-lg font-semibold text-[#183A32]">
                            {copy.postIncidentHelp.triggerBtn}
                          </h3>
                          <p className="text-xs sm:text-sm text-[#355049] leading-relaxed">
                            {copy.postIncidentHelp.triggerHint}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={onOpenPostIncidentHelp}
                        data-testid="open-post-incident-help-btn"
                        className="isc-btn-primary shrink-0"
                      >
                        <LifeBuoy className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>{copy.postIncidentHelp.triggerBtn}</span>
                      </button>
                    </section>
                  </ScrollReveal>

                  {/* Optional AI Plain-Language Review */}
                  <ScrollReveal>
                    <AiReviewCard
                      id="ai-review-section"
                      language={language}
                      status={aiStatus}
                      result={aiResult}
                      unavailableReason={aiUnavailableReason}
                      validationError={aiValidationError}
                      onRequestReview={handleRequestAiReview}
                      onContinueConsent={handleContinueAiConsent}
                      onUseDemoOnly={handleUseDemoOnly}
                    />
                  </ScrollReveal>
                </>
              );
            })()
          )}
        </section>

        {!result && (aiStatus !== 'idle' || aiValidationError) && (
          <AiReviewCard
            id="ai-review-section"
            language={language}
            status={aiStatus}
            result={aiResult}
            unavailableReason={aiUnavailableReason}
            validationError={aiValidationError}
            onRequestReview={handleRequestAiReview}
            onContinueConsent={handleContinueAiConsent}
            onUseDemoOnly={handleUseDemoOnly}
          />
        )}

        {!result && (
          <section
            aria-label={copy.postIncidentHelp.triggerBtn}
            className="isc-mint-surface p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div className="flex items-start gap-3 min-w-0">
              <span className="w-10 h-10 rounded-[var(--radius-md)] bg-[#FFFEFA] border border-[#9BC4AC] text-[#214D41] flex items-center justify-center shrink-0 mt-0.5">
                <LifeBuoy className="w-5 h-5" aria-hidden="true" />
              </span>
              <div className="space-y-1 min-w-0">
                <h3 className="font-editorial text-lg font-semibold text-[#183A32]">
                  {copy.postIncidentHelp.triggerBtn}
                </h3>
                <p className="text-xs sm:text-sm text-[#355049] leading-relaxed">
                  {copy.postIncidentHelp.triggerHint}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenPostIncidentHelp}
              data-testid="open-post-incident-help-btn"
              className="isc-btn-primary shrink-0"
            >
              <LifeBuoy className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{copy.postIncidentHelp.triggerBtn}</span>
            </button>
          </section>
        )}

        {/* SECTION 03: GROUP-CHAT REVIEW & PAYMENT CHECK EDITORIAL BAND */}
        <ScrollReveal>
          <section
            aria-labelledby="editorial-specialized-checks-heading"
            className="isc-section-rule space-y-5"
          >
            <div className="max-w-2xl space-y-1.5">
              <p className="font-mono-data text-[11px] font-semibold uppercase tracking-[0.14em] text-[#214D41]">
                {copy.nav.reviewGroupChat} · {copy.nav.checkPayment}
              </p>
              <h2
                id="editorial-specialized-checks-heading"
                className="font-editorial text-2xl sm:text-[1.85rem] font-semibold text-[#183A32] leading-snug"
              >
                {copy.messageCheck.resultTitle}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <EditorialActionCard
                kicker={copy.groupChat.kicker}
                title={copy.nav.reviewGroupChat}
                description={copy.groupChat.subtitle}
                cta={copy.nav.reviewGroupChat}
                Icon={MessagesSquare}
                onClick={onNavigateToGroupChat}
                testId="editorial-group-chat-card"
              />
              <EditorialActionCard
                kicker={copy.paymentCheck.kicker}
                title={copy.nav.checkPayment}
                description={copy.paymentCheck.subtitle}
                cta={copy.nav.checkPayment}
                Icon={Wallet}
                onClick={onNavigateToPayment}
                testId="editorial-payment-check-card"
              />
            </div>
          </section>
        </ScrollReveal>

        {/* SECTION 04: HOW THE CHECK WORKS OVERVIEW */}
        <ScrollReveal>
          <section
            aria-labelledby="editorial-how-it-works-heading"
            className="isc-section-rule space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="max-w-2xl space-y-1.5">
                <p className="font-mono-data text-[11px] font-semibold uppercase tracking-[0.14em] text-[#214D41]">
                  {copy.howItWorks.kicker}
                </p>
                <h2
                  id="editorial-how-it-works-heading"
                  className="font-editorial text-2xl sm:text-[1.85rem] font-semibold text-[#183A32] leading-snug"
                >
                  {copy.howItWorks.title}
                </h2>
                <p className="text-sm text-[#355049] leading-relaxed">
                  {copy.howItWorks.subtitle}
                </p>
              </div>
              {onNavigateToHowItWorks && (
                <button
                  type="button"
                  onClick={onNavigateToHowItWorks}
                  className="isc-btn-secondary shrink-0"
                >
                  <BookOpen className="w-4 h-4 text-[#214D41]" aria-hidden="true" />
                  <span>{copy.nav.howItWorks}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {copy.howItWorks.steps.map((step) => (
                <div
                  key={step.num}
                  className="isc-sheet p-4 sm:p-5 space-y-2 bg-[#FFFEFA]"
                >
                  <span className="font-mono-data text-xs font-semibold text-[#214D41]">
                    {step.num}
                  </span>
                  <h3 className="font-editorial text-base font-semibold text-[#183A32]">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#355049] leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* SECTION 05: OFFICIAL SOURCES & ABOUT */}
        <ScrollReveal>
          <div className="isc-section-rule space-y-6">
            <OfficialSourcesCard language={language} />

            {onNavigateToAbout && (
              <div className="isc-paper-inset p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3 max-w-2xl">
                  <span className="w-9 h-9 rounded-[var(--radius-md)] bg-[#FFFEFA] border border-[#DFDAD0] text-[#214D41] flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <div className="space-y-1">
                    <h3 className="font-editorial text-lg font-semibold text-[#183A32]">
                      {copy.about.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#355049] leading-relaxed">
                      {copy.about.intro}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onNavigateToAbout}
                  className="isc-btn-secondary shrink-0"
                >
                  <span>{copy.nav.about}</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>

      {printableSummary && (
        <PrintableFamilySummary summary={printableSummary} language={language} />
      )}
    </>
  );
}
