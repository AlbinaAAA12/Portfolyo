import { memo, useEffect, useRef, useState, type CSSProperties, type FocusEvent, type KeyboardEvent, type PointerEvent } from 'react';
import type { CaseId, Locale } from '../../types';
import { asset } from '../../lib/assets';
import type { VideoKey } from '../../lib/media';
import { ProjectMedia } from '../media/ProjectMedia';
import './ProjectCollage.css';

type ProjectCollageItem = { id: CaseId; file: string; media?: VideoKey };

const CARD_WIDTH = 480;
const CARD_STEP = 112;
const POSITION_PERIOD = 1680;
const SLOT_MIN_X = -720;
const SLOT_INDICES = Array.from({ length: 15 }, (_, index) => index - 4);
const CARD_ASPECT_RATIOS: Record<CaseId, number> = {
  future: 209 / 118,
  spirit: 3008 / 2066,
  mozglab: 1255 / 802,
  veritas: 792 / 415,
  outsourcing: 1128 / 803,
};

function wrapMotion(value: number) {
  return ((value % POSITION_PERIOD) + POSITION_PERIOD) % POSITION_PERIOD;
}

function shortestDelta(value: number) {
  return ((value + POSITION_PERIOD / 2) % POSITION_PERIOD + POSITION_PERIOD) % POSITION_PERIOD - POSITION_PERIOD / 2;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getPhysicalX(slot: number, motion: number) {
  const anchorX = -300 + slot * CARD_STEP + motion;
  return ((anchorX - SLOT_MIN_X) % POSITION_PERIOD + POSITION_PERIOD) % POSITION_PERIOD + SLOT_MIN_X;
}

function updateSlotPosition(element: HTMLDivElement, slot: number, motion: number) {
  const physicalX = getPhysicalX(slot, motion);
  const physicalY = 174 - physicalX * .62;
  element.style.setProperty('--project-collage-physical-x', `${physicalX}px`);
  element.style.setProperty('--project-collage-physical-y', `${physicalY}px`);
  element.style.zIndex = String(-Math.round(physicalX));
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
  const slotElements = useRef(new Map<number, HTMLDivElement>());
  const drag = useRef<{ pointerId: number; x: number; moved: number; pendingDelta: number } | null>(null);
  const suppressClick = useRef(false);
  const renderedMotion = useRef(0);
  const targetMotion = useRef(0);
  const pendingDirectDelta = useRef(0);
  const wheelActive = useRef(false);
  const frame = useRef<number | null>(null);
  const previousFrameTime = useRef<number | null>(null);
  const interactionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interactionRef = useRef(false);
  const [sceneScale, setSceneScale] = useState(1);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  const applyMotion = (motion: number) => {
    renderedMotion.current = wrapMotion(motion);
    slotElements.current.forEach((element, slot) => updateSlotPosition(element, slot, renderedMotion.current));
  };

  const beginInteraction = () => {
    interactionRef.current = true;
    setIsInteracting(true);
    setActiveSlot(null);
    if (interactionTimer.current) clearTimeout(interactionTimer.current);
    interactionTimer.current = null;
  };

  const finishInteractionAfterDelay = () => {
    if (interactionTimer.current) clearTimeout(interactionTimer.current);
    interactionTimer.current = setTimeout(() => {
      interactionRef.current = false;
      interactionTimer.current = null;
      setIsInteracting(false);
    }, 180);
  };

  const scheduleFrame = () => {
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame((time) => {
      frame.current = null;
      let motion = renderedMotion.current;
      const directDelta = pendingDirectDelta.current;
      pendingDirectDelta.current = 0;
      if (directDelta) {
        motion = wrapMotion(motion + directDelta);
        if (wheelActive.current) targetMotion.current = wrapMotion(targetMotion.current + directDelta);
      }

      if (wheelActive.current) {
        const error = shortestDelta(targetMotion.current - motion);
        const elapsed = previousFrameTime.current === null ? 16 : Math.min(64, Math.max(1, time - previousFrameTime.current));
        previousFrameTime.current = time;
        if (Math.abs(error) < .25) {
          motion = targetMotion.current;
          wheelActive.current = false;
          previousFrameTime.current = null;
          finishInteractionAfterDelay();
        } else {
          motion = wrapMotion(motion + error * (1 - Math.exp(-elapsed / 32)));
        }
      } else {
        previousFrameTime.current = null;
      }

      applyMotion(motion);
      if (wheelActive.current) scheduleFrame();
    });
  };

  const queueDirectMotion = (amount: number) => {
    if (wheelActive.current) {
      wheelActive.current = false;
      targetMotion.current = renderedMotion.current;
      previousFrameTime.current = null;
    }
    pendingDirectDelta.current += amount;
    scheduleFrame();
  };

  const moveWheelTarget = (amount: number) => {
    const currentError = wheelActive.current ? shortestDelta(targetMotion.current - renderedMotion.current) : 0;
    const nextError = clamp(currentError + clamp(amount, -CARD_STEP, CARD_STEP), -224, 224);
    targetMotion.current = wrapMotion(renderedMotion.current + nextError);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      wheelActive.current = false;
      previousFrameTime.current = null;
      applyMotion(targetMotion.current);
      finishInteractionAfterDelay();
      return;
    }
    wheelActive.current = Math.abs(nextError) >= .25;
    if (wheelActive.current) {
      previousFrameTime.current = null;
      scheduleFrame();
    } else {
      applyMotion(targetMotion.current);
      finishInteractionAfterDelay();
    }
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
      const amount = -logicalDelta * .8;
      if (!amount) return;
      beginInteraction();
      moveWheelTarget(amount);
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
    drag.current = { pointerId: event.pointerId, x: event.clientX, moved: 0, pendingDelta: 0 };
    suppressClick.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (slot: number, event: PointerEvent<HTMLButtonElement>) => {
    const activeDrag = drag.current;
    if (activeDrag && activeDrag.pointerId === event.pointerId) {
      const delta = event.clientX - activeDrag.x;
      activeDrag.x = event.clientX;
      activeDrag.moved += Math.abs(delta);
      activeDrag.pendingDelta += delta;
      if (activeDrag.moved > 6) {
        beginInteraction();
        suppressClick.current = true;
        if (activeDrag.pendingDelta) {
          queueDirectMotion(activeDrag.pendingDelta / getEffectiveScale());
          activeDrag.pendingDelta = 0;
        }
      }
      return;
    }
    if (event.pointerType !== 'touch' && !interactionRef.current && activeSlot !== slot) setActiveSlot(slot);
  };

  const endPointer = (event: PointerEvent<HTMLButtonElement>) => {
    const activeDrag = drag.current;
    if (activeDrag?.pointerId !== event.pointerId) return;
    if (event.type === 'pointercancel' && activeDrag.moved > 6) suppressClick.current = true;
    drag.current = null;
    if (activeDrag.moved > 6) finishInteractionAfterDelay();
    const bounds = root.current?.getBoundingClientRect();
    if (bounds && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) {
      setActiveSlot(null);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      beginInteraction();
      queueDirectMotion(CARD_STEP);
      finishInteractionAfterDelay();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      beginInteraction();
      queueDirectMotion(-CARD_STEP);
      finishInteractionAfterDelay();
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
    <div className="project-collage-plane">
      {SLOT_INDICES.map((slot) => {
        const project = projects[((slot % projects.length) + projects.length) % projects.length];
        const offsetDirection = activeSlot === null
          ? 0
          : Math.sign(getPhysicalX(slot, renderedMotion.current) - getPhysicalX(activeSlot, renderedMotion.current));
        const offsetX = offsetDirection * 40 / .94;
        const offsetY = (-offsetDirection * 24 - .16 * offsetX) / .84;
        const isActive = slot === activeSlot;
        const slotStyle = {
          '--project-collage-card-height': `${CARD_WIDTH / CARD_ASPECT_RATIOS[project.id]}px`,
          '--project-collage-float-x': isActive ? '0px' : `${offsetX}px`,
          '--project-collage-float-y': isActive ? `${-64 / .84}px` : `${offsetY}px`,
          '--project-collage-opacity': isActive ? .99 : activeSlot === null ? .88 : .80,
        } as CSSProperties & Record<`--${string}`, string | number>;
        return <div
          className={`project-collage-position${isActive ? ' is-active' : ''}`}
          key={slot}
          style={slotStyle}
          ref={(element) => {
            if (element) {
              slotElements.current.set(slot, element);
              updateSlotPosition(element, slot, renderedMotion.current);
            } else {
              slotElements.current.delete(slot);
            }
          }}
        >
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
