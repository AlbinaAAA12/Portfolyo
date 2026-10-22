/**
 * Flip this to true only after every listed original video has been copied to
 * public/assets/videos. Keeping the gate explicit prevents Vite's SPA fallback
 * from making a missing-media URL look like a successful request.
 */
export const hasCompleteOnboardingSourceMedia = false;

export const onboardingVideoSources = {
  '07 1': 'videos/mozglab-landing.mp4',
  '05 1': 'videos/iidei-landing.mp4',
  '02 1': 'videos/veritas-login.mp4',
  '03 1': 'videos/onboarding-03.mp4',
  '01 1': 'videos/mozglab-dashboard.mp4',
} as const;
