/**
 * Pure quiz session logic (no React).
 *
 * Keeps scoring rules in one place so the Quiz screen only renders UI.
 * Beginners: "pure" means the same inputs always return the same output — easy to test.
 */

import type { LocalizedQuizQuestion } from './quiz';

/** Where the user is in the quiz flow */
export type QuizPhase = 'intro' | 'quiz' | 'results';

export type QuizSessionState = {
  phase: QuizPhase;
  index: number;
  /** Selected option index for the current question, or null if none chosen */
  selected: number | null;
  correctCount: number;
};

export function createInitialQuizState(): QuizSessionState {
  return { phase: 'intro', index: 0, selected: null, correctCount: 0 };
}

/** 1 if the answer matches, else 0 */
export function pointsForAnswer(selectedIndex: number, correctIndex: number): number {
  return selectedIndex === correctIndex ? 1 : 0;
}

/** Integer percent 0–100 */
export function percentCorrect(correct: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Math.round((correct / total) * 100);
}

/**
 * After the user taps Next/Finish: updates score and either moves to the next
 * question or ends on the results phase.
 */
export function advanceQuizState(
  state: QuizSessionState,
  questions: LocalizedQuizQuestion[],
): QuizSessionState {
  if (state.phase !== 'quiz' || state.selected == null) {
    return state;
  }

  const current = questions[state.index];
  if (!current) {
    return state;
  }

  const total = questions.length;
  const nextCorrect = state.correctCount + pointsForAnswer(state.selected, current.correctIndex);

  if (state.index >= total - 1) {
    return {
      ...state,
      phase: 'results',
      correctCount: nextCorrect,
      selected: null,
    };
  }

  return {
    ...state,
    index: state.index + 1,
    correctCount: nextCorrect,
    selected: null,
  };
}
