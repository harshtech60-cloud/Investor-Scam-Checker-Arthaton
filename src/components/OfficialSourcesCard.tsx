import {
  AlertTriangle,
  Building2,
  ExternalLink,
  FileWarning,
  Landmark,
  PhoneCall,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import type { Language } from '../types/check';
import { getCopy } from '../data/translations';
import { useCardTilt } from '../utils/useCardTilt';

interface OfficialSourcesCardProps {
  language: Language;
  compact?: boolean;
}

export const OFFICIAL_PORTAL_LINKS = {
  sebiLookup: 'https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognised=yes',
  sebiCheck: 'https://siportal.sebi.gov.in/intermediary/sebi-check',
  appsList: 'https://investor.sebi.gov.in/Investor-support.html',
  spotScam: 'https://investor.sebi.gov.in/spot-any-scam.html',
  fakeAppsPdf: 'https://investor.sebi.gov.in/pdf/Fake%20trading%20app%20scam%20Landscape.pdf',
  rbiSafety: 'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=53185',
  rbiUnauthPdf: 'https://rbi.org.in/commonman/images/FAME202426022024.pdf',
  npciAwareness: 'https://www.npci.org.in/fraud-awareness',
  cyberCrime: 'https://cybercrime.gov.in/',
  scores: 'https://scores.sebi.gov.in/',
} as const;

function PrimaryPortalCard({
  id,
  href,
  title,
  desc,
  openLabel,
  Icon,
}: {
  id: string;
  href: string;
  title: string;
  desc: string;
  openLabel: string;
  Icon: typeof Building2;
}) {
  const { tiltStyle, tiltHandlers } = useCardTilt(2.6);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-official-link={id}
      style={tiltStyle}
      {...tiltHandlers}
      className="group rounded-[var(--radius-md)] border border-[#C9C2B4] bg-[#FFFEFA] hover:bg-[#EAF4EE] hover:border-[#214D41] p-4 isc-interactive-card flex flex-col justify-between gap-3 isc-focus-ring"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="w-9 h-9 rounded-[var(--radius-md)] bg-[#D8EBDF] border border-[#9BC4AC] text-[#183A32] flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-105">
          <Icon className="w-4 h-4" aria-hidden="true" />
        </span>
        <ExternalLink
          className="w-4 h-4 text-[#566B64] group-hover:text-[#214D41] shrink-0 mt-1 transition-all duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
      </div>

      <div className="space-y-1">
        <div className="text-sm font-semibold text-[#183A32] group-hover:text-[#214D41] transition-colors leading-snug">
          {title}
        </div>
        <p className="text-xs text-[#355049] leading-relaxed">{desc}</p>
      </div>

      <span className="text-xs font-semibold text-[#214D41] inline-flex items-center gap-1 pt-0.5">
        <span>{openLabel}</span>
        <span
          aria-hidden="true"
          className="inline-block transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        >
          ↗
        </span>
      </span>
    </a>
  );
}

function GuidancePortalCard({
  id,
  href,
  title,
  desc,
  Icon,
}: {
  id: string;
  href: string;
  title: string;
  desc: string;
  Icon: typeof ShieldAlert;
}) {
  const { tiltStyle, tiltHandlers } = useCardTilt(2.4);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-official-link={id}
      style={tiltStyle}
      {...tiltHandlers}
      className="group rounded-[var(--radius-md)] border border-[#DFDAD0] bg-[#F7F5EE] hover:bg-[#EAF4EE] hover:border-[#214D41] p-3.5 isc-interactive-card flex flex-col justify-between gap-2 isc-focus-ring"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-7 h-7 rounded-[var(--radius-sm)] bg-[#FFFEFA] border border-[#DFDAD0] text-[#214D41] flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-105 group-hover:border-[#9BC4AC]">
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
          <span className="text-xs sm:text-sm font-semibold text-[#183A32] leading-snug">
            {title}
          </span>
        </div>
        <ExternalLink
          className="w-3.5 h-3.5 text-[#566B64] group-hover:text-[#214D41] shrink-0 mt-0.5 transition-all duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
      </div>
      <p className="text-xs text-[#355049] leading-relaxed">{desc}</p>
    </a>
  );
}

export function OfficialSourcesCard({ language, compact = false }: OfficialSourcesCardProps) {
  const copy = getCopy(language);
  const ov = copy.officialVerify;

  const links = [
    {
      id: 'sebi-lookup',
      href: OFFICIAL_PORTAL_LINKS.sebiLookup,
      title: ov.sebiLookupLabel,
      desc: ov.sebiLookupDesc,
      Icon: Building2,
    },
    {
      id: 'sebi-check',
      href: OFFICIAL_PORTAL_LINKS.sebiCheck,
      title: ov.sebiCheckLabel,
      desc: ov.sebiCheckDesc,
      Icon: ShieldCheck,
    },
    {
      id: 'official-apps',
      href: OFFICIAL_PORTAL_LINKS.appsList,
      title: ov.appsListLabel,
      desc: ov.appsListDesc,
      Icon: Smartphone,
    },
  ] as const;

  const guidanceLinks = [
    {
      id: 'spot-scam',
      href: OFFICIAL_PORTAL_LINKS.spotScam,
      title: ov.spotScamLabel,
      desc: ov.spotScamDesc,
      Icon: ShieldAlert,
    },
    {
      id: 'fake-apps-pdf',
      href: OFFICIAL_PORTAL_LINKS.fakeAppsPdf,
      title: ov.fakeAppsPdfLabel,
      desc: ov.fakeAppsPdfDesc,
      Icon: FileWarning,
    },
    {
      id: 'rbi-safety',
      href: OFFICIAL_PORTAL_LINKS.rbiSafety,
      title: ov.rbiSafetyLabel,
      desc: ov.rbiSafetyDesc,
      Icon: Landmark,
    },
    {
      id: 'npci-awareness',
      href: OFFICIAL_PORTAL_LINKS.npciAwareness,
      title: ov.npciAwarenessLabel,
      desc: ov.npciAwarenessDesc,
      Icon: AlertTriangle,
    },
    {
      id: 'cyber-crime',
      href: OFFICIAL_PORTAL_LINKS.cyberCrime,
      title: ov.cyberCrimeLabel,
      desc: ov.cyberCrimeDesc,
      Icon: PhoneCall,
    },
    {
      id: 'sebi-scores',
      href: OFFICIAL_PORTAL_LINKS.scores,
      title: ov.scoresLabel,
      desc: ov.scoresDesc,
      Icon: Scale,
    },
  ] as const;

  return (
    <section
      aria-labelledby={`official-verify-heading-${compact ? 'compact' : 'full'}`}
      data-testid="official-verify-card"
      className="isc-sheet p-5 sm:p-6 space-y-5"
    >
      <div className="space-y-1.5 pb-4 border-b border-[#DFDAD0]">
        <h2
          id={`official-verify-heading-${compact ? 'compact' : 'full'}`}
          className="font-editorial text-xl sm:text-2xl font-semibold text-[#183A32]"
        >
          {ov.title}
        </h2>
        <p className="text-xs sm:text-sm text-[#355049] leading-relaxed max-w-3xl">
          {ov.subtitle}
        </p>
      </div>

      {/* Primary Official Verification Portals */}
      <div className={`grid grid-cols-1 ${compact ? '' : 'sm:grid-cols-3'} gap-3`}>
        {links.map((item) => (
          <PrimaryPortalCard
            key={item.id}
            id={item.id}
            href={item.href}
            title={item.title}
            desc={item.desc}
            openLabel={ov.openPortalBtn}
            Icon={item.Icon}
          />
        ))}
      </div>

      {/* Guidance & Reporting Portals */}
      {!compact && (
        <div className="pt-4 border-t border-[#DFDAD0] space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#566B64]">
            {ov.guidanceStripTitle}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {guidanceLinks.map((item) => (
              <GuidancePortalCard
                key={item.id}
                id={item.id}
                href={item.href}
                title={item.title}
                desc={item.desc}
                Icon={item.Icon}
              />
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-[#566B64] pt-3 border-t border-[#DFDAD0] leading-relaxed">
        {ov.qrUnavailableNote}
      </p>
    </section>
  );
}
