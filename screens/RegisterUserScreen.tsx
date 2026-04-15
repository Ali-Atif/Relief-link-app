import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton, ScreenLayout } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import type { AuthStackParamList } from '../navigation/types';
import { colors, spacing } from '../utils/constants';
import { validatePhoneNumber } from '../utils/phoneValidation';

type Props = NativeStackScreenProps<AuthStackParamList, 'RegisterUser'>;

export function RegisterUserScreen({ navigation }: Props) {
  const { register, error, clearError, busy } = useAuth();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      clearError();
      setLocalError(null);
    });
    return unsub;
  }, [navigation, clearError]);

  const handleRegister = async () => {
    setLocalError(null);
    if (!name.trim()) {
      setLocalError(t('auth.nameRequired'));
      return;
    }
    const phoneCheck = validatePhoneNumber(phone);
    if (!phoneCheck.valid) {
      setLocalError(t(`phone.${phoneCheck.errorKey}`));
      return;
    }
    if (password !== confirm) {
      setLocalError(t('auth.passwordMismatch'));
      return;
    }
    if (password.length < 6) {
      setLocalError(t('auth.passwordTooShort'));
      return;
    }
    const ok = await register({
      email,
      password,
      role: 'user',
      displayName: name,
      phone: phoneCheck.value,
    });
    if (ok) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login', params: { prefilledEmail: email.trim() } }],
        }),
      );
    }
  };

  const displayError = localError ?? error;

  return (
    <ScreenLayout title={t('auth.registerAsUser')} subtitle={t('auth.userRegisterSubtitle')}>
      {displayError ? <Text style={styles.error}>{displayError}</Text> : null}

      <View style={styles.field}>
        <Text style={styles.label}>{t('auth.fullName')}</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder={t('auth.phFullName')}
          editable={!busy}
        />
      </View>
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
        <Text style={styles.label}>{t('auth.phone')}</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder={t('auth.phUserPhone')}
          keyboardType="phone-pad"
          autoComplete="tel"
          editable={!busy}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>{t('auth.password')}</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder={t('auth.phNewPassword')}
          secureTextEntry
          autoComplete="new-password"
          editable={!busy}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>{t('auth.confirmPassword')}</Text>
        <TextInput
          style={styles.input}
          value={confirm}
          onChangeText={setConfirm}
          placeholder={t('auth.phConfirm')}
          secureTextEntry
          autoComplete="new-password"
          editable={!busy}
        />
      </View>

      <PrimaryButton
        label={busy ? t('auth.creating') : t('auth.createAccountSubmit')}
        icon="person-add-outline"
        onPress={handleRegister}
        disabled={busy}
      />
      {busy ? <ActivityIndicator color={colors.primary} style={styles.spinner} /> : null}

      <PrimaryButton
        label={t('auth.backToRegisterOptions')}
        variant="outline"
        icon="arrow-back-outline"
        onPress={() => navigation.navigate('Register')}
        disabled={busy}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  error: {
    color: '#b91c1c',
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
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
