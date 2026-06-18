'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function jumpToTop() {
  const root = document.documentElement;
  const previousScrollBehaviour = root.style.scrollBehavior;

  root.style.scrollBehavior = 'auto';
  window.scrollTo({ left: 0, top: 0, behavior: 'auto' });
  root.style.scrollBehavior = previousScrollBehaviour;
}

export default function InitialScrollTop() {
  const pathname = usePathname();

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    if (window.location.hash) return undefined;

    jumpToTop();
    const firstFrame = window.requestAnimationFrame(jumpToTop);
    const secondPass = window.setTimeout(jumpToTop, 80);

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.clearTimeout(secondPass);
    };
  }, [pathname]);

  return null;
}
