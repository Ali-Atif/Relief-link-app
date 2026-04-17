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
      navigation.navigate(user?.role === 'ngo' ? 'NgoHome' : 'Home');
    }
  }, [navigation, user?.role]);

  const email = user?.email?.trim() || '—';
  const name = user?.displayName?.trim() || '—';
  const phone = user?.phone?.trim() || '—';
  const ngoName = user?.ngoName?.trim() || '—';
  const ngoRegNo = user?.registrationNumber?.trim() || '—';
  const address = user?.address?.trim() || '—';
  const isNgo = user?.role === 'ngo';

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
        <View style={styles.infoCard}>
          <Text style={[styles.infoTitle, { textAlign, writingDirection }]}>{t('profile.detailsTitle')}</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { textAlign, writingDirection }]}>{t('auth.fullName')}</Text>
            <Text style={[styles.infoValue, { textAlign, writingDirection }]}>{name}</Text>
          </View>
          {isNgo ? (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { textAlign, writingDirection }]}>{t('auth.ngoName')}</Text>
              <Text style={[styles.infoValue, { textAlign, writingDirection }]}>{ngoName}</Text>
            </View>
          ) : null}
          {isNgo ? (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { textAlign, writingDirection }]}>{t('auth.registrationNumber')}</Text>
              <Text style={[styles.infoValue, { textAlign, writingDirection }]}>{ngoRegNo}</Text>
            </View>
          ) : null}
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { textAlign, writingDirection }]}>{t('auth.phone')}</Text>
            <Text style={[styles.infoValue, { textAlign, writingDirection }]}>{phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { textAlign, writingDirection }]}>{t('auth.email')}</Text>
            <Text style={[styles.infoValue, { textAlign, writingDirection }]}>{email}</Text>
          </View>
          {isNgo ? (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { textAlign, writingDirection }]}>{t('auth.address')}</Text>
              <Text style={[styles.infoValue, { textAlign, writingDirection }]}>{address}</Text>
            </View>
          ) : null}
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
  infoCard: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  infoRow: {
    gap: spacing.xs,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '700',
  },
  infoValue: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
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
