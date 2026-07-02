'use client';

import { useEffect } from 'react';
import { createScope, type Scope } from 'animejs';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export function useHomeAnimation(
  rootRef: React.RefObject<HTMLElement | null>,
  setup: (scope: Scope, reducedMotion: boolean) => void | (() => void),
  deps: React.DependencyList = [],
) {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const scope = createScope({ root });
    let localCleanup: void | (() => void);

    scope.add(() => {
      localCleanup = setup(scope, reducedMotion);
    });

    return () => {
      if (typeof localCleanup === 'function') localCleanup();
      scope.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootRef, reducedMotion, ...deps]);
}
