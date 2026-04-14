import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLanguage } from '../contexts/LanguageContext';
import type { RootStackParamList } from '../navigation/types';
import { colors, radii, spacing } from '../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'SelectRole'>;

export function SelectRoleScreen({ navigation }: Props) {
  const { t, language, toggleLanguage } = useLanguage();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Language Toggle */}
        <Pressable
          onPress={() => void toggleLanguage()}
          style={({ pressed }) => [styles.langRow, pressed && styles.langPressed]}
          accessibilityRole="button"
        >
          <Ionicons name="globe-outline" size={22} color={colors.primaryDark} />
          <Text style={styles.langText}>
            {language === 'en' ? 'English → اردو' : 'اردو → English'}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="people-outline" size={48} color={colors.primary} />
          </View>
          <Text style={styles.title}>{t('roleSelect.title')}</Text>
          <Text style={styles.subtitle}>{t('roleSelect.subtitle')}</Text>
        </View>

        {/* Role Selection */}
        <View style={styles.options}>
          {/* Register as User */}
          <Pressable
            onPress={() => navigation.navigate('RegisterUser')}
            style={({ pressed }) => [styles.optionCard, pressed && styles.optionPressed]}
            accessibilityRole="button"
            accessibilityLabel={t('roleSelect.userRole')}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="person-outline" size={36} color={colors.primary} />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>{t('roleSelect.userRole')}</Text>
              <Text style={styles.optionDesc}>{t('roleSelect.userDesc')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
          </Pressable>

          {/* Register as NGO */}
          <Pressable
            onPress={() => navigation.navigate('RegisterNgo')}
            style={({ pressed }) => [styles.optionCard, pressed && styles.optionPressed]}
            accessibilityRole="button"
            accessibilityLabel={t('roleSelect.ngoRole')}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="business-outline" size={36} color={colors.primary} />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>{t('roleSelect.ngoRole')}</Text>
              <Text style={styles.optionDesc}>{t('roleSelect.ngoDesc')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
          </Pressable>
        </View>

        {/* Already have account */}
        <Pressable
          onPress={() => navigation.navigate('Login')}
          style={styles.loginLink}
          accessibilityRole="button"
        >
          <Text style={styles.loginLinkText}>{t('roleSelect.alreadyHaveAccount')}</Text>
          <Ionicons name="log-in-outline" size={18} color={colors.primary} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.md + 2,
    paddingTop: spacing.lg,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-end',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  langPressed: {
    opacity: 0.9,
    backgroundColor: colors.surfaceMuted,
  },
  langText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xl * 2,
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  options: {
    gap: spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionPressed: {
    opacity: 0.9,
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  optionDesc: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  loginLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
  },
  loginLinkText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
});
