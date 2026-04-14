import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Input } from '../components/Input';
import { PrimaryButton } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import type { RootStackParamList } from '../navigation/types';
import { colors, radii, spacing } from '../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { login, user, error, clearError, busy } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Navigate to Home when user becomes authenticated
  useEffect(() => {
    if (user) {
      navigation.replace('Home');
    }
  }, [user, navigation]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      clearError();
      setEmailError('');
      setPasswordError('');
    });
    return unsub;
  }, [navigation, clearError]);

  const validate = useCallback((): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let isValid = true;

    if (!email.trim()) {
      setEmailError(t('login.errorEmailRequired'));
      isValid = false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError(t('login.errorEmailInvalid'));
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError(t('login.errorPasswordRequired'));
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  }, [email, password, t]);

  const handleLogin = useCallback(() => {
    if (validate()) {
      login(email.trim(), password);
    }
  }, [validate, login, email, password]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* Language Toggle */}
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

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Ionicons name="log-in-outline" size={32} color={colors.primary} />
              </View>
              <Text style={styles.title}>{t('login.title')}</Text>
              <Text style={styles.subtitle}>{t('login.subtitle')}</Text>
            </View>

            {/* Error Display */}
            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={20} color={colors.emergency} />
                <Text style={styles.error}>{error}</Text>
              </View>
            ) : null}

            {/* Form */}
            <View style={styles.form}>
              <Input
                label={t('auth.email')}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError('');
                }}
                placeholder={t('auth.phEmail')}
                leadingIcon="mail-outline"
                keyboardType="email-address"
                error={emailError}
                autoCapitalize="none"
                autoComplete="email"
                editable={!busy}
              />

              <Input
                label={t('auth.password')}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) setPasswordError('');
                }}
                placeholder={t('auth.phPassword')}
                leadingIcon="lock-closed-outline"
                secure
                error={passwordError}
                editable={!busy}
                autoComplete="password"
              />
            </View>

            {/* Submit */}
            <View style={styles.actions}>
              <PrimaryButton
                label={busy ? t('auth.signingIn') : t('auth.signIn')}
                icon="log-in-outline"
                onPress={handleLogin}
                disabled={busy}
              />
              {busy ? <ActivityIndicator color={colors.primary} style={styles.spinner} /> : null}

              <PrimaryButton
                label={t('auth.createAccountBtn')}
                variant="outline"
                icon="person-add-outline"
                onPress={() => navigation.navigate('SelectRole')}
                disabled={busy}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xl + 20,
  },
  container: {
    flex: 1,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-end',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  langPressed: {
    opacity: 0.9,
    backgroundColor: colors.surfaceMuted,
  },
  langText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: '#fef2f2',
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
  error: {
    flex: 1,
    color: colors.emergencyDark,
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actions: {
    gap: spacing.sm,
  },
  spinner: {
    marginTop: -spacing.sm,
  },
});
