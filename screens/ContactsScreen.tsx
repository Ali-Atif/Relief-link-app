import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../components';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslatedHeader } from '../hooks/useTranslatedHeader';
import type { EmergencyContact } from '../services/emergencyContactsStorage';
import { getEmergencyContacts, removeEmergencyContact } from '../services/emergencyContactsStorage';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'Contacts'>;

export function ContactsScreen({ navigation }: Props) {
  const { t } = useLanguage();
  useTranslatedHeader(navigation, 'nav.contacts');

  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  const load = useCallback(async () => {
    setContacts(await getEmergencyContacts());
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const confirmDelete = (item: EmergencyContact) => {
    const name = item.name || t('contacts.contactFallback');
    Alert.alert(t('contacts.removeTitle'), t('contacts.removeMsg', { name, phone: item.phone }), [
      { text: t('contacts.cancel'), style: 'cancel' },
      {
        text: t('contacts.deleteAction'),
        style: 'destructive',
        onPress: async () => {
          try {
            await removeEmergencyContact(item.id);
            await load();
          } catch {
            Alert.alert(t('contacts.deleteErrTitle'), t('contacts.deleteErrMsg'));
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('contacts.title')}</Text>
        <Text style={styles.subtitle}>{t('contacts.subtitle')}</Text>
      </View>

      <FlatList
        style={styles.list}
        data={contacts}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        contentContainerStyle={contacts.length === 0 ? styles.listEmpty : styles.listContent}
        ListEmptyComponent={<Text style={styles.placeholder}>{t('contacts.empty')}</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowMain}>
              <Text style={styles.name}>{item.name || t('contacts.contactFallback')}</Text>
              <Text style={styles.phone}>{item.phone}</Text>
            </View>
            <Pressable
              onPress={() => confirmDelete(item)}
              style={({ pressed }) => [styles.deleteBtn, pressed && styles.deletePressed]}
              accessibilityRole="button"
              accessibilityLabel={`${t('contacts.delete')} ${item.name ?? ''}`}
            >
              <Text style={styles.deleteText}>{t('contacts.delete')}</Text>
            </Pressable>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <PrimaryButton
              label={t('contacts.add')}
              icon="add-circle-outline"
              onPress={() => navigation.navigate('AddContact')}
            />
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  listEmpty: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    justifyContent: 'center',
  },
  placeholder: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    paddingVertical: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowMain: {
    flex: 1,
    marginRight: spacing.sm,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  phone: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  deleteBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
  },
  deletePressed: {
    opacity: 0.88,
  },
  deleteText: {
    color: '#b91c1c',
    fontWeight: '600',
    fontSize: 14,
  },
  footer: {
    marginTop: spacing.md,
  },
});
