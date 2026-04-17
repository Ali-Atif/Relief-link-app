import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '../utils/constants';

type Props = {
  unreadCount: number;
  onPress: () => void;
  accessibilityLabel: string;
};

export function NotificationBell({ unreadCount, onPress, accessibilityLabel }: Props) {
  const count = unreadCount > 99 ? '99+' : String(unreadCount);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Ionicons name="notifications-outline" size={23} color={colors.primaryDark} />
      {unreadCount > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 42,
    height: 42,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.82,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 19,
    height: 19,
    paddingHorizontal: 4,
    borderRadius: radii.full,
    backgroundColor: colors.emergency,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  badgeText: {
    color: colors.onEmergency,
    fontWeight: '800',
    fontSize: 10,
  },
});
