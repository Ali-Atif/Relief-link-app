/**
 * Loads localized quiz questions from bundled `data/quiz.json`.
 *
 * Each question has English + Urdu text; we pick one block based on `AppLanguage`.
 * Results are memoized per language so repeated calls stay cheap.
 */

import type { AppLanguage } from '../i18n/types';
import quizJson from '../data/quiz.json';

export type QuizLangBlock = {
  question: string;
  options: string[];
};

export type QuizQuestionRaw = {
  id: string;
  topic: string;
  correctIndex: number;
  en: QuizLangBlock;
  ur: QuizLangBlock;
};

export type LocalizedQuizQuestion = {
  id: string;
  topic: string;
  correctIndex: number;
  question: string;
  options: string[];
};

const rawQuestions = quizJson as QuizQuestionRaw[];

/** In-memory cache: building the list is O(n); language switches are rare */
const localizedCache = new Map<AppLanguage, LocalizedQuizQuestion[]>();

export function getQuizQuestions(language: AppLanguage): LocalizedQuizQuestion[] {
  const hit = localizedCache.get(language);
  if (hit) {
    return hit;
  }

  const built = rawQuestions.map((q) => {
    const block = language === 'ur' ? q.ur : q.en;
    return {
      id: q.id,
      topic: q.topic,
      correctIndex: q.correctIndex,
      question: block.question,
      options: block.options,
    };
  });

  localizedCache.set(language, built);
  return built;
}

export function getQuizQuestionCount(): number {
  return rawQuestions.length;
}
