import { useEffect, useState, type CSSProperties, type SyntheticEvent } from 'react';
import { asset } from '../../lib/assets';
import { getVideoSource, type VideoKey } from '../../lib/media';

type ProjectMediaProps = {
  media: VideoKey;
  poster: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
};

export function ProjectMedia({ media, poster, alt = '', className, style }: ProjectMediaProps) {
  const source = getVideoSource(media);
  const [failedSource, setFailedSource] = useState<string | undefined>();
  const videoAvailable = Boolean(source && failedSource !== source);

  useEffect(() => {
    setFailedSource(undefined);
  }, [source]);

  const posterSource = asset(poster);
  const handleError = (event: SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    video.pause();
    setFailedSource(source);
  };

  if (!videoAvailable) {
    return <img src={posterSource} alt={alt} className={className} style={style} />;
  }

  return (
    <video
      key={source}
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
