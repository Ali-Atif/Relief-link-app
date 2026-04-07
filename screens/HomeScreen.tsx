import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { IconTileButton, PrimaryButton, ScreenLayout, SosButton } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslatedHeader } from '../hooks/useTranslatedHeader';
import { useSosEmergency } from '../hooks/useSosEmergency';
import type { RootStackParamList } from '../navigation/types';
import { colors, radii, spacing } from '../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { user, logout, busy, error } = useAuth();
  const { sosLoading, triggerSos } = useSosEmergency();
  const { t, language, toggleLanguage } = useLanguage();

  useTranslatedHeader(navigation, 'nav.reliefLink');

  const goSosDetails = useCallback(() => navigation.navigate('SOS'), [navigation]);
  const goContacts = useCallback(() => navigation.navigate('Contacts'), [navigation]);
  const goReport = useCallback(() => navigation.navigate('Report'), [navigation]);
  const goGuides = useCallback(() => navigation.navigate('Guides'), [navigation]);
  const goQuiz = useCallback(() => navigation.navigate('Quiz'), [navigation]);

  return (
    <ScreenLayout title={t('home.title')} subtitle={t('home.subtitle')}>
      
      {/* --- Relief / Language Bar --- */}
      <Pressable
        onPress={() => void toggleLanguage()}
        style={({ pressed }) => [styles.modernBar, pressed && styles.barPressed]}
        accessibilityRole="button"
        accessibilityLabel={t('home.language')}
      >
        <View style={styles.langIconWrap}>
          <Ionicons name="globe-outline" size={24} color={colors.primaryDark} />
        </View>
        <View style={styles.langTextCol}>
          <Text style={styles.langLabel}>{t('home.language')}</Text>
          <Text style={styles.langValue}>
            {language === 'en' ? 'English → اردو' : 'اردو → English'}
          </Text>
          <Text style={styles.langHint}>{t('home.tapToSwitch')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </Pressable>

      {/* --- Online / Offline Status Pill --- */}
      <View style={[styles.statusPill, user?.email ? styles.online : styles.offline]}>
        <View style={styles.statusIconWrap}>
          <Ionicons
            name={user?.email ? 'person-circle-outline' : 'cloud-offline-outline'}
            size={24}
            color={user?.email ? colors.text : colors.surfaceMuted}
          />
          {user?.email && <View style={styles.onlineDot} />}
        </View>
        <Text style={styles.signedInText} numberOfLines={1}>
          {user?.email
            ? t('home.signedInAs', { email: user.email })
            : t('home.signedInOffline')}
        </Text>
      </View>

      {/* --- Error Box --- */}
      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={20} color={colors.emergency} />
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}

      {/* --- SOS Button --- */}
      <SosButton
        onPress={triggerSos}
        loading={sosLoading}
        disabled={busy}
        subtitle={t('sos.subtitleHint')}
        emergencySubLabel={t('sos.buttonSub')}
        accessibilityLabel={t('sos.a11yLabel')}
      />

      {/* --- SOS Details Button --- */}
      <PrimaryButton
        label={t('home.sosDetails')}
        variant="outline"
        icon="information-circle-outline"
        onPress={goSosDetails}
        disabled={busy}
      />

      {/* --- Quick Actions --- */}
      <Text style={styles.sectionLabel}>{t('home.quickActions')}</Text>
      <View style={styles.grid}>
        <IconTileButton
          label={t('home.emergencyContacts')}
          icon="people"
          onPress={goContacts}
        />
        <IconTileButton
          label={t('home.reportIncident')}
          icon="document-text"
          onPress={goReport}
        />
        <IconTileButton
          label={t('home.safetyGuides')}
          icon="book"
          onPress={goGuides}
        />
        <IconTileButton
          label={t('home.awarenessQuiz')}
          icon="school"
          accent="slate"
          onPress={goQuiz}
        />
      </View>

      {/* --- Hint Box --- */}
      <View style={styles.hintBox}>
        <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
        <Text style={styles.hint}>{t('home.hint')}</Text>
      </View>

      {/* --- Sign Out Button --- */}
      <PrimaryButton
        label={busy ? t('home.signingOut') : t('home.signOut')}
        variant="outline"
        icon="log-out-outline"
        onPress={() => logout()}
        disabled={busy || sosLoading}
      />
      {busy ? <ActivityIndicator color={colors.primary} style={styles.spinner} /> : null}
    </ScreenLayout>
  );
}

// --- Modern Styles for Only Online / Relief Bar ---
const styles = StyleSheet.create({
  // ---- Relief / Language Bar ----
  modernBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.surface,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    marginVertical: spacing.sm,
  },
  barPressed: {
    opacity: 0.92,
    backgroundColor: colors.surfaceMuted,
  },

  langIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langTextCol: { flex: 1 },
  langLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  langValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
    marginTop: 4,
  },
  langHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },

  // ---- Online / Offline Status Pill ----
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginVertical: spacing.sm,
  },
  online: {
    backgroundColor: colors.primary,
  },
  offline: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusIconWrap: {
    marginRight: spacing.md,
    position: 'relative',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4ade80',
    borderWidth: 1,
    borderColor: colors.surface,
  },
  signedInText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.surface,
  },

  // --- Error Box ---
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginVertical: spacing.sm,
  },
  error: {
    flex: 1,
    color: colors.emergencyDark,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },

  // --- Quick Actions / Section ---
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.sm,
    marginBottom: -spacing.xs,
  },
  grid: { gap: spacing.md },

  // --- Hint Box ---
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  hint: {
    flex: 1,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
    fontWeight: '500',
  },

  // --- Spinner ---
  spinner: { marginTop: -spacing.sm },
});
