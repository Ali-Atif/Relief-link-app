import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton, ScreenLayout } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import type { AuthStackParamList } from '../navigation/types';
import { colors, radii, spacing } from '../utils/constants';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { login, error, clearError, busy } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => clearError());
    return unsub;
  }, [navigation, clearError]);

  return (
    <ScreenLayout title={t('nav.reliefLink')} subtitle={t('auth.loginSubtitle')}>
      <Pressable
        onPress={() => void toggleLanguage()}
        style={({ pressed }) => [styles.langRow, pressed && styles.langPressed]}
        accessibilityRole="button"
      >
        <Ionicons name="globe-outline" size={22} color={colors.primaryDark} />
        <Text style={styles.langText}>
          {language === 'en' ? 'English → اردو' : 'اردو → English'}
        </Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </Pressable>

      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={20} color={colors.emergency} />
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.field}>
        <Text style={styles.label}>{t('auth.email')}</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder={t('auth.phEmail')}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          editable={!busy}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>{t('auth.password')}</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder={t('auth.phPassword')}
          secureTextEntry
          autoComplete="password"
          editable={!busy}
        />
      </View>

      <PrimaryButton
        label={busy ? t('auth.signingIn') : t('auth.signIn')}
        icon="log-in-outline"
        onPress={() => login(email, password)}
        disabled={busy}
      />
      {busy ? <ActivityIndicator color={colors.primary} style={styles.spinner} /> : null}

      <PrimaryButton
        label={t('auth.createAccountBtn')}
        variant="outline"
        icon="person-add-outline"
        onPress={() => navigation.navigate('Register')}
        disabled={busy}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'stretch',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  langPressed: {
    opacity: 0.9,
    backgroundColor: colors.surfaceMuted,
  },
  langText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: '#fef2f2',
    borderRadius: radii.md,
    marginBottom: spacing.sm,
  },
  error: {
    flex: 1,
    color: colors.emergencyDark,
    fontSize: 14,
    fontWeight: '600',
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.surface,
    fontSize: 16,
    color: colors.text,
  },
  spinner: {
    marginTop: -spacing.sm,
  },
});
