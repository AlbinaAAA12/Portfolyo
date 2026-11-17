import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, useMotionValueEvent } from 'motion/react';
import type { MotionValue } from 'motion/react';
import type { CaseId, Locale } from '../../types';
import './DesktopCaseDeck.css';

const caseOrder: CaseId[] = ['mozglab', 'spirit', 'future', 'veritas'];
const perspective = 1400;
const tilt = 14;
const depth = 180;
const minimumScale = 0.92;
export type DesktopCaseRequest = { id: CaseId; revision: number };

type DesktopCaseDeckProps = {
  locale: Locale;
  initialCase: CaseId;
  request: DesktopCaseRequest;
  disabled: boolean;
  progress: MotionValue<number>;
  sceneScale: number;
  onActiveChange: (id: CaseId) => void;
  renderCase: (id: CaseId, playbackEnabled: boolean) => ReactNode;
};

function CaseLayer({ id, index, height, travel, progress, activeIndex, reduceMotion, children }: {
  id: CaseId; index: number; height: number; travel: number; progress: MotionValue<number>; activeIndex: number;
  reduceMotion: boolean; children: ReactNode;
}) {
  const relative = useTransform(progress, (value) => index - value);
  const y = useTransform(relative, (value) => value * travel);
  const rotateX = useTransform(relative, (value) => Math.max(-1, Math.min(1, value)) * tilt);
  const z = useTransform(relative, (value) => -Math.min(Math.abs(value), 1) * depth);
  const scale = useTransform(relative, (value) => 1 - Math.min(Math.abs(value), 1) * (1 - minimumScale));
  const opacity = useTransform(relative, (value) => {
    if (value <= -1 || value > 1.3) return 0;
    return value < -0.85 ? (value + 1) / 0.15 : 1;
  });
  const visibility = useTransform(opacity, (value) => value === 0 ? 'hidden' : 'visible');
  const current = activeIndex === index;
  return <motion.div
    className="case-deck__layer"
    aria-hidden={!current}
    inert={!current}
    style={reduceMotion ? { height, y, opacity, visibility } : { height, y, rotateX, z, scale, opacity, visibility }}
    data-case={id}
  >{children}</motion.div>;
}

export default function DesktopCaseDeck({ locale, initialCase, request, disabled, progress, sceneScale, onActiveChange, renderCase }: DesktopCaseDeckProps) {
  const deckRef = useRef<HTMLDivElement>(null);
  const portRef = useRef<HTMLDivElement>(null);
  const raw = useMotionValue(caseOrder.indexOf(initialCase));
  const initialIndexRef = useRef(Math.max(0, caseOrder.indexOf(initialCase)));
  const prefersReducedMotion = useReducedMotion();
  const smooth = useSpring(raw, prefersReducedMotion ? { stiffness: 1000, damping: 1000, mass: 1 } : { stiffness: 240, damping: 38, mass: 0.7, restDelta: 0.001 });
  const visualProgress = prefersReducedMotion ? raw : smooth;
  const [{ height, bottomBleed }, setGeometry] = useState({ height: 0, bottomBleed: 0 });
  const [activeIndex, setActiveIndex] = useState(Math.max(0, caseOrder.indexOf(initialCase)));
  const activeIndexRef = useRef(Math.max(0, caseOrder.indexOf(initialCase)));
  const timerRef = useRef<number | undefined>(undefined);
  const initialized = useRef(false);
  const requestRevision = useRef(request.revision);
  const measuredHeight = useRef(0);
  const pendingResizeRatio = useRef<number | null>(null);

  useMotionValueEvent(visualProgress, 'change', (value) => progress.set(value));

  useLayoutEffect(() => {
    const deck = deckRef.current;
    const node = portRef.current;
    const viewport = deck?.closest<HTMLElement>('.scene-viewport');
    if (!deck || !node || !viewport) return;
    const update = () => {
      const nextHeight = deck.clientHeight;
      const bounds = deck.getBoundingClientRect();
      const scale = bounds.width / deck.offsetWidth;
      if (nextHeight <= 0 || scale <= 0) return;
      // Extend only the clipping area; keep the cards and scroll steps at their original size.
      const nextBleed = Math.max(0, Math.ceil((viewport.getBoundingClientRect().bottom - bounds.bottom) / scale));
      const previousHeight = measuredHeight.current;
      if (initialized.current && previousHeight > 0 && previousHeight !== nextHeight) {
        pendingResizeRatio.current = node.scrollTop / previousHeight;
      }
      measuredHeight.current = nextHeight;
      setGeometry((current) => current.height === nextHeight && current.bottomBleed === nextBleed
        ? current : { height: nextHeight, bottomBleed: nextBleed });
    };
    const observer = new ResizeObserver(update);
    observer.observe(deck);
    observer.observe(viewport);
    update();
    return () => observer.disconnect();
  }, [sceneScale]);

  useLayoutEffect(() => {
    const node = portRef.current;
    if (!node || height <= 0) return;
    if (!initialized.current) {
      const startIndex = initialIndexRef.current;
      node.scrollTop = startIndex * height;
      raw.jump(startIndex);
      smooth.jump(startIndex);
      progress.set(startIndex);
      activeIndexRef.current = startIndex;
      setActiveIndex(startIndex);
      initialized.current = true;
      return;
    }
    if (pendingResizeRatio.current !== null) {
      const position = pendingResizeRatio.current;
      pendingResizeRatio.current = null;
      node.scrollTop = position * height;
      raw.set(position);
    }
  }, [height, progress, raw, smooth]);

  const handleScroll = useCallback(() => {
    const node = portRef.current;
    const currentHeight = measuredHeight.current;
    if (!node || currentHeight <= 0) return;
    const value = Math.max(0, Math.min(caseOrder.length - 1, node.scrollTop / currentHeight));
    raw.set(value);
    const nearest = Math.round(value);
    if (activeIndexRef.current !== nearest) {
      activeIndexRef.current = nearest;
      setActiveIndex(nearest);
      onActiveChange(caseOrder[nearest]);
    }
    if (timerRef.current !== undefined) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = undefined;
      const port = portRef.current;
      if (!port || disabled || measuredHeight.current <= 0) return;
      const destination = Math.round(raw.get()) * measuredHeight.current;
      if (Math.abs(destination - port.scrollTop) > 0.5) port.scrollTo({ top: destination, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }, 200);
  }, [disabled, onActiveChange, prefersReducedMotion, raw]);

  useEffect(() => {
    const node = portRef.current;
    if (!node || !initialized.current || request.revision === requestRevision.current || measuredHeight.current <= 0) return;
    requestRevision.current = request.revision;
    const index = Math.max(0, caseOrder.indexOf(request.id));
    node.scrollTo({ top: index * measuredHeight.current, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }, [request, prefersReducedMotion, height]);

  useEffect(() => {
    if (disabled && timerRef.current !== undefined) {
      window.clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  }, [disabled]);

  useEffect(() => () => {
    if (timerRef.current !== undefined) window.clearTimeout(timerRef.current);
  }, []);

  // Account for the projected edges of tilted cards, so adjacent cards rest fully offscreen.
  const radians = tilt * Math.PI / 180;
  const entryProjection = 1 + (depth + height * Math.sin(radians)) / perspective;
  const entryTravel = (height / 2 + bottomBleed) * entryProjection
    + height * (minimumScale * Math.cos(radians) - 0.5);
  const exitTravel = height / 2 * (2 + depth / perspective);
  const travel = Math.max(height * 1.05, entryTravel, exitTravel) + 2;
  const viewportHeight = height + bottomBleed;
  const layers = caseOrder.map((id, index) => <CaseLayer key={id} id={id} index={index} height={height} travel={travel} progress={visualProgress} activeIndex={activeIndex} reduceMotion={Boolean(prefersReducedMotion)}>
    {renderCase(id, Math.abs(index - activeIndex) <= 1)}
  </CaseLayer>);

  return <div ref={deckRef} className={`case-deck${disabled ? ' is-disabled' : ''}`}>
    <div ref={portRef} className="case-deck__scrollport" style={{ bottom: -bottomBleed }} onScroll={handleScroll} tabIndex={0} role="region" aria-label={locale === 'ru' ? 'Прокрутка кейсов' : 'Scroll through cases'} aria-disabled={disabled || undefined}>
      <div className="case-deck__track" style={{ height: height * caseOrder.length + bottomBleed }}>
        <div className="case-deck__stage" style={{ height: viewportHeight, perspective, perspectiveOrigin: `50% ${height / 2}px` }}>
          {layers}
        </div>
      </div>
    </div>
  </div>;
}
