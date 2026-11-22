import { useCallback, useState, type PointerEvent } from 'react';
import { computeCardPointerTilt } from './editorialMotion';
import { prefersReducedMotion } from './motionPreferences';

export function useCardTilt(maxDeg = 2.8) {
  const [tilt, setTilt] = useState<{ rotateX: number; rotateY: number; active: boolean }>({
    rotateX: 0,
    rotateY: 0,
    active: false,
  });

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (e.pointerType !== 'mouse') return;
      if (typeof window !== 'undefined' && (window.innerWidth < 640 || prefersReducedMotion())) {
        return;
      }
      const rect = e.currentTarget.getBoundingClientRect();
      const next = computeCardPointerTilt(e.clientX, e.clientY, rect, maxDeg);
      setTilt({ rotateX: next.rotateX, rotateY: next.rotateY, active: true });
    },
    [maxDeg]
  );

  const resetTilt = useCallback(() => {
    setTilt((prev) => (prev.active ? { rotateX: 0, rotateY: 0, active: false } : prev));
  }, []);

  const tiltStyle = tilt.active
    ? {
        transform: `perspective(820px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateY(-4px)`,
      }
    : undefined;

  return {
    tiltStyle,
    isTilted: tilt.active,
    tiltHandlers: {
      onPointerMove,
      onPointerLeave: resetTilt,
      onPointerCancel: resetTilt,
    },
  };
}
