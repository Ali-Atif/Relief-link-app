import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, layout, radii, spacing } from '../utils/constants';

type Props = {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  subtitle?: ReactNode;
  emergencySubLabel?: string;
  accessibilityLabel?: string;
};

/** Extra-large high-contrast SOS — primary emergency action. */
export function SosButton({
  onPress,
  disabled = false,
  loading = false,
  subtitle,
  emergencySubLabel = 'Emergency alert',
  accessibilityLabel = 'Emergency SOS. Sends your location by SMS to saved contacts.',
}: Props) {
  const isBusy = loading || disabled;
  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onPress}
        disabled={isBusy}
        style={({ pressed }) => [
          styles.outerRing,
          pressed && !isBusy && styles.pressed,
          isBusy && styles.disabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <View style={styles.button}>
          {loading ? (
            <ActivityIndicator color={colors.onEmergency} size="large" />
          ) : (
            <>
              <View style={styles.iconRow}>
                <Ionicons name="warning" size={36} color={colors.onEmergency} />
              </View>
              <Text style={styles.label}>SOS</Text>
              <Text style={styles.subLabel}>{emergencySubLabel}</Text>
            </>
          )}
        </View>
      </Pressable>
      {subtitle ? <Text style={styles.hint}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  outerRing: {
    width: '100%',
    borderRadius: radii.xl,
    padding: 4,
    backgroundColor: colors.emergencyRing,
    shadowColor: colors.emergencyDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  button: {
    minHeight: layout.sosMinHeight,
    borderRadius: radii.lg,
    backgroundColor: colors.emergency,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg + 4,
    paddingHorizontal: spacing.lg,
    borderWidth: 3,
    borderColor: colors.onEmergency,
  },
  iconRow: {
    marginBottom: spacing.sm,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.992 }],
  },
  disabled: {
    opacity: 0.62,
  },
  label: {
    fontSize: 44,
    fontWeight: '900',
    color: colors.onEmergency,
    letterSpacing: 6,
  },
  subLabel: {
    marginTop: spacing.sm,
    fontSize: 15,
    fontWeight: '700',
    color: colors.emergencyRing,
    letterSpacing: 0.3,
  },
  hint: {
    marginTop: spacing.md,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.sm,
    fontWeight: '500',
  },
});
