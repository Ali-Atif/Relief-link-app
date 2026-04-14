import type { Voice } from 'expo-speech';

function normLang(lang: string): string {
  return lang.toLowerCase().replace(/_/g, '-').trim();
}

export type UrduTtsPick = {
  language: string;
  voice?: string;
  /** True when a device voice is actually suited for Urdu (not just a generic `ur-PK` tag). */
  hasUrduEngine: boolean;
};

/**
 * Picks best Urdu TTS voice from the device list (Android/iOS/Web differ wildly).
 */
export function pickUrduTtsOptions(voices: Voice[]): UrduTtsPick {
  function score(langRaw: string): number {
    const l = normLang(langRaw);
    if (l === 'ur-pk' || l === 'urd-pk') return 100;
    if (l === 'ur-in' || l === 'urd-in') return 95;
    if (l.startsWith('ur-') || l.startsWith('urd-')) return 85;
    if (l === 'ur' || l === 'urd') return 75;
    if (l.includes('urdu')) return 65;
    return 0;
  }

  let best: Voice | null = null;
  let bestScore = 0;
  for (const v of voices) {
    const s = score(v.language);
    if (s > bestScore) {
      bestScore = s;
      best = v;
    }
  }

  if (best != null && bestScore > 0) {
    return {
      language: normLang(best.language) || 'ur-PK',
      voice: best.identifier,
      hasUrduEngine: true,
    };
  }

  for (const v of voices) {
    const blob = `${v.name} ${v.identifier} ${v.language}`.toLowerCase();
    if (blob.includes('urdu') || blob.includes('urd_') || blob.includes('urd-')) {
      return {
        language: 'ur-PK',
        voice: v.identifier,
        hasUrduEngine: true,
      };
    }
  }

  return { language: 'ur-PK', hasUrduEngine: false };
}
