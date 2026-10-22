import { useCallback, useEffect, useRef, type DragEvent as ReactDragEvent, type PointerEvent as ReactPointerEvent } from 'react';

type SwipeOptions = {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
};

type Gesture = { pointerId: number; x: number; y: number; direction?: 'left' | 'right'; captured: boolean };

const INTERACTIVE_SELECTOR = 'button, a, input, textarea, select, [contenteditable="true"], [role="button"]';

/** Pointer handlers for horizontal swipes that leave vertical scrolling alone. */
export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 48 }: SwipeOptions = {}) {
  const callbacks = useRef({ onSwipeLeft, onSwipeRight, threshold });
  callbacks.current = { onSwipeLeft, onSwipeRight, threshold };
  const gesture = useRef<Gesture | null>(null);
  const suppressClick = useRef(false);
  const suppressionTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => {
    if (suppressionTimer.current) clearTimeout(suppressionTimer.current);
  }, []);

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    const target = event.target;
    if (target instanceof Element && target.closest(INTERACTIVE_SELECTOR)) return;
    gesture.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, captured: false };
  }, []);

  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const current = gesture.current;
    if (!current || current.pointerId !== event.pointerId || current.direction) return;
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    if (Math.abs(dx) < callbacks.current.threshold || Math.abs(dx) <= Math.abs(dy) * 1.25) return;
    current.direction = dx < 0 ? 'left' : 'right';
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
      current.captured = true;
    } catch {
      // Capture may fail if the browser has already canceled the pointer.
    }
  }, []);

  const onPointerUp = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const current = gesture.current;
    if (!current || current.pointerId !== event.pointerId) return;
    gesture.current = null;
    if (current.direction) {
      suppressClick.current = true;
      if (suppressionTimer.current) clearTimeout(suppressionTimer.current);
      suppressionTimer.current = setTimeout(() => { suppressClick.current = false; }, 700);
      if (current.direction === 'left') callbacks.current.onSwipeLeft?.();
      else callbacks.current.onSwipeRight?.();
    }
  }, []);

  const onPointerCancel = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (gesture.current?.pointerId === event.pointerId) gesture.current = null;
  }, []);

  const onDragStart = useCallback((event: ReactDragEvent<HTMLElement>) => {
    const target = event.target;
    if (!(target instanceof Element) || target.closest(INTERACTIVE_SELECTOR)) return;
    if (target.closest('img')) event.preventDefault();
  }, []);

  const onClickCapture = useCallback((event: React.MouseEvent<HTMLElement>) => {
    if (!suppressClick.current) return;
    suppressClick.current = false;
    if (suppressionTimer.current) clearTimeout(suppressionTimer.current);
    event.preventDefault();
    event.stopPropagation();
  }, []);

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onDragStart, onClickCapture };
}
