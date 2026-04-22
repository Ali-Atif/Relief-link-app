import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Contacts from 'expo-contacts';
import { useCallback, useRef, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton, ScreenLayout } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { addEmergencyContact } from '../services/emergencyContactsStorage';
import { sendPendingSosSmsToNewContact } from '../services/sosService';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../utils/constants';
import { validatePhoneNumber } from '../utils/phoneValidation';

type Props = NativeStackScreenProps<RootStackParamList, 'AddContact'>;

export function AddContactScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const heroDirection = language === 'ur' ? 'rtl' : 'ltr';

  const onBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Contacts' as never);
    }
  }, [navigation]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [picking, setPicking] = useState(false);
  const pickingInFlight = useRef(false);

  const displayNameFromContact = useCallback(
    (c: Contacts.ExistingContact) => {
      const full = c.name?.trim();
      if (full) {
        return full;
      }
      const fromParts = [c.firstName, c.middleName, c.lastName]
        .filter((x): x is string => Boolean(x && String(x).trim()))
        .join(' ')
        .trim();
      if (fromParts) {
        return fromParts;
      }
      if (c.company?.trim()) {
        return c.company.trim();
      }
      return t('addContact.unknownContactName');
    },
    [t],
  );

  const pickFromContacts = useCallback(async () => {
    if (Platform.OS === 'web') {
      Alert.alert(t('addContact.contactsWebTitle'), t('addContact.contactsWebMsg'));
      return;
    }
    if (pickingInFlight.current) {
      return;
    }
    pickingInFlight.current = true;
    setPicking(true);
    try {
      const available = await Contacts.isAvailableAsync();
      if (!available) {
        Alert.alert(
          t('addContact.contactsUnavailableTitle'),
          t('addContact.contactsUnavailableMsg'),
        );
        return;
      }
      if (Platform.OS === 'android') {
        const perm = await Contacts.requestPermissionsAsync();
        if (perm.status !== 'granted') {
          Alert.alert(
            t('addContact.contactsPermissionTitle'),
            t('addContact.contactsPermissionMsg'),
          );
          return;
        }
      }
      const contact = await Contacts.presentContactPickerAsync();
      if (!contact) {
        return;
      }
      const nameStr = displayNameFromContact(contact);
      const withNumbers = contact.phoneNumbers?.filter(
        (p) => p.number && String(p.number).trim().length > 0,
      );
      if (!withNumbers?.length) {
        setName((prev) => (prev.trim() ? prev : nameStr));
        Alert.alert(
          t('addContact.contactNoPhoneTitle'),
          t('addContact.contactNoPhoneMsg'),
        );
        return;
      }
      const primary = withNumbers.find((p) => p.isPrimary) ?? withNumbers[0];
      const raw = String(primary.number).trim();
      setName(nameStr);
      setPhone(raw);
      setPhoneError(null);
    } catch {
      Alert.alert(
        t('addContact.contactPickerErrorTitle'),
        t('addContact.contactPickerErrorMsg'),
      );
    } finally {
      pickingInFlight.current = false;
      setPicking(false);
    }
  }, [displayNameFromContact, t]);

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
      await addEmergencyContact({ name: nameTrim, phone: phoneCheck.value }, user?.uid);
      const pendingSms = await sendPendingSosSmsToNewContact(phoneCheck.value, user?.uid);
      if (pendingSms.status === 'opened') {
        Alert.alert(t('sos.pendingSmsOpenedTitle'), t('sos.pendingSmsOpenedMsg'));
      } else if (pendingSms.status === 'sms_unavailable') {
        Alert.alert(t('sos.smsNoTitle'), t('sos.smsNoMsgWithLink', { url: pendingSms.mapsUrl }));
      } else if (pendingSms.status === 'cancelled') {
        Alert.alert(t('sos.cancelTitle'), t('sos.pendingSmsStillQueuedMsg'));
      }
      navigation.goBack();
    } catch {
      Alert.alert(t('addContact.saveFailTitle'), t('addContact.tryAgain'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenLayout
      title={t('nav.addContact')}
      subtitle={t('addContact.subtitle')}
      showBack={{
        label: t('contacts.backChip'),
        onPress: onBack,
        accessibilityLabel: t('contacts.backChip'),
      }}
      heroDirection={heroDirection}
    >
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
      <View style={styles.actionButtons}>
        <PrimaryButton
          label={picking ? t('addContact.openingContacts') : t('addContact.pickFromContacts')}
          icon="people-outline"
          variant="outline"
          onPress={() => void pickFromContacts()}
          disabled={saving || picking}
        />
        <PrimaryButton
          label={saving ? t('addContact.saving') : t('addContact.save')}
          icon="save-outline"
          onPress={() => void save()}
          disabled={saving || picking}
        />
      </View>
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
  actionButtons: {
    gap: spacing.md,
  },
});
