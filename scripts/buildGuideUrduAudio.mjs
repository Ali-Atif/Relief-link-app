/**
 * Generates bundled Urdu MP3 narrations (Microsoft Edge neural voice via node-edge-tts).
 * Run: node scripts/buildGuideUrduAudio.mjs
 * Requires network once. Output: assets/audio/guides/ur/{id}.mp3
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EdgeTTS } from 'node-edge-tts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const REMINDER_TITLE = 'اہم یاد دہانی';
const REMINDER_BODY =
  'مقامی ایمرجنسی سروسز کی ہدایات پر عمل کریں۔ یہ رہنمائی عمومی حفاظتی معلومات دیتی ہے۔';

/** Male Urdu neural — bundled in app as offline “recorded” narration. */
const VOICE = 'ur-PK-AsadNeural';
const LANG = 'ur-PK';

function flattenBody(body) {
  return body.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();
}

function buildUrduNarration(g) {
  const u = g.ur;
  const parts = [`${u.title}.`, u.summary];
  for (const s of u.sections) {
    parts.push(`${s.heading}.`);
    parts.push(flattenBody(s.body));
  }
  parts.push(`${REMINDER_TITLE}.`, REMINDER_BODY);
  return parts.join('\n\n');
}

const guides = JSON.parse(fs.readFileSync(path.join(root, 'data', 'guides.json'), 'utf8'));
const outDir = path.join(root, 'assets', 'audio', 'guides', 'ur');
fs.mkdirSync(outDir, { recursive: true });

const tts = new EdgeTTS({
  voice: VOICE,
  lang: LANG,
  timeout: 180000,
  outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
});

for (const g of guides) {
  const text = buildUrduNarration(g);
  const outPath = path.join(outDir, `${g.id}.mp3`);
  // eslint-disable-next-line no-console
  console.log('Synthesizing', g.id, `(${text.length} chars)…`);
  await tts.ttsPromise(text, outPath);
  const st = fs.statSync(outPath);
  // eslint-disable-next-line no-console
  console.log('  →', outPath, `(${(st.size / 1024).toFixed(0)} KB)`);
}

// eslint-disable-next-line no-console
console.log('Done.');
