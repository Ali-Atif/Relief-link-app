import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton, ScreenLayout } from '../components';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'Report'>;

export function ReportScreen({ navigation }: Props) {
  const [details, setDetails] = useState('');

  return (
    <ScreenLayout title="Report incident" subtitle="Describe what you observed (not submitted yet).">
      <View style={styles.field}>
        <Text style={styles.label}>Details</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={details}
          onChangeText={setDetails}
          placeholder="What happened? Where?"
          multiline
          textAlignVertical="top"
        />
      </View>
      <PrimaryButton label="Submit (placeholder)" onPress={() => navigation.goBack()} />
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
    minHeight: 120,
  },
  multiline: {
    paddingTop: spacing.md,
  },
});
