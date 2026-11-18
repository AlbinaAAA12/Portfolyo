import { useEffect, useRef } from 'react';

type Gesture = { id: number; x: number; y: number; startedAt: number };

/** A deliberate downward flick dismisses from any scroll position; slow drags keep native scrolling. */
export function useSwipeDownDismiss({ enabled, onDismiss }: { enabled: boolean; onDismiss: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;
    let gesture: Gesture | null = null;
    let suppressClickUntil = 0;
    const cancel = () => { gesture = null; };
    const start = (event: TouchEvent) => {
      if (event.touches.length !== 1) { cancel(); return; }
      const touch = event.touches[0];
      gesture = { id: touch.identifier, x: touch.clientX, y: touch.clientY, startedAt: event.timeStamp };
    };
    const move = (event: TouchEvent) => {
      if (event.touches.length !== 1) cancel();
    };
    const end = (event: TouchEvent) => {
      const current = gesture;
      cancel();
      if (!current || event.touches.length) return;
      const touch = Array.from(event.changedTouches).find(item => item.identifier === current.id);
      if (!touch) return;
      const dx = Math.abs(touch.clientX - current.x);
      const dy = touch.clientY - current.y;
      const elapsed = Math.max(1, event.timeStamp - current.startedAt);
      if (dy < 80 || dy <= dx * 1.5 || elapsed > 450 || dy / elapsed < .55) return;
      // Touch events survive the pointercancel emitted when native scrolling takes over.
      // Do not cancel touchmove: reading, selection and pinch zoom stay native.
      if (event.cancelable) event.preventDefault();
      suppressClickUntil = Date.now() + 500;
      dismissRef.current();
    };
    const click = (event: MouseEvent) => {
      if (Date.now() >= suppressClickUntil) return;
      event.preventDefault();
      event.stopPropagation();
    };
    element.addEventListener('touchstart', start, { passive: true });
    element.addEventListener('touchmove', move, { passive: true });
    element.addEventListener('touchend', end, { passive: false });
    element.addEventListener('touchcancel', cancel, { passive: true });
    element.addEventListener('click', click, true);
    return () => {
      element.removeEventListener('touchstart', start);
      element.removeEventListener('touchmove', move);
      element.removeEventListener('touchend', end);
      element.removeEventListener('touchcancel', cancel);
      element.removeEventListener('click', click, true);
    };
  }, [enabled]);

  return ref;
}
