import { motion } from 'motion/react';
import { ArrowRight, BookOpen, ExternalLink, HeartHandshake, ShieldCheck } from 'lucide-react';
import type { Language } from '../types/check';
import { getCopy } from '../data/translations';
import { OfficialSourcesCard } from './OfficialSourcesCard';
import { ScrollReveal } from './ScrollReveal';

interface AboutViewProps {
  language: Language;
  onStartCheck: () => void;
}

const RESOURCE_URLS = [
  'https://investor.sebi.gov.in/Investor-support.html',
  'https://scores.sebi.gov.in/',
  'https://cybercrime.gov.in/',
  'https://sachet.rbi.org.in/',
] as const;

export function AboutView({ language, onStartCheck }: AboutViewProps) {
  const copy = getCopy(language);
  const principleIcons = [HeartHandshake, ShieldCheck, BookOpen];

  return (
    <div className="space-y-8">
      {/* Human, Concise Editorial Intro */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl space-y-2.5 pb-6 border-b border-[#DFDAD0]"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-[#214D41]">
          {copy.about.kicker}
        </p>
        <h1 className="font-editorial text-3xl sm:text-[2.3rem] font-semibold tracking-tight text-[#183A32] text-balance leading-[1.15]">
          {copy.about.title}
        </h1>
        <p className="text-sm sm:text-base text-[#355049] leading-relaxed">
          {copy.about.intro}
        </p>
      </motion.section>

      {/* Design Principles */}
      <section aria-labelledby="principles-heading" className="space-y-4">
        <h2
          id="principles-heading"
          className="font-editorial text-xl sm:text-2xl font-semibold text-[#183A32]"
        >
          {copy.about.principlesTitle}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {copy.about.principles.map((item, index) => {
            const Icon = principleIcons[index];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0.2, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.22,
                  delay: 0.04 + index * 0.045,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="isc-sheet p-5 sm:p-6 space-y-3 hover:border-[#9BC4AC] transition-colors duration-200"
              >
                <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[#D8EBDF] border border-[#9BC4AC] text-[#183A32] flex items-center justify-center">
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </div>
                <h3 className="font-editorial text-lg font-semibold text-[#183A32]">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#355049] leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Prominent Official Verification Portals */}
      <ScrollReveal>
        <OfficialSourcesCard language={language} />
      </ScrollReveal>

      {/* Official Indian Verification & Reporting Directory */}
      <ScrollReveal delay={0.05}>
      <section aria-labelledby="directory-heading" className="isc-sheet p-5 sm:p-7 space-y-5">
        <div className="space-y-1.5">
          <h2
            id="directory-heading"
            className="font-editorial text-xl font-semibold text-[#183A32]"
          >
            {copy.about.directoryTitle}
          </h2>
          <p className="text-sm text-[#355049]">{copy.about.directoryNote}</p>
        </div>

        <div className="divide-y divide-[#DFDAD0] border-t border-b border-[#DFDAD0]">
          {copy.about.resources.map((res, idx) => (
            <a
              key={idx}
              href={RESOURCE_URLS[idx] ?? 'https://investor.sebi.gov.in/'}
              target="_blank"
              rel="noopener noreferrer"
              className="py-4 px-2 -mx-2 rounded-[var(--radius-sm)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:bg-[#EAF4EE]/60 transition-colors isc-focus-ring group"
            >
              <div>
                <h3 className="text-base font-semibold text-[#183A32] group-hover:text-[#214D41] transition-colors">
                  {res.name}
                </h3>
                <p className="text-sm text-[#355049] mt-0.5">{res.detail}</p>
              </div>
              <ExternalLink
                className="w-4 h-4 text-[#214D41] shrink-0 hidden sm:block transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </a>
          ))}
        </div>

        <div className="pt-1">
          <button
            type="button"
            onClick={onStartCheck}
            className="isc-btn-primary"
          >
            <span>{copy.nav.checkMessage}</span>
            <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          </button>
        </div>
      </section>
      </ScrollReveal>
    </div>
  );
}
