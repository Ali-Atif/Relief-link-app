import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../components';
import { Input } from '../components/Input';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import type { RootStackParamList } from '../navigation/types';
import { colors, radii, spacing } from '../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'RegisterNgo'>;

type FormErrors = {
  ngoName?: string;
  registrationNumber?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export function RegisterNgoScreen({ navigation }: Props) {
  const { registerNgo, error, clearError, busy } = useAuth();
  const { t } = useLanguage();

  const [ngoName, setNgoName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      clearError();
      setErrors({});
    });
    return unsub;
  }, [navigation, clearError]);

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // NGO Name validation
    if (!ngoName.trim()) {
      newErrors.ngoName = t('registerNgo.errorNgoNameRequired');
    } else if (ngoName.trim().length < 2) {
      newErrors.ngoName = t('registerNgo.errorNgoNameMinLength');
    }

    // Registration Number validation
    if (!registrationNumber.trim()) {
      newErrors.registrationNumber = t('registerNgo.errorRegNumberRequired');
    }

    // Contact Person validation
    if (!contactPerson.trim()) {
      newErrors.contactPerson = t('registerNgo.errorContactRequired');
    } else if (contactPerson.trim().length < 2) {
      newErrors.contactPerson = t('registerNgo.errorContactMinLength');
    }

    // Phone validation
    const digitsOnly = phone.replace(/\D/g, '');
    if (!digitsOnly) {
      newErrors.phone = t('registerNgo.errorPhoneRequired');
    } else if (digitsOnly.length < 8) {
      newErrors.phone = t('registerNgo.errorPhoneMinDigits');
    } else if (digitsOnly.length > 15) {
      newErrors.phone = t('registerNgo.errorPhoneMaxDigits');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = t('registerNgo.errorEmailRequired');
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = t('registerNgo.errorEmailInvalid');
    }

    // Password validation
    if (!password) {
      newErrors.password = t('registerNgo.errorPasswordRequired');
    } else if (password.length < 6) {
      newErrors.password = t('registerNgo.errorPasswordMinLength');
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = t('registerNgo.errorConfirmRequired');
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t('registerNgo.errorPasswordMismatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [ngoName, registrationNumber, contactPerson, phone, email, password, confirmPassword, t]);

  const handleRegister = useCallback(async () => {
    if (!validate()) {
      return;
    }

    const success = await registerNgo(
      ngoName.trim(),
      registrationNumber.trim(),
      contactPerson.trim(),
      phone.trim(),
      email.trim(),
      password,
    );

    if (success) {
      // Navigate to Login screen after successful registration
      // Using replace to prevent user from going back to registration
      navigation.replace('Login');
    } else if (error) {
      Alert.alert(t('registerNgo.errorTitle'), error);
    }
  }, [validate, registerNgo, error, navigation, t]);

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
            {/* Header */}
            <View style={styles.header}>
              <Pressable
                onPress={() => navigation.goBack()}
                style={styles.backButton}
                accessibilityRole="button"
              >
                <Ionicons name="arrow-back-outline" size={24} color={colors.text} />
              </Pressable>
              <View style={styles.headerIcon}>
                <Ionicons name="business-outline" size={32} color={colors.primary} />
              </View>
              <Text style={styles.title}>{t('registerNgo.title')}</Text>
              <Text style={styles.subtitle}>{t('registerNgo.subtitle')}</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Input
                label={t('registerNgo.labelNgoName')}
                value={ngoName}
                onChangeText={(text) => {
                  setNgoName(text);
                  if (errors.ngoName) setErrors((prev) => ({ ...prev, ngoName: undefined }));
                }}
                placeholder={t('registerNgo.phNgoName')}
                leadingIcon="business-outline"
                error={errors.ngoName}
                editable={!busy}
                autoComplete="organization"
              />

              <Input
                label={t('registerNgo.labelRegistrationNumber')}
                value={registrationNumber}
                onChangeText={(text) => {
                  setRegistrationNumber(text);
                  if (errors.registrationNumber) setErrors((prev) => ({ ...prev, registrationNumber: undefined }));
                }}
                placeholder={t('registerNgo.phRegistrationNumber')}
                leadingIcon="document-text-outline"
                error={errors.registrationNumber}
                editable={!busy}
              />

              <Input
                label={t('registerNgo.labelContactPerson')}
                value={contactPerson}
                onChangeText={(text) => {
                  setContactPerson(text);
                  if (errors.contactPerson) setErrors((prev) => ({ ...prev, contactPerson: undefined }));
                }}
                placeholder={t('registerNgo.phContactPerson')}
                leadingIcon="person-outline"
                error={errors.contactPerson}
                editable={!busy}
                autoComplete="name"
              />

              <Input
                label={t('registerNgo.labelPhone')}
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                placeholder={t('registerNgo.phPhone')}
                leadingIcon="call-outline"
                keyboardType="phone-pad"
                error={errors.phone}
                editable={!busy}
                autoComplete="tel"
              />

              <Input
                label={t('registerNgo.labelEmail')}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder={t('registerNgo.phEmail')}
                leadingIcon="mail-outline"
                keyboardType="email-address"
                error={errors.email}
                editable={!busy}
                autoCapitalize="none"
                autoComplete="email"
              />

              <Input
                label={t('registerNgo.labelPassword')}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder={t('registerNgo.phPassword')}
                leadingIcon="lock-closed-outline"
                secure
                error={errors.password}
                editable={!busy}
                autoComplete="new-password"
              />

              <Input
                label={t('registerNgo.labelConfirmPassword')}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                placeholder={t('registerNgo.phConfirmPassword')}
                leadingIcon="lock-closed-outline"
                secure
                error={errors.confirmPassword}
                editable={!busy}
                autoComplete="new-password"
              />
            </View>

            {/* Submit */}
            <View style={styles.actions}>
              <PrimaryButton
                label={busy ? t('registerNgo.creating') : t('registerNgo.submit')}
                icon="checkmark-circle-outline"
                onPress={handleRegister}
                disabled={busy}
              />
              {busy ? <ActivityIndicator color={colors.primary} style={styles.spinner} /> : null}

              <PrimaryButton
                label={t('registerNgo.backToRole')}
                variant="outline"
                icon="arrow-back-outline"
                onPress={() => navigation.goBack()}
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
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
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
