import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, ScreenLayout } from '../components';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  return (
    <ScreenLayout title="Home" subtitle="Choose where to go next.">
      <View style={styles.grid}>
        <PrimaryButton label="Emergency SOS" onPress={() => navigation.navigate('SOS')} />
        <PrimaryButton label="Trusted contacts" onPress={() => navigation.navigate('Contacts')} />
        <PrimaryButton label="Report incident" onPress={() => navigation.navigate('Report')} />
        <PrimaryButton label="Safety guides" onPress={() => navigation.navigate('Guides')} />
      </View>
      <Text style={styles.hint}>
        Location and SMS modules are wired in services/location and services/sms for later use.
      </Text>
      <PrimaryButton label="Back to login" variant="outline" onPress={() => navigation.navigate('Login')} />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: spacing.md,
  },
  hint: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
  },
});
