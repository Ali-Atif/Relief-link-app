import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { NotificationBell, ScreenLayout, SosButton, SosRequestCard } from '../components';
import QuickTile from '../components/newUI/QuickTile';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../hooks/useNotifications';
import type { RootStackParamList } from '../navigation/types';
import { PAKISTAN_EMERGENCY_CONTACTS } from '../data/pakistanEmergencyContacts';
import { getDailySafetyTip } from '../services/safetyTips';
import { type SosAlert, subscribeUserSosAlerts } from '../services/sosAlertsService';
import { spacing, radii, colors } from '../utils/constants';
import { blockDirection, flexRowWithDirection } from '../utils/layoutRtl';
import { useAuth } from '../contexts/AuthContext';

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, logout, busy } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const { unreadCount } = useNotifications();
  const [myAlerts, setMyAlerts] = React.useState<SosAlert[]>([]);
  const [rerequestingAlertId, setRerequestingAlertId] = React.useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setMyAlerts([]);
      return;
    }
    return subscribeUserSosAlerts(user.uid, setMyAlerts);
  }, [user]);

  const handleLanguageToggle = async () => {
    await toggleLanguage();
  };

  // Helper for RTL text alignment
  const textAlign = language === 'ur' ? 'right' : 'left';
  const direction = language === 'ur' ? 'rtl' : 'ltr';
  const tabItems: Array<{
    label: string;
    icon: string;
    screen: 'Home' | 'Guides' | 'EmergencyContacts' | 'Contacts' | 'SOS' | 'Quiz';
    active?: boolean;
  }> = [
    { label: t('home.tabHome'), icon: 'home', screen: 'Home', active: true },
    { label: t('home.tabGuides'), icon: 'book', screen: 'Guides' },
    { label: t('home.tabEmergencyNumbers'), icon: 'call', screen: 'EmergencyContacts' },
    { label: t('home.tabFamilyChecklist'), icon: 'people', screen: 'Contacts' },
    { label: t('home.tabSOS'), icon: 'warning', screen: 'SOS' },
    { label: t('home.tabQuiz'), icon: 'help-circle', screen: 'Quiz' },
  ];

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
          <NotificationBell
            unreadCount={unreadCount}
            onPress={() => navigation.navigate('Notifications')}
            accessibilityLabel={t('home.openNotificationsA11y')}
          />
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
        onPress={() => navigation.navigate('SOS')}
        mainLabel={t('sos.bigButtonLabel')}
        emergencySubLabel={t('sos.buttonSub')}
        accessibilityLabel={t('sos.a11yLabel')}
        subtitle={t('sos.quickEmergencyAccess')}
        subtitleStyle={{ textAlign }}
      />

      {/* Quick Access — explicit rows so tiles in each row share equal height */}
      <View style={blockDirection(direction)}>
        <Text style={[styles.sectionTitle, { textAlign }]}>{t('home.quickAccess')}</Text>
        <View>
          <View style={[styles.gridRow, flexRowWithDirection(direction)]}>
            <View style={styles.col}>
              <QuickTile
                fillRow
                direction={direction}
                title={t('home.disasterGuides')}
                subtitle={t('home.learnSafetyProcedure')}
                icon="book"
                color="#2563eb"
                badge={t('home.badgeGuides', { count: 6 })}
                onPress={() => navigation.navigate('Guides')}
              />
            </View>
            <View style={styles.col}>
              <QuickTile
                fillRow
                direction={direction}
                title={t('home.emergencyContactsModule')}
                subtitle={t('home.emergencyContactsModuleSubtitle')}
                icon="call"
                color="#ef4444"
                badge={t('home.badgeHelplines', { count: PAKISTAN_EMERGENCY_CONTACTS.length })}
                onPress={() => navigation.navigate('EmergencyContacts')}
              />
            </View>
          </View>
          <View style={[styles.gridRow, flexRowWithDirection(direction)]}>
            <View style={styles.col}>
              <QuickTile
                fillRow
                direction={direction}
                title={t('home.emergencySOS')}
                subtitle={t('home.quickEmergencyAccess')}
                icon="warning"
                color="#f97316"
                badge={t('home.badgeInstant')}
                onPress={() => navigation.navigate('SOS')}
              />
            </View>
            <View style={styles.col}>
              <QuickTile
                fillRow
                direction={direction}
                title={t('home.preparedness')}
                subtitle={t('home.familyChecklist')}
                icon="list"
                color="#10b981"
                badge={t('home.badgeChecklist', { count: 10 })}
                onPress={() => navigation.navigate('Contacts')}
              />
            </View>
          </View>
          <View style={[styles.gridRow, flexRowWithDirection(direction)]}>
            <View style={styles.col}>
              <QuickTile
                fillRow
                direction={direction}
                title={t('home.tabQuiz')}
                subtitle={t('home.quizQuickSubtitle')}
                icon="school"
                color="#8b5cf6"
                onPress={() => navigation.navigate('Quiz' as never)}
              />
            </View>
            <View style={styles.colSpacer} />
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
            {getDailySafetyTip(language)}
          </Text>
        </View>
      </View>

      {/* Notifications are now only shown in the Notifications screen. */}

      <View style={[styles.whyCard, blockDirection(direction)]}>
        <View style={[styles.sosSectionHeader, flexRowWithDirection(direction)]}>
          <Text style={[styles.whyTitle, { textAlign, flex: 1 }]}>{t('home.yourSosApplications')}</Text>
          {myAlerts.length > 0 ? (
            <Pressable
              onPress={() => navigation.navigate('SosHistory')}
              style={({ pressed }) => [styles.seeAllChip, pressed ? styles.seeAllChipPressed : null]}
              accessibilityRole="button"
              accessibilityLabel={t('home.seeAllSos')}
            >
              <View style={[styles.seeAllInner, flexRowWithDirection(direction)]}>
                <Text style={styles.seeAllText}>{t('home.seeAllSos')}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primaryDark} />
              </View>
            </Pressable>
          ) : null}
        </View>
        {myAlerts.slice(0, 3).map((alert) => (
          <SosRequestCard
            key={alert.id}
            alert={alert}
            currentUserId={user?.uid}
            t={t}
            textAlign={textAlign}
            direction={direction}
            language={language}
            navigation={navigation}
            variant="inline"
            rerequestingAlertId={rerequestingAlertId}
            onRerequestState={setRerequestingAlertId}
          />
        ))}
        {myAlerts.length === 0 ? (
          <Text style={[styles.notificationText, { textAlign }]}>{t('home.noSosApplications')}</Text>
        ) : null}
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
  gridRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginHorizontal: -spacing.xs,
    marginBottom: spacing.md,
  },
  col: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: spacing.xs,
  },
  colSpacer: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: spacing.xs,
  },
  tipCard: {
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
    marginEnd: spacing.md,
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
  sosSectionHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  seeAllChip: {
    borderRadius: radii.full,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    backgroundColor: 'rgba(109, 40, 217, 0.12)',
  },
  seeAllChipPressed: {
    opacity: 0.86,
  },
  seeAllInner: {
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    color: colors.primaryDark,
    fontWeight: '800',
    fontSize: 13,
  },
  whyTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 0,
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
  notificationText: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
});

export default HomeScreen;
