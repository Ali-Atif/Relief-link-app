import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

import { colors, radii, spacing } from '../../utils/constants';
import { flexRowWithDirection } from '../../utils/layoutRtl';

/** Vertical lift on press/hover — parent lists should leave this much scroll slack above the first row so tiles are not clipped. */
export const QUICK_TILE_LIFT_PX = 6;

const LIFT_PX = QUICK_TILE_LIFT_PX;

const WEB_CURSOR: ViewStyle =
  Platform.OS === 'web'
    ? ({
        cursor: 'pointer',
      } as ViewStyle)
    : {};

type Props = {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  badge?: string;
  /** Guides grid: centered icon + title only (no subtitle strip). */
  layout?: 'default' | 'compact';
  /** Layout direction for header row + text alignment. */
  direction?: 'ltr' | 'rtl';
  onPress?: () => void;
};

/**
 * Quick Access tile: spring lift + shadow on touch (mobile) and hover (web).
 * Whole card (icon + text) moves together like the reference “modal” float.
 */
export function QuickTile({
  title,
  subtitle,
  icon,
  color = colors.primary,
  badge,
  layout = 'default',
  direction = 'ltr',
  onPress,
}: Props) {
  const alignText = direction === 'rtl' ? 'right' : 'left';
  const touching = useRef(false);
  const hovering = useRef(false);
  const lift = useRef(new Animated.Value(0)).current;
  const [stackOnTop, setStackOnTop] = useState(false);

  const targetUp = useCallback(() => touching.current || hovering.current, []);

  const runSpring = useCallback(() => {
    const up = targetUp();
    setStackOnTop(up);
    Animated.spring(lift, {
      toValue: up ? 1 : 0,
      friction: 7,
      tension: 140,
      useNativeDriver: false,
    }).start();
  }, [lift, targetUp]);

  const onPressIn = useCallback(() => {
    touching.current = true;
    runSpring();
  }, [runSpring]);

  const onPressOut = useCallback(() => {
    touching.current = false;
    runSpring();
  }, [runSpring]);

  const onHoverIn = useCallback(() => {
    hovering.current = true;
    runSpring();
  }, [runSpring]);

  const onHoverOut = useCallback(() => {
    hovering.current = false;
    runSpring();
  }, [runSpring]);

  const translateY = lift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -LIFT_PX],
  });

  const shadowOpacity = lift.interpolate({
    inputRange: [0, 1],
    outputRange: [0.07, 0.18],
  });

  const shadowRadius = lift.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 22],
  });

  const elevation = lift.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 12],
  });

  return (
    <Animated.View
      style={[
        styles.shadowHost,
        WEB_CURSOR,
        stackOnTop && styles.cardStacked,
        {
          transform: [{ translateY }],
          shadowOpacity,
          shadowRadius,
          elevation,
        },
      ]}
    >
      <View style={styles.cardClip}>
        <Pressable
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          onHoverIn={onHoverIn}
          onHoverOut={onHoverOut}
          android_ripple={null}
          style={[styles.pressableFill, layout === 'compact' && styles.pressableCompact]}
        >
          {layout === 'compact' ? (
            <View style={styles.compactInner}>
              <View style={[styles.iconWrapCompact, { backgroundColor: color }]}>
                <Ionicons name={icon} size={26} color="#fff" />
              </View>
              <Text style={[styles.titleCompact, { textAlign: alignText }]} numberOfLines={2}>
                {title}
              </Text>
            </View>
          ) : (
            <>
              <View
                style={[
                  styles.header,
                  flexRowWithDirection(direction),
                  { backgroundColor: color + '22' /* translucent */ },
                  badge ? styles.headerWithBadge : styles.headerNoBadge,
                ]}
              >
                <View style={[styles.iconWrap, { backgroundColor: color }]}>
                  <Ionicons name={icon} size={20} color="#fff" />
                </View>
                {badge ? (
                  <View style={styles.badge}>
                    <Text style={[styles.badgeText, { textAlign: alignText }]}>{badge}</Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.body}>
                <Text
                  style={[styles.title, !subtitle && styles.titleNoSubtitle, { textAlign: alignText }]}
                  numberOfLines={2}
                >
                  {title}
                </Text>
                {subtitle ? (
                  <Text style={[styles.subtitle, { textAlign: alignText }]} numberOfLines={2}>
                    {subtitle}
                  </Text>
                ) : null}
              </View>
            </>
          )}
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  /** Shadow + lift live here so inner can clip tint to rounded corners without killing shadow. */
  shadowHost: {
    alignSelf: 'stretch',
    borderRadius: radii.md,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    zIndex: 0,
  },
  cardClip: {
    borderRadius: radii.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardStacked: {
    zIndex: 20,
  },
  pressableFill: {
    flexGrow: 1,
    flexShrink: 0,
  },
  pressableCompact: {
    justifyContent: 'center',
  },
  compactInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    minHeight: 112,
  },
  iconWrapCompact: {
    width: 56,
    height: 56,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  titleCompact: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 18,
    width: '100%',
  },
  header: {
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
  },
  headerNoBadge: {
    justifyContent: 'flex-start',
  },
  headerWithBadge: {
    justifyContent: 'space-between',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomLeftRadius: radii.md,
    borderBottomRightRadius: radii.md,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  titleNoSubtitle: {
    marginBottom: 0,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },
});

export default QuickTile;
