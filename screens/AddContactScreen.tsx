import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton, ScreenLayout } from '../components';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslatedHeader } from '../hooks/useTranslatedHeader';
import { addEmergencyContact } from '../services/emergencyContactsStorage';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../utils/constants';
import { validatePhoneNumber } from '../utils/phoneValidation';

type Props = NativeStackScreenProps<RootStackParamList, 'AddContact'>;

export function AddContactScreen({ navigation }: Props) {
  const { t } = useLanguage();
  useTranslatedHeader(navigation, 'nav.addContact');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setPhoneError(null);

    const nameTrim = name.trim();
    if (!nameTrim) {
      Alert.alert(t('addContact.nameReqTitle'), t('addContact.nameReqMsg'));
      return;
    }

    const phoneCheck = validatePhoneNumber(phone);
    if (!phoneCheck.valid) {
      setPhoneError(t(`phone.${phoneCheck.errorKey}`));
      return;
    }

    setSaving(true);
    try {
      await addEmergencyContact({ name: nameTrim, phone: phoneCheck.value });
      navigation.goBack();
    } catch {
      Alert.alert(t('addContact.saveFailTitle'), t('addContact.tryAgain'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenLayout title={t('nav.addContact')} subtitle={t('addContact.subtitle')}>
      <View style={styles.field}>
        <Text style={styles.label}>{t('addContact.name')}</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder={t('addContact.phName')}
          autoCapitalize="words"
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>{t('addContact.phone')}</Text>
        <TextInput
          style={[styles.input, phoneError ? styles.inputError : null]}
          value={phone}
          onChangeText={(v) => {
            setPhone(v);
            if (phoneError) setPhoneError(null);
          }}
          placeholder="+92 300 1234567"
          keyboardType="phone-pad"
          autoComplete="tel"
        />
        {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
        <Text style={styles.hint}>{t('addContact.hint')}</Text>
      </View>
      <PrimaryButton
        label={saving ? t('addContact.saving') : t('addContact.save')}
        icon="save-outline"
        onPress={() => void save()}
        disabled={saving}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
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
  inputError: {
    borderColor: '#b91c1c',
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
