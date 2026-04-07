/**
 * Offline survival guides: titles and sections from `data/guides.json`.
 * The array is loaded once at module load — no async I/O on the hot path.
 */

import guidesJson from '../data/guides.json';

export type GuideSection = {
  heading: string;
  body: string;
};

export type SurvivalGuide = {
  id: string;
  title: string;
  summary: string;
  sections: GuideSection[];
};

const guides = guidesJson as SurvivalGuide[];

export function getAllGuides(): SurvivalGuide[] {
  return guides;
}

export function getGuideById(id: string): SurvivalGuide | undefined {
  return guides.find((g) => g.id === id);
}
