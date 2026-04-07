import { Ionicons } from '@expo/vector-icons';
import { memo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, layout, radii, spacing } from '../utils/constants';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'filled' | 'outline';
  disabled?: boolean;
  children?: ReactNode;
  /** Ionicons name (e.g. "log-out-outline") */
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
};

export const PrimaryButton = memo(function PrimaryButton({
  label,
  onPress,
  variant = 'filled',
  disabled = false,
  icon,
  iconPosition = 'left',
}: Props) {
  const isOutline = variant === 'outline';
  const iconColor = isOutline ? colors.primaryDark : colors.onEmergency;
  const iconEl = icon ? (
    <Ionicons name={icon} size={22} color={disabled ? colors.textMuted : iconColor} />
  ) : null;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        isOutline ? styles.outline : styles.filled,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <View style={styles.inner}>
        {icon && iconPosition === 'left' ? iconEl : null}
        <Text
          style={[
            styles.label,
            isOutline && styles.labelOutline,
            disabled && styles.labelDisabled,
            icon ? styles.labelWithIcon : null,
          ]}
        >
          {label}
        </Text>
        {icon && iconPosition === 'right' ? iconEl : null}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  base: {
    minHeight: layout.buttonMinHeight,
    paddingHorizontal: spacing.md + 4,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // gap: spacing.sm,
  },
  filled: {
    backgroundColor: colors.primary,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  outline: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    color: colors.onEmergency,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  labelWithIcon: {
    flexShrink: 1,
  },
  labelOutline: {
    color: colors.primaryDark,
  },
  labelDisabled: {
    opacity: 0.9,
  },
});
