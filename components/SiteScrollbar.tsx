'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';

const EDGE_INSET = 14;
const MIN_THUMB_HEIGHT = 78;
const SCROLL_STEP = 96;
const PAGE_SCROLL_FACTOR = 0.88;

interface ScrollMetrics {
  maxScroll: number;
  progress: number;
  thumbHeight: number;
  thumbTop: number;
  trackHeight: number;
  travel: number;
}

const INITIAL_METRICS: ScrollMetrics = {
  maxScroll: 0,
  progress: 0,
  thumbHeight: MIN_THUMB_HEIGHT,
  thumbTop: EDGE_INSET,
  trackHeight: 1,
  travel: 0,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getScrollMetrics(): ScrollMetrics {
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
  const [metrics, setMetrics] = useState<ScrollMetrics>(INITIAL_METRICS);
  const [isDragging, setIsDragging] = useState(false);
  const metricsRef = useRef<ScrollMetrics>(INITIAL_METRICS);
  const dragStartY = useRef(0);
  const dragStartScroll = useRef(0);
  const rafRef = useRef<number | null>(null);

  const commitMetrics = useCallback((nextMetrics: ScrollMetrics) => {
    metricsRef.current = nextMetrics;
    setMetrics(nextMetrics);
  }, []);

  const update = useCallback(() => {
    commitMetrics(getScrollMetrics());
  }, [commitMetrics]);

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

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(scheduleUpdate);
      resizeObserver.observe(document.documentElement);
      resizeObserver.observe(document.body);
    }

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      resizeObserver?.disconnect();
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    };
  }, [scheduleUpdate, update]);

  useEffect(() => {
    if (!isDragging) return undefined;

    document.documentElement.style.cursor = 'grabbing';
    document.documentElement.style.userSelect = 'none';

    const handlePointerMove = (event: PointerEvent) => {
      event.preventDefault();
      const liveMetrics = metricsRef.current;
      const delta = event.clientY - dragStartY.current;
      const scrollDelta = liveMetrics.travel > 0 ? (delta / liveMetrics.travel) * liveMetrics.maxScroll : 0;
      window.scrollTo({ top: clamp(dragStartScroll.current + scrollDelta, 0, liveMetrics.maxScroll) });
      scheduleUpdate();
    };

    const stopDragging = () => {
      document.documentElement.style.cursor = '';
      document.documentElement.style.userSelect = '';
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', stopDragging, { once: true });
    window.addEventListener('pointercancel', stopDragging, { once: true });

    return () => {
      document.documentElement.style.cursor = '';
      document.documentElement.style.userSelect = '';
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopDragging);
      window.removeEventListener('pointercancel', stopDragging);
    };
  }, [isDragging, scheduleUpdate]);

  if (metrics.maxScroll <= 8) return null;

  const scrollToProgress = (progress: number, smooth = true) => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: clamp(progress, 0, 1) * metrics.maxScroll,
      behavior: smooth && !reducedMotion ? 'smooth' : 'auto',
    });
    scheduleUpdate();
  };

  const scrollToPosition = (top: number) => {
    window.scrollTo({ top: clamp(top, 0, metrics.maxScroll) });
    scheduleUpdate();
  };

  const startDrag = (clientY: number) => {
    dragStartY.current = clientY;
    dragStartScroll.current = window.scrollY;
    setIsDragging(true);
  };

  const handleTrackPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);

    if ((event.target as HTMLElement).dataset.scrollbarThumb === 'true') {
      startDrag(event.clientY);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const clickY = event.clientY - rect.top;
    const nextProgress = metrics.travel > 0 ? (clickY - metrics.thumbHeight / 2) / metrics.travel : 0;
    scrollToProgress(nextProgress);
  };

  return (
    <div className="fixed right-1.5 top-3 z-[70] flex h-[calc(100svh-1.5rem)] w-7 items-center justify-center sm:right-2.5 sm:w-8 lg:right-3 lg:top-4 lg:h-[calc(100svh-2rem)] lg:w-9">
      <div
        aria-label="Page scroll position"
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(metrics.progress * 100)}
        role="scrollbar"
        tabIndex={0}
        className="group relative h-full w-3.5 cursor-pointer touch-none rounded-full border border-white/10 bg-slate-950/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_22px_rgba(15,23,42,0.42)] backdrop-blur-md transition-[width,border-color,background-color,box-shadow] duration-200 hover:w-4 hover:border-blue-300/30 hover:bg-slate-900/65 focus:w-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617] sm:w-4 sm:hover:w-5 sm:focus:w-5"
        onPointerDown={handleTrackPointerDown}
        onKeyDown={(event) => {
          const scrollTop = window.scrollY;
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            scrollToPosition(scrollTop + SCROLL_STEP);
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault();
            scrollToPosition(scrollTop - SCROLL_STEP);
          }
          if (event.key === 'PageDown') {
            event.preventDefault();
            scrollToPosition(scrollTop + window.innerHeight * PAGE_SCROLL_FACTOR);
          }
          if (event.key === 'PageUp') {
            event.preventDefault();
            scrollToPosition(scrollTop - window.innerHeight * PAGE_SCROLL_FACTOR);
          }
          if (event.key === 'Home') {
            event.preventDefault();
            scrollToPosition(0);
          }
          if (event.key === 'End') {
            event.preventDefault();
            scrollToPosition(metrics.maxScroll);
          }
        }}
      >
        <span
          data-scrollbar-thumb="true"
          className={`pointer-events-auto absolute left-1/2 w-2.5 rounded-full bg-gradient-to-b from-blue-100 via-blue-400 to-indigo-500 shadow-[0_0_18px_rgba(96,165,250,0.58)] transition-[background,box-shadow,width,opacity] duration-200 group-hover:w-3 group-focus:w-3 sm:w-3 sm:group-hover:w-3.5 sm:group-focus:w-3.5 ${
            isDragging ? 'w-3.5 shadow-[0_0_30px_rgba(129,140,248,0.86)] sm:w-4' : ''
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
