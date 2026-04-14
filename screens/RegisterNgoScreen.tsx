import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton, ScreenLayout } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import type { AuthStackParamList } from '../navigation/types';
import { colors, spacing } from '../utils/constants';

type Props = NativeStackScreenProps<AuthStackParamList, 'RegisterNgo'>;

export function RegisterNgoScreen({ navigation }: Props) {
  const { register, error, clearError, busy } = useAuth();
  const { t } = useLanguage();
  const [ngoName, setNgoName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
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
    if (!ngoName.trim() || !contactName.trim() || !phone.trim()) {
      setLocalError(t('auth.ngoFieldsRequired'));
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
      role: 'ngo',
      displayName: contactName,
      ngoName,
      phone,
      address,
    });
    if (ok) {
      navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] }));
    }
  };

  return (
    <ScreenLayout title={t('auth.registerAsNgo')} subtitle={t('auth.ngoRegisterSubtitle')}>
      {localError || error ? <Text style={styles.error}>{localError ?? error}</Text> : null}
      <View style={styles.field}>
        <Text style={styles.label}>{t('auth.ngoName')}</Text>
        <TextInput
          style={styles.input}
          value={ngoName}
          onChangeText={setNgoName}
          placeholder={t('auth.phNgoName')}
          editable={!busy}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>{t('auth.contactPerson')}</Text>
        <TextInput
          style={styles.input}
          value={contactName}
          onChangeText={setContactName}
          placeholder={t('auth.phContactPerson')}
          editable={!busy}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>{t('auth.phone')}</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder={t('auth.phNgoPhone')}
          keyboardType="phone-pad"
          editable={!busy}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>{t('auth.address')}</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder={t('auth.phNgoAddress')}
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
          editable={!busy}
        />
      </View>

      <PrimaryButton
        label={busy ? t('auth.creating') : t('auth.createAccountSubmit')}
        icon="business-outline"
        onPress={handleRegister}
        disabled={busy}
      />
      {busy ? <ActivityIndicator color={colors.primary} style={styles.spinner} /> : null}

      <PrimaryButton
        label={t('auth.backToRegisterOptions')}
        variant="outline"
        icon="arrow-back-outline"
        onPress={() => navigation.navigate('Register')}
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
