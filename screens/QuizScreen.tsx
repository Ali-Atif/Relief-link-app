/**
 * Awareness quiz UI. Rules and scoring live in `services/quizSession` + `hooks/useQuizSession`.
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../components';
import { useLanguage } from '../contexts/LanguageContext';
import { useQuizSession } from '../hooks/useQuizSession';
import { useTranslatedHeader } from '../hooks/useTranslatedHeader';
import type { RootStackParamList } from '../navigation/types';
import { getQuizTopicTranslationKey } from '../services/quizTopics';
import { percentCorrect } from '../services/quizSession';
import { colors, spacing } from '../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'Quiz'>;

export function QuizScreen({ navigation }: Props) {
  const { language, t } = useLanguage();
  useTranslatedHeader(navigation, 'nav.quiz');

  const {
    phase,
    index,
    selected,
    correctCount,
    total,
    current,
    startQuiz,
    setSelected,
    goNext,
    retry,
  } = useQuizSession(language);

  const topicLabel = useCallback(
    (topic: string) => t(getQuizTopicTranslationKey(topic)),
    [t],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {phase === 'intro' ? (
          <View style={styles.block}>
            <Text style={styles.title}>{t('quiz.introTitle')}</Text>
            <Text style={styles.subtitle}>{t('quiz.introSubtitle')}</Text>
            <PrimaryButton label={t('quiz.start')} icon="play-circle-outline" onPress={startQuiz} />
          </View>
        ) : null}

        {phase === 'quiz' && current != null ? (
          <View style={styles.block}>
            <Text style={styles.meta}>
              {t('quiz.questionOf', { current: index + 1, total })}
            </Text>
            <Text style={styles.topicChip}>{topicLabel(current.topic)}</Text>
            <Text style={styles.question}>{current.question}</Text>

            <View style={styles.options}>
              {current.options.map((opt, i) => {
                const isSelected = selected === i;
                return (
                  <Pressable
                    key={`${current.id}-${i}`}
                    onPress={() => setSelected(i)}
                    style={({ pressed }) => [
                      styles.option,
                      isSelected && styles.optionSelected,
                      pressed && styles.optionPressed,
                    ]}
                  >
                    <Text style={[styles.optionLetter, isSelected && styles.optionLetterOn]}>
                      {String.fromCharCode(65 + i)}
                    </Text>
                    <Text style={[styles.optionText, isSelected && styles.optionTextOn]}>{opt}</Text>
                  </Pressable>
                );
              })}
            </View>

            {selected == null ? <Text style={styles.hint}>{t('quiz.pickAnswer')}</Text> : null}

            <PrimaryButton
              label={index >= total - 1 ? t('quiz.finish') : t('quiz.next')}
              icon={index >= total - 1 ? 'flag-outline' : 'arrow-forward-circle-outline'}
              onPress={goNext}
              disabled={selected == null}
            />
          </View>
        ) : null}

        {phase === 'results' ? (
          <View style={styles.block}>
            <Text style={styles.title}>{t('quiz.resultsTitle')}</Text>
            <Text style={styles.scoreBig}>
              {correctCount}/{total}
            </Text>
            <Text style={styles.subtitle}>
              {t('quiz.scoreLine', {
                correct: correctCount,
                total,
                percent: percentCorrect(correctCount, total),
              })}
            </Text>
            <PrimaryButton label={t('quiz.retry')} icon="refresh-outline" onPress={retry} />
            <PrimaryButton
              label={t('quiz.backHome')}
              variant="outline"
              icon="home-outline"
              onPress={() => navigation.goBack()}
            />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg * 2,
  },
  block: {
    gap: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
  },
  meta: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  topicChip: {
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
    backgroundColor: '#ccfbf1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 26,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: '#f0fdfa',
  },
  optionPressed: {
    opacity: 0.92,
  },
  optionLetter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
    backgroundColor: colors.border,
  },
  optionLetterOn: {
    backgroundColor: colors.primary,
    color: '#fff',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  optionTextOn: {
    fontWeight: '600',
  },
  hint: {
    fontSize: 13,
    color: colors.textMuted,
  },
  scoreBig: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.primaryDark,
  },
});
