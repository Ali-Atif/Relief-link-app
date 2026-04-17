import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GuideBackChip } from '../components/GuideBackChip';
import { GuideVoiceBar } from '../components/GuideVoiceBar';
import { useLanguage } from '../contexts/LanguageContext';
import { translate } from '../i18n/strings';
import type { RootStackParamList } from '../navigation/types';
import { buildGuideVoiceChunks, type GuideVoiceChunk } from '../services/guideVoiceChunks';
import { getGuideByIdForLanguage } from '../services/guides';
import { guideDetailScrollContent } from '../utils/guideDetailChrome';
import { blockDirection, flexRowWithDirection } from '../utils/layoutRtl';
import { colors, radii, spacing } from '../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'GuideDetail'>;

/** Turn guide body into bullet lines: paragraphs first, else single newlines, else one block. */
function bodyToBulletLines(body: string): string[] {
  const raw = body.replace(/\r\n/g, '\n').trim();
  if (!raw) return [];

  if (/\n\s*\n/.test(raw)) {
    return raw
      .split(/\n\s*\n+/)
      .map((p) => p.replace(/\s+/g, ' ').trim())
      .filter(Boolean);
  }

  if (raw.includes('\n')) {
    return raw
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
  }

  return [raw.replace(/\s+/g, ' ').trim()];
}

export function GuideDetailScreen({ route, navigation }: Props) {
  const { language, t } = useLanguage();
  const { guideId, title: paramTitle } = route.params;

  const guide = useMemo(() => getGuideByIdForLanguage(guideId, language), [guideId, language]);
  const guideEn = useMemo(() => getGuideByIdForLanguage(guideId, 'en'), [guideId]);
  const displayTitle = guide?.title ?? paramTitle ?? t('guides.title');

  const voiceChunks = useMemo((): GuideVoiceChunk[] => {
    if (!guide) return [];
    return buildGuideVoiceChunks(guide, t('guides.reminderTitle'), t('guides.reminderBody'));
  }, [guide, t]);

  const voiceChunksEnSpeech = useMemo((): GuideVoiceChunk[] => {
    if (!guideEn) return [];
    return buildGuideVoiceChunks(
      guideEn,
      translate('en', 'guides.reminderTitle'),
      translate('en', 'guides.reminderBody'),
    );
  }, [guideEn]);

  const textAlign = language === 'ur' ? 'right' : 'left';
  const writingDirection = language === 'ur' ? 'rtl' : 'ltr';
  const direction = language === 'ur' ? 'rtl' : 'ltr';

  const backToGuides = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Guides');
    }
  };

  if (guide == null) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={guideDetailScrollContent} keyboardShouldPersistTaps="handled">
          <View style={blockDirection(direction)}>
            <GuideBackChip
              label={t('guides.backToGuides')}
              onPress={backToGuides}
              accessibilityLabel={t('guides.backToGuides')}
            />
          </View>
          <Text style={[styles.errorText, { textAlign, writingDirection }]}>{t('guides.notFound')}</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={guideDetailScrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
      >
        <View style={blockDirection(direction)}>
          <GuideBackChip
            label={t('guides.backToGuides')}
            onPress={backToGuides}
            accessibilityLabel={t('guides.backToGuides')}
          />

          <View style={[styles.mainCard, blockDirection(direction)]}>
            <View style={[styles.heroRow, flexRowWithDirection('ltr')]}>
              <View style={[styles.heroIcon, { backgroundColor: guide.color }]}>
                <Ionicons name={guide.icon} size={28} color="#ffffff" />
              </View>
              <Text style={[styles.heroTitle, { textAlign, writingDirection }]} numberOfLines={3}>
                {displayTitle}
              </Text>
            </View>

            <View style={styles.offlineBadge}>
              <Text style={styles.offlineBadgeText}>{t('guides.availableOffline')}</Text>
            </View>

            <GuideVoiceBar
              guideId={guideId}
              chunks={voiceChunks}
              fallbackChunks={voiceChunksEnSpeech}
              language={language}
              accentColor={guide.color}
              direction={direction}
              title={t('guides.voiceTitle')}
              hint={t('guides.voiceHint')}
              playA11y={t('guides.voicePlayA11y')}
              stopA11y={t('guides.voiceStopA11y')}
            />

            <Text style={[styles.summary, { textAlign, writingDirection }]}>{guide.summary}</Text>

            {guide.sections.map((section, index) => {
              const lines = bodyToBulletLines(section.body);
              return (
                <View key={`${section.heading}-${index}`} style={styles.sectionBlock}>
                  <Text style={[styles.sectionHeadingOut, { textAlign, writingDirection }]}>
                    {section.heading}
                  </Text>
                  <View style={[styles.bulletContainer, blockDirection(direction)]}>
                    {lines.map((line, i) => (
                      <View
                        key={`${index}-${i}`}
                        style={[
                          styles.bulletRow,
                          flexRowWithDirection(direction),
                          i === lines.length - 1 && styles.bulletRowLast,
                        ]}
                      >
                        <Text
                          style={[styles.bulletGlyph, { textAlign, writingDirection }]}
                          accessibilityElementsHidden
                        >
                          {'\u2022'}
                        </Text>
                        <Text style={[styles.bulletLine, { textAlign, writingDirection }]}>{line}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}

            <View style={[styles.reminderBox, blockDirection(direction)]} accessibilityRole="alert">
              <View style={styles.reminderHeaderRow}>
                <Ionicons name="warning" size={22} color="#b45309" />
                <Text style={[styles.reminderTitle, { textAlign, writingDirection }]}>
                  {t('guides.reminderTitle')}
                </Text>
              </View>
              <Text style={[styles.reminderBody, { textAlign, writingDirection }]}>
                {t('guides.reminderBody')}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mainCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  heroTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 28,
  },
  offlineBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#16a34a',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
  },
  offlineBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  summary: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMuted,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  sectionBlock: {
    marginBottom: spacing.lg,
  },
  sectionHeadingOut: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: 24,
  },
  bulletContainer: {
    backgroundColor: '#eef2f6',
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  bulletRowLast: {
    marginBottom: 0,
  },
  bulletGlyph: {
    fontSize: 16,
    lineHeight: 22,
    color: '#64748b',
    minWidth: 18,
    fontWeight: '800',
  },
  bulletLine: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
  },
  errorText: {
    fontSize: 17,
    color: colors.textMuted,
    padding: spacing.md,
  },
  reminderBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: '#fef9c3',
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: radii.md,
  },
  reminderHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  reminderTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 22,
  },
  reminderBody: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 22,
  },
});
