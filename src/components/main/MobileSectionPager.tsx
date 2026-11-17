import { useRef, type ReactNode, type RefObject } from 'react';
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'motion/react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import './MobileSectionPager.css';

type Props = {
  page: string;
  direction: number;
  disabled: boolean;
  scrollRef: RefObject<HTMLDivElement | null>;
  onSwipe: (direction: -1 | 1) => void;
  children: ReactNode;
};
type Gesture = { id: number; x: number; y: number; axis: 'x' | 'y' | null };
const nestedControl = 'input, textarea, select, [contenteditable], [role="slider"], [aria-roledescription="carousel"], .overlay-gallery, [data-section-swipe-ignore]';

function Page({ direction, scrollRef, children }: Pick<Props, 'direction' | 'scrollRef' | 'children'>) {
  const present = useIsPresent();
  const reducedMotion = useReducedMotion();
  return <motion.div className="mobile-section-page" ref={present ? scrollRef : undefined}
    aria-hidden={present ? undefined : true} inert={!present}
    custom={direction} initial="enter" animate="center" exit="exit"
    variants={{
      enter: (value: number) => ({ x: reducedMotion || !value ? 0 : `${value * 100}%` }),
      center: { x: 0 },
      exit: (value: number) => ({ x: reducedMotion || !value ? 0 : `${-value * 100}%`, transition: { duration: reducedMotion || !value ? 0 : .36, ease: [.22, 1, .36, 1] } }),
    }}
    transition={{ duration: reducedMotion || !direction ? 0 : .36, ease: [.22, 1, .36, 1] }}>
    <div className="mobile-section-content">{children}</div>
  </motion.div>;
}

/** Only touch gestures page the sections. Header clicks never enter this path. */
export default function MobileSectionPager({ page, direction, disabled, scrollRef, onSwipe, children }: Props) {
  const gesture = useRef<Gesture | null>(null);
  const suppressClickUntil = useRef(0);
  const busyUntil = useRef(0);
  const cancel = () => { gesture.current = null; };
  const down = (event: ReactPointerEvent<HTMLDivElement>) => {
    gesture.current = null;
    if (disabled || event.pointerType !== 'touch' || !event.isPrimary || Date.now() < busyUntil.current) return;
    if (event.target instanceof Element && event.target.closest(nestedControl)) return;
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, axis: null };
  };
  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = gesture.current;
    if (!current || current.id !== event.pointerId || current.axis) return;
    const dx = Math.abs(event.clientX - current.x);
    const dy = Math.abs(event.clientY - current.y);
    if (Math.max(dx, dy) < 10) return;
    current.axis = dx > dy * 1.5 ? 'x' : 'y';
    if (current.axis === 'x') {
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
  return <div className={`mobile-section-viewport${disabled ? ' is-disabled' : ''}`}
    onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={cancel}
    onClickCapture={(event) => {
      if (Date.now() >= suppressClickUntil.current) return;
      event.preventDefault(); event.stopPropagation();
    }}>
    <AnimatePresence initial={false} custom={direction}>
      <Page key={page} direction={direction} scrollRef={scrollRef}>{children}</Page>
    </AnimatePresence>
  </div>;
}
