import { motion } from 'motion/react';
import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  Globe,
  HelpCircle,
  Info,
  MessageSquareText,
  ShieldAlert,
  Wallet,
} from 'lucide-react';
import type { Language, MessageCheckInput, PillarFinding, PillarStatus } from '../types/check';
import { getCopy } from '../data/translations';
import { useCardTilt } from '../utils/useCardTilt';

export type ClueId = 'message' | 'sebi' | 'link' | 'payment';

interface FourClueGraphProps {
  language: Language;
  formInput: MessageCheckInput;
  pillars: PillarFinding[] | null;
  isResultCurrent: boolean;
  staggerKey?: string | null;
  onFocusField: (fieldId: string) => void;
}

const NODE_DEFS: Array<{
  id: ClueId;
  num: string;
  fieldId: string;
  Icon: typeof MessageSquareText;
}> = [
  { id: 'message', num: '01', fieldId: 'msg-pitch', Icon: MessageSquareText },
  { id: 'sebi', num: '02', fieldId: 'msg-sebi', Icon: BadgeCheck },
  { id: 'link', num: '03', fieldId: 'msg-link', Icon: Globe },
  { id: 'payment', num: '04', fieldId: 'msg-payment', Icon: Wallet },
];

function getReviewedCardStyle(status: PillarStatus) {
  switch (status) {
    case 'high_risk':
      return {
        surfaceClass: 'bg-[#FBF1EE] border-[#C86F5C]',
        barFill: '#C86F5C',
        barRatio: 1,
        textColor: '#8A3727',
        iconWrapClass: 'bg-[#FFFEFA] text-[#B85440] border-[#C86F5C]',
        StatusIcon: ShieldAlert,
      };
    case 'caution':
      return {
        surfaceClass: 'bg-[#FDF6E7] border-[#DBA14B]',
        barFill: '#DBA14B',
        barRatio: 0.78,
        textColor: '#794D0C',
        iconWrapClass: 'bg-[#FFFEFA] text-[#B3771B] border-[#DBA14B]',
        StatusIcon: AlertTriangle,
      };
    case 'cant_verify':
      return {
        surfaceClass: 'bg-[#EFECE3] border-[#C4BEB2]',
        barFill: '#8B908C',
        barRatio: 0.62,
        textColor: '#3F4744',
        iconWrapClass: 'bg-[#FFFEFA] text-[#565E5A] border-[#C4BEB2]',
        StatusIcon: HelpCircle,
      };
    case 'not_provided':
    default:
      return {
        surfaceClass: 'bg-[#F7F5EE] border-[#DFDAD0]',
        barFill: '#DDD8CE',
        barRatio: 0.25,
        textColor: '#5E6662',
        iconWrapClass: 'bg-[#FFFEFA] text-[#5E6662] border-[#DAD5C9]',
        StatusIcon: Info,
      };
  }
}

export function FourClueGraph({
  language,
  formInput,
  pillars,
  isResultCurrent,
  staggerKey,
  onFocusField,
}: FourClueGraphProps) {
  const copy = getCopy(language);

  const filledMap: Record<ClueId, boolean> = {
    message: Boolean(formInput.messageText.trim()),
    sebi: Boolean(formInput.sebiClaim.trim()),
    link: Boolean(formInput.websiteLink.trim()),
    payment: Boolean(formInput.paymentDetail.trim() || formInput.requestedAmountInr.trim()),
  };

  const filledCount = NODE_DEFS.filter((n) => filledMap[n.id]).length;

  return (
    <section
      aria-labelledby="four-clue-graph-heading"
      className="isc-sheet p-5 sm:p-6 space-y-4"
    >
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#DFDAD0]">
        <h2
          id="four-clue-graph-heading"
          className="font-editorial text-lg sm:text-xl font-semibold text-[#183A32]"
        >
          {copy.messageCheck.graphTitle}
        </h2>

        <p
          aria-live="polite"
          className="text-xs font-semibold text-[#214D41] tabular-nums"
        >
          {copy.messageCheck.graphProgress(filledCount)}
        </p>
      </div>

      {/* Sequential 4-Clue Horizontal Sequence Diagram */}
      <div
        key={staggerKey ?? 'initial'}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {NODE_DEFS.map((node, idx) => {
          const Icon = node.Icon;
          const isFilled = filledMap[node.id];
          const label = copy.messageCheck.steps[node.id];
          const reviewedPillar =
            isResultCurrent && pillars
              ? pillars.find((p) => p.id === node.id) ?? null
              : null;

          const reviewedStyle = reviewedPillar
            ? getReviewedCardStyle(reviewedPillar.status)
            : null;

          const surfaceClass = reviewedStyle
            ? reviewedStyle.surfaceClass
            : isFilled
            ? 'bg-[#EAF4EE] border-[#9BC4AC]'
            : 'bg-[#F7F5EE] border-[#DFDAD0]';

          const barFill = reviewedStyle
            ? reviewedStyle.barFill
            : isFilled
            ? '#214D41'
            : '#DDD8CE';

          const barRatio = reviewedStyle
            ? reviewedStyle.barRatio
            : isFilled
            ? 0.75
            : 0.22;

          const statusText = reviewedPillar
            ? reviewedPillar.statusLabel[language]
            : isFilled
            ? copy.messageCheck.nodeEntered
            : copy.messageCheck.nodeEmpty;

          const StatusIcon = reviewedStyle
            ? reviewedStyle.StatusIcon
            : isFilled
            ? CheckCircle2
            : Info;

          const statusColor = reviewedStyle
            ? reviewedStyle.textColor
            : isFilled
            ? '#214D41'
            : '#5E6662';

          const iconWrapClass = reviewedStyle
            ? reviewedStyle.iconWrapClass
            : isFilled
            ? 'bg-[#FFFEFA] text-[#214D41] border-[#9BC4AC]'
            : 'bg-[#FFFEFA] text-[#5E6662] border-[#DFDAD0]';

          return (
            <ClueNodeCard
              key={node.id}
              node={node}
              idx={idx}
              Icon={Icon}
              StatusIcon={StatusIcon}
              isFilled={isFilled}
              reviewedStatus={reviewedPillar ? reviewedPillar.status : isFilled ? 'entered' : 'empty'}
              label={label}
              statusText={statusText}
              surfaceClass={surfaceClass}
              barFill={barFill}
              barRatio={barRatio}
              statusColor={statusColor}
              iconWrapClass={iconWrapClass}
              ariaLabel={`${label} — ${statusText}. ${copy.messageCheck.nodeFocusHint(label)}`}
              onFocusField={onFocusField}
            />
          );
        })}
      </div>
    </section>
  );
}

interface ClueNodeCardProps {
  node: (typeof NODE_DEFS)[number];
  idx: number;
  Icon: typeof MessageSquareText;
  StatusIcon: typeof Info;
  isFilled: boolean;
  reviewedStatus: string;
  label: string;
  statusText: string;
  surfaceClass: string;
  barFill: string;
  barRatio: number;
  statusColor: string;
  iconWrapClass: string;
  ariaLabel: string;
  onFocusField: (fieldId: string) => void;
}

function ClueNodeCard({
  node,
  idx,
  Icon,
  StatusIcon,
  isFilled,
  reviewedStatus,
  label,
  statusText,
  surfaceClass,
  barFill,
  barRatio,
  statusColor,
  iconWrapClass,
  ariaLabel,
  onFocusField,
}: ClueNodeCardProps) {
  const { tiltStyle, tiltHandlers } = useCardTilt(3.2);

  return (
    <motion.button
      type="button"
      data-clue-node={node.id}
      data-filled={String(isFilled)}
      data-review-status={reviewedStatus}
      onClick={() => onFocusField(node.fieldId)}
      aria-label={ariaLabel}
      initial={{ opacity: 0.15, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.26,
        delay: 0.08 + idx * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={tiltStyle}
      {...tiltHandlers}
      className={`group text-left rounded-[var(--radius-md)] border p-4 hover:border-[#214D41] isc-interactive-card isc-focus-ring flex flex-col justify-between gap-3 ${surfaceClass}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono-data text-xs font-semibold text-[#566B64]">
          {node.num}
        </span>
        <span
          className={`w-7 h-7 rounded-[var(--radius-sm)] border flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-105 ${iconWrapClass}`}
        >
          <Icon className="w-3.5 h-3.5" aria-hidden="true" />
        </span>
      </div>

      <div className="space-y-1.5 min-w-0">
        <div className="text-sm font-semibold text-[#183A32] leading-snug">
          {label}
        </div>

        {/* Tactile Progress / Status Meter */}
        <div className="h-1.5 w-full rounded-full bg-[#FFFEFA]/80 border border-[#DFDAD0]/60 overflow-hidden">
          <div
            className="h-full w-full rounded-full origin-left transition-transform duration-300 ease-out"
            style={{
              transform: `scaleX(${barRatio})`,
              backgroundColor: barFill,
            }}
          />
        </div>

        <div
          style={{ color: statusColor }}
          className="inline-flex items-start gap-1.5 text-xs font-medium leading-snug pt-0.5"
        >
          <StatusIcon className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
          <span className="break-words">{statusText}</span>
        </div>
      </div>
    </motion.button>
  );
}
