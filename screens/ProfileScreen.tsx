import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenLayout } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import type { RootStackParamList } from '../navigation/types';
import { blockDirection } from '../utils/layoutRtl';
import { colors, radii, spacing } from '../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export function ProfileScreen({ navigation }: Props) {
  const { user, logout, busy } = useAuth();
  const { t, language } = useLanguage();
  const heroDirection = language === 'ur' ? 'rtl' : 'ltr';
  const textAlign = language === 'ur' ? 'right' : 'left';
  const writingDirection = language === 'ur' ? 'rtl' : 'ltr';

  const onBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  }, [navigation]);

  const email = user?.email ?? '';

  return (
    <ScreenLayout
      title={t('profile.title')}
      subtitle={email ? t('home.signedInAs', { email }) : undefined}
      showBack={{
        label: t('nav.backChip'),
        onPress: onBack,
        accessibilityLabel: t('nav.backA11y'),
      }}
      heroDirection={heroDirection}
    >
      <View style={[styles.card, blockDirection(heroDirection)]}>
        <View style={[styles.avatarWrap, { alignSelf: language === 'ur' ? 'flex-end' : 'flex-start' }]}>
          <Ionicons name="person" size={36} color={colors.primaryDark} />
        </View>
        <Text style={[styles.hint, { textAlign, writingDirection }]}>{t('profile.hint')}</Text>

        <Pressable
          onPress={logout}
          disabled={busy || !user}
          style={({ pressed }) => [
            styles.signOut,
            (pressed && !busy) && styles.signOutPressed,
            busy && styles.signOutDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel={t('home.signOut')}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.signOutLabel}>{busy ? t('home.signingOut') : t('home.signOut')}</Text>
        </Pressable>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  hint: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    fontWeight: '500',
  },
  signOut: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    backgroundColor: colors.emergency,
  },
  signOutPressed: {
    opacity: 0.88,
  },
  signOutDisabled: {
    opacity: 0.55,
  },
  signOutLabel: {
    color: colors.onEmergency,
    fontWeight: '800',
    fontSize: 16,
  },
});
