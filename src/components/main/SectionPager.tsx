import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'motion/react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import './SectionPager.css';

type Props = {
  desktop: boolean;
  page: string;
  direction: number;
  disabled: boolean;
  scrollRef: RefObject<HTMLDivElement | null>;
  onSwipe: (direction: -1 | 1) => void;
  children: ReactNode;
};
type Gesture = { id: number; x: number; y: number; axis: 'x' | 'y' | null };
const nestedControl = 'input, textarea, select, [contenteditable], [role="slider"], [aria-roledescription="carousel"], .overlay-gallery, [data-section-swipe-ignore]';

function Page({ desktop, page, direction, scrollRef, children }: Pick<Props, 'desktop' | 'page' | 'direction' | 'scrollRef' | 'children'>) {
  const present = useIsPresent();
  const reducedMotion = useReducedMotion();
  const prefix = desktop ? 'desktop' : 'mobile';
  return <motion.div className={`${prefix}-section-page${page === 'resume' ? ' is-resume' : ''}`} ref={present ? scrollRef : undefined}
    aria-hidden={present ? undefined : true} inert={!present}
    custom={direction} initial="enter" animate="center" exit="exit"
    variants={{
      enter: (value: number) => ({ x: reducedMotion || !value ? 0 : `${value * 100}%` }),
      center: { x: 0 },
      exit: (value: number) => ({ x: reducedMotion || !value ? 0 : `${-value * 100}%`, transition: { duration: reducedMotion || !value ? 0 : .36, ease: [.22, 1, .36, 1] } }),
    }}
    transition={{ duration: reducedMotion || !direction ? 0 : .36, ease: [.22, 1, .36, 1] }}>
    <div className={`${prefix}-section-content`}>{children}</div>
  </motion.div>;
}

/** Header clicks never enter the gesture path. Nested carousels retain their gestures. */
export default function SectionPager({ desktop, page, direction, disabled, scrollRef, onSwipe, children }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [pageHeight, setPageHeight] = useState(668);
  const gesture = useRef<Gesture | null>(null);
  const suppressClickUntil = useRef(0);
  const busyUntil = useRef(0);
  const callbacks = useRef({ disabled, onSwipe });
  callbacks.current = { disabled, onSwipe };
  const ignored = (target: EventTarget | null, mouse = false) => target instanceof Element && !!target.closest(
    `${nestedControl}${desktop ? ', .collage-panel, .project-rail' : ''}${mouse ? ', button, a, [role="button"]' : ''}`,
  );
  useLayoutEffect(() => {
    const frame = frameRef.current;
    const viewport = frame?.closest('.scene-viewport');
    if (!desktop || !frame || !viewport) return;
    const measure = () => {
      const bounds = frame.getBoundingClientRect();
      const scale = bounds.width / frame.offsetWidth;
      if (scale > 0) setPageHeight(Math.max(668, (window.innerHeight - bounds.top) / scale));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(frame); observer.observe(viewport);
    measure();
    return () => observer.disconnect();
  }, [desktop]);
  useEffect(() => {
    const frame = frameRef.current;
    if (!desktop || !frame) return;
    let lastEvent = 0, distance = 0, fired = false;
    const wheel = (event: WheelEvent) => {
      const now = Date.now();
      if (now - lastEvent > 220) { distance = 0; fired = false; }
      lastEvent = now;
      if (callbacks.current.disabled || event.ctrlKey || ignored(event.target) || Math.abs(event.deltaX) <= Math.abs(event.deltaY) * 1.5) return;
      event.preventDefault();
      if (fired || now < busyUntil.current) return;
      const delta = event.deltaX * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerWidth : 1);
      if (Math.sign(delta) !== Math.sign(distance)) distance = 0;
      distance += delta;
      if (Math.abs(distance) < 80) return;
      fired = true; busyUntil.current = now + 400;
      callbacks.current.onSwipe(distance > 0 ? 1 : -1);
    };
    frame.addEventListener('wheel', wheel, { passive: false });
    return () => frame.removeEventListener('wheel', wheel);
  }, [desktop]);
  const cancel = () => { gesture.current = null; };
  const down = (event: ReactPointerEvent<HTMLDivElement>) => {
    gesture.current = null;
    const mouse = event.pointerType === 'mouse';
    if (disabled || (!desktop && event.pointerType !== 'touch') || !event.isPrimary || (mouse && event.button !== 0) || Date.now() < busyUntil.current) return;
    if (ignored(event.target, mouse)) return;
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, axis: null };
  };
  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = gesture.current;
    if (!current || current.id !== event.pointerId) return;
    if (current.axis === 'x') { event.preventDefault(); return; }
    if (current.axis === 'y') return;
    const dx = Math.abs(event.clientX - current.x);
    const dy = Math.abs(event.clientY - current.y);
    if (Math.max(dx, dy) < 10) return;
    current.axis = dx > dy * 1.5 ? 'x' : 'y';
    if (current.axis === 'x') {
      event.preventDefault();
      try { event.currentTarget.setPointerCapture(event.pointerId); }
      catch { /* The browser may have already released or canceled the pointer. */ }
    }
  };
  const up = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = gesture.current;
    cancel();
    if (!current || current.id !== event.pointerId || current.axis !== 'x' || disabled) return;
    // Suppress the link/button click generated after any horizontal drag.
    suppressClickUntil.current = Date.now() + 450;
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    if (Math.abs(dx) < Math.max(48, Math.min(100, event.currentTarget.clientWidth * .18)) || Math.abs(dx) <= Math.abs(dy) * 1.5) return;
    busyUntil.current = Date.now() + 400;
    onSwipe(dx < 0 ? 1 : -1);
  };
  return <div className={`${desktop ? 'desktop' : 'mobile'}-section-viewport${disabled ? ' is-disabled' : ''}`}
    ref={frameRef} data-desktop={desktop || undefined}
    onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={cancel}
    onClickCapture={(event) => {
      if (Date.now() >= suppressClickUntil.current) return;
      event.preventDefault(); event.stopPropagation();
    }}
    onDragStart={(event) => { if (desktop && !ignored(event.target, true)) event.preventDefault(); }}>
    <div className="section-pages" style={desktop ? { height: pageHeight } : undefined}>
      <AnimatePresence initial={false} custom={direction}>
        <Page key={page} page={page} desktop={desktop} direction={direction} scrollRef={scrollRef}>{children}</Page>
      </AnimatePresence>
    </div>
  </div>;
}
