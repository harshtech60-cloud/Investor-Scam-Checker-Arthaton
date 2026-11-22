import { useState, type ChangeEvent, type FormEvent } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CheckSquare,
  ExternalLink,
  HelpCircle,
  IndianRupee,
  LifeBuoy,
  Loader2,
  MessageSquareText,
  Printer,
  QrCode,
  RotateCcw,
  Square,
  Wallet,
} from 'lucide-react';
import type {
  Language,
  PaymentCheckInput,
  PaymentCheckResult,
  PaymentMethod,
  PaymentSource,
  RecipientMatch,
} from '../types/check';
import { PAYMENT_DEMO_PRESETS } from '../data/presets';
import { getCopy } from '../data/translations';
import { analyzePaymentCheck, getCheckBasisLabel } from '../utils/analyzer';
import { decodeQrFromFile } from '../utils/imageUtils';
import { buildPrintablePaymentSummary } from '../utils/printSummary';
import { parseUpiUri } from '../utils/upiQr';
import { OFFICIAL_PORTAL_LINKS, OfficialSourcesCard } from './OfficialSourcesCard';
import { PrintableFamilySummary } from './PrintableFamilySummary';
import { ScrollReveal } from './ScrollReveal';
import { RiskBreakdownStrip, StatusIndicator, getBannerStyles } from './StatusIndicator';

interface PaymentCheckViewProps {
  language: Language;
  onNavigateToMessage: () => void;
  onOpenPostIncidentHelp: () => void;
}

const EMPTY_PAYMENT: PaymentCheckInput = {
  method: 'upi',
  handleOrAccount: '',
  ifscCode: '',
  amountInr: '',
  claimedEntity: '',
  recipientMatch: 'unsure',
  source: 'other',
};

function PaymentMethodIcon({ method, active }: { method: PaymentMethod; active: boolean }) {
  const strokePrimary = active ? '#214D41' : '#566B64';
  const strokeAccent = active ? '#DBA14B' : '#7A807C';

  if (method === 'upi') {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect
          x="6.5"
          y="2.5"
          width="11"
          height="19"
          rx="2"
          stroke={strokePrimary}
          strokeWidth="1.6"
        />
        <path
          d="M11.75 7.5L9.75 11.5H12.5L11.25 15.5L14.75 10.75H12L13.25 7.5H11.75Z"
          fill={strokeAccent}
        />
      </svg>
    );
  }

  if (method === 'bank_transfer') {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          d="M3.5 9L12 4L20.5 9H3.5Z"
          stroke={strokePrimary}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M6.5 11.5V17.5" stroke={strokePrimary} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M12 11.5V17.5" stroke={strokeAccent} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M17.5 11.5V17.5" stroke={strokePrimary} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M3.5 20H20.5" stroke={strokePrimary} strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1" stroke={strokePrimary} strokeWidth="1.6" />
      <rect x="14" y="3.5" width="6.5" height="6.5" rx="1" stroke={strokePrimary} strokeWidth="1.6" />
      <rect x="3.5" y="14" width="6.5" height="6.5" rx="1" stroke={strokeAccent} strokeWidth="1.6" />
      <rect x="6" y="6" width="1.5" height="1.5" fill={strokeAccent} />
      <rect x="16.5" y="6" width="1.5" height="1.5" fill={strokeAccent} />
      <rect x="6" y="16.5" width="1.5" height="1.5" fill={strokePrimary} />
      <path d="M14 14.5H17V17H20.5" stroke={strokeAccent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 20H20" stroke={strokePrimary} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function PaymentCheckView({
  language,
  onNavigateToMessage,
  onOpenPostIncidentHelp,
}: PaymentCheckViewProps) {
  const copy = getCopy(language);
  const [formInput, setFormInput] = useState<PaymentCheckInput>(EMPTY_PAYMENT);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [result, setResult] = useState<PaymentCheckResult | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [justUpdated, setJustUpdated] = useState(false);
  const [qrNote, setQrNote] = useState<string | null>(null);

  const handleFieldChange = <K extends keyof PaymentCheckInput>(
    field: K,
    value: PaymentCheckInput[K]
  ) => {
    setFormInput((prev) => ({ ...prev, [field]: value }));
    setSelectedPresetId(null);
    setJustUpdated(false);
    if (validationError) setValidationError(null);
  };

  const handleQrPicked = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const raw = await decodeQrFromFile(file);
      const upi = raw ? parseUpiUri(raw) : null;
      if (!upi) {
        setQrNote(
          raw
            ? 'This QR is not a UPI payment code. Do not scan or pay through it until you verify who sent it.'
            : 'No QR code found in this image. Try a sharper, closer crop.'
        );
        return;
      }
      setFormInput((prev) => ({
        ...prev,
        method: 'qr_or_link',
        handleOrAccount: upi.pa,
        amountInr: upi.am ?? prev.amountInr,
        claimedEntity: upi.pn ?? prev.claimedEntity,
      }));
      setSelectedPresetId(null);
      setJustUpdated(false);
      setQrNote(`QR decoded on this device: it pays ${upi.pa}${upi.pn ? ` (name inside the QR: ${upi.pn})` : ''}. Nothing was uploaded.`);
    } catch {
      setQrNote('Could not read this image.');
    }
  };

  const handleSelectPreset = (presetId: string) => {
    const preset = PAYMENT_DEMO_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setFormInput(preset.input);
    setSelectedPresetId(presetId);
    setCheckedItems({});
    setValidationError(null);
    setJustUpdated(true);
    setResult(analyzePaymentCheck(preset.input));
  };

  const handleClear = () => {
    setFormInput(EMPTY_PAYMENT);
    setSelectedPresetId(null);
    setCheckedItems({});
    setValidationError(null);
    setJustUpdated(false);
    setResult(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const analysis = analyzePaymentCheck(formInput);
    if (analysis.overallLevel === 'insufficient_data') {
      setValidationError(copy.paymentCheck.validationError);
      setJustUpdated(false);
      setResult(null);
      return;
    }
    setValidationError(null);
    setCheckedItems({});
    setIsChecking(true);
    window.setTimeout(() => {
      setResult(analysis);
      setIsChecking(false);
      setJustUpdated(true);
    }, 150);
  };

  const toggleChecklist = (index: number) => {
    setCheckedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handlePlaceholder =
    formInput.method === 'upi'
      ? copy.paymentCheck.fields.handlePlaceholderUpi
      : formInput.method === 'bank_transfer'
      ? copy.paymentCheck.fields.handlePlaceholderBank
      : copy.paymentCheck.fields.handlePlaceholderQr;

  const statusLabels = {
    high_risk: copy.statusTags.highRiskBadge,
    caution: copy.statusTags.cautionBadge,
    cant_verify: copy.statusTags.cantVerifyBadge,
    not_provided: copy.statusTags.notProvidedBadge,
  } as const;

  const isFormEmpty =
    !formInput.handleOrAccount.trim() &&
    !formInput.amountInr.trim() &&
    !formInput.claimedEntity.trim();

  const printableSummary = result ? buildPrintablePaymentSummary(result, language) : null;

  return (
    <>
      <div className="space-y-8 isc-no-print print:hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* LEFT COLUMN (7/12): Title, Presets & Short Organized Payment Form */}
          <div className="lg:col-span-7 space-y-5 min-w-0">
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-3"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-[#214D41]">
                {copy.paymentCheck.kicker}
              </p>
              <h1 className="font-editorial text-3xl sm:text-[2.3rem] font-semibold tracking-tight text-[#183A32] text-balance leading-[1.14]">
                {copy.paymentCheck.title}
              </h1>
              <p className="text-sm sm:text-base text-[#355049] leading-relaxed max-w-2xl">
                {copy.paymentCheck.subtitle}
              </p>
            </motion.section>

            <motion.section
              aria-labelledby="payment-presets-heading"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-2"
            >
              <h2
                id="payment-presets-heading"
                className="text-xs font-semibold uppercase tracking-wider text-[#566B64]"
              >
                {copy.paymentCheck.presetsTitle}
              </h2>

              <div className="flex flex-wrap items-center gap-2">
                {PAYMENT_DEMO_PRESETS.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.id)}
                      aria-pressed={isSelected}
                      title={preset.subtitle[language]}
                      className={`min-h-[38px] px-3.5 py-1.5 rounded-[var(--radius-md)] text-xs sm:text-sm font-medium border isc-interactive-card isc-focus-ring text-left max-w-full ${
                        isSelected
                          ? 'bg-[#214D41] text-[#FFFEFA] border-[#214D41]'
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
                  className="isc-btn-secondary !min-h-[38px] !px-3.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{copy.paymentCheck.clearBtn}</span>
                </button>
              </div>
            </motion.section>

            {/* Payment Form Sheet */}
            <motion.section
              aria-labelledby="payment-form-heading"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.09, ease: [0.16, 1, 0.3, 1] }}
              className="isc-sheet p-5 sm:p-6"
            >
              <div className="mb-5 pb-3.5 border-b border-[#DFDAD0] flex flex-wrap items-center justify-between gap-2">
                <h2
                  id="payment-form-heading"
                  className="font-editorial text-lg sm:text-xl font-semibold text-[#183A32]"
                >
                  {copy.paymentCheck.formTitle}
                </h2>
                <button
                  type="button"
                  onClick={onNavigateToMessage}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#214D41] hover:underline underline-offset-4 rounded isc-focus-ring"
                >
                  <MessageSquareText className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{copy.nav.checkMessage}</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4.5" noValidate>
                {/* Payment Method Choice Group */}
                <div>
                  <span className="block text-sm font-semibold text-[#183A32] mb-2">
                    {copy.paymentCheck.fields.methodLabel}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {(['upi', 'bank_transfer', 'qr_or_link'] as PaymentMethod[]).map((method) => {
                      const active = formInput.method === method;
                      return (
                        <button
                          key={method}
                          type="button"
                          data-payment-method={method}
                          onClick={() => handleFieldChange('method', method)}
                          aria-pressed={active}
                          className={`relative text-left p-3.5 rounded-[var(--radius-md)] border isc-interactive-card isc-focus-ring flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 min-h-[58px] sm:min-h-[100px] ${
                            active
                              ? 'isc-selected-choice'
                              : 'border-[#DFDAD0] bg-[#F7F5EE] hover:bg-[#EAF4EE]/60 hover:border-[#214D41]'
                          }`}
                        >
                          <div className="flex items-center justify-between sm:w-full shrink-0">
                            <PaymentMethodIcon method={method} active={active} />
                            {active && (
                              <span
                                className="hidden sm:inline-flex w-4 h-4 rounded-full bg-[#214D41] text-[#FFFEFA] items-center justify-center shrink-0"
                                aria-hidden="true"
                              >
                                <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div
                              className={`text-xs sm:text-sm font-semibold leading-snug ${
                                active ? 'text-[#214D41]' : 'text-[#183A32]'
                              }`}
                            >
                              {copy.paymentCheck.fields.methods[method]}
                            </div>
                            <div className="text-[11px] text-[#566B64] leading-snug">
                              {copy.paymentCheck.fields.methodHints[method]}
                            </div>
                          </div>
                          {active && (
                            <span
                              className="sm:hidden w-4 h-4 rounded-full bg-[#214D41] text-[#FFFEFA] flex items-center justify-center shrink-0"
                              aria-hidden="true"
                            >
                              <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="pay-handle"
                    className="block text-sm font-semibold text-[#183A32] mb-1.5"
                  >
                    {copy.paymentCheck.fields.handleLabel}
                  </label>
                  <input
                    id="pay-handle"
                    type="text"
                    value={formInput.handleOrAccount}
                    onChange={(e) => handleFieldChange('handleOrAccount', e.target.value)}
                    placeholder={handlePlaceholder}
                    className="isc-field px-3.5 py-2 text-sm sm:text-base font-mono-data placeholder:font-sans"
                  />
                  <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[#CFC9BB] bg-white px-2.5 py-1 text-xs font-semibold text-[#183A32] hover:bg-[#F4F2EB]">
                    <QrCode className="w-3.5 h-3.5" aria-hidden="true" />
                    Read a QR image
                    <input type="file" accept="image/*" className="sr-only" onChange={handleQrPicked} />
                  </label>
                  {qrNote && <p role="status" className="mt-1.5 text-xs text-[#355049]">{qrNote}</p>}
                  {formInput.method === 'qr_or_link' && (
                    <div
                      role="region"
                      aria-labelledby="qr-sebi-handoff-heading"
                      data-testid="qr-sebi-handoff"
                      className="mt-3 p-4 rounded-[var(--radius-md)] bg-[#EBF5EF] border border-[#9BC4AC] space-y-3 isc-panel-reveal"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-9 h-9 rounded-[var(--radius-md)] bg-[#FFFEFA] border border-[#9BC4AC] text-[#214D41] flex items-center justify-center shrink-0 mt-0.5">
                          <QrCode className="w-4 h-4" aria-hidden="true" />
                        </span>
                        <div className="space-y-1 min-w-0">
                          <h3
                            id="qr-sebi-handoff-heading"
                            className="text-sm font-semibold text-[#183A32]"
                          >
                            {copy.paymentCheck.qrHandoffHeading}
                          </h3>
                          <p className="text-xs sm:text-sm text-[#355049] leading-relaxed">
                            {copy.paymentCheck.qrHandoffDesc}
                          </p>
                        </div>
                      </div>
                      <div className="sm:pl-12">
                        <a
                          href={OFFICIAL_PORTAL_LINKS.sebiCheck}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-testid="qr-sebi-handoff-btn"
                          className="isc-btn-primary w-full sm:w-auto"
                        >
                          <span>{copy.paymentCheck.qrHandoffBtn}</span>
                          <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {formInput.method === 'bank_transfer' && (
                  <div>
                    <label
                      htmlFor="pay-ifsc"
                      className="block text-sm font-semibold text-[#183A32] mb-1.5"
                    >
                      {copy.paymentCheck.fields.ifscLabel}
                    </label>
                    <input
                      id="pay-ifsc"
                      type="text"
                      value={formInput.ifscCode}
                      onChange={(e) => handleFieldChange('ifscCode', e.target.value)}
                      placeholder={copy.paymentCheck.fields.ifscPlaceholder}
                      className="isc-field px-3.5 py-2 text-sm sm:text-base font-mono-data placeholder:font-sans"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-end">
                  <div>
                    <label
                      htmlFor="pay-amount"
                      className="block text-sm font-semibold text-[#183A32] mb-1.5"
                    >
                      {copy.paymentCheck.fields.amountLabel}
                    </label>
                    <div className="relative">
                      <IndianRupee
                        className="w-4 h-4 text-[#566B64] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                        aria-hidden="true"
                      />
                      <input
                        id="pay-amount"
                        type="text"
                        inputMode="numeric"
                        value={formInput.amountInr}
                        onChange={(e) => handleFieldChange('amountInr', e.target.value)}
                        placeholder={copy.paymentCheck.fields.amountPlaceholder}
                        className="isc-field pl-8 pr-3 py-2 text-sm sm:text-base font-mono-data placeholder:font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="pay-entity"
                      className="block text-sm font-semibold text-[#183A32] mb-1.5"
                    >
                      {copy.paymentCheck.fields.entityLabel}
                    </label>
                    <input
                      id="pay-entity"
                      type="text"
                      value={formInput.claimedEntity}
                      onChange={(e) => handleFieldChange('claimedEntity', e.target.value)}
                      placeholder={copy.paymentCheck.fields.entityPlaceholder}
                      className="isc-field px-3.5 py-2 text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="pay-source"
                    className="block text-sm font-semibold text-[#183A32] mb-1.5"
                  >
                    {copy.paymentCheck.fields.sourceLabel}
                  </label>
                  <select
                    id="pay-source"
                    value={formInput.source}
                    onChange={(e) => handleFieldChange('source', e.target.value as PaymentSource)}
                    className="isc-field px-3.5 py-2 text-sm sm:text-base"
                  >
                    <option value="whatsapp_telegram" className="bg-[#FFFEFA] text-[#183A32]">
                      {copy.paymentCheck.fields.sources.whatsapp_telegram}
                    </option>
                    <option value="trading_app" className="bg-[#FFFEFA] text-[#183A32]">
                      {copy.paymentCheck.fields.sources.trading_app}
                    </option>
                    <option value="adviser_claim" className="bg-[#FFFEFA] text-[#183A32]">
                      {copy.paymentCheck.fields.sources.adviser_claim}
                    </option>
                    <option value="other" className="bg-[#FFFEFA] text-[#183A32]">
                      {copy.paymentCheck.fields.sources.other}
                    </option>
                  </select>
                </div>

                <div>
                  <span className="block text-sm font-semibold text-[#183A32] mb-2">
                    {copy.paymentCheck.fields.matchLabel}
                  </span>
                  <div className="space-y-2">
                    {(['matches', 'different', 'unsure'] as RecipientMatch[]).map((matchVal) => {
                      const checked = formInput.recipientMatch === matchVal;
                      return (
                        <label
                          key={matchVal}
                          className={`min-h-[44px] flex items-center gap-3 px-3.5 py-2 rounded-[var(--radius-md)] border isc-interactive-card ${
                            checked
                              ? 'isc-selected-choice text-[#183A32]'
                              : 'border-[#DFDAD0] bg-[#F7F5EE] hover:bg-[#EAF4EE]/60 hover:border-[#9BC4AC] text-[#183A32]'
                          }`}
                        >
                          <input
                            type="radio"
                            name="recipientMatch"
                            value={matchVal}
                            checked={checked}
                            onChange={() => handleFieldChange('recipientMatch', matchVal)}
                            className="w-4 h-4 accent-[#214D41]"
                          />
                          <span className="text-sm font-medium">
                            {copy.paymentCheck.fields.matches[matchVal]}
                          </span>
                        </label>
                      );
                    })}
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
                    className="p-3.5 rounded-[var(--radius-md)] border text-sm font-medium"
                  >
                    {validationError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isChecking}
                  className="w-full isc-btn-primary"
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span>{copy.paymentCheck.checkingBtn}</span>
                    </>
                  ) : (
                    <>
                      <span>{copy.paymentCheck.submitBtn}</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>
            </motion.section>
          </div>

          {/* RIGHT COLUMN (5/12): Verdict First + 4-Finding Breakdown */}
          <div className="lg:col-span-5 space-y-5 min-w-0">
            <section
              aria-labelledby="payment-result-heading"
              aria-live="polite"
              className="space-y-4"
            >
              {!result ? (
                <div className="isc-sheet p-6 text-center space-y-3">
                  <div className="w-11 h-11 rounded-[var(--radius-md)] bg-[#D8EBDF] border border-[#9BC4AC] text-[#183A32] flex items-center justify-center mx-auto">
                    <Wallet className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h2
                    id="payment-result-heading"
                    className="font-editorial text-xl font-semibold text-[#183A32]"
                  >
                    {copy.paymentCheck.emptyTitle}
                  </h2>
                  <p className="text-sm text-[#355049] leading-relaxed">
                    {copy.paymentCheck.emptyBody}
                  </p>
                </div>
              ) : (
                (() => {
                  const banner = getBannerStyles(result.overallLevel, language);
                  const BannerIcon = banner.Icon;
                  return (
                    <>
                      {/* Verdict Card */}
                      <motion.div
                        key={`${result.overallLevel}-${formInput.method}-${formInput.handleOrAccount}`}
                        initial={{ opacity: 0.72, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        style={banner.containerStyle}
                        className="rounded-[var(--radius-lg)] border p-5 shadow-[var(--shadow-card)] space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h2
                            id="payment-result-heading"
                            className="text-xs font-semibold uppercase tracking-wider text-[#566B64]"
                          >
                            {copy.paymentCheck.resultTitle}
                          </h2>
                          {justUpdated && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#214D41]">
                              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>{copy.paymentCheck.updatedBadge}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            style={banner.tagStyle}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-sm)] border text-xs font-semibold"
                          >
                            <BannerIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            <span>{banner.verdictTag}</span>
                          </span>

                          {result.overallLevel === 'cant_verify' && (
                            <span
                              data-testid="payment-not-verified-badge"
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
                        </div>

                        <h3 className="font-editorial text-lg sm:text-xl font-semibold leading-snug text-[#183A32]">
                          {result.overallTitle[language]}
                        </h3>
                        <p className="text-xs sm:text-sm leading-relaxed text-[#355049]">
                          {result.overallSummary[language]}
                        </p>
                      </motion.div>

                      {/* Risk Breakdown & Findings List */}
                      <div className="isc-sheet p-5 space-y-4">
                        <RiskBreakdownStrip
                          language={language}
                          title={copy.breakdown.paymentSummaryTitle}
                          segments={result.findings.map((f) => {
                            const fLabel = f.statusLabel
                              ? f.statusLabel[language]
                              : f.status === 'cant_verify'
                                ? copy.analyzer.payCantVerifyLabel
                                : statusLabels[f.status];
                            return {
                              label: `${f.title[language]} (${fLabel})`,
                              status: f.status,
                            };
                          })}
                        />

                        <div>
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#566B64] mb-2">
                            {copy.paymentCheck.findingsHeading}
                          </h3>
                          <div className="divide-y divide-[#DFDAD0] border-t border-b border-[#DFDAD0]">
                            {result.findings.map((item) => {
                              const basisLabel = getCheckBasisLabel(item.checkBasis, copy);
                              const itemLabel = item.statusLabel
                                ? item.statusLabel[language]
                                : item.status === 'cant_verify'
                                  ? copy.analyzer.payCantVerifyLabel
                                  : statusLabels[item.status];
                              return (
                                <div key={item.id} className="py-3.5 space-y-1.5">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-sm font-semibold text-[#183A32]">
                                      {item.title[language]}
                                    </p>
                                    <StatusIndicator
                                      status={item.status}
                                      label={itemLabel}
                                    />
                                  </div>
                                  {basisLabel && (
                                    <p className="text-xs font-medium text-[#566B64]">
                                      {basisLabel}
                                    </p>
                                  )}
                                  <p className="text-xs sm:text-sm text-[#355049] leading-relaxed">
                                    {item.detail[language]}
                                  </p>
                                  {item.evidencePhrase && (
                                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                      <span className="text-xs font-medium text-[#566B64]">
                                        {copy.messageCheck.evidenceLabel}
                                      </span>
                                      <span className="text-xs font-mono-data text-[#183A32] bg-[#F7F5EE] border border-[#C9C2B4] px-2 py-0.5 rounded-[var(--radius-sm)] break-words">
                                        &ldquo;{item.evidencePhrase}&rdquo;
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()
              )}
            </section>
          </div>
        </div>

        {/* FULL-WIDTH FOUR-POINT PRE-PAYMENT CHECKLIST */}
        {result && (() => {
          const totalCount = result.checklist.length;
          const checkedCount = result.checklist.filter((_, idx) =>
            Boolean(checkedItems[idx])
          ).length;
          const isAllChecked = totalCount > 0 && checkedCount === totalCount;
          const progressRatio = totalCount > 0 ? checkedCount / totalCount : 0;

          return (
            <ScrollReveal>
            <section
              aria-labelledby="payment-checklist-heading"
              className="isc-sheet p-5 sm:p-6 space-y-4"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3
                    id="payment-checklist-heading"
                    className="font-editorial text-lg font-semibold text-[#183A32]"
                  >
                    {copy.paymentCheck.checklistHeading}
                  </h3>
                  <span
                    aria-live="polite"
                    data-checklist-progress={`${checkedCount}/${totalCount}`}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold tabular-nums ${
                      isAllChecked ? 'text-[#214D41]' : 'text-[#566B64]'
                    }`}
                  >
                    {isAllChecked && (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    )}
                    <span>
                      {isAllChecked
                        ? copy.paymentCheck.checklistComplete
                        : copy.paymentCheck.checklistProgress(checkedCount, totalCount)}
                    </span>
                  </span>
                </div>

                <div
                  className="h-2 w-full rounded-full bg-[#EAE6DC] overflow-hidden"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={totalCount}
                  aria-valuenow={checkedCount}
                  aria-label={copy.paymentCheck.checklistHeading}
                >
                  <div
                    className="h-full w-full origin-left transition-transform duration-200 bg-[#214D41] rounded-full"
                    style={{ transform: `scaleX(${progressRatio})` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.checklist.map((item, idx) => {
                  const checked = Boolean(checkedItems[idx]);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleChecklist(idx)}
                      aria-pressed={checked}
                      className={`w-full min-h-[46px] flex items-start gap-3 p-3.5 rounded-[var(--radius-md)] border text-left isc-interactive-card isc-focus-ring ${
                        checked
                          ? 'isc-selected-choice text-[#183A32]'
                          : 'bg-[#F7F5EE] border-[#DFDAD0] hover:bg-[#EAF4EE]/60 hover:border-[#214D41] text-[#183A32]'
                      }`}
                    >
                      {checked ? (
                        <CheckSquare
                          className="w-4 h-4 text-[#214D41] shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                      ) : (
                        <Square
                          className="w-4 h-4 text-[#566B64] shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                      )}
                      <span className="text-xs sm:text-sm leading-relaxed">
                        {item[language]}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-[#566B64] pt-3 border-t border-[#DFDAD0] leading-relaxed">
                {result.demoLimitNote[language]}
              </p>
            </section>
            </ScrollReveal>
          );
        })()}

        {/* Guided Post-Incident Help */}
        <ScrollReveal delay={0.04}>
        <section
          aria-label={copy.postIncidentHelp.triggerBtn}
          className="isc-mint-surface p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div className="flex items-start gap-3 min-w-0">
            <span className="w-9 h-9 rounded-[var(--radius-md)] bg-[#FFFEFA] border border-[#9BC4AC] text-[#214D41] flex items-center justify-center shrink-0 mt-0.5">
              <LifeBuoy className="w-4 h-4" aria-hidden="true" />
            </span>
            <div className="space-y-0.5 min-w-0">
              <p className="text-sm font-semibold text-[#183A32]">
                {copy.postIncidentHelp.triggerBtn}
              </p>
              <p className="text-xs sm:text-sm text-[#355049] leading-relaxed">
                {copy.postIncidentHelp.triggerHint}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenPostIncidentHelp}
            data-testid="payment-open-post-incident-help-btn"
            className="isc-btn-primary shrink-0"
          >
            <LifeBuoy className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{copy.postIncidentHelp.triggerBtn}</span>
          </button>
        </section>
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            disabled={!result}
            onClick={() => window.print()}
            data-testid="payment-print-summary-btn"
            className="group isc-sheet isc-interactive-card p-4 sm:p-5 text-left hover:border-[#214D41] hover:bg-[#EAF4EE]/45 flex flex-col justify-between gap-2 isc-focus-ring disabled:opacity-45 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-[#183A32]">
                {copy.printSummary.printBtn}
              </span>
              <Printer className="w-4 h-4 text-[#214D41] shrink-0 transition-transform duration-150 group-hover:scale-110" aria-hidden="true" />
            </div>
            <p className="text-xs text-[#566B64] leading-snug">
              {copy.printSummary.familyDocKicker}
            </p>
          </button>

          <button
            type="button"
            onClick={onNavigateToMessage}
            className="group isc-sheet isc-interactive-card p-4 sm:p-5 text-left hover:border-[#214D41] hover:bg-[#EAF4EE]/45 flex items-center justify-between gap-2 isc-focus-ring"
          >
            <div className="flex items-center gap-2.5">
              <MessageSquareText className="w-4 h-4 text-[#214D41] shrink-0 transition-transform duration-150 group-hover:scale-110" aria-hidden="true" />
              <span className="text-sm font-semibold text-[#183A32]">
                {copy.nav.checkMessage}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-[#214D41] shrink-0 transition-transform duration-150 group-hover:translate-x-1" aria-hidden="true" />
          </button>
        </div>
        </ScrollReveal>

        <ScrollReveal delay={0.06}>
          <OfficialSourcesCard language={language} />
        </ScrollReveal>
      </div>

      {printableSummary && (
        <PrintableFamilySummary summary={printableSummary} language={language} />
      )}
    </>
  );
}
