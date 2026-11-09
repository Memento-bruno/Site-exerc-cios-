import type { Exercise } from '@/data/types';
import { SVG_KEYFRAMES } from '@/data/svg-keyframes';
import manifest from '@/data/media-manifest.json';

export type MediaManifest = Record<string, { images?: [string, string]; video?: string }>;
export const MEDIA_MANIFEST = manifest as unknown as MediaManifest;

export type MediaSource = 'video' | 'dataset' | 'svg' | 'none';

export function mediaSourceFor(exercise: Exercise): MediaSource {
  const m = MEDIA_MANIFEST[exercise.id];
  if (m?.video) return 'video';
  if (m?.images) return 'dataset';
  if (exercise.media.svgKeyframes && SVG_KEYFRAMES[exercise.media.svgKeyframes]) return 'svg';
  return 'none';
}
