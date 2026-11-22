import type { Language, PrintableSummaryData } from '../types/check';
import { getCopy } from '../data/translations';

interface PrintableFamilySummaryProps {
  summary: PrintableSummaryData;
  language: Language;
}

export function PrintableFamilySummary({ summary, language }: PrintableFamilySummaryProps) {
  const copy = getCopy(language);
  const ps = copy.printSummary;

  return (
    <article
      aria-label={summary.docTitle}
      data-testid="printable-family-summary"
      className="hidden print:block isc-print-only bg-white text-slate-900 space-y-5 text-[13px] leading-relaxed"
    >
      {/* Print Document Header */}
      <header className="border-b-2 border-slate-900 pb-3 space-y-1.5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
          {ps.familyDocKicker}
        </p>
        <h1 className="text-xl font-bold text-slate-950">{summary.docTitle}</h1>
      </header>

      {/* Verdict Summary Box */}
      <section className="border border-slate-300 rounded-md p-3.5 bg-slate-50 space-y-1.5 break-inside-avoid">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
            {ps.verdictLabel}
          </span>
          <span className="inline-block px-2.5 py-0.5 rounded-full border border-slate-700 text-xs font-bold text-slate-950 bg-white">
            {summary.verdictBadge}
          </span>
        </div>
        <h2 className="text-base font-bold text-slate-950">{summary.verdictHeadline}</h2>
        <p className="text-slate-800">{summary.verdictSummary}</p>
        {summary.connectionNote && (
          <p className="text-xs text-slate-700 pt-1 border-t border-slate-200">
            {summary.connectionNote}
          </p>
        )}
      </section>

      {/* Findings & Redacted Evidence Phrases */}
      <section className="space-y-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wide text-slate-700 border-b border-slate-300 pb-1">
          {ps.findingsLabel}
        </h2>
        <div className="space-y-2">
          {summary.findings.map((finding, index) => (
            <div
              key={`${finding.area}-${index}`}
              className="border border-slate-300 rounded-md p-3 space-y-1 break-inside-avoid"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-slate-950">{finding.area}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded border border-slate-400 text-slate-800 bg-slate-50">
                  {finding.statusLabel}
                </span>
              </div>
              {finding.checkBasisLabel && (
                <p className="text-[11px] font-medium text-slate-600">{finding.checkBasisLabel}</p>
              )}
              <p className="text-slate-800">{finding.headline}</p>
              {finding.evidencePhrases.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {finding.evidencePhrases.map((phrase) => (
                    <span
                      key={phrase}
                      className="text-xs font-mono px-2 py-0.5 rounded border border-slate-300 bg-slate-100 text-slate-900 break-words"
                    >
                      &ldquo;{phrase}&rdquo;
                    </span>
                  ))}
                </div>
              )}
              {finding.note && <p className="text-xs text-slate-600 pt-0.5">{finding.note}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Missing / Unverified Information Notes */}
      {summary.missingInfoNotes.length > 0 && (
        <section className="border border-slate-300 rounded-md p-3 space-y-1.5 break-inside-avoid">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-700">
            {ps.missingInfoLabel}
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-slate-800">
            {summary.missingInfoNotes.map((note, idx) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Optional AI Plain-Language Review Section (Only when run in session) */}
      {summary.aiSummary && (
        <section className="border border-slate-400 rounded-md p-3.5 space-y-2 break-inside-avoid">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-1.5">
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-800">
              {ps.aiSectionLabel}
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded border border-slate-600 text-slate-950">
              {summary.aiSummary.verdictLabel}
            </span>
          </div>
          <p className="text-slate-900">{summary.aiSummary.summary}</p>
          {summary.aiSummary.insufficientEvidenceNote && (
            <p className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded p-2">
              {summary.aiSummary.insufficientEvidenceNote}
            </p>
          )}
          {summary.aiSummary.warningSigns.length > 0 && (
            <ul className="space-y-1.5">
              {summary.aiSummary.warningSigns.map((sign, idx) => (
                <li key={idx} className="text-xs text-slate-800 border-l-2 border-slate-400 pl-2.5">
                  <div className="font-bold text-slate-950">{sign.title}</div>
                  <div className="font-mono text-slate-700">&ldquo;{sign.supportingPhrase}&rdquo;</div>
                  <div>{sign.explanation}</div>
                </li>
              ))}
            </ul>
          )}
          {summary.aiSummary.practicalNextSteps.length > 0 && (
            <ol className="list-decimal pl-5 space-y-0.5 text-xs text-slate-800">
              {summary.aiSummary.practicalNextSteps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          )}
          <p className="text-[11px] text-slate-700">{summary.aiSummary.noSafeProofNote}</p>
          <p className="text-[11px] text-slate-600">{summary.aiSummary.verificationUnavailableNote}</p>
        </section>
      )}

      {/* Practical Next Steps */}
      <section className="space-y-1.5 break-inside-avoid">
        <h2 className="text-xs font-bold uppercase tracking-wide text-slate-700 border-b border-slate-300 pb-1">
          {ps.nextStepsLabel}
        </h2>
        <ol className="list-decimal pl-5 space-y-1 text-slate-900">
          {summary.nextSteps.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      </section>

      {/* Official Portals with Full Readable URLs */}
      <section className="border border-slate-300 rounded-md p-3 space-y-2 break-inside-avoid">
        <h2 className="text-xs font-bold uppercase tracking-wide text-slate-700">
          {ps.officialLinksLabel}
        </h2>
        <ul className="space-y-1.5">
          {summary.officialLinks.map((link) => (
            <li key={link.url} className="text-xs">
              <div className="font-bold text-slate-950">{link.label}</div>
              <div className="font-mono text-emerald-900 break-all">{link.url}</div>
              <div className="text-slate-700">{link.desc}</div>
            </li>
          ))}
        </ul>
      </section>

      {/* Privacy Exclusion & Demo Disclosures */}
      <footer className="border-t border-slate-300 pt-2.5 space-y-1 text-[11px] text-slate-700">
        <p className="font-semibold text-slate-900">{summary.privacyExclusionNote}</p>
        <p>{summary.demoLimitNote}</p>
      </footer>
    </article>
  );
}
