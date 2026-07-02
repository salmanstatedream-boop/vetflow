import {
  animate,
  createScope,
  createTimeline,
  onScroll,
  stagger,
  svg,
  type Scope,
  type ScrollObserver,
  type Timeline,
} from 'animejs';

export type AnimationCleanup = () => void;

export function revealOnScroll(
  targets: string | Element | Element[],
  container: HTMLElement,
  options?: {
    y?: number;
    duration?: number;
    delay?: number;
    staggerMs?: number;
  },
): ScrollObserver {
  const { y = 28, duration = 700, delay = 0, staggerMs = 60 } = options ?? {};

  return onScroll({
    target: container,
    enter: 'bottom 88%',
    leave: 'top 12%',
    onEnter: () => {
      animate(targets, {
        opacity: [0, 1],
        y: [y, 0],
        duration,
        delay: staggerMs ? stagger(staggerMs) : delay,
        ease: 'outExpo',
      });
    },
  });
}

export function drawSvgPath(
  path: SVGPathElement,
  duration = 1400,
): ReturnType<typeof animate> {
  const drawable = svg.createDrawable(path);
  return animate(drawable, {
    draw: ['0 0', '0 1', '1 1'],
    duration,
    ease: 'inOut(3)',
  });
}

export function createScopedAnimations(
  root: HTMLElement,
  setup: (scope: Scope) => void,
): AnimationCleanup {
  const scope = createScope({ root });
  scope.add((s) => {
    if (s) setup(s);
  });
  return () => scope.revert();
}

export function createHeroTimeline(
  root: HTMLElement,
  selectors: {
    dots: string;
    lines: string;
    core: string;
    nodes: string;
    labels: string;
  },
): Timeline {
  const tl = createTimeline({ defaults: { ease: 'outExpo' } });

  tl.add(root.querySelectorAll(selectors.dots), {
    opacity: [0, 1],
    scale: [0, 1],
    duration: 500,
    delay: stagger(40, { grid: [8, 8], from: 'center' }),
  })
    .add(root.querySelectorAll(selectors.lines), {
      opacity: [0, 1],
      duration: 800,
    }, '-=200')
    .add(root.querySelector(selectors.core)!, {
      scale: [0.6, 1],
      opacity: [0, 1],
      duration: 700,
      ease: 'outElastic(1, .6)',
    }, '-=400')
    .add(root.querySelectorAll(selectors.nodes), {
      scale: [0, 1],
      opacity: [0, 1],
      duration: 600,
      delay: stagger(120),
    }, '-=300')
    .add(root.querySelectorAll(selectors.labels), {
      opacity: [0, 1],
      y: [8, 0],
      duration: 500,
      delay: stagger(80),
    }, '-=200');

  return tl;
}

export function pulseLoop(target: Element, color = 'rgba(34, 211, 238, 0.6)'): AnimationCleanup {
  const anim = animate(target, {
    scale: [1, 1.15, 1],
    boxShadow: [
      `0 0 0 0 ${color.replace('0.6', '0.4')}`,
      `0 0 24px 8px ${color.replace('0.6', '0.2')}`,
      `0 0 0 0 ${color.replace('0.6', '0')}`,
    ],
    duration: 2200,
    loop: true,
    ease: 'inOutSine',
  });

  return () => anim.revert();
}
