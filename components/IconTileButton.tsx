import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, layout, radii, spacing } from '../utils/constants';

type Props = {
  label: string;
  onPress: () => void;
  icon: keyof typeof Ionicons.glyphMap;
  /** Teal = default, slate = neutral */
  accent?: 'teal' | 'slate';
  disabled?: boolean;
};

/**
 * Large tappable row with icon — optimized for home navigation and stress use.
 */
export const IconTileButton = memo(function IconTileButton({
  label,
  onPress,
  icon,
  accent = 'teal',
  disabled = false,
}: Props) {
  const circleBg = accent === 'teal' ? colors.primaryLight : colors.surfaceMuted;
  const iconColor = accent === 'teal' ? colors.primaryDark : colors.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.row,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={[styles.iconCircle, { backgroundColor: circleBg }]}>
        <Ionicons name={icon} size={26} color={iconColor} />
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    minHeight: layout.iconTileMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    // gap: spacing.md,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.primaryBorder,
  },
  disabled: {
    opacity: 0.5,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.15,
  },
});
