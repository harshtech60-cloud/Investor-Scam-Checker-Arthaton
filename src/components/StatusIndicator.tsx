import { AlertTriangle, HelpCircle, Info, ShieldAlert } from 'lucide-react';
import type { Language, PillarStatus, RiskLevel } from '../types/check';
import { getCopy } from '../data/translations';

interface StatusBadgeProps {
  status: RiskLevel | PillarStatus;
  label: string;
}

export function StatusIndicator({ status, label }: StatusBadgeProps) {
  const config = {
    high_risk: {
      icon: ShieldAlert,
      style: {
        backgroundColor: 'var(--status-danger-bg)',
        borderColor: 'var(--status-danger-border)',
        color: 'var(--status-danger-text)',
      },
      iconStyle: { color: 'var(--status-danger-icon)' },
    },
    caution: {
      icon: AlertTriangle,
      style: {
        backgroundColor: 'var(--status-caution-bg)',
        borderColor: 'var(--status-caution-border)',
        color: 'var(--status-caution-text)',
      },
      iconStyle: { color: 'var(--status-caution-icon)' },
    },
    cant_verify: {
      icon: HelpCircle,
      style: {
        backgroundColor: 'var(--status-neutral-bg)',
        borderColor: 'var(--status-neutral-border)',
        color: 'var(--status-neutral-text)',
      },
      iconStyle: { color: 'var(--status-neutral-icon)' },
    },
    not_provided: {
      icon: Info,
      style: {
        backgroundColor: 'var(--status-empty-bg)',
        borderColor: 'var(--status-empty-border)',
        color: 'var(--status-empty-text)',
      },
      iconStyle: { color: 'var(--status-empty-text)' },
    },
    insufficient_data: {
      icon: Info,
      style: {
        backgroundColor: 'var(--status-neutral-bg)',
        borderColor: 'var(--status-neutral-border)',
        color: 'var(--status-neutral-text)',
      },
      iconStyle: { color: 'var(--status-neutral-icon)' },
    },
  }[status];

  const Icon = config.icon;

  return (
    <span
      style={config.style}
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[var(--radius-sm)] border text-xs font-semibold whitespace-normal sm:whitespace-nowrap max-w-full text-left leading-snug shrink-0"
    >
      <Icon className="w-3.5 h-3.5 shrink-0" style={config.iconStyle} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

export function getBannerStyles(level: RiskLevel, language: Language) {
  const copy = getCopy(language);
  switch (level) {
    case 'high_risk':
      return {
        containerStyle: {
          backgroundColor: '#FBF1EE',
          borderColor: '#C86F5C',
          color: '#183A32',
        },
        iconStyle: {
          backgroundColor: '#C86F5C',
          color: '#FFFEFA',
          border: '1px solid #B05440',
        },
        tagStyle: {
          backgroundColor: '#F6DFDA',
          borderColor: '#C86F5C',
          color: '#7C2D1E',
        },
        verdictTag: copy.statusTags.highRiskVerdict,
        Icon: ShieldAlert,
      };
    case 'caution':
      return {
        containerStyle: {
          backgroundColor: '#FDF6E7',
          borderColor: '#DBA14B',
          color: '#183A32',
        },
        iconStyle: {
          backgroundColor: '#DBA14B',
          color: '#183A32',
          border: '1px solid #BD8530',
        },
        tagStyle: {
          backgroundColor: '#F8E8C6',
          borderColor: '#DBA14B',
          color: '#6C4208',
        },
        verdictTag: copy.statusTags.cautionVerdict,
        Icon: AlertTriangle,
      };
    case 'cant_verify':
    case 'insufficient_data':
    default:
      return {
        containerStyle: {
          backgroundColor: '#FFFEFA',
          borderColor: '#C4BEB2',
          color: '#183A32',
        },
        iconStyle: {
          backgroundColor: '#EAE6DC',
          color: '#3F4744',
          border: '1px solid #C4BEB2',
        },
        tagStyle: {
          backgroundColor: '#EFECE3',
          borderColor: '#C4BEB2',
          color: '#3F4744',
        },
        verdictTag: copy.statusTags.cantVerifyVerdict,
        Icon: HelpCircle,
      };
  }
}

interface BreakdownSegment {
  label: string;
  status: PillarStatus;
}

interface RiskBreakdownStripProps {
  language: Language;
  title: string;
  segments: BreakdownSegment[];
}

export function RiskBreakdownStrip({ language, title, segments }: RiskBreakdownStripProps) {
  if (segments.length === 0) return null;

  const copy = getCopy(language);
  const counts = {
    high_risk: segments.filter((s) => s.status === 'high_risk').length,
    caution: segments.filter((s) => s.status === 'caution').length,
    cant_verify: segments.filter((s) => s.status === 'cant_verify').length,
    not_provided: segments.filter((s) => s.status === 'not_provided').length,
  };

  const segmentColor = (status: PillarStatus) => {
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

  return (
    <div
      className="py-3 border-y border-[#DFDAD0] space-y-2.5"
      aria-label={title}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold text-[#355049]">{title}</span>
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

      <div className="flex items-center gap-1.5 h-2.5 w-full" role="presentation">
        {segments.map((seg, idx) => (
          <div
            key={`${seg.label}-${idx}`}
            title={seg.label}
            style={{ backgroundColor: segmentColor(seg.status) }}
            className="h-full flex-1 rounded-sm transition-colors"
          />
        ))}
      </div>
    </div>
  );
}
