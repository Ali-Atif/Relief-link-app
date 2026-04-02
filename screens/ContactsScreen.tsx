import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text } from 'react-native';

import { PrimaryButton, ScreenLayout } from '../components';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'Contacts'>;

export function ContactsScreen({ navigation }: Props) {
  return (
    <ScreenLayout title="Trusted contacts" subtitle="Your emergency contacts will appear here.">
      <Text style={styles.placeholder}>No contacts yet (placeholder).</Text>
      <PrimaryButton label="Add contact" onPress={() => navigation.navigate('AddContact')} />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    fontSize: 15,
    color: colors.textMuted,
  },
});
