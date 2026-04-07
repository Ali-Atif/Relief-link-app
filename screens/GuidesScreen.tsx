import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLanguage } from '../contexts/LanguageContext';
import { useTranslatedHeader } from '../hooks/useTranslatedHeader';
import type { RootStackParamList } from '../navigation/types';
import { getAllGuides } from '../services/guides';
import { colors, spacing } from '../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'Guides'>;

const guides = getAllGuides();

export function GuidesScreen({ navigation }: Props) {
  const { t } = useLanguage();
  useTranslatedHeader(navigation, 'nav.guides');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('guides.title')}</Text>
        <Text style={styles.subtitle}>{t('guides.subtitle')}</Text>
      </View>

      <FlatList
        style={styles.list}
        data={guides}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() =>
              navigation.navigate('GuideDetail', { guideId: item.id, title: item.title })
            }
            accessibilityRole="button"
            accessibilityLabel={t('guides.openHint')}
          >
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowSummary} numberOfLines={2}>
                {item.summary}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.text,
    minHeight: 72,
  },
  rowPressed: {
    opacity: 0.92,
  },
  rowText: {
    flex: 1,
    marginRight: spacing.sm,
  },
  rowTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  rowSummary: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 21,
  },
  chevron: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.primary,
  },
});
