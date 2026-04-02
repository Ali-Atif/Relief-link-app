import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useLayoutEffect } from 'react';
import { StyleSheet, Text } from 'react-native';

import { ScreenLayout } from '../components';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'GuideDetail'>;

export function GuideDetailScreen({ route, navigation }: Props) {
  const { guideId, title } = route.params;

  useLayoutEffect(() => {
    if (title) {
      navigation.setOptions({ title });
    }
  }, [navigation, title]);

  return (
    <ScreenLayout title={title ?? 'Guide'} subtitle={`Topic ID: ${guideId}`}>
      <Text style={styles.body}>
        This is a placeholder detail view. Replace with real content from your CMS or bundled assets.
      </Text>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  body: {
    fontSize: 16,
    color: colors.textMuted,
    lineHeight: 24,
  },
});
