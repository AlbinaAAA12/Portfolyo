import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { asset } from '../../lib/assets';
import { hasCompleteOnboardingSourceMedia, onboardingVideoSources } from './source-media';
import { startLensCanvas } from './LensCanvas';
import './Onboarding.css';

export type OnboardingProps = {
  locale: 'ru' | 'en';
  onComplete: () => void;
};

const DURATION_MS = 4204;
const TIMELINE_SECONDS = 4.204;
const REFERENCE_LOAD_TIMEOUT_MS = 8000;

type CardSpec = {
  id: string;
  name: keyof typeof onboardingVideoSources | '08 1' | '06 1' | '04 1';
  kind: 'video' | 'image';
  src: string;
  opacity: number[];
  opacityTimes?: number[];
  opacityEase: MotionEase | MotionEase[];
};

type MotionEase = 'linear' | [number, number, number, number];

const cards: CardSpec[] = [
  { id: '1:14028', name: '08 1', kind: 'image', src: 'figma/28781.png', opacity: [0, 0, 1, 1], opacityTimes: [0, 0.6703, 0.6915, 1], opacityEase: ['linear', [0.5, 0, 0.5, 1], 'linear'] },
  { id: '1:14029', name: '06 1', kind: 'image', src: 'figma/c841d.png', opacity: [0, 0, 1, 1, 0, 0], opacityTimes: [0, 0.5645, 0.5856, 0.6703, 0.6915, 1], opacityEase: ['linear', [0.5, 0, 0.5, 1], [0.5, 0, 0.5, 1], [0.5, 0, 0.5, 1], 'linear'] },
  { id: '1:14030', name: '07 1', kind: 'video', src: onboardingVideoSources['07 1'], opacity: [0, 0, 1, 1, 0, 0], opacityTimes: [0, 0.4688, 0.4798, 0.5635, 0.5856, 1], opacityEase: ['linear', [0.5, 0, 0.5, 1], [0.5, 0, 0.5, 1], [0.5, 0, 0.5, 1], 'linear'] },
  { id: '1:14031', name: '05 1', kind: 'video', src: onboardingVideoSources['05 1'], opacity: [0, 0, 1, 1, 0, 0], opacityTimes: [0, 0.3811, 0.3944, 0.4679, 0.4798, 1], opacityEase: ['linear', [0.5, 0, 0.5, 1], [0.5, 0, 0.5, 1], [0.5, 0, 0.5, 1], 'linear'] },
  { id: '1:14032', name: '04 1', kind: 'image', src: 'figma/8a88c.jpg', opacity: [0, 0, 1, 1, 0, 0], opacityTimes: [0, 0.3328, 0.3413, 0.3811, 0.3939, 1], opacityEase: ['linear', [0.5, 0, 0.5, 1], [0.5, 0, 0.5, 1], [0.5, 0, 0.5, 1], 'linear'] },
  { id: '1:14033', name: '02 1', kind: 'video', src: onboardingVideoSources['02 1'], opacity: [0, 0, 1, 1, 0, 0], opacityTimes: [0, 0.2378, 0.2379, 0.3328, 0.3413, 1], opacityEase: ['linear', 'linear', [0.5, 0, 0.5, 1], [0.5, 0, 0.5, 1], 'linear'] },
  { id: '1:14034', name: '03 1', kind: 'video', src: onboardingVideoSources['03 1'], opacity: [0, 0, 1, 1, 0, 0], opacityTimes: [0, 0.1188, 0.1189, 0.2322, 0.2379, 1], opacityEase: ['linear', 'linear', [0.5, 0, 0.5, 1], [0.5, 0, 0.5, 1], 'linear'] },
  { id: '1:14035', name: '01 1', kind: 'video', src: onboardingVideoSources['01 1'], opacity: [1, 1, 0, 0], opacityTimes: [0, 0.1188, 0.1189, 1], opacityEase: 'linear' },
];

function MotionCard({ card, onUnavailable }: { card: CardSpec; onUnavailable: () => void }) {
  return (
    <motion.div
      className="onboarding-card"
      data-node-id={card.id}
      data-name={card.name}
      initial={{ opacity: card.opacity[0], scaleX: 1, scaleY: 1, ...(card.id === '1:14035' ? { x: 30.5 } : {}) }}
      animate={{
        opacity: card.opacity,
        scaleX: [1, 1, 4.8, 4.8, 1],
        scaleY: [1, 1, 4.8, 4.8, 1],
        ...(card.id === '1:14035' ? { x: [30.5, 0, 0] } : {}),
      }}
      transition={{
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
      }}
    >
      <LensCardContent card={card} onUnavailable={onUnavailable} />
    </motion.div>
  );
}

function LensCardContent({ card, onUnavailable }: { card: CardSpec; onUnavailable: () => void }) {
  const canvasRef = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    let stop: (() => void) | undefined;
    let cancelled = false;
    let sourceVideo: HTMLVideoElement | undefined;
    const fail = () => { if (!cancelled) onUnavailable(); };
    if (card.kind === 'image') {
      const image = new Image();
      image.onload = () => {
        if (cancelled) return;
        void startLensCanvas(canvas, image).then((cleanup) => {
          if (cancelled) cleanup();
          else stop = cleanup;
        }).catch(fail);
      };
      image.onerror = fail;
      image.src = asset(card.src);
    } else {
      const video = document.createElement('video');
      sourceVideo = video;
      video.muted = true;
      video.playsInline = true;
      video.loop = true;
      video.onloadeddata = () => {
        if (cancelled) return;
        void video.play().then(() => startLensCanvas(canvas, video)).then((cleanup) => {
          if (cancelled) cleanup();
          else stop = cleanup;
        }).catch(fail);
      };
      video.onerror = fail;
      video.src = asset(card.src);
      video.load();
    }
    return () => {
      cancelled = true;
      stop?.();
      sourceVideo?.pause();
      if (sourceVideo) sourceVideo.removeAttribute('src');
    };
  }, [card, onUnavailable]);

  return <canvas ref={canvasRef} className="onboarding-card-canvas" aria-hidden="true" />;
}

function SourceLayerAnimation({ onUnavailable }: { onUnavailable: () => void }) {
  return (
    <div className="onboarding-source-stage" data-node-id="1:14024" aria-hidden="true">
      <motion.div className="onboarding-letter onboarding-letter-w" data-node-id="1:14027"
        initial={{ x: -22.182 }} animate={{ x: [-22.182, -59.613, -242.612, -242.612, -321.986, -242.612, -59.613] }}
        transition={{ x: { duration: TIMELINE_SECONDS, times: [0, 0.0476, 0.1189, 0.1629, 0.7441, 0.9529, 1], ease: ['linear', 'linear', [0.3, -0.05, 0.7, -0.5], 'linear', 'linear', 'linear'] } }}>W</motion.div>
      <motion.div className="onboarding-letter onboarding-letter-r" data-node-id="1:14025"
        initial={{ rotate: 0, x: 30.5 }} animate={{ rotate: [0, 0, 30, 30, 0], x: [30.5, 0, 180.226, 180.226, 217.658, 180.226, 30.5] }}
        transition={{ rotate: { duration: TIMELINE_SECONDS, times: [0, 0.1629, 0.7103, 0.9531, 1], ease: ['linear', [0.5, 0, 0.5, 1], [0.5, 0, 0.5, 1], [0.5, 0, 0.5, 1]] }, x: { duration: TIMELINE_SECONDS, times: [0, 0.0476, 0.1189, 0.1629, 0.7103, 0.9529, 1], ease: 'linear' } }}>R</motion.div>
      <motion.div className="onboarding-letter onboarding-letter-k" data-node-id="1:14026"
        initial={{ x: 30.5 }} animate={{ x: [30.5, 0, 213.499, 213.499, 223.259, 248.233, 248.233, 30.5] }}
        transition={{ x: { duration: TIMELINE_SECONDS, times: [0, 0.0476, 0.1189, 0.1629, 0.6682, 0.9098, 0.9531, 1], ease: 'linear' } }}>k</motion.div>
      {cards.map((card) => <MotionCard key={card.id} card={card} onUnavailable={onUnavailable} />)}
    </div>
  );
}

function canUseSourceLayers(): boolean {
  return hasCompleteOnboardingSourceMedia && typeof navigator !== 'undefined' && 'gpu' in navigator;
}

export function Onboarding({ locale, onComplete }: OnboardingProps) {
  const [showSourceLayers, setShowSourceLayers] = useState(canUseSourceLayers);
  const [videoFailed, setVideoFailed] = useState(false);
  const [referenceStarted, setReferenceStarted] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);
  const completedRef = useRef(false);

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  const completeOnce = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onCompleteRef.current();
  }, []);

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
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      const timer = window.setTimeout(completeOnce, 0);
      return () => window.clearTimeout(timer);
    }

    if (showSourceLayers || videoFailed) {
      const timer = window.setTimeout(completeOnce, DURATION_MS);
      return () => window.clearTimeout(timer);
    }

    if (!referenceStarted) {
      const timer = window.setTimeout(() => setVideoFailed(true), REFERENCE_LOAD_TIMEOUT_MS);
      return () => window.clearTimeout(timer);
    }
  }, [completeOnce, referenceStarted, showSourceLayers, videoFailed]);

  const failToReference = useCallback(() => {
    setShowSourceLayers(false);
    setVideoFailed(false);
    setReferenceStarted(false);
  }, []);

  return (
    <main className="onboarding-root" lang={locale} aria-label={locale === 'ru' ? 'Заставка портфолио' : 'Portfolio intro'}>
      <div className="onboarding-frame" ref={frameRef}>
        {showSourceLayers ? (
          <SourceLayerAnimation onUnavailable={failToReference} />
        ) : videoFailed ? (
          <div className="onboarding-static-mark" aria-hidden="true"><span>W</span><span>R</span><span>k</span></div>
        ) : (
          <video
            className="onboarding-reference"
            src={asset('onboarding-reference.mp4')}
            muted
            playsInline
            autoPlay
            preload="auto"
            onLoadedMetadata={(event) => {
              const video = event.currentTarget;
              if (Number.isFinite(video.duration) && video.duration > 0) {
                video.playbackRate = video.duration / TIMELINE_SECONDS;
              }
            }}
            onPlay={() => setReferenceStarted(true)}
            onCanPlay={(event) => { void event.currentTarget.play().catch(() => setVideoFailed(true)); }}
            onEnded={completeOnce}
            onError={() => setVideoFailed(true)}
            aria-hidden="true"
          />
        )}
      </div>
    </main>
  );
}

export default Onboarding;
