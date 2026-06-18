'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function withInstantScroll(action: () => void) {
  const root = document.documentElement;
  const previousScrollBehaviour = root.style.scrollBehavior;

  root.style.scrollBehavior = 'auto';
  action();
  root.style.scrollBehavior = previousScrollBehaviour;
}

function jumpToTop() {
  withInstantScroll(() => {
    window.scrollTo({ left: 0, top: 0, behavior: 'auto' });
  });
}

function jumpToAnchor() {
  const anchor = window.location.hash.slice(1);
  if (!anchor) return false;

  const target = document.getElementById(anchor);
  if (!target) return false;

  withInstantScroll(() => {
    target.scrollIntoView({ block: 'start', behavior: 'auto' });
  });

  return true;
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
    const runScroll = () => {
      if (window.location.hash) {
        jumpToAnchor();
      } else {
        jumpToTop();
      }
    };

    const firstFrame = window.requestAnimationFrame(runScroll);
    const secondPass = window.setTimeout(runScroll, 80);
    const finalPass = window.setTimeout(runScroll, 220);

    const handleHashChange = () => {
      window.requestAnimationFrame(jumpToAnchor);
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.clearTimeout(secondPass);
      window.clearTimeout(finalPass);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [pathname]);

  return null;
}
