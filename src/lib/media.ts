import { asset } from './assets';

export type VideoKey =
  | 'mozglab-landing'
  | 'mozglab-dashboard'
  | 'iidei-landing'
  | 'iidei-promo'
  | 'veritas-landing'
  | 'veritas-login'
  | 'outsourcing'
  | 'portrait'
  | 'onboarding-03';

export function getVideoSource(key: VideoKey): string | undefined {
  const filename = __VIDEO_FILES__[key];
  return filename ? asset(`videos/${filename}`) : undefined;
}
