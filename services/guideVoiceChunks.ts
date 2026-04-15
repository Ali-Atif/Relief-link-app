import type { LocalizedSurvivalGuide } from './guides';

function flattenBody(body: string): string {
  return body.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();
}

/** `heading` = titles / section headers (stricter TTS); `body` = paragraphs / reminder text. */
export type GuideVoiceChunkTone = 'heading' | 'body';

export type GuideVoiceChunk = {
  text: string;
  tone: GuideVoiceChunkTone;
};

/**
 * Segments for device TTS: headings split from body so pitch/rate can differ per line.
 */
export function buildGuideVoiceChunks(
  guide: LocalizedSurvivalGuide,
  reminderTitle: string,
  reminderBody: string,
): GuideVoiceChunk[] {
  const chunks: GuideVoiceChunk[] = [];

  const title = guide.title.trim();
  if (title) chunks.push({ text: title, tone: 'heading' });

  const summary = guide.summary.trim();
  if (summary) chunks.push({ text: summary, tone: 'body' });

  for (const section of guide.sections) {
    const h = section.heading.trim();
    if (h) chunks.push({ text: h, tone: 'heading' });
    const body = flattenBody(section.body);
    if (body) chunks.push({ text: body, tone: 'body' });
  }

  const rt = reminderTitle.trim();
  if (rt) chunks.push({ text: rt, tone: 'heading' });
  const rb = reminderBody.trim();
  if (rb) chunks.push({ text: rb, tone: 'body' });

  return chunks;
}
