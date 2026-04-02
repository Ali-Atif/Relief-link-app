import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenLayout } from '../components';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'Guides'>;

const SAMPLE_GUIDES = [
  { id: 'earthquake', title: 'Earthquake basics' },
  { id: 'flood', title: 'Flood safety' },
  { id: 'wildfire', title: 'Wildfire evacuation' },
];

export function GuidesScreen({ navigation }: Props) {
  return (
    <ScreenLayout title="Safety guides" subtitle="Tap a topic to open the detail screen.">
      <FlatList
        data={SAMPLE_GUIDES}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() =>
              navigation.navigate('GuideDetail', { guideId: item.id, title: item.title })
            }
          >
            <Text style={styles.rowTitle}>{item.title}</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        )}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
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
  rowPressed: {
    opacity: 0.9,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  chevron: {
    fontSize: 22,
    color: colors.primary,
  },
});
