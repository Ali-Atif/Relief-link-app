import { Ionicons } from '@expo/vector-icons';
import {
  I18nManager,
  Platform,
  Pressable,
  type PressableStateCallbackType,
  StyleSheet,
  Text,
  type ViewStyle,
} from 'react-native';

import { colors, radii, spacing } from '../utils/constants';

type PressableWithHover = PressableStateCallbackType & { hovered?: boolean };

const WEB_TRANSITION: ViewStyle =
  Platform.OS === 'web'
    ? ({
        cursor: 'pointer',
        transition: 'transform 0.18s ease-out, box-shadow 0.18s ease-out, background-color 0.18s ease-out',
      } as ViewStyle)
    : {};

type Props = {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
};

/** Gray pill back control — same look on Guides list and Guide detail (mgx-style). */
export function GuideBackChip({ label, onPress, accessibilityLabel }: Props) {
  const icon = I18nManager.isRTL ? 'chevron-forward' : 'chevron-back';

  return (
    <Pressable
      onPress={onPress}
      style={(s) => {
        const hovered = Boolean((s as PressableWithHover).hovered);
        return [styles.chip, WEB_TRANSITION, (hovered || s.pressed) && styles.chipLifted];
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <Ionicons name={icon} size={18} color={colors.text} />
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: '#e2e8f0',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  chipLifted: {
    backgroundColor: '#cbd5e1',
    transform: [{ translateY: -2 }],
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
});
