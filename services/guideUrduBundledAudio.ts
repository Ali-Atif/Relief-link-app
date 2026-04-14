/**
 * Bundled Urdu guide narrations (MP3, neural “studio” voice).
 * Regenerate: npm run build:guide-audio (requires network; uses node-edge-tts).
 */
export const UR_GUIDE_RECORDINGS: Record<string, number> = {
  flood: require('../assets/audio/guides/ur/flood.mp3'),
  earthquake: require('../assets/audio/guides/ur/earthquake.mp3'),
  fire: require('../assets/audio/guides/ur/fire.mp3'),
  cyclone: require('../assets/audio/guides/ur/cyclone.mp3'),
  landslide: require('../assets/audio/guides/ur/landslide.mp3'),
  'building-collapse': require('../assets/audio/guides/ur/building-collapse.mp3'),
};

export function getUrduBundledGuideRecording(guideId: string): number | undefined {
  return UR_GUIDE_RECORDINGS[guideId];
}
