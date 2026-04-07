/**
 * Maps raw topic ids from `data/quiz.json` to i18n keys used in `i18n/strings.ts`.
 */

const TOPIC_TO_KEY: Record<string, 'quiz.topicFlood' | 'quiz.topicEarthquake' | 'quiz.topicFire'> = {
  flood: 'quiz.topicFlood',
  earthquake: 'quiz.topicEarthquake',
  fire: 'quiz.topicFire',
};

/** Translation key for `t()`, or the raw topic if unknown */
export function getQuizTopicTranslationKey(topic: string): string {
  return TOPIC_TO_KEY[topic] ?? topic;
}
