import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { I18nManager, Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenLayout, SosButton } from '../components';
import QuickTile from '../components/newUI/QuickTile';
import { useLanguage } from '../contexts/LanguageContext';
import { blockDirection, flexRowWithDirection } from '../utils/layoutRtl';
import { colors, radii, spacing } from '../utils/constants';

export function HomeScreen() {
  const navigation = useNavigation();
  const { language, toggleLanguage, t } = useLanguage();

  // Handle RTL for Urdu
  useEffect(() => {
    if (language === 'ur') {
      I18nManager.forceRTL(true);
    } else {
      I18nManager.forceRTL(false);
    }
  }, [language]);

  const handleLanguageToggle = async () => {
    await toggleLanguage();
  };

  // Helper for RTL text alignment
  const textAlign = language === 'ur' ? 'right' : 'left';
  const direction = language === 'ur' ? 'rtl' : 'ltr';

  return (
    <ScreenLayout bodyGap={spacing.sm + 4} contentPaddingBottom={spacing.md + spacing.sm}>
      <View style={[styles.brandRow, flexRowWithDirection(direction)]}>
        <Text style={[styles.brandTitle, { textAlign }]} numberOfLines={1}>
          {t('nav.reliefLink')}
        </Text>
        <View style={styles.headerActions}>
          <Pressable
            onPress={handleLanguageToggle}
            style={({ pressed }) => [styles.headerIconBtn, pressed && styles.headerIconBtnPressed]}
            accessibilityRole="button"
            accessibilityLabel={t('home.toggleLanguageA11y')}
          >
            <Ionicons name="language-outline" size={24} color={colors.primaryDark} />
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('Profile' as never)}
            style={({ pressed }) => [styles.headerIconBtn, pressed && styles.headerIconBtnPressed]}
            accessibilityRole="button"
            accessibilityLabel={t('home.openProfileA11y')}
          >
            <Ionicons name="person-circle-outline" size={28} color={colors.primaryDark} />
          </Pressable>
        </View>
      </View>

      {/* Welcome banner (only on Home) */}
      <View style={[styles.welcomeCard, blockDirection(direction)]}>
        <View style={styles.welcomeLeft}>
          <Text style={[styles.welcomeTitle, { textAlign }]}>{t('home.welcomeTitle')}</Text>
          <Text style={[styles.welcomeSubtitle, { textAlign }]} numberOfLines={2}>
            {t('home.welcomeSubtitle')}
          </Text>
        </View>
        <View style={styles.welcomeBadge}>
          <Text style={[styles.badgeText, { textAlign }]}>{t('home.welcomeBadge')}</Text>
        </View>
      </View>

      {/* Large SOS action first after banner */}
      <SosButton 
        onPress={() => navigation.navigate('SOS' as never)} 
        subtitle={t('sos.quickEmergencyAccess')} 
      />

      {/* Quick Access grid */}
      <View style={blockDirection(direction)}>
        <Text style={[styles.sectionTitle, { textAlign }]}>{t('home.quickAccess')}</Text>
          <View style={styles.grid}>
            <View style={styles.col}>
              <QuickTile
                title={t('home.disasterGuides')}
                subtitle={t('home.learnSafetyProcedure')}
                icon="book"
                color="#2563eb"
                onPress={() => navigation.navigate('Guides' as never)}
              />
            </View>
            <View style={styles.col}>
              <QuickTile
                title={t('home.ngoReport')}
                subtitle={t('home.emergencyMedicalHelp')}
                icon="heart"
                color="#ef4444"
                onPress={() => navigation.navigate('Report' as never)}
              />
            </View>
            <View style={styles.col}>
              <QuickTile
                title={t('home.emergencySOS')}
                subtitle={t('home.quickEmergencyAccess')}
                icon="warning"
                color="#f97316"
                onPress={() => navigation.navigate('SOS' as never)}
              />
            </View>
            <View style={styles.col}>
              <QuickTile
                title={t('home.preparedness')}
                subtitle={t('home.familyChecklist')}
                icon="list"
                color="#10b981"
                onPress={() => navigation.navigate('Contacts' as never)}
              />
            </View>
            <View style={styles.col}>
              <QuickTile
                title={t('home.tabQuiz')}
                subtitle={t('home.quizQuickSubtitle')}
                icon="school"
                color="#8b5cf6"
                onPress={() => navigation.navigate('Quiz' as never)}
              />
            </View>
          </View>
      </View>

      {/* Safety Tip of the Day */}
      <View style={[styles.tipCard, flexRowWithDirection(direction)]}>
        <View style={styles.tipIcon}>
          <Ionicons name="bulb" size={22} color="#744210" />
        </View>
        <View style={styles.tipBody}>
          <Text style={[styles.tipTitle, { textAlign }]}>{t('home.safetyTipTitle')}</Text>
          <Text style={[styles.tipText, { textAlign }]} numberOfLines={3}>
            {t('home.safetyTipContent')}
          </Text>
        </View>
      </View>

      {/* Why Use This App */}
      <View style={[styles.whyCard, blockDirection(direction)]}>
        <Text style={[styles.whyTitle, { textAlign }]}>{t('home.whyUseTitle')}</Text>
        <View style={styles.whyList}>
          <Text style={[styles.bullet, { textAlign }]}>{t('home.whyUseBullet1')}</Text>
          <Text style={[styles.bullet, { textAlign }]}>{t('home.whyUseBullet2')}</Text>
          <Text style={[styles.bullet, { textAlign }]}>{t('home.whyUseBullet3')}</Text>
          <Text style={[styles.bullet, { textAlign }]}>{t('home.whyUseBullet4')}</Text>
        </View>
      </View>

      {/* Footer note — tab bar is global (see RootNavigator). */}
      <View style={[styles.footer, blockDirection(direction)]}>
        <Text style={[styles.footerText, { textAlign }]}>{t('home.footerText')}</Text>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  brandRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  brandTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
    minWidth: 0,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerIconBtn: {
    padding: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerIconBtnPressed: {
    opacity: 0.82,
    backgroundColor: colors.surfaceMuted,
  },
  welcomeCard: {
    borderRadius: radii.lg,
    padding: spacing.md,
    backgroundColor: '#6d28d9',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 8,
    overflow: 'hidden',
  },
  welcomeLeft: {
    marginBottom: spacing.sm,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: spacing.xs,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  welcomeBadge: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
  },
  badgeText: {
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '700',
    fontSize: 12,
  },
  sectionTitle: {
    marginTop: 0,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -spacing.xs,
    paddingTop: 0,
    paddingBottom: spacing.xs,
  },
  col: {
    flexBasis: '48%',
    maxWidth: '48%',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fffaf0',
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  tipIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  tipBody: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#92400e',
    marginBottom: spacing.xs,
  },
  tipText: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  whyCard: {
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  whyTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  whyList: {
    gap: spacing.xs,
  },
  bullet: {
    color: colors.textMuted,
    fontSize: 13,
  },
  footer: {
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 13,
  },
});

export default HomeScreen;
