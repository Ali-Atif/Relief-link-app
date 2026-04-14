import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View, type ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GuideBackChip } from '../components/GuideBackChip';
import QuickTile, { QUICK_TILE_LIFT_PX } from '../components/newUI/QuickTile';
import { useLanguage } from '../contexts/LanguageContext';
import { dispatchResetToHome } from '../navigation/resetToHome';
import type { RootStackParamList } from '../navigation/types';
import { getAllGuidesForLanguage, type LocalizedSurvivalGuide } from '../services/guides';
import { blockDirection } from '../utils/layoutRtl';
import { colors, spacing } from '../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'Guides'>;

/** Small extra bottom so last row shadow / hover is not clipped. */
const SHADOW_PAD = 4;

export function GuidesScreen({ navigation }: Props) {
  const { language, t } = useLanguage();

  const guides = useMemo(() => getAllGuidesForLanguage(language), [language]);
  const textAlign = language === 'ur' ? 'right' : 'left';
  const writingDirection = language === 'ur' ? 'rtl' : 'ltr';
  const direction = language === 'ur' ? 'rtl' : 'ltr';

  const backToHome = useCallback(() => {
    dispatchResetToHome(navigation.dispatch);
  }, [navigation]);

  const listHeader = useMemo(
    () => (
      <View style={styles.listHeader}>
        <View style={[styles.hero, blockDirection(direction)]}>
          <GuideBackChip
            label={t('guides.backToHome')}
            onPress={backToHome}
            accessibilityLabel={t('guides.backToHome')}
          />
          <Text style={[styles.title, { textAlign, writingDirection }]}>{t('guides.title')}</Text>
          <Text
            style={[styles.sectionH3, { textAlign, writingDirection }]}
            accessibilityRole="header"
          >
            {t('guides.sectionH3')}
          </Text>
        </View>
        {/* Space for QuickTile translateY(-LIFT) so the first row does not clip under the header / list top */}
        <View style={{ height: QUICK_TILE_LIFT_PX + 4 }} />
      </View>
    ),
    [backToHome, direction, t, textAlign, writingDirection],
  );

  const renderItem = useCallback<ListRenderItem<LocalizedSurvivalGuide>>(
    ({ item }) => (
      <View style={styles.tileCell}>
        <QuickTile
          layout="compact"
          title={item.title}
          icon={item.icon}
          color={item.color}
          onPress={() => navigation.navigate('GuideDetail', { guideId: item.id })}
        />
      </View>
    ),
    [navigation],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <FlatList
        data={guides}
        keyExtractor={(item) => item.id}
        numColumns={2}
        ListHeaderComponent={listHeader}
        renderItem={renderItem}
        columnWrapperStyle={styles.columnRow}
        contentContainerStyle={styles.listContent}
        style={styles.list}
        showsVerticalScrollIndicator
        removeClippedSubviews={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    flex: 1,
    overflow: 'visible',
  },
  listHeader: {
    paddingTop: spacing.sm,
  },
  hero: {
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs,
    alignSelf: 'stretch',
  },
  sectionH3: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.md,
    alignSelf: 'stretch',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg + spacing.md + SHADOW_PAD,
    flexGrow: 1,
  },
  columnRow: {
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    gap: spacing.sm,
    overflow: 'visible',
  },
  tileCell: {
    flex: 1,
    paddingHorizontal: spacing.xs / 2,
    overflow: 'visible',
  },
});
