import { useHeaderHeight } from '@react-navigation/elements';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radii, spacing } from '../utils/constants';

type Props = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  /** When false, content is not inside ScrollView (required for FlatList / other VirtualizedLists). */
  scrollable?: boolean;
};

export function ScreenLayout({ title, subtitle, children, scrollable = true }: Props) {
  const headerHeight = useHeaderHeight();

  const header =
    title != null && title.length > 0 ? (
      <View style={styles.titleBlock}>
        <View style={styles.titleAccent} />
        <View style={styles.titleTextWrap}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
    ) : subtitle ? (
      <Text style={styles.subtitleOnly}>{subtitle}</Text>
    ) : null;

  const keyboardVerticalOffset = Platform.OS === 'ios' ? headerHeight : 0;
  /** Android relies on `softwareKeyboardLayoutMode: "resize"` in app.json; avoid double-adjust with KAV. */
  const keyboardBehavior = Platform.OS === 'ios' ? 'padding' : undefined;

  const avoiding = (inner: ReactNode) => (
    <KeyboardAvoidingView
      style={styles.keyboardFlex}
      behavior={keyboardBehavior}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {inner}
    </KeyboardAvoidingView>
  );

  if (!scrollable) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        {avoiding(
          <View style={styles.fixedOuter}>
            {header}
            <View style={[styles.body, styles.bodyFlex]}>{children}</View>
          </View>,
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {avoiding(
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {header}
          <View style={styles.body}>{children}</View>
        </ScrollView>,
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardFlex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.md + 2,
    paddingBottom: spacing.xl,
  },
  fixedOuter: {
    flex: 1,
    paddingHorizontal: spacing.md + 2,
    paddingBottom: spacing.xl,
  },
  bodyFlex: {
    flex: 1,
    minHeight: 0,
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
  body: {
    gap: spacing.md + 4,
  },
});
