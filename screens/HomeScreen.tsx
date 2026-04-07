import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { I18nManager, Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenLayout, SosButton } from '../components';
import QuickTile from '../components/newUI/QuickTile';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { spacing, radii, colors } from '../utils/constants';

export function HomeScreen() {
  const navigation = useNavigation();
  const { user, logout, busy } = useAuth();
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
    <ScreenLayout>
      {/* Language & Account Section - at top */}
      <View style={styles.settingsCard}>
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>{t('home.language')}</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.langToggle, pressed && styles.langTogglePressed]}
            onPress={handleLanguageToggle}
          >
            <Text style={styles.langText}>{language === 'en' ? 'English' : 'اردو'}</Text>
          </Pressable>
        </View>

        {user && (
          <>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Pressable
                style={({ pressed }) => [styles.signOutButton, pressed && styles.signOutButtonPressed]}
                onPress={logout}
                disabled={busy}
              >
                <Ionicons name="log-out" size={14} color="#fff" />
                <Text style={styles.signOutText}>{busy ? t('home.signingOut') : t('home.signOut')}</Text>
              </Pressable>
            </View>
          </>
        )}
      </View>

      {/* Welcome banner (only on Home) */}
      <View style={[styles.welcomeCard, { direction }]}>
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
      <View style={{ direction }}>
        <Text style={[styles.sectionTitle, { textAlign }]}>{t('home.quickAccess')}</Text>
          <View style={styles.grid}>
            <View style={styles.col}>
              <QuickTile
                title={t('home.disasterGuides')}
                subtitle={t('home.learnSafetyProcedure')}
                icon="book"
                color="#2563eb"
                badge="6 Guides"
                onPress={() => navigation.navigate('Guides' as never)}
              />
            </View>
            <View style={styles.col}>
              <QuickTile
                title={t('home.ngoReport')}
                subtitle={t('home.emergencyMedicalHelp')}
                icon="heart"
                color="#ef4444"
                badge="1 Tutorial"
                onPress={() => navigation.navigate('Report' as never)}
              />
            </View>
            <View style={styles.col}>
              <QuickTile
                title={t('home.emergencySOS')}
                subtitle={t('home.quickEmergencyAccess')}
                icon="warning"
                color="#f97316"
                badge="Instant"
                onPress={() => navigation.navigate('SOS' as never)}
              />
            </View>
            <View style={styles.col}>
              <QuickTile
                title={t('home.preparedness')}
                subtitle={t('home.familyChecklist')}
                icon="list"
                color="#10b981"
                badge="10 Items"
                onPress={() => navigation.navigate('Contacts' as never)}
              />
            </View>
          </View>
      </View>

      {/* Safety Tip of the Day */}
      <View style={[styles.tipCard, { direction }]}>
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
      <View style={[styles.whyCard, { direction }]}>
        <Text style={[styles.whyTitle, { textAlign }]}>{t('home.whyUseTitle')}</Text>
        <View style={styles.whyList}>
          <Text style={[styles.bullet, { textAlign }]}>{t('home.whyUseBullet1')}</Text>
          <Text style={[styles.bullet, { textAlign }]}>{t('home.whyUseBullet2')}</Text>
          <Text style={[styles.bullet, { textAlign }]}>{t('home.whyUseBullet3')}</Text>
          <Text style={[styles.bullet, { textAlign }]}>{t('home.whyUseBullet4')}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { direction }]}>
        <Text style={[styles.footerText, { textAlign }]}>{t('home.footerText')}</Text>
      </View>

      <View style={[styles.bottomTabs, { direction }]}>
        {[
          { label: t('home.tabHome'), icon: 'home', screen: 'Home', active: true },
          { label: t('home.tabGuides'), icon: 'book', screen: 'Guides' },
          { label: t('home.tabReports'), icon: 'medkit', screen: 'Report' },
          { label: t('home.tabChecklist'), icon: 'checkmark-circle', screen: 'Contacts' },
          { label: t('home.tabSOS'), icon: 'warning', screen: 'SOS' },
          { label: t('home.tabQuiz'), icon: 'help-circle', screen: 'Quiz' },
        ].map((item) => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [
              styles.tabItem,
              item.active && styles.tabItemActive,
              pressed && styles.tabItemPressed,
            ]}
            onPress={() => navigation.navigate(item.screen as never)}
          >
            <Ionicons
              name={item.icon as any}
              size={22}
              color={item.active ? colors.primary : colors.textMuted}
            />
            <Text style={[styles.tabLabel, item.active && styles.tabLabelActive]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
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
    marginTop: spacing.md,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -spacing.xs,
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
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  whyTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  whyList: {
    gap: spacing.xs,
  },
  bullet: {
    color: colors.textMuted,
    fontSize: 13,
  },
  settingsCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  userEmail: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  langToggle: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
  },
  langTogglePressed: {
    opacity: 0.8,
  },
  langText: {
    fontWeight: '700',
    fontSize: 12,
    color: colors.primaryDark,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: '#dc2626',
    gap: 4,
  },
  signOutButtonPressed: {
    opacity: 0.8,
  },
  signOutText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 11,
  },
  footer: {
    marginTop: spacing.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  bottomTabs: {
    marginTop: spacing.md,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  tabItem: {
    width: '32%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  tabItemActive: {
    backgroundColor: colors.primaryLight,
    borderRadius: radii.lg,
  },
  tabItemPressed: {
    opacity: 0.7,
  },
  tabLabel: {
    marginTop: 6,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
});

export default HomeScreen;
