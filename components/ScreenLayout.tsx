import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GuideBackChip } from './GuideBackChip';
import { colors, radii, spacing } from '../utils/constants';
import { guideDetailScrollContent } from '../utils/guideDetailChrome';
import { blockDirection } from '../utils/layoutRtl';

export type ScreenLayoutBack = {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
};

type Props = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  /** Same gray pill as Guides — when set, screen should use `headerShown: false` on the stack. */
  showBack?: ScreenLayoutBack;
  /** Pass `language === 'ur' ? 'rtl' : 'ltr'` so the chip aligns like Guides. */
  heroDirection?: 'ltr' | 'rtl';
  /** Vertical gap between stacked children (default: roomy). Use smaller on dense home-style screens. */
  bodyGap?: number;
  /** Override scroll content bottom padding (e.g. less empty space above global tab bar on Home). */
  contentPaddingBottom?: number;
};

export function ScreenLayout({
  title,
  subtitle,
  children,
  showBack,
  heroDirection = 'ltr',
  bodyGap,
  contentPaddingBottom,
}: Props) {
  const writingDirection = heroDirection === 'rtl' ? 'rtl' : 'ltr';
  const bodyGapResolved = bodyGap ?? spacing.md + 4;
  const scrollContent = [
    guideDetailScrollContent,
    ...(contentPaddingBottom != null ? [{ paddingBottom: contentPaddingBottom }] : []),
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
      >
        {showBack ? (
          <View style={blockDirection(heroDirection)}>
            <GuideBackChip
              label={showBack.label}
              onPress={showBack.onPress}
              accessibilityLabel={showBack.accessibilityLabel}
            />
          </View>
        ) : null}
        {title ? (
          <View style={blockDirection(heroDirection)}>
            <View style={styles.titleBlock}>
              <View style={styles.titleAccent} />
              <View style={styles.titleTextWrap}>
                <Text style={[styles.title, { writingDirection }]}>{title}</Text>
                {subtitle ? (
                  <Text style={[styles.subtitle, { writingDirection }]}>{subtitle}</Text>
                ) : null}
              </View>
            </View>
          </View>
        ) : subtitle ? (
          <View style={blockDirection(heroDirection)}>
            <Text style={[styles.subtitleOnly, { writingDirection }]}>{subtitle}</Text>
          </View>
        ) : null}
        <View style={[styles.body, { gap: bodyGapResolved }]}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  titleBlock: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  titleAccent: {
    width: 5,
    borderRadius: radii.sm,
    backgroundColor: colors.primary,
    minHeight: 48,
  },
  titleTextWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    lineHeight: 24,
    fontWeight: '500',
  },
  subtitleOnly: {
    fontSize: 16,
    color: colors.textMuted,
    lineHeight: 24,
    marginBottom: spacing.lg,
    fontWeight: '500',
  },
  body: {},
});
