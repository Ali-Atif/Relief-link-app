import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useLayoutEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLanguage } from '../contexts/LanguageContext';
import type { RootStackParamList } from '../navigation/types';
import { getGuideById } from '../services/guides';
import { colors, spacing } from '../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'GuideDetail'>;

export function GuideDetailScreen({ route, navigation }: Props) {
  const { t } = useLanguage();
  const { guideId, title: paramTitle } = route.params;

  const guide = useMemo(() => getGuideById(guideId), [guideId]);
  const displayTitle = guide?.title ?? paramTitle ?? 'Guide';

  useLayoutEffect(() => {
    navigation.setOptions({ title: displayTitle });
  }, [navigation, displayTitle]);

  if (guide == null) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.errorText}>{t('guides.notFound')}</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
      >
        <Text style={styles.lead}>{guide.summary}</Text>

        {guide.sections.map((section, index) => (
          <View key={`${section.heading}-${index}`} style={styles.block}>
            <Text style={styles.sectionHeading}>{section.heading}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scroll: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg * 2,
  },
  lead: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 28,
    marginBottom: spacing.lg,
  },
  block: {
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: spacing.sm,
  },
  sectionBody: {
    fontSize: 17,
    color: '#1e293b',
    lineHeight: 26,
  },
  errorText: {
    fontSize: 17,
    color: colors.textMuted,
    padding: spacing.md,
  },
});
