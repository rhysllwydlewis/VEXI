'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

const EDGE_INSET = 12;
const MIN_THUMB_HEIGHT = 64;
const SCROLL_STEP = 72;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getScrollMetrics() {
  const root = document.documentElement;
  const viewportHeight = window.innerHeight;
  const scrollHeight = root.scrollHeight;
  const maxScroll = Math.max(scrollHeight - viewportHeight, 0);
  const scrollTop = window.scrollY || root.scrollTop;
  const trackHeight = Math.max(viewportHeight - EDGE_INSET * 2, 1);
  const thumbHeight = maxScroll > 0
    ? clamp((viewportHeight / scrollHeight) * trackHeight, MIN_THUMB_HEIGHT, trackHeight)
    : trackHeight;
  const travel = Math.max(trackHeight - thumbHeight, 0);
  const progress = maxScroll > 0 ? clamp(scrollTop / maxScroll, 0, 1) : 0;

  return {
    maxScroll,
    progress,
    thumbHeight,
    thumbTop: EDGE_INSET + travel * progress,
    trackHeight,
    travel,
  };
}

export default function SiteScrollbar() {
  const [metrics, setMetrics] = useState(() => ({
    maxScroll: 0,
    progress: 0,
    thumbHeight: MIN_THUMB_HEIGHT,
    thumbTop: EDGE_INSET,
    trackHeight: 1,
    travel: 0,
  }));
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartScroll = useRef(0);
  const rafRef = useRef<number | null>(null);

  const update = useCallback(() => {
    setMetrics(getScrollMetrics());
  }, []);

  const scheduleUpdate = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      update();
    });
  }, [update]);

  useEffect(() => {
    update();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(document.documentElement);
    resizeObserver.observe(document.body);

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      resizeObserver.disconnect();
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    };
  }, [scheduleUpdate, update]);

  useEffect(() => {
    if (!isDragging) return undefined;

    const handlePointerMove = (event: PointerEvent) => {
      event.preventDefault();
      const delta = event.clientY - dragStartY.current;
      const scrollDelta = metrics.travel > 0 ? (delta / metrics.travel) * metrics.maxScroll : 0;
      window.scrollTo({ top: clamp(dragStartScroll.current + scrollDelta, 0, metrics.maxScroll) });
    };

    const stopDragging = () => setIsDragging(false);

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', stopDragging, { once: true });
    window.addEventListener('pointercancel', stopDragging, { once: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopDragging);
      window.removeEventListener('pointercancel', stopDragging);
    };
  }, [isDragging, metrics.maxScroll, metrics.travel]);

  if (metrics.maxScroll <= 8) return null;

  const scrollToProgress = (progress: number, smooth = true) => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: clamp(progress, 0, 1) * metrics.maxScroll,
      behavior: smooth && !reducedMotion ? 'smooth' : 'auto',
    });
  };

  const handleTrackPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();

    if ((event.target as HTMLElement).dataset.scrollbarThumb === 'true') {
      dragStartY.current = event.clientY;
      dragStartScroll.current = window.scrollY;
      setIsDragging(true);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const clickY = event.clientY - rect.top;
    const nextProgress = metrics.travel > 0 ? (clickY - metrics.thumbHeight / 2) / metrics.travel : 0;
    scrollToProgress(nextProgress);
  };

  return (
    <div className="fixed right-2 top-3 z-[70] hidden h-[calc(100svh-1.5rem)] w-5 items-center justify-center md:flex">
      <div
        aria-label="Page scroll position"
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(metrics.progress * 100)}
        role="scrollbar"
        tabIndex={0}
        className="group relative h-full w-3 cursor-pointer rounded-full border border-white/10 bg-slate-950/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_18px_rgba(15,23,42,0.35)] backdrop-blur-md transition-colors duration-300 hover:border-blue-300/25 hover:bg-slate-900/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]"
        onPointerDown={handleTrackPointerDown}
        onKeyDown={(event) => {
          const scrollTop = window.scrollY;
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            window.scrollTo({ top: clamp(scrollTop + SCROLL_STEP, 0, metrics.maxScroll) });
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault();
            window.scrollTo({ top: clamp(scrollTop - SCROLL_STEP, 0, metrics.maxScroll) });
          }
          if (event.key === 'PageDown') {
            event.preventDefault();
            window.scrollTo({ top: clamp(scrollTop + window.innerHeight * 0.85, 0, metrics.maxScroll) });
          }
          if (event.key === 'PageUp') {
            event.preventDefault();
            window.scrollTo({ top: clamp(scrollTop - window.innerHeight * 0.85, 0, metrics.maxScroll) });
          }
          if (event.key === 'Home') {
            event.preventDefault();
            window.scrollTo({ top: 0 });
          }
          if (event.key === 'End') {
            event.preventDefault();
            window.scrollTo({ top: metrics.maxScroll });
          }
        }}
      >
        <span
          data-scrollbar-thumb="true"
          className={`pointer-events-auto absolute left-1/2 w-1.5 rounded-full bg-gradient-to-b from-blue-200 via-blue-400 to-indigo-500 shadow-[0_0_18px_rgba(96,165,250,0.55)] transition-[background,box-shadow,width] duration-300 group-hover:w-2 ${
            isDragging ? 'w-2 shadow-[0_0_26px_rgba(129,140,248,0.82)]' : ''
          }`}
          style={{
            height: `${metrics.thumbHeight}px`,
            transform: `translate(-50%, ${metrics.thumbTop - EDGE_INSET}px)`,
          }}
        />
      </div>
    </div>
  );
}
