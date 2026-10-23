import { memo, useEffect, useRef, useState, type CSSProperties, type FocusEvent, type KeyboardEvent, type PointerEvent } from 'react';
import type { CaseId, Locale } from '../../types';
import { asset } from '../../lib/assets';
import type { VideoKey } from '../../lib/media';
import { ProjectMedia } from '../media/ProjectMedia';
import './ProjectCollage.css';

type ProjectCollageItem = { id: CaseId; file: string; media?: VideoKey };

const CARD_WIDTH = 480;
const CARD_STEP = 112;
const CYCLE_WIDTH = CARD_STEP * 5;
const SLOT_INDICES = Array.from({ length: 18 }, (_, index) => index - 8);
const CARD_ASPECT_RATIOS: Record<CaseId, number> = {
  future: 209 / 118,
  spirit: 3008 / 2066,
  mozglab: 1255 / 802,
  veritas: 792 / 415,
  outsourcing: 1128 / 803,
};

function wrapMotion(value: number) {
  return ((value % CYCLE_WIDTH) + CYCLE_WIDTH) % CYCLE_WIDTH;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

const ProjectCollageMedia = memo(function ProjectCollageMedia({
  media,
  poster,
  playbackEnabled,
}: {
  media?: VideoKey;
  poster: string;
  playbackEnabled: boolean;
}) {
  if (media) return <ProjectMedia media={media} poster={poster} alt="" playbackEnabled={playbackEnabled} />;
  return <img src={asset(poster)} alt="" />;
});

export default function ProjectCollage({
  projects,
  locale,
  caseName,
  onCase,
  playbackEnabled,
}: {
  projects: ProjectCollageItem[];
  locale: Locale;
  caseName: (id: CaseId) => string;
  onCase: (id: CaseId) => void;
  playbackEnabled: boolean;
}) {
  const root = useRef<HTMLElement>(null);
  const plane = useRef<HTMLDivElement>(null);
  const drag = useRef<{ pointerId: number; x: number; moved: number } | null>(null);
  const suppressClick = useRef(false);
  const motionRef = useRef(0);
  const pendingDelta = useRef(0);
  const frame = useRef<number | null>(null);
  const interactionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interactionRef = useRef(false);
  const [sceneScale, setSceneScale] = useState(1);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  const beginInteraction = () => {
    interactionRef.current = true;
    setIsInteracting(true);
    setActiveSlot(null);
    if (interactionTimer.current) clearTimeout(interactionTimer.current);
    interactionTimer.current = setTimeout(() => {
      interactionRef.current = false;
      interactionTimer.current = null;
      setIsInteracting(false);
    }, 180);
  };

  const moveBy = (amount: number, bounded = false) => {
    const pending = pendingDelta.current + amount;
    pendingDelta.current = bounded ? clamp(pending, -CARD_STEP, CARD_STEP) : pending;
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const delta = pendingDelta.current;
      pendingDelta.current = 0;
      if (!delta) return;
      const next = wrapMotion(motionRef.current + delta);
      motionRef.current = next;
      plane.current?.style.setProperty('--project-collage-motion-x', `${next}px`);
      plane.current?.style.setProperty('--project-collage-motion-y', `${-next * .62}px`);
    });
  };

  const getEffectiveScale = () => {
    const width = root.current?.getBoundingClientRect().width ?? 0;
    return width > 0 ? width / 592 : sceneScale;
  };

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0) setSceneScale(entry.contentRect.width / 592);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      const rawDelta = Math.abs(event.deltaX) >= Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (!rawDelta) return;
      const factor = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 592 : 1;
      const logicalDelta = rawDelta * factor / getEffectiveScale();
      const amount = Math.abs(logicalDelta) >= 80
        ? -Math.sign(logicalDelta) * CARD_STEP
        : -logicalDelta * .8;
      if (!amount) return;
      beginInteraction();
      moveBy(amount, true);
      event.preventDefault();
    };
    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => element.removeEventListener('wheel', handleWheel);
  }, [sceneScale]);

  useEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    if (interactionTimer.current) clearTimeout(interactionTimer.current);
  }, []);

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    if (event.pointerType === 'touch') setActiveSlot(null);
    drag.current = { pointerId: event.pointerId, x: event.clientX, moved: 0 };
    suppressClick.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (slot: number, event: PointerEvent<HTMLButtonElement>) => {
    const activeDrag = drag.current;
    if (activeDrag && activeDrag.pointerId === event.pointerId) {
      const delta = event.clientX - activeDrag.x;
      activeDrag.x = event.clientX;
      activeDrag.moved += Math.abs(delta);
      if (activeDrag.moved > 6) {
        beginInteraction();
        suppressClick.current = true;
        if (delta) moveBy(delta / getEffectiveScale());
      }
      return;
    }
    if (event.pointerType !== 'touch' && !interactionRef.current && activeSlot !== slot) setActiveSlot(slot);
  };

  const endPointer = (event: PointerEvent<HTMLButtonElement>) => {
    if (drag.current?.pointerId !== event.pointerId) return;
    if (event.type === 'pointercancel' && drag.current.moved > 6) suppressClick.current = true;
    drag.current = null;
    const bounds = root.current?.getBoundingClientRect();
    if (bounds && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) {
      setActiveSlot(null);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      beginInteraction();
      moveBy(CARD_STEP);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      beginInteraction();
      moveBy(-CARD_STEP);
    }
  };

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setActiveSlot(null);
  };

  const style = {
    '--project-collage-scale': sceneScale,
  } as CSSProperties & Record<`--${string}`, string | number>;

  return <section
    ref={root}
    className={`collage-panel project-collage${isInteracting ? ' is-interacting' : ''}`}
    style={style}
    aria-label={locale === 'ru' ? 'Проекты' : 'Selected projects'}
    tabIndex={0}
    role="region"
    onKeyDown={handleKeyDown}
    onBlur={handleBlur}
    onPointerLeave={(event) => {
      if (event.pointerType !== 'touch' && !drag.current && !interactionRef.current) setActiveSlot(null);
    }}
  >
    <div className="project-collage-plane" ref={plane}>
      {SLOT_INDICES.map((slot) => {
        const project = projects[((slot % projects.length) + projects.length) % projects.length];
        const x = -300 + slot * CARD_STEP;
        const y = 360 - slot * CARD_STEP * .62;
        const offsetDirection = activeSlot === null ? 0 : Math.sign(slot - activeSlot);
        const offsetX = offsetDirection * 40 / .94;
        const offsetY = (-offsetDirection * 24 - .16 * offsetX) / .84;
        const isActive = slot === activeSlot;
        const slotStyle = {
          '--project-collage-base-x': `${x}px`,
          '--project-collage-base-y': `${y}px`,
          '--project-collage-card-height': `${CARD_WIDTH / CARD_ASPECT_RATIOS[project.id]}px`,
          '--project-collage-depth': isActive ? 1000 : -slot,
          '--project-collage-float-x': isActive ? '0px' : `${offsetX}px`,
          '--project-collage-float-y': isActive ? `${-64 / .84}px` : `${offsetY}px`,
          '--project-collage-opacity': isActive ? .99 : activeSlot === null ? .88 : .80,
        } as CSSProperties & Record<`--${string}`, string | number>;
        return <div className={`project-collage-position${isActive ? ' is-active' : ''}`} key={slot} style={slotStyle}>
          <button
            className="project-collage-hit"
            type="button"
            aria-label={`${locale === 'ru' ? 'Открыть кейс' : 'Open case'}: ${caseName(project.id)}`}
            onPointerEnter={(event) => {
              if (event.pointerType !== 'touch' && !interactionRef.current && !drag.current) setActiveSlot(slot);
            }}
            onPointerLeave={(event) => {
              if (drag.current || interactionRef.current || event.currentTarget.matches(':focus-visible') || activeSlot !== slot) return;
              const nextTarget = event.relatedTarget;
              if (nextTarget instanceof Element && nextTarget.closest('.project-collage-hit')) return;
              setActiveSlot(null);
            }}
            onPointerMove={(event) => handlePointerMove(slot, event)}
            onFocus={(event) => {
              if (!interactionRef.current && event.currentTarget.matches(':focus-visible')) setActiveSlot(slot);
            }}
            onPointerDown={handlePointerDown}
            onPointerUp={endPointer}
            onPointerCancel={endPointer}
            onClick={(event) => {
              if (suppressClick.current) {
                event.preventDefault();
                event.stopPropagation();
                suppressClick.current = false;
                return;
              }
              onCase(project.id);
            }}
          >
            <span className="project-collage-visual" aria-hidden="true">
              <ProjectCollageMedia
                media={project.media}
                poster={`figma/${project.file}`}
                playbackEnabled={playbackEnabled}
              />
            </span>
          </button>
        </div>;
      })}
    </div>
  </section>;
}
