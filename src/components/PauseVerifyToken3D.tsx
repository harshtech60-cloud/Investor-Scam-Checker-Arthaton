import { useEffect, useRef, useState, type PointerEvent } from 'react';
import {
  ArrowDownRight,
  BadgeCheck,
  CheckCircle2,
  Globe,
  HelpCircle,
  MessageSquareText,
  ShieldAlert,
  Wallet,
} from 'lucide-react';
import type { Language, MessageCheckInput, PillarFinding, UnifiedCheckResult } from '../types/check';
import { getCopy } from '../data/translations';
import { computeLensScrollProgress } from '../utils/editorialMotion';
import { prefersReducedMotion } from '../utils/motionPreferences';
import type { PauseVerifySceneController } from '../utils/threePauseVerifyScene';

export type HeroClueId = 'message' | 'sebi' | 'link' | 'payment';

interface PauseVerifyToken3DProps {
  language: Language;
  formInput?: MessageCheckInput;
  result?: UnifiedCheckResult | null;
  isResultCurrent?: boolean;
  activeClueId?: HeroClueId | null;
  onSelectClue?: (clueId: HeroClueId) => void;
  onFocusClue?: (fieldId: string, clueId?: HeroClueId) => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

const MOTIF_CLUES: Array<{
  id: HeroClueId;
  num: string;
  fieldId: string;
  stepIndex: number;
  Icon: typeof MessageSquareText;
}> = [
  { id: 'message', num: '01', fieldId: 'msg-pitch', stepIndex: 0, Icon: MessageSquareText },
  { id: 'sebi', num: '02', fieldId: 'msg-sebi', stepIndex: 1, Icon: BadgeCheck },
  { id: 'link', num: '03', fieldId: 'msg-link', stepIndex: 2, Icon: Globe },
  { id: 'payment', num: '04', fieldId: 'msg-payment', stepIndex: 3, Icon: Wallet },
];

/**
 * Editorial 3D "Verification Lens" Hero Component:
 * - Desktop: slow continuous drift, bounded pointer parallax, and scroll-driven
 *   transition from the Verification Lens into the labeled 4-clue motif.
 * - Mobile (<640px): static lightweight 3D render without pointer effects or loop overhead.
 * - Automatically pauses off-screen, when tab is hidden, or under prefers-reduced-motion.
 */
export function PauseVerifyToken3D({
  language,
  formInput,
  result,
  isResultCurrent = false,
  activeClueId,
  onSelectClue,
  onFocusClue,
}: PauseVerifyToken3DProps) {
  const copy = getCopy(language);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<PauseVerifySceneController | null>(null);

  const [webglFallback, setWebglFallback] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [internalClueId, setInternalClueId] = useState<HeroClueId | null>(null);

  const selectedClueId = activeClueId !== undefined ? activeClueId : internalClueId;

  const handleToggleClue = (clueId: HeroClueId) => {
    if (onSelectClue) {
      onSelectClue(clueId);
    } else {
      setInternalClueId((prev) => (prev === clueId ? null : clueId));
    }
  };

  useEffect(() => {
    const stageEl = stageRef.current;
    const mountEl = canvasMountRef.current;
    if (!stageEl || !mountEl) return;

    const isMobileNow = () => window.innerWidth < 640;
    const reducedNow = prefersReducedMotion();
    stageEl.dataset.threeMode = isMobileNow() ? 'mobile' : 'desktop';
    stageEl.dataset.threeReady = 'false';
    stageEl.dataset.threePaused = String(reducedNow || isMobileNow());
    stageEl.dataset.threeFrames = '0';

    let disposed = false;
    let controller: PauseVerifySceneController | null = null;
    let cleanupListeners = () => {};

    // Keep Three.js out of the initial application bundle. The decorative hero
    // scene loads after the first paint; the existing HTML fallback stays visible
    // if the module or WebGL renderer cannot start.
    const startScene = () => {
      import('../utils/threePauseVerifyScene')
        .then(({ createPauseVerifyScene }) => {
          if (disposed) return;

          try {
            controller = createPauseVerifyScene(mountEl, isMobileNow(), reducedNow, {
              onStateChange: ({ paused, frameCount, mobile }) => {
                stageEl.dataset.threePaused = String(paused);
                stageEl.dataset.threeFrames = String(frameCount);
                stageEl.dataset.threeMode = mobile ? 'mobile' : 'desktop';
              },
            });
            controllerRef.current = controller;
            stageEl.dataset.threeReady = 'true';
          } catch {
            setWebglFallback(true);
            return;
          }

          const handleResize = () => {
            controller?.setMobileMode(isMobileNow());
            controller?.resize();
          };
          const resizeObserver =
            typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleResize) : null;
          resizeObserver?.observe(stageEl);
          window.addEventListener('resize', handleResize);

          const handleVisibility = () => {
            controller?.setTabVisible(document.visibilityState === 'visible');
          };
          document.addEventListener('visibilitychange', handleVisibility);

          const io =
            typeof IntersectionObserver !== 'undefined'
              ? new IntersectionObserver(
                  (entries) => {
                    const entry = entries[0];
                    if (entry) {
                      controller?.setInView(entry.isIntersecting);
                    }
                  },
                  { threshold: 0.02 }
                )
              : null;
          io?.observe(stageEl);

          const handleScroll = () => {
            if (isMobileNow() || prefersReducedMotion()) {
              setScrollProgress(0);
              controller?.setScrollProgress(0);
              return;
            }
            const rect = stageEl.getBoundingClientRect();
            const heroTop = window.scrollY + rect.top;
            const progress = computeLensScrollProgress(window.scrollY, heroTop, rect.height);
            setScrollProgress(progress);
            controller?.setScrollProgress(progress);
          };
          window.addEventListener('scroll', handleScroll, { passive: true });
          handleScroll();

          const mediaQuery =
            typeof window.matchMedia === 'function'
              ? window.matchMedia('(prefers-reduced-motion: reduce)')
              : null;
          const handleReducedChange = () => {
            const reduced = Boolean(mediaQuery?.matches);
            controller?.setReducedMotion(reduced);
            if (reduced) setScrollProgress(0);
          };
          mediaQuery?.addEventListener('change', handleReducedChange);

          cleanupListeners = () => {
            resizeObserver?.disconnect();
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('visibilitychange', handleVisibility);
            io?.disconnect();
            mediaQuery?.removeEventListener('change', handleReducedChange);
          };
        })
        .catch(() => {
          if (!disposed) setWebglFallback(true);
        });
    };

    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (idleWindow.requestIdleCallback && idleWindow.cancelIdleCallback) {
      const idleId = idleWindow.requestIdleCallback(startScene, { timeout: 1200 });
      return () => {
        disposed = true;
        idleWindow.cancelIdleCallback?.(idleId);
        cleanupListeners();
        controller?.dispose();
        controllerRef.current = null;
      };
    }

    const timerId = window.setTimeout(startScene, 120);
    return () => {
      disposed = true;
      window.clearTimeout(timerId);
      cleanupListeners();
      controller?.dispose();
      controllerRef.current = null;
    };
  }, []);

  const resetStageTilt = () => {
    const el = stageRef.current;
    if (el) {
      el.dataset.pointerActive = 'false';
    }
    controllerRef.current?.setPointer(0, 0, false);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    if (prefersReducedMotion()) return;
    if (typeof window !== 'undefined' && window.innerWidth < 640) return;

    const el = stageRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const nx = clamp(((e.clientX - rect.left) / rect.width - 0.5) * 2, -1, 1);
    const ny = clamp(((e.clientY - rect.top) / rect.height - 0.5) * 2, -1, 1);

    el.dataset.pointerActive = 'true';
    controllerRef.current?.setPointer(nx, ny, true);
  };

  const activeMotifIndex = Math.min(3, Math.floor(scrollProgress * 4));

  const filledMap: Record<HeroClueId, boolean> = {
    message: Boolean(formInput?.messageText.trim()),
    sebi: Boolean(formInput?.sebiClaim.trim()),
    link: Boolean(formInput?.websiteLink.trim()),
    payment: Boolean(formInput?.paymentDetail.trim() || formInput?.requestedAmountInr.trim()),
  };
  const filledCount = MOTIF_CLUES.filter((c) => filledMap[c.id]).length;

  const getPillarForClue = (clueId: HeroClueId): PillarFinding | null => {
    if (!isResultCurrent || !result) return null;
    return result.pillars.find((p) => p.id === clueId) ?? null;
  };

  const selectedClueMeta = selectedClueId
    ? MOTIF_CLUES.find((c) => c.id === selectedClueId) ?? null
    : null;
  const selectedPillar = selectedClueId ? getPillarForClue(selectedClueId) : null;
  const selectedStepInfo = selectedClueMeta
    ? copy.howItWorks.steps[selectedClueMeta.stepIndex]
    : null;

  return (
    <div
      className="isc-sheet p-4 sm:p-5 bg-[#FFFEFA] flex flex-col justify-between gap-3.5 overflow-hidden"
      aria-label={copy.hero.kicker}
    >
      {/* Editorial Frame Header */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#DFDAD0]">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#214D41]">
          {copy.messageCheck.graphTitle}
        </span>
        <span className="font-mono-data text-[11px] text-[#566B64]">
          {copy.messageCheck.cluesCount(filledCount)}
        </span>
      </div>

      {/* Interactive 3D Verification Lens Stage */}
      <div
        ref={stageRef}
        data-testid="pause-verify-3d-stage"
        data-pointer-active="false"
        data-scroll-progress={scrollProgress.toFixed(2)}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetStageTilt}
        onPointerCancel={resetStageTilt}
        className="relative w-full h-[184px] sm:h-[236px] rounded-[var(--radius-md)] border border-[#DFDAD0] overflow-hidden bg-gradient-to-br from-[#F7F5EE] via-[#F1F4EF] to-[#E4EDE7]"
        aria-hidden="true"
      >
        {/* Architectural Reticle Rings */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center transition-transform duration-200 ease-out"
          style={{
            transform: `scale(${1 + scrollProgress * 0.08})`,
          }}
        >
          <div className="w-36 h-36 sm:w-52 sm:h-52 rounded-full border border-dashed border-[#9BC4AC]/65" />
          <div className="absolute w-24 h-24 sm:w-36 sm:h-36 rounded-full border border-[#DBA14B]/25" />
        </div>

        {/* Dedicated Empty WebGL Mount Target */}
        {!webglFallback ? (
          <div ref={canvasMountRef} className="relative z-10 w-full h-full" />
        ) : (
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <svg width="96" height="106" viewBox="0 0 128 144" fill="none">
              <path
                d="M64 8L14 28V66C14 97.5 35.4 125.2 64 136C92.6 125.2 114 97.5 114 66V28L64 8Z"
                fill="#183A32"
              />
              <path
                d="M64 14L20 31.6V66C20 94 38.8 118.4 64 128.4C89.2 118.4 108 94 108 66V31.6L64 14Z"
                fill="#214D41"
                stroke="#9BC4AC"
                strokeWidth="1.5"
              />
              <rect x="34" y="42" width="44" height="54" rx="6" fill="#FFFEFA" stroke="#C9C2B4" />
              <circle
                cx="78"
                cy="84"
                r="16"
                fill="#EBF5EF"
                fillOpacity="0.88"
                stroke="#DBA14B"
                strokeWidth="4"
              />
              <path d="M90 96L104 110" stroke="#183A32" strokeWidth="5" strokeLinecap="round" />
            </svg>
          </div>
        )}
      </div>

      {/* Interactive 4-Clue Motif Connected to Form & Results */}
      <div className="space-y-2.5 pt-1">
        <div data-testid="hero-four-clue-motif" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {MOTIF_CLUES.map(({ id, num, fieldId, Icon }, idx) => {
            const label = copy.messageCheck.steps[id];
            const isSelected = selectedClueId === id;
            const isFilled = filledMap[id];
            const pillar = getPillarForClue(id);
            const isFlagged = pillar?.status === 'high_risk' || pillar?.status === 'caution';
            const isScrollHighlighted = scrollProgress > 0.12 && idx <= activeMotifIndex;

            const statusChip = pillar
              ? pillar.status === 'high_risk' || pillar.status === 'caution'
                ? copy.statusTags.highRiskBadge
                : pillar.status === 'not_provided'
                  ? copy.messageCheck.nodeEmpty
                  : copy.statusTags.notVerifiedBadge
              : isFilled
                ? copy.messageCheck.nodeEntered
                : copy.messageCheck.nodeEmpty;

            return (
              <button
                key={id}
                type="button"
                data-testid={`hero-clue-btn-${id}`}
                data-clue-state={pillar ? pillar.status : isFilled ? 'entered' : 'empty'}
                aria-pressed={isSelected}
                aria-label={`${label} — ${statusChip}`}
                onClick={() => handleToggleClue(id)}
                className={`group rounded-[var(--radius-sm)] border px-2.5 py-2 text-left transition-all duration-200 cursor-pointer isc-focus-ring flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-[#EAF4EE] border-[#214D41] ring-1 ring-[#214D41]/30 shadow-xs'
                    : isFlagged
                      ? 'bg-[#FBF1EE]/80 border-[#C86F5C] hover:border-[#214D41]'
                      : isScrollHighlighted || isFilled
                        ? 'bg-[#EAF4EE]/70 border-[#9BC4AC] hover:border-[#214D41]'
                        : 'bg-[#F7F5EE] border-[#DFDAD0] hover:bg-[#EAF4EE]/60 hover:border-[#214D41]'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono-data text-[10px] font-semibold text-[#566B64]">
                    {num}
                  </span>
                  {pillar?.status === 'high_risk' || pillar?.status === 'caution' ? (
                    <ShieldAlert
                      className="w-3.5 h-3.5 text-[#B85440] shrink-0"
                      aria-hidden="true"
                    />
                  ) : pillar?.status === 'cant_verify' ? (
                    <HelpCircle
                      className="w-3.5 h-3.5 text-[#565E5A] shrink-0"
                      aria-hidden="true"
                    />
                  ) : isFilled ? (
                    <CheckCircle2
                      className="w-3.5 h-3.5 text-[#214D41] shrink-0"
                      aria-hidden="true"
                    />
                  ) : (
                    <Icon
                      className={`w-3.5 h-3.5 transition-colors shrink-0 ${
                        isSelected || isScrollHighlighted
                          ? 'text-[#214D41]'
                          : 'text-[#566B64] group-hover:text-[#214D41]'
                      }`}
                      aria-hidden="true"
                    />
                  )}
                </div>
                <span className="text-xs font-semibold text-[#183A32] leading-tight truncate">
                  {label}
                </span>
                <span
                  className={`text-[10px] font-medium leading-tight truncate ${
                    isFlagged
                      ? 'text-[#8A3727]'
                      : isFilled
                        ? 'text-[#214D41]'
                        : 'text-[#566B64]'
                  }`}
                >
                  {isFilled || pillar ? statusChip : copy.messageCheck.nodeEmpty}
                </span>
              </button>
            );
          })}
        </div>

        {/* Inline Interactive Clue Detail & Form Link */}
        {selectedClueMeta && selectedStepInfo ? (
          <div
            data-testid="hero-clue-detail-panel"
            aria-live="polite"
            className="p-3 rounded-[var(--radius-md)] bg-[#F7F5EE] border border-[#9BC4AC] space-y-2 isc-panel-reveal"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5 min-w-0">
                <span className="font-mono-data text-[10px] font-semibold uppercase tracking-wider text-[#214D41]">
                  {selectedClueMeta.num} · {copy.messageCheck.steps[selectedClueMeta.id]}
                </span>
                <p className="text-xs font-semibold text-[#183A32] leading-snug">
                  {selectedPillar ? selectedPillar.headline[language] : selectedStepInfo.title}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#355049] leading-relaxed">
              {selectedPillar ? selectedPillar.explanation[language] : selectedStepInfo.desc}
            </p>

            {selectedPillar?.evidencePhrases && selectedPillar.evidencePhrases.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 pt-0.5">
                {selectedPillar.evidencePhrases.slice(0, 3).map((phrase) => (
                  <span
                    key={phrase}
                    className="text-[11px] font-mono-data text-[#183A32] bg-[#FFFEFA] border border-[#C9C2B4] px-2 py-0.5 rounded-[var(--radius-sm)] break-words"
                  >
                    &ldquo;{phrase}&rdquo;
                  </span>
                ))}
              </div>
            )}

            <div className="pt-0.5">
              <button
                type="button"
                data-testid="hero-clue-focus-btn"
                onClick={() => onFocusClue?.(selectedClueMeta.fieldId, selectedClueMeta.id)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#214D41] hover:underline underline-offset-4 cursor-pointer isc-focus-ring rounded"
              >
                <ArrowDownRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>
                  {copy.messageCheck.nodeFocusHint(copy.messageCheck.steps[selectedClueMeta.id])}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#355049] leading-relaxed">
            {copy.messageCheck.graphProgress(filledCount)} · {copy.messageCheck.presetsHint}
          </p>
        )}
      </div>
    </div>
  );
}
 