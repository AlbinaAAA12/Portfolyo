import { useEffect, useRef, useState, type CSSProperties, type FocusEvent, type KeyboardEvent, type PointerEvent, type WheelEvent } from 'react';
import type { CaseId, Locale } from '../../types';
import { asset } from '../../lib/assets';
import type { VideoKey } from '../../lib/media';
import { ProjectMedia } from '../media/ProjectMedia';
import './ProjectCollage.css';

type ProjectCollageItem = { id: CaseId; file: string; media?: VideoKey };

const CARD_STEP = 100;
const CYCLE_WIDTH = CARD_STEP * 5;
const SLOT_INDICES = Array.from({ length: 26 }, (_, index) => index - 8);

function wrapMotion(value: number) {
  return ((value % CYCLE_WIDTH) + CYCLE_WIDTH) % CYCLE_WIDTH;
}

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
  const drag = useRef<{ pointerId: number; x: number; moved: number } | null>(null);
  const suppressClick = useRef(false);
  const motionRef = useRef(0);
  const [motion, setMotion] = useState(0);
  const [sceneScale, setSceneScale] = useState(1);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0) setSceneScale(entry.contentRect.width / 592);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const moveBy = (amount: number) => {
    const next = wrapMotion(motionRef.current + amount);
    motionRef.current = next;
    setMotion(next);
  };

  const getEffectiveScale = () => {
    const width = root.current?.getBoundingClientRect().width ?? 0;
    return width > 0 ? width / 592 : sceneScale;
  };

  const handleWheel = (event: WheelEvent<HTMLElement>) => {
    const rawDelta = Math.abs(event.deltaX) >= Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!rawDelta) return;
    const factor = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 592 : 1;
    moveBy(-rawDelta * factor / getEffectiveScale());
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    if (event.pointerType === 'touch') setActiveSlot(null);
    drag.current = { pointerId: event.pointerId, x: event.clientX, moved: 0 };
    suppressClick.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const activeDrag = drag.current;
    if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
    const delta = event.clientX - activeDrag.x;
    activeDrag.x = event.clientX;
    activeDrag.moved += Math.abs(delta);
    if (activeDrag.moved > 6) {
      suppressClick.current = true;
      setActiveSlot(null);
    }
    if (delta) moveBy(delta / getEffectiveScale());
  };

  const endPointer = (event: PointerEvent<HTMLButtonElement>) => {
    if (drag.current?.pointerId !== event.pointerId) return;
    drag.current = null;
    const bounds = root.current?.getBoundingClientRect();
    if (bounds && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) {
      setActiveSlot(null);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      moveBy(CARD_STEP);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
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
    className="collage-panel project-collage"
    style={style}
    aria-label={locale === 'ru' ? 'Проекты' : 'Selected projects'}
    tabIndex={0}
    role="region"
    onWheel={handleWheel}
    onKeyDown={handleKeyDown}
    onBlur={handleBlur}
    onPointerLeave={(event) => {
      if (event.pointerType !== 'touch' && !drag.current) setActiveSlot(null);
    }}
  >
    <div className="project-collage-plane">
      {SLOT_INDICES.map((slot) => {
        const project = projects[((slot % projects.length) + projects.length) % projects.length];
        const x = -300 + slot * CARD_STEP + motion;
        const y = 360 - slot * 62 - motion * .62;
        const offsetDirection = activeSlot === null ? 0 : Math.sign(slot - activeSlot);
        const offsetX = offsetDirection * 40 / .94;
        const offsetY = (-offsetDirection * 24 - .16 * offsetX) / .84;
        const isActive = slot === activeSlot;
        const slotStyle = {
          '--project-collage-x': `${x}px`,
          '--project-collage-y': `${y}px`,
          '--project-collage-depth': isActive ? 1000 : -slot,
          '--project-collage-float-x': isActive ? '0px' : `${offsetX}px`,
          '--project-collage-float-y': isActive ? `${-64 / .84}px` : `${offsetY}px`,
          '--project-collage-opacity': isActive ? .97 : activeSlot === null ? .72 : .52,
        } as CSSProperties & Record<`--${string}`, string | number>;
        return <div className={`project-collage-position${isActive ? ' is-active' : ''}`} key={slot} style={slotStyle}>
          <button
            className="project-collage-hit"
            type="button"
            aria-label={`${locale === 'ru' ? 'Открыть кейс' : 'Open case'}: ${caseName(project.id)}`}
            onPointerEnter={(event) => {
              if (event.pointerType !== 'touch' && !drag.current) setActiveSlot(slot);
            }}
            onPointerLeave={(event) => {
              if (drag.current || event.currentTarget.matches(':focus-visible') || activeSlot !== slot) return;
              const nextTarget = event.relatedTarget;
              if (nextTarget instanceof Element && nextTarget.closest('.project-collage-hit')) return;
              setActiveSlot(null);
            }}
            onFocus={(event) => {
              if (event.currentTarget.matches(':focus-visible')) setActiveSlot(slot);
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
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
              {project.media
                ? <ProjectMedia media={project.media} poster={`figma/${project.file}`} alt="" playbackEnabled={playbackEnabled} />
                : <img src={asset(`figma/${project.file}`)} alt="" />}
            </span>
          </button>
        </div>;
      })}
    </div>
  </section>;
}
