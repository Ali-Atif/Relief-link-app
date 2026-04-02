import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text } from 'react-native';

import { ScreenLayout } from '../components';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'SOS'>;

export function SOSScreen(_props: Props) {
  return (
    <ScreenLayout title="Emergency SOS" subtitle="SOS actions will be implemented here.">
      <Text style={styles.note}>
        expo-location and expo-sms are available via services/location and services/sms.
      </Text>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  note: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
  },
});
