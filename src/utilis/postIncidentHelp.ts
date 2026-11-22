import type { Language, PostIncidentChoice } from '../types/check';
import { getCopy } from '../data/translations';
import { OFFICIAL_PORTAL_LINKS } from '../components/OfficialSourcesCard';

export const POST_INCIDENT_CHOICES: PostIncidentChoice[] = [
  'paid',
  'shared_secret',
  'clicked_or_installed',
  'not_acted',
];

export interface PostIncidentOfficialLink {
  id: 'rbi_unauth_pdf' | 'cyber_crime' | 'sebi_fake_apps_pdf';
  label: string;
  url: string;
}

export interface PostIncidentGuidance {
  choice: PostIncidentChoice;
  label: string;
  heading: string;
  summary: string;
  steps: string[];
  urgentRuleNote: string;
  deviceNotCheckedNote?: string;
  reporting?: {
    title: string;
    body: string;
    helpline: string;
    portalLabel: string;
    portalUrl: string;
  };
  showBackToChecker: boolean;
  officialLinks: PostIncidentOfficialLink[];
  disclaimerNote: string;
}

export function getPostIncidentGuidance(
  choice: PostIncidentChoice,
  language: Language
): PostIncidentGuidance {
  const copy = getCopy(language);
  const h = copy.postIncidentHelp;
  const spec = h.choices[choice];

  const officialLinks: PostIncidentOfficialLink[] = [
    {
      id: 'cyber_crime',
      label: h.cyberPortalLabel,
      url: OFFICIAL_PORTAL_LINKS.cyberCrime,
    },
    {
      id: 'rbi_unauth_pdf',
      label: h.rbiPdfLabel,
      url: OFFICIAL_PORTAL_LINKS.rbiUnauthPdf,
    },
    {
      id: 'sebi_fake_apps_pdf',
      label: h.sebiFakeAppPdfLabel,
      url: OFFICIAL_PORTAL_LINKS.fakeAppsPdf,
    },
  ];

  return {
    choice,
    label: spec.label,
    heading: spec.heading,
    summary: spec.summary,
    steps: spec.steps,
    urgentRuleNote: h.urgentRuleNote,
    deviceNotCheckedNote: spec.deviceNotCheckedNote,
    reporting: spec.showReportingCard
      ? {
          title: h.reportingTitle,
          body: h.reportingBody,
          helpline: h.helplineBadge,
          portalLabel: h.reportingPortalLabel,
          portalUrl: OFFICIAL_PORTAL_LINKS.cyberCrime,
        }
      : undefined,
    showBackToChecker: Boolean(spec.showBackToChecker),
    officialLinks,
    disclaimerNote: h.disclaimerNote,
  };
}
