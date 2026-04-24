import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GuideBackChip } from '../components/GuideBackChip';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { PAKISTAN_EMERGENCY_CONTACTS, type PakistanEmergencyRow } from '../data/pakistanEmergencyContacts';
import { dispatchResetToHome } from '../navigation/resetToHome';
import type { RootStackParamList } from '../navigation/types';
import { openPhoneDialer } from '../utils/openContactLinks';
import { blockDirection, flexRowWithDirection } from '../utils/layoutRtl';
import { colors, radii, spacing } from '../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'EmergencyContacts'>;

export function EmergencyContactsScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const textAlign = language === 'ur' ? 'right' : 'left';
  const writingDirection = language === 'ur' ? 'rtl' : 'ltr';
  const direction = language === 'ur' ? 'rtl' : 'ltr';

  const backToHome = useCallback(() => {
    dispatchResetToHome(navigation.dispatch, user?.role === 'ngo');
  }, [navigation, user?.role]);

  const onDial = useCallback(
    (row: PakistanEmergencyRow) => {
      void openPhoneDialer(row.dial);
    },
    [],
  );

  const listHeader = useMemo(
    () => (
      <View style={[styles.listHeader, blockDirection(direction)]}>
        <GuideBackChip
          label={t('emergencyContacts.backToHome')}
          onPress={backToHome}
          accessibilityLabel={t('emergencyContacts.backToHome')}
        />
        <Text style={[styles.title, { textAlign, writingDirection }]}>{t('emergencyContacts.title')}</Text>
        <Text style={[styles.subtitle, { textAlign, writingDirection }]}>{t('emergencyContacts.subtitle')}</Text>
        <View style={styles.listHeaderPad} />
      </View>
    ),
    [backToHome, direction, t, textAlign, writingDirection],
  );

  const renderItem = useCallback<ListRenderItem<PakistanEmergencyRow>>(
    ({ item }) => (
      <Pressable
        onPress={() => onDial(item)}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        accessibilityRole="button"
        accessibilityLabel={t('emergencyContacts.tapToCallA11y', { name: t(item.nameKey) })}
      >
        <View style={[styles.cardInner, flexRowWithDirection(direction)]}>
          <View style={[styles.iconWrap, { backgroundColor: `${colors.primary}18` }]}>
            <Ionicons name={item.icon} size={24} color={colors.primary} />
          </View>
          <View style={styles.cardTextBlock}>
            <Text style={[styles.serviceName, { textAlign, writingDirection }]}>{t(item.nameKey)}</Text>
          </View>
          <Ionicons
            name={language === 'ur' ? 'chevron-back' : 'chevron-forward'}
            size={20}
            color={colors.textMuted}
            style={styles.chevron}
          />
        </View>
      </Pressable>
    ),
    [direction, language, onDial, t, textAlign, writingDirection],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <FlatList
        data={[...PAKISTAN_EMERGENCY_CONTACTS]}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={listHeader}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        style={styles.list}
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
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  listHeader: {
    marginBottom: spacing.sm,
  },
  listHeaderPad: {
    height: spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.md,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  card: {
    marginBottom: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.9,
  },
  cardInner: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  chevron: {
    flexShrink: 0,
  },
});

export default EmergencyContactsScreen;
