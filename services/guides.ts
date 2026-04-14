/**
 * Offline survival guides from `data/guides.json` (bilingual en/ur).
 * Loaded once at module load — no async I/O on the hot path.
 */

import Ionicons from '@expo/vector-icons/Ionicons';

import guidesJson from '../data/guides.json';
import type { AppLanguage } from '../i18n/types';

export type GuideIconName = keyof typeof Ionicons.glyphMap;

export type GuideSection = {
  heading: string;
  body: string;
};

export type LocalizedSurvivalGuide = {
  id: string;
  icon: GuideIconName;
  color: string;
  title: string;
  summary: string;
  sections: GuideSection[];
};

type BilingualGuideBody = {
  title: string;
  summary: string;
  sections: GuideSection[];
};

type RawSurvivalGuide = {
  id: string;
  icon: string;
  color: string;
  en: BilingualGuideBody;
  ur: BilingualGuideBody;
};

const rawGuides = guidesJson as RawSurvivalGuide[];

/** Number of offline guides (for UI copy). */
export const SURVIVAL_GUIDE_COUNT = rawGuides.length;

function localize(raw: RawSurvivalGuide, lang: AppLanguage): LocalizedSurvivalGuide {
  const block = lang === 'ur' ? raw.ur : raw.en;
  return {
    id: raw.id,
    icon: raw.icon as GuideIconName,
    color: raw.color,
    title: block.title,
    summary: block.summary,
    sections: block.sections,
  };
}

export function getAllGuidesForLanguage(lang: AppLanguage): LocalizedSurvivalGuide[] {
  return rawGuides.map((g) => localize(g, lang));
}

export function getGuideByIdForLanguage(id: string, lang: AppLanguage): LocalizedSurvivalGuide | undefined {
  const raw = rawGuides.find((g) => g.id === id);
  return raw ? localize(raw, lang) : undefined;
}
