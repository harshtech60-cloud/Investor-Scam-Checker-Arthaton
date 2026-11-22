import { motion } from 'motion/react';
import {
  ArrowDown,
  BadgeCheck,
  ChevronRight,
  Globe,
  MessageSquareText,
  Wallet,
} from 'lucide-react';
import type { Language, PillarFinding, PillarStatus } from '../types/check';
import { getCopy } from '../data/translations';
import { useCardTilt } from '../utils/useCardTilt';
import { StatusIndicator } from './StatusIndicator';

interface ConnectedResultTilesProps {
  language: Language;
  pillars: PillarFinding[];
  selectedPillarId: PillarFinding['id'] | null;
  expandedPillarIds?: PillarFinding['id'][];
  staggerKey?: string | null;
  onSelectPillar: (pillarId: PillarFinding['id']) => void;
}

const PILLAR_ICONS: Record<PillarFinding['id'], typeof MessageSquareText> = {
  message: MessageSquareText,
  sebi: BadgeCheck,
  link: Globe,
  payment: Wallet,
};

function getConnectorTone(status: PillarStatus): string {
  switch (status) {
    case 'high_risk':
      return '#C86F5C';
    case 'caution':
      return '#DBA14B';
    case 'cant_verify':
      return '#8B908C';
    case 'not_provided':
    default:
      return '#DDD8CE';
  }
}

function getIconBadgeTone(status: PillarStatus): string {
  switch (status) {
    case 'high_risk':
      return 'bg-[#FBF1EE] text-[#8A3727] border-[#C86F5C]';
    case 'caution':
      return 'bg-[#FDF6E7] text-[#794D0C] border-[#DBA14B]';
    case 'cant_verify':
      return 'bg-[#EFECE3] text-[#3F4744] border-[#C4BEB2]';
    case 'not_provided':
    default:
      return 'bg-[#F6F4EC] text-[#5E6662] border-[#DAD5C9]';
  }
}

interface ResultTileButtonProps {
  pillar: PillarFinding;
  idx: number;
  title: string;
  stepLabel: string;
  headline: string;
  statusLabel: string;
  expandedLabel: string;
  selectPrompt: string;
  isExpanded: boolean;
  isHighlighted: boolean;
  onSelect: () => void;
}

function ResultTileButton({
  pillar,
  idx,
  title,
  stepLabel,
  headline,
  statusLabel,
  expandedLabel,
  selectPrompt,
  isExpanded,
  isHighlighted,
  onSelect,
}: ResultTileButtonProps) {
  const PillarIcon = PILLAR_ICONS[pillar.id];
  const { tiltStyle, tiltHandlers } = useCardTilt(2.6);

  return (
    <motion.button
      type="button"
      data-result-tile={pillar.id}
      aria-pressed={isExpanded}
      aria-label={`${title} — ${statusLabel}. ${selectPrompt}`}
      onClick={onSelect}
      initial={{ opacity: 0.15, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.26,
        delay: 0.12 + idx * 0.065,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={tiltStyle}
      {...tiltHandlers}
      className={`group relative w-full text-left p-4 rounded-[var(--radius-md)] border isc-interactive-card isc-focus-ring flex items-start justify-between gap-3 ${
        isHighlighted
          ? 'bg-[#EAF4EE] border-[#214D41] shadow-[0_6px_18px_rgba(24,58,50,0.09)]'
          : 'bg-[#FFFEFA] border-[#DFDAD0] hover:bg-[#F3F8F5] hover:border-[#214D41]'
      }`}
    >
      {isHighlighted && (
        <motion.span
          layoutId="isc-selected-clue-bridge"
          aria-hidden="true"
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          className="absolute inset-x-4 bottom-0 h-[3px] rounded-t-full bg-[#214D41]"
        />
      )}

      <div className="flex items-start gap-3 min-w-0 flex-1">
        <span
          className={`w-9 h-9 rounded-[var(--radius-md)] border flex items-center justify-center shrink-0 mt-0.5 transition-transform duration-150 group-hover:scale-105 ${getIconBadgeTone(
            pillar.status
          )}`}
        >
          <PillarIcon className="w-4 h-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-[#183A32]">{stepLabel}</span>
            <StatusIndicator status={pillar.status} label={statusLabel} />
          </div>
          <p className="text-xs text-[#355049] leading-relaxed">{headline}</p>
          {isExpanded && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#214D41]">
              <ArrowDown className="w-3 h-3" aria-hidden="true" />
              <span>{expandedLabel}</span>
            </span>
          )}
        </div>
      </div>

      <ChevronRight
        className={`w-4 h-4 shrink-0 mt-2 transition-transform duration-180 ${
          isHighlighted
            ? 'text-[#214D41] rotate-90'
            : 'text-[#566B64] group-hover:translate-x-0.5 group-hover:text-[#214D41]'
        }`}
        aria-hidden="true"
      />
    </motion.button>
  );
}

export function ConnectedResultTiles({
  language,
  pillars,
  selectedPillarId,
  expandedPillarIds,
  staggerKey,
  onSelectPillar,
}: ConnectedResultTilesProps) {
  const copy = getCopy(language);

  const counts = {
    high_risk: pillars.filter((p) => p.status === 'high_risk').length,
    caution: pillars.filter((p) => p.status === 'caution').length,
    cant_verify: pillars.filter((p) => p.status === 'cant_verify').length,
    not_provided: pillars.filter((p) => p.status === 'not_provided').length,
  };

  const flaggedCount = counts.high_risk + counts.caution;

  const summaryItems = [
    flaggedCount > 0
      ? {
          key: 'flagged',
          dotColor: '#C86F5C',
          text: copy.breakdown.highRiskCount(flaggedCount),
        }
      : null,
    counts.cant_verify > 0
      ? {
          key: 'cant_verify',
          dotColor: '#7A807C',
          text: copy.breakdown.unverifiedCount(counts.cant_verify),
        }
      : null,
    counts.not_provided > 0
      ? {
          key: 'not_provided',
          dotColor: '#B8B2A5',
          text: copy.breakdown.notEnteredCount(counts.not_provided),
        }
      : null,
  ].filter(Boolean) as Array<{ key: string; dotColor: string; text: string }>;

  const activeTitle = selectedPillarId
    ? copy.messageCheck.pillarTitles[selectedPillarId]
    : null;

  return (
    <div aria-label={copy.breakdown.messageSummaryTitle} className="space-y-3.5">
      {/* Header Row with Derived Counts */}
      <div className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#566B64]">
            {copy.breakdown.messageSummaryTitle}
          </span>
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[#183A32] tabular-nums">
            {summaryItems.map((item) => (
              <span key={item.key} className="inline-flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: item.dotColor }}
                  aria-hidden="true"
                />
                <span>{item.text}</span>
              </span>
            ))}
          </div>
        </div>
        <p className="text-xs text-[#566B64]">{copy.messageCheck.tileInspectHint}</p>
      </div>

      {/* Connected 4-Segment Track */}
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {pillars.map((pillar) => {
          const isOpen = expandedPillarIds
            ? expandedPillarIds.includes(pillar.id)
            : selectedPillarId === pillar.id;
          return (
            <div key={pillar.id} className="flex items-center flex-1">
              <span
                style={{ backgroundColor: getConnectorTone(pillar.status) }}
                className={`h-2 flex-1 rounded-sm transition-all duration-200 ${
                  isOpen || selectedPillarId === pillar.id
                    ? 'opacity-100 scale-y-110'
                    : 'opacity-75'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Sequential 4-Clue Grid */}
      <div key={staggerKey ?? 'initial'} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {pillars.map((pillar, idx) => {
          const isExpanded = expandedPillarIds
            ? expandedPillarIds.includes(pillar.id)
            : selectedPillarId === pillar.id;
          const isHighlighted = selectedPillarId === pillar.id || isExpanded;
          const title = copy.messageCheck.pillarTitles[pillar.id];

          return (
            <ResultTileButton
              key={pillar.id}
              pillar={pillar}
              idx={idx}
              title={title}
              stepLabel={copy.messageCheck.steps[pillar.id]}
              headline={pillar.headline[language]}
              statusLabel={pillar.statusLabel[language]}
              expandedLabel={copy.messageCheck.tileViewing}
              selectPrompt={copy.messageCheck.tileSelectPrompt(title)}
              isExpanded={isExpanded}
              isHighlighted={isHighlighted}
              onSelect={() => onSelectPillar(pillar.id)}
            />
          );
        })}
      </div>

      {/* Subtle visual connector indicator linking selected clue tile down to full explanation */}
      {activeTitle && (
        <motion.div
          key={selectedPillarId}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          data-testid="active-clue-connector"
          className="flex items-center justify-center gap-2 pt-1 text-xs font-semibold text-[#214D41]"
        >
          <span
            className="h-px flex-1 bg-gradient-to-r from-transparent via-[#9BC4AC] to-[#214D41]"
            aria-hidden="true"
          />
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-sm)] bg-[#EBF5EF] border border-[#9BC4AC] text-[#183A32]">
            <ArrowDown className="w-3.5 h-3.5 text-[#214D41]" aria-hidden="true" />
            <span>{activeTitle}</span>
          </span>
          <span
            className="h-px flex-1 bg-gradient-to-l from-transparent via-[#9BC4AC] to-[#214D41]"
            aria-hidden="true"
          />
        </motion.div>
      )}
    </div>
  );
}
