import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Globe,
  HelpCircle,
  MessageSquareText,
  Wallet,
} from 'lucide-react';
import { motion } from 'motion/react';
import type { Language } from '../types/check';
import { getCopy } from '../data/translations';
import { ScrollReveal } from './ScrollReveal';

interface HowItWorksViewProps {
  language: Language;
  onStartCheck: () => void;
}

export function HowItWorksView({ language, onStartCheck }: HowItWorksViewProps) {
  const copy = getCopy(language);
  const icons = [MessageSquareText, BadgeCheck, Globe, Wallet];

  return (
    <div className="space-y-8">
      {/* Editorial Intro */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl space-y-2.5 pb-6 border-b border-[#DFDAD0]"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-[#214D41]">
          {copy.howItWorks.kicker}
        </p>
        <h1 className="font-editorial text-3xl sm:text-[2.3rem] font-semibold tracking-tight text-[#183A32] text-balance leading-[1.15]">
          {copy.howItWorks.title}
        </h1>
        <p className="text-sm sm:text-base text-[#355049] leading-relaxed">
          {copy.howItWorks.subtitle}
        </p>
      </motion.section>

      {/* 4-Part Visual Sequence */}
      <section aria-labelledby="connection-diagram-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2
            id="connection-diagram-heading"
            className="font-editorial text-xl sm:text-2xl font-semibold text-[#183A32]"
          >
            {copy.howItWorks.diagramTitle}
          </h2>
          <button
            type="button"
            onClick={onStartCheck}
            className="isc-btn-primary whitespace-nowrap shrink-0"
          >
            <span>{copy.nav.checkMessage}</span>
            <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {copy.howItWorks.steps.map((step, index) => {
            const StepIcon = icons[index];
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0.2, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.22,
                  delay: 0.04 + index * 0.045,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="isc-sheet p-5 flex flex-col justify-between gap-4 hover:border-[#9BC4AC] transition-colors duration-200"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono-data text-xs font-semibold text-[#214D41]">
                      {step.num}
                    </span>
                    <span className="w-9 h-9 rounded-[var(--radius-md)] bg-[#D8EBDF] border border-[#9BC4AC] flex items-center justify-center text-[#183A32]">
                      <StepIcon className="w-4 h-4" aria-hidden="true" />
                    </span>
                  </div>
                  <h3 className="font-editorial text-lg font-semibold text-[#183A32] leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#355049] leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {/* Subtle Sequence Track */}
                <div className="pt-2 border-t border-[#DFDAD0] flex items-center gap-1.5" aria-hidden="true">
                  {[0, 1, 2, 3].map((slot) => (
                    <span
                      key={slot}
                      className={`h-1.5 flex-1 rounded-sm ${
                        slot <= index ? 'bg-[#214D41]' : 'bg-[#EAE6DC]'
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Transparent Demo Scope vs Official Live Verification */}
      <ScrollReveal>
      <section aria-labelledby="demo-scope-heading" className="space-y-4">
        <h2
          id="demo-scope-heading"
          className="font-editorial text-xl sm:text-2xl font-semibold text-[#183A32]"
        >
          {copy.howItWorks.scopeTitle}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="isc-sheet p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#DFDAD0]">
              <span className="w-8 h-8 rounded-[var(--radius-md)] bg-[#D8EBDF] border border-[#9BC4AC] text-[#214D41] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              </span>
              <h3 className="font-editorial text-lg font-semibold text-[#183A32]">
                {copy.howItWorks.canDoTitle}
              </h3>
            </div>
            <ul className="space-y-3 divide-y divide-[#DFDAD0]">
              {copy.howItWorks.canDoList.map((item, idx) => (
                <li
                  key={idx}
                  className="pt-3 first:pt-0 text-sm text-[#355049] leading-relaxed"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="isc-sheet p-5 sm:p-6 space-y-4 bg-[#FBF9F4]">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#DFDAD0]">
              <span className="w-8 h-8 rounded-[var(--radius-md)] bg-[#EFECE3] border border-[#C4BEB2] text-[#3F4744] flex items-center justify-center shrink-0">
                <HelpCircle className="w-4 h-4" aria-hidden="true" />
              </span>
              <h3 className="font-editorial text-lg font-semibold text-[#183A32]">
                {copy.howItWorks.cannotDoTitle}
              </h3>
            </div>
            <ul className="space-y-3 divide-y divide-[#DFDAD0]">
              {copy.howItWorks.cannotDoList.map((item, idx) => (
                <li
                  key={idx}
                  className="pt-3 first:pt-0 text-sm text-[#355049] leading-relaxed"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* Common Indian Retail Investor Patterns */}
      <ScrollReveal delay={0.05}>
      <section aria-labelledby="common-patterns-heading" className="space-y-4">
        <h2
          id="common-patterns-heading"
          className="font-editorial text-xl sm:text-2xl font-semibold text-[#183A32]"
        >
          {copy.howItWorks.patternsTitle}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {copy.howItWorks.patterns.map((pattern, idx) => (
            <article key={idx} className="isc-sheet p-5 sm:p-6 space-y-2.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#794D0C]">
                <AlertTriangle
                  className="w-4 h-4 shrink-0 text-[#B3771B]"
                  aria-hidden="true"
                />
                <span>{copy.howItWorks.patternTag}</span>
              </div>
              <h3 className="font-editorial text-lg font-semibold text-[#183A32]">
                {pattern.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#355049] leading-relaxed">
                {pattern.desc}
              </p>
            </article>
          ))}
        </div>
      </section>
      </ScrollReveal>
    </div>
  );
}
