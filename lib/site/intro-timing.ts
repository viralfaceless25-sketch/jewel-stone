export const INTRO_DURATION_MS = 1450;
export const INTRO_REDUCED_DURATION_MS = 650;

export function getIntroDuration(reducedMotion: boolean): number {
  return reducedMotion ? INTRO_REDUCED_DURATION_MS : INTRO_DURATION_MS;
}
