export interface CardTilt {
  rotateX: number;
  rotateY: number;
}

/**
 * Splits a localized editorial headline into 2–3 balanced display lines
 * for crisp line-by-line reveal without breaking sentences across 12 languages.
 */
export function splitHeadlineLines(headline: string): string[] {
  const cleaned = headline.trim().replace(/\s+/g, ' ');
  if (!cleaned) return [];

  // Split on natural sentence terminators (Latin '.', Devanagari '।', Tamil/Malayalam/etc.)
  const sentenceParts = cleaned
    .split(/(?<=[.।!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (sentenceParts.length >= 2) {
    return sentenceParts.slice(0, 3);
  }

  // Fallback for single-clause localized headlines: split cleanly near midpoint on spaces
  const words = cleaned.split(' ');
  if (words.length <= 4) {
    return [cleaned];
  }

  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
}

/**
 * Clamps a numeric value between min and max.
 */
export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

/**
 * Computes bounded [0..1] scroll progress as the hero verification lens
 * transitions toward the 4-clue motif section.
 */
export function computeLensScrollProgress(
  scrollY: number,
  heroTop: number,
  heroHeight: number
): number {
  if (!Number.isFinite(scrollY) || !Number.isFinite(heroTop) || heroHeight <= 0) {
    return 0;
  }
  const travelDistance = Math.max(heroHeight * 0.72, 220);
  const raw = (scrollY - Math.max(0, heroTop - 40)) / travelDistance;
  return clamp01(raw);
}

/**
 * Calculates a subtle, calm 3D tilt (in degrees) for interactive cards/tiles only.
 * Never applied to static prose blocks or mobile viewports.
 */
export function computeCardPointerTilt(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
  maxDeg = 3.2
): CardTilt {
  if (rect.width <= 0 || rect.height <= 0 || maxDeg <= 0) {
    return { rotateX: 0, rotateY: 0 };
  }
  const nx = Math.max(-1, Math.min(1, ((clientX - rect.left) / rect.width - 0.5) * 2));
  const ny = Math.max(-1, Math.min(1, ((clientY - rect.top) / rect.height - 0.5) * 2));

  return {
    rotateX: Number((-ny * maxDeg).toFixed(2)),
    rotateY: Number((nx * maxDeg).toFixed(2)),
  };
}
