import { useEffect, useState, type CSSProperties, type SyntheticEvent } from 'react';
import { asset } from '../../lib/assets';
import { getVideoSource, type VideoKey } from '../../lib/media';

type ProjectMediaProps = {
  media: VideoKey;
  poster: string;
  playbackEnabled?: boolean;
  alt?: string;
  className?: string;
  style?: CSSProperties;
};

export function ProjectMedia({ media, poster, playbackEnabled = true, alt = '', className, style }: ProjectMediaProps) {
  const videoSource = getVideoSource(media);
  const [failedSource, setFailedSource] = useState<string | undefined>();
  const [mediaElement, setMediaElement] = useState<HTMLImageElement | HTMLVideoElement | null>(null);
  const observerSupported = typeof IntersectionObserver !== 'undefined';
  const [isVisible, setIsVisible] = useState(!observerSupported);
  const [hasEnteredView, setHasEnteredView] = useState(!observerSupported);
  const [documentVisible, setDocumentVisible] = useState(typeof document === 'undefined' || !document.hidden);
  const source = playbackEnabled && hasEnteredView ? videoSource : undefined;
  const videoAvailable = Boolean(source && failedSource !== source);

  useEffect(() => {
    setFailedSource(undefined);
  }, [videoSource]);

  useEffect(() => {
    if (!mediaElement) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      setHasEnteredView(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting && entry.intersectionRatio > 0;
      setIsVisible(visible);
      if (visible) setHasEnteredView(true);
    });
    observer.observe(mediaElement);
    return () => observer.disconnect();
  }, [mediaElement]);

  useEffect(() => {
    const updateDocumentVisibility = () => setDocumentVisible(!document.hidden);
    document.addEventListener('visibilitychange', updateDocumentVisibility);
    return () => document.removeEventListener('visibilitychange', updateDocumentVisibility);
  }, []);

  useEffect(() => {
    if (!mediaElement || mediaElement.tagName !== 'VIDEO') return;
    const video = mediaElement as HTMLVideoElement;
    if (videoAvailable && playbackEnabled && hasEnteredView && isVisible && documentVisible) {
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
    return () => video.pause();
  }, [mediaElement, videoAvailable, playbackEnabled, hasEnteredView, isVisible, documentVisible]);

  const posterSource = asset(poster);
  const handleError = (event: SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    video.pause();
    setFailedSource(videoSource);
  };

  if (!videoAvailable) {
    return <img ref={setMediaElement} src={posterSource} alt={alt} className={className} style={style} />;
  }

  return (
    <video
      key={source}
      ref={setMediaElement}
      src={source}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={posterSource}
      aria-label={alt || undefined}
      className={className}
      style={style}
      onError={handleError}
    />
  );
}
