/**
 * React state for the awareness quiz: intro → questions → results.
 * Delegates rules to `services/quizSession.ts`.
 */

import { useCallback, useMemo, useState } from 'react';

import type { AppLanguage } from '../i18n/types';
import { getQuizQuestions, type LocalizedQuizQuestion } from '../services/quiz';
import {
  advanceQuizState,
  createInitialQuizState,
  type QuizSessionState,
} from '../services/quizSession';

export function useQuizSession(language: AppLanguage) {
  const questions = useMemo(() => getQuizQuestions(language), [language]);
  const total = questions.length;

  const [state, setState] = useState<QuizSessionState>(createInitialQuizState);

  const current: LocalizedQuizQuestion | undefined = questions[state.index];

  const startQuiz = useCallback(() => {
    setState({
      ...createInitialQuizState(),
      phase: 'quiz',
    });
  }, []);

  const setSelected = useCallback((optionIndex: number) => {
    setState((s) => (s.phase === 'quiz' ? { ...s, selected: optionIndex } : s));
  }, []);

  const goNext = useCallback(() => {
    setState((s) => advanceQuizState(s, questions));
  }, [questions]);

  const retry = useCallback(() => {
    setState(createInitialQuizState());
  }, []);

  return {
    phase: state.phase,
    index: state.index,
    selected: state.selected,
    correctCount: state.correctCount,
    total,
    current,
    questions,
    startQuiz,
    setSelected,
    goNext,
    retry,
  };
}
