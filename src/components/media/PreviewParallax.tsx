import { useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'motion/react';
import './PreviewParallax.css';

type Props = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  as?: 'span' | 'div' | 'section';
  enabled?: boolean;
  interactionTarget?: 'self' | 'button';
};

/** Keep layout/hit testing still; animate media and its frame on independent layers. */
export function PreviewParallax({ children, as: Tag = 'span', enabled = true, interactionTarget = 'self', className = '', ...props }: Props) {
  const root = useRef<HTMLElement | null>(null);
  // Same springs as the portrait; smaller angles suit the larger project previews.
  const rotateX = useSpring(0, { stiffness: 220, damping: 18, mass: 1 });
  const rotateY = useSpring(0, { stiffness: 220, damping: 18, mass: 1 });
  const light = useSpring(0, { stiffness: 300, damping: 26, mass: 1 });
  const lift = useSpring(1, { stiffness: 300, damping: 18, mass: 1 });
  const lightX = useMotionValue(50);
  const lightY = useMotionValue(50);
  const lightSize = useMotionValue(180);
  const x = useTransform(rotateY, value => value / 8 * 5);
  const y = useTransform(rotateX, value => -value / 8 * 5);
  const scale = useTransform([rotateX, rotateY], ([rx, ry]: number[]) => 1 + Math.max(Math.abs(rx), Math.abs(ry)) / 8 * .065);
  const opacity = useTransform(light, value => Math.max(0, Math.min(1, value)));
  const background = useMotionTemplate`radial-gradient(${lightSize}px circle at ${lightX}% ${lightY}%, rgba(255,255,255,.22), rgba(245,56,160,.06) 40%, transparent 72%)`;

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const target = interactionTarget === 'button' ? element.closest('button') ?? element : element;
    const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reset = (immediate = false) => {
      element.dataset.previewHovered = 'false';
      if (immediate) { rotateX.jump(0); rotateY.jump(0); light.jump(0); lift.jump(1); }
      else { rotateX.set(0); rotateY.set(0); light.set(0); lift.set(1); }
    };
    const move = (event: Event) => {
      const pointerEvent = event as PointerEvent;
      if (!enabled || reduced.matches || !pointer.matches || pointerEvent.pointerType === 'touch' || pointerEvent.buttons) return;
      const bounds = element.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const nx = Math.max(-1, Math.min(1, (pointerEvent.clientX - bounds.left) / bounds.width * 2 - 1));
      const ny = Math.max(-1, Math.min(1, (pointerEvent.clientY - bounds.top) / bounds.height * 2 - 1));
      element.dataset.previewHovered = 'true';
      rotateX.set(-ny * 8); rotateY.set(nx * 8);
      lightX.set((nx + 1) * 50); lightY.set((ny + 1) * 50);
      lightSize.set(Math.max(100, Math.min(240, bounds.width * .4)));
      light.set(1); lift.set(1.025);
    };
    const leave = () => reset();
    const suspend = () => reset(true);
    const visibility = () => { if (document.hidden) suspend(); };
    reset(true);
    target.addEventListener('pointerenter', move, { passive: true });
    target.addEventListener('pointermove', move, { passive: true });
    target.addEventListener('pointerleave', leave);
    target.addEventListener('pointercancel', leave);
    target.addEventListener('pointerdown', leave);
    pointer.addEventListener('change', suspend);
    reduced.addEventListener('change', suspend);
    window.addEventListener('blur', suspend);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      target.removeEventListener('pointerenter', move);
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerleave', leave);
      target.removeEventListener('pointercancel', leave);
      target.removeEventListener('pointerdown', leave);
      pointer.removeEventListener('change', suspend);
      reduced.removeEventListener('change', suspend);
      window.removeEventListener('blur', suspend);
      document.removeEventListener('visibilitychange', visibility);
      reset(true);
    };
  }, [enabled, interactionTarget, rotateX, rotateY, light, lift, lightX, lightY, lightSize]);

  return <Tag {...props} ref={node => { root.current = node; }} className={`preview-parallax ${className}`}>
    <motion.span className="preview-parallax__surface" style={{ rotateX, rotateY, scale: lift }}>
      <motion.span className="preview-parallax__content" style={{ x, y, scale }}>{children}</motion.span>
      <motion.span className="preview-parallax__light" aria-hidden="true" style={{ opacity, background }} />
    </motion.span>
  </Tag>;
}
