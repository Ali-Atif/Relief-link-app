import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { NotificationBell, ScreenLayout, SosButton } from '../components';
import QuickTile from '../components/newUI/QuickTile';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../hooks/useNotifications';
import type { RootStackParamList } from '../navigation/types';
import { getDailySafetyTip } from '../services/safetyTips';
import { subscribeChatThreadsForAlertUser } from '../services/chatService';
import { getChatThreadId } from '../services/chatThreadIds';
import { rerequestSosAlert, type SosAlert, subscribeUserSosAlerts } from '../services/sosAlertsService';
import { spacing, radii, colors } from '../utils/constants';
import { displaySosStatus } from '../utils/sosStatusDisplay';
import { blockDirection, flexRowWithDirection, gridRowDirection } from '../utils/layoutRtl';
import { openMapsLink } from '../utils/openMapsLink';
import { useAuth } from '../contexts/AuthContext';

type PendingThreadsProps = {
  alertId: string;
  survivorUserId: string;
  textAlign: 'left' | 'right';
  direction: 'ltr' | 'rtl';
  t: (key: string, vars?: Record<string, string | number>) => string;
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

function PendingAlertChatThreads({
  alertId,
  survivorUserId,
  textAlign,
  direction,
  t,
  navigation,
}: PendingThreadsProps) {
  const [threads, setThreads] = React.useState<
    Array<{ threadId: string; ngoId: string; ngoName: string }>
  >([]);

  useEffect(() => subscribeChatThreadsForAlertUser(alertId, survivorUserId, setThreads), [alertId, survivorUserId]);

  if (threads.length === 0) return null;

  return (
    <View style={[styles.threadList, blockDirection(direction)]}>
      {threads.map((th) => (
        <Pressable
          key={th.threadId}
          onPress={() =>
            navigation.navigate('Chat', {
              chatId: th.threadId,
              alertId,
              userId: survivorUserId,
              ngoId: th.ngoId,
              otherPersonName: th.ngoName,
            })
          }
        >
          <Text style={[styles.markReadText, { textAlign }]}>{t('home.openChatWithNgo', { name: th.ngoName })}</Text>
        </Pressable>
      ))}
    </View>
  );
}

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

  const normalizeStatus = (status: SosAlert['status']): 'pending' | 'in_progress' | 'resolved' => {
    if (status === 'open') return 'pending';
    if (status === 'in_chat') return 'in_progress';
    return status;
  };

  const handleRerequest = async (alert: SosAlert) => {
    if (!user) return;
    setRerequestingAlertId(alert.id);
    try {
      await rerequestSosAlert(alert.id, user.uid);
      Alert.alert(t('home.reRequestSuccess'));
    } catch {
      Alert.alert(t('home.reRequestError'));
    } finally {
      setRerequestingAlertId(null);
    }
  };

  // Helper for RTL text alignment
  const textAlign = language === 'ur' ? 'right' : 'left';
  const direction = language === 'ur' ? 'rtl' : 'ltr';
  const tabItems: Array<{
    label: string;
    icon: string;
    screen: 'Home' | 'Guides' | 'Report' | 'Contacts' | 'SOS' | 'Quiz';
    active?: boolean;
  }> = [
    { label: t('home.tabHome'), icon: 'home', screen: 'Home', active: true },
    { label: t('home.tabGuides'), icon: 'book', screen: 'Guides' },
    { label: t('home.tabReports'), icon: 'medkit', screen: 'Report' },
    { label: t('home.tabChecklist'), icon: 'checkmark-circle', screen: 'Contacts' },
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

      {/* Quick Access grid */}
      <View style={blockDirection(direction)}>
        <Text style={[styles.sectionTitle, { textAlign }]}>{t('home.quickAccess')}</Text>
          <View style={[styles.grid, gridRowDirection(direction)]}>
            <View style={styles.col}>
              <QuickTile
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
                direction={direction}
                title={t('home.ngoReport')}
                subtitle={t('home.emergencyMedicalHelp')}
                icon="heart"
                color="#ef4444"
                badge={t('home.badgeTutorial', { count: 1 })}
                onPress={() => navigation.navigate('Report')}
              />
            </View>
            <View style={styles.col}>
              <QuickTile
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
                direction={direction}
                title={t('home.preparedness')}
                subtitle={t('home.familyChecklist')}
                icon="list"
                color="#10b981"
                badge={t('home.badgeChecklist', { count: 10 })}
                onPress={() => navigation.navigate('Contacts')}
              />
            </View>
            <View style={styles.col}>
              <QuickTile
                direction={direction}
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
            {getDailySafetyTip(language)}
          </Text>
        </View>
      </View>

      {/* Notifications are now only shown in the Notifications screen. */}

      <View style={[styles.whyCard, blockDirection(direction)]}>
        <Text style={[styles.whyTitle, { textAlign }]}>{t('home.yourSosApplications')}</Text>
        {myAlerts.slice(0, 3).map((alert) => (
          <View key={alert.id} style={styles.notificationRow}>
            {(() => {
              const status = normalizeStatus(alert.status);
              const assignedNgoId = alert.ngoId;
              const statusLine =
                status === 'in_progress' && alert.ngoName
                  ? t('home.sosInProgressBy', { name: alert.ngoName })
                  : displaySosStatus(status, t);
              return (
                <>
            <Text style={[styles.notificationTitle, { textAlign }]}>
              {t('home.sosStatusLine', { status: statusLine })}
            </Text>
            <Text style={[styles.notificationText, { textAlign }]}>{`${alert.userName} · ${alert.userEmail ?? '—'}`}</Text>
            {alert.userPhone ? (
              <Text style={[styles.notificationText, { textAlign }]}>{alert.userPhone}</Text>
            ) : null}
            {alert.mapsUrl?.trim() ? (
              <Pressable
                onPress={async () => {
                  const ok = await openMapsLink(alert.mapsUrl);
                  if (!ok) {
                    Alert.alert(t('maps.openLocationFailedTitle'), t('maps.openLocationFailedMsg'));
                  }
                }}
                accessibilityRole="link"
                accessibilityLabel={t('maps.openLocationA11y')}
              >
                <Text style={[styles.notificationText, styles.mapsLink, { textAlign }]} numberOfLines={3}>
                  {alert.mapsUrl}
                </Text>
              </Pressable>
            ) : null}
            {status === 'in_progress' && assignedNgoId ? (
              <View style={[styles.settingRow, flexRowWithDirection(direction), { marginBottom: 0 }]}>
                <Pressable
                  onPress={() =>
                    navigation.navigate('Chat', {
                      chatId: getChatThreadId(alert.id, assignedNgoId),
                      alertId: alert.id,
                      userId: alert.userId,
                      ngoId: assignedNgoId,
                      otherPersonName: alert.ngoName ?? 'NGO Support',
                    })
                  }
                >
                  <Text style={[styles.markReadText, { textAlign }]}>{t('home.openChat')}</Text>
                </Pressable>
                <Pressable
                  disabled={rerequestingAlertId === alert.id}
                  onPress={() => void handleRerequest(alert)}
                >
                  <Text
                    style={[
                      styles.markReadText,
                      { textAlign },
                      rerequestingAlertId === alert.id ? styles.disabledAction : null,
                    ]}
                  >
                    {t('home.reRequest')}
                  </Text>
                </Pressable>
              </View>
            ) : null}
            {status === 'pending' && user?.uid === alert.userId ? (
              <PendingAlertChatThreads
                alertId={alert.id}
                survivorUserId={alert.userId}
                textAlign={textAlign}
                direction={direction}
                t={t}
                navigation={navigation}
              />
            ) : null}
                </>
              );
            })()}
          </View>
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
  grid: {
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
  settingRow: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  markReadText: {
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 13,
  },
  disabledAction: {
    opacity: 0.45,
  },
  threadList: {
    marginTop: spacing.xs,
    gap: spacing.sm,
    alignSelf: 'stretch',
  },
  notificationRow: {
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 2,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  notificationText: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  mapsLink: {
    color: colors.primaryDark,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});

export default HomeScreen;
