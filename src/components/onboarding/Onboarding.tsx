import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { asset } from '../../lib/assets';
import { getVideoSource, type VideoKey } from '../../lib/media';
import { startLensCanvas } from './LensCanvas';
import './Onboarding.css';

export type OnboardingProps = {
  locale: 'ru' | 'en';
  onComplete: () => void;
};

const DURATION_MS = 4204;
const TIMELINE_SECONDS = 4.204;
const PREPARATION_DEADLINE_MS = 6000;
const VIDEO_PREPARATION_TIMEOUT_MS = 3000;

type CardSpec = {
  id: string;
  name: string;
  kind: 'video' | 'image';
  src: string;
  videoKey?: VideoKey;
  opacity: number[];
  opacityTimes?: number[];
  opacityEase: MotionEase | MotionEase[];
};

type MotionEase = 'linear' | [number, number, number, number];

const cards: CardSpec[] = [
  { id: '1:14028', name: '08 1', kind: 'image', src: 'figma/28781.png', opacity: [0, 0, 1, 1], opacityTimes: [0, 0.6703, 0.6915, 1], opacityEase: ['linear', [0.5, 0, 0.5, 1], 'linear'] },
  { id: '1:14029', name: '06 1', kind: 'image', src: 'figma/c841d.png', opacity: [0, 0, 1, 1, 0, 0], opacityTimes: [0, 0.5645, 0.5856, 0.6703, 0.6915, 1], opacityEase: ['linear', [0.5, 0, 0.5, 1], [0.5, 0, 0.5, 1], [0.5, 0, 0.5, 1], 'linear'] },
  { id: '1:14030', name: '07 1', kind: 'video', videoKey: 'mozglab-landing', src: 'figma/card-mozglab-landing.png', opacity: [0, 0, 1, 1, 0, 0], opacityTimes: [0, 0.4688, 0.4798, 0.5635, 0.5856, 1], opacityEase: ['linear', [0.5, 0, 0.5, 1], [0.5, 0, 0.5, 1], [0.5, 0, 0.5, 1], 'linear'] },
  { id: '1:14031', name: '05 1', kind: 'video', videoKey: 'iidei-landing', src: 'figma/card-iidei-landing.png', opacity: [0, 0, 1, 1, 0, 0], opacityTimes: [0, 0.3811, 0.3944, 0.4679, 0.4798, 1], opacityEase: ['linear', [0.5, 0, 0.5, 1], [0.5, 0, 0.5, 1], [0.5, 0, 0.5, 1], 'linear'] },
  { id: '1:14032', name: '04 1', kind: 'image', src: 'figma/8a88c.jpg', opacity: [0, 0, 1, 1, 0, 0], opacityTimes: [0, 0.3328, 0.3413, 0.3811, 0.3939, 1], opacityEase: ['linear', [0.5, 0, 0.5, 1], [0.5, 0, 0.5, 1], [0.5, 0, 0.5, 1], 'linear'] },
  { id: '1:14033', name: '02 1', kind: 'video', videoKey: 'veritas-login', src: 'figma/card-veritas-login.png', opacity: [0, 0, 1, 1, 0, 0], opacityTimes: [0, 0.2378, 0.2379, 0.3328, 0.3413, 1], opacityEase: ['linear', 'linear', [0.5, 0, 0.5, 1], [0.5, 0, 0.5, 1], 'linear'] },
  { id: '1:14034', name: '03 1', kind: 'video', videoKey: 'onboarding-03', src: 'figma/onboarding-03-poster.png', opacity: [0, 0, 1, 1, 0, 0], opacityTimes: [0, 0.1188, 0.1189, 0.2322, 0.2379, 1], opacityEase: ['linear', 'linear', [0.5, 0, 0.5, 1], [0.5, 0, 0.5, 1], 'linear'] },
  { id: '1:14035', name: '01 1', kind: 'video', videoKey: 'mozglab-dashboard', src: 'figma/card-mozglab-dashboard.png', opacity: [1, 1, 0, 0], opacityTimes: [0, 0.1188, 0.1189, 1], opacityEase: 'linear' },
];

function MotionCard({ card, running, onReady }: { card: CardSpec; running: boolean; onReady: () => void }) {
  const initial = { opacity: card.opacity[0], scaleX: 1, scaleY: 1, ...(card.id === '1:14035' ? { x: 30.5 } : {}) };
  const animate = {
    opacity: card.opacity,
    scaleX: [1, 1, 4.8, 4.8, 1],
    scaleY: [1, 1, 4.8, 4.8, 1],
    ...(card.id === '1:14035' ? { x: [30.5, 0, 0] } : {}),
  };
  return (
    <motion.div
      className="onboarding-card"
      data-node-id={card.id}
      data-name={card.name}
      initial={initial}
      animate={running ? animate : initial}
      transition={running ? {
        opacity: {
          duration: TIMELINE_SECONDS,
          times: card.opacityTimes,
          ease: card.opacityEase,
        },
        scaleX: { duration: TIMELINE_SECONDS, times: [0, 0.0476, 0.1189, 0.9529, 1], ease: ['linear', [0.5, 0, 0.5, 1], [0.5, 0, 0.5, 1], [0.5, 0, 0.5, 1]] },
        scaleY: { duration: TIMELINE_SECONDS, times: [0, 0.0476, 0.1189, 0.9529, 1], ease: ['linear', [0.5, 0, 0.5, 1], [0.5, 0, 0.5, 1], [0.5, 0, 0.5, 1]] },
        ...(card.id === '1:14035' ? {
          x: { duration: TIMELINE_SECONDS, times: [0, 0.0476, 1], ease: 'linear' },
        } : {}),
      } : { duration: 0 }}
    >
      <LensCardContent card={card} onReady={onReady} />
    </motion.div>
  );
}

function LensCardContent({ card, onReady }: { card: CardSpec; onReady: () => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const onReadyRef = useRef(onReady);
  useEffect(() => { onReadyRef.current = onReady; }, [onReady]);
  useEffect(() => {
    let cancelled = false;
    let stop: (() => void) | undefined;
    let sourceVideo: HTMLVideoElement | undefined;
    let rendererStarted = false;
    let posterReady = false;
    let posterFailed = false;
    let videoAttemptDone = false;
    let posterRequested = false;
    let videoTimeout = 0;
    const currentCanvas = () => hostRef.current?.querySelector('canvas') ?? null;
    const start = async (media: HTMLImageElement | HTMLVideoElement) => {
      const canvas = currentCanvas();
      if (!canvas || cancelled || rendererStarted) return;
      rendererStarted = true;
      const cleanup = await startLensCanvas(canvas, media, () => {
        if (!cancelled) onReadyRef.current();
      });
      if (cancelled) cleanup();
      else stop = cleanup;
    };
    const startPoster = () => {
      if (posterReady) void start(poster).catch(() => {});
      else if (!posterFailed) posterRequested = true;
    };
    const poster = new Image();
    poster.onload = () => {
      posterReady = true;
      if (card.kind === 'image' || !card.videoKey || !getVideoSource(card.videoKey) || posterRequested) startPoster();
    };
    poster.onerror = () => {
      posterFailed = true;
      if (card.kind === 'image' || !card.videoKey || !getVideoSource(card.videoKey)) onReady();
    };
    poster.src = asset(card.src);
    const videoSrc = card.kind === 'video' && card.videoKey ? getVideoSource(card.videoKey) : undefined;
    if (videoSrc) {
      const video = document.createElement('video');
      sourceVideo = video;
      video.muted = true;
      video.playsInline = true;
      video.loop = true;
      video.preload = 'auto';
      const fallBack = () => {
        if (cancelled || videoAttemptDone) return;
        videoAttemptDone = true;
        window.clearTimeout(videoTimeout);
        video.pause();
        startPoster();
      };
      video.onerror = fallBack;
      video.onloadeddata = () => {
        if (cancelled || videoAttemptDone) return;
        void video.play().then(() => {
          if (cancelled || videoAttemptDone) return;
          videoAttemptDone = true;
          window.clearTimeout(videoTimeout);
          void start(video).catch(() => { /* The bounded preparation deadline releases the timeline. */ });
        }).catch(fallBack);
      };
      video.src = videoSrc;
      video.load();
      videoTimeout = window.setTimeout(fallBack, VIDEO_PREPARATION_TIMEOUT_MS);
    }
    return () => {
      cancelled = true;
      window.clearTimeout(videoTimeout);
      stop?.();
      sourceVideo?.pause();
      if (sourceVideo) {
        sourceVideo.removeAttribute('src');
        sourceVideo.load();
      }
    };
  }, [card]);

  return <div ref={hostRef} className="onboarding-card-canvas-host" aria-hidden="true"><canvas className="onboarding-card-canvas" /></div>;
}

function SourceLayerAnimation({ onTimelineStart }: { onTimelineStart: () => void }) {
  const [running, setRunning] = useState(false);
  const readyIds = useRef(new Set<string>());
  const markReady = useCallback((id: string) => {
    if (readyIds.current.has(id)) return;
    readyIds.current.add(id);
    if (readyIds.current.size === cards.length) setRunning(true);
  }, []);
  useEffect(() => {
    if (running) return;
    const timer = window.setTimeout(() => setRunning(true), PREPARATION_DEADLINE_MS);
    return () => window.clearTimeout(timer);
  }, [running]);
  useEffect(() => {
    if (running) onTimelineStart();
  }, [onTimelineStart, running]);

  return (
    <div className="onboarding-source-stage" data-node-id="1:14024" data-timeline-running={running ? 'true' : 'false'} aria-hidden="true">
      <motion.div className="onboarding-letter onboarding-letter-w" data-node-id="1:14027"
        initial={{ x: -22.182 }} animate={running ? { x: [-22.182, -59.613, -242.612, -242.612, -321.986, -242.612, -59.613] } : { x: -22.182 }}
        transition={running ? { x: { duration: TIMELINE_SECONDS, times: [0, 0.0476, 0.1189, 0.1629, 0.7441, 0.9529, 1], ease: ['linear', 'linear', [0.3, -0.05, 0.7, -0.5], 'linear', 'linear', 'linear'] } } : { duration: 0 }}>W</motion.div>
      <motion.div className="onboarding-letter onboarding-letter-r" data-node-id="1:14025"
        initial={{ rotate: 0, x: 30.5 }} animate={running ? { rotate: [0, 0, 30, 30, 0], x: [30.5, 0, 180.226, 180.226, 217.658, 180.226, 30.5] } : { rotate: 0, x: 30.5 }}
        transition={running ? { rotate: { duration: TIMELINE_SECONDS, times: [0, 0.1629, 0.7103, 0.9531, 1], ease: ['linear', [0.5, 0, 0.5, 1], [0.5, 0, 0.5, 1], [0.5, 0, 0.5, 1]] }, x: { duration: TIMELINE_SECONDS, times: [0, 0.0476, 0.1189, 0.1629, 0.7103, 0.9529, 1], ease: 'linear' } } : { duration: 0 }}>R</motion.div>
      <motion.div className="onboarding-letter onboarding-letter-k" data-node-id="1:14026"
        initial={{ x: 30.5 }} animate={running ? { x: [30.5, 0, 213.499, 213.499, 223.259, 248.233, 248.233, 30.5] } : { x: 30.5 }}
        transition={running ? { x: { duration: TIMELINE_SECONDS, times: [0, 0.0476, 0.1189, 0.1629, 0.6682, 0.9098, 0.9531, 1], ease: 'linear' } } : { duration: 0 }}>k</motion.div>
      {cards.map((card) => <MotionCard key={card.id} card={card} running={running} onReady={() => markReady(card.id)} />)}
    </div>
  );
}

export function Onboarding({ locale, onComplete }: OnboardingProps) {
  const [showSourceLayers] = useState(true);
  const [timelineStarted, setTimelineStarted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ));
  const frameRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);
  const completedRef = useRef(false);

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(preference.matches);
    preference.addEventListener('change', updatePreference);
    return () => preference.removeEventListener('change', updatePreference);
  }, []);

  const completeOnce = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onCompleteRef.current();
  }, []);

  const handleTimelineStart = useCallback(() => setTimelineStarted(true), []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const updateScale = () => frame.style.setProperty('--design-scale', String(frame.clientWidth / 1280));
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion || timelineStarted) {
      const timer = window.setTimeout(completeOnce, DURATION_MS);
      return () => window.clearTimeout(timer);
    }
  }, [completeOnce, reducedMotion, timelineStarted]);

  return (
    <main className="onboarding-root" lang={locale} aria-label={locale === 'ru' ? 'Заставка портфолио' : 'Portfolio intro'}>
      <div className="onboarding-frame" ref={frameRef}>
        {reducedMotion ? (
          <div className="onboarding-static-mark" aria-hidden="true"><span>W</span><span>R</span><span>k</span></div>
        ) : showSourceLayers ? (
          <SourceLayerAnimation onTimelineStart={handleTimelineStart} />
        ) : (
          <div className="onboarding-static-mark" aria-hidden="true"><span>W</span><span>R</span><span>k</span></div>
        )}
      </div>
    </main>
  );
}

export default Onboarding;
