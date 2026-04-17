import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { displaySosStatus } from '../utils/sosStatusDisplay';
import { blockDirection, flexRowWithDirection } from '../utils/layoutRtl';

import { NotificationBell, PieChart, PrimaryButton, ScreenLayout } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../hooks/useNotifications';
import type { RootStackParamList } from '../navigation/types';
import { ensureChatForAlert } from '../services/chatService';
import { getChatThreadId } from '../services/chatThreadIds';
import {
  markSosAlertInProgress,
  markSosAlertResolved,
  type SosAlert,
  subscribeLatestSosAlerts,
} from '../services/sosAlertsService';
import { colors, radii, spacing } from '../utils/constants';
import { openEmailComposer, openPhoneDialer } from '../utils/openContactLinks';
import { openMapsLink } from '../utils/openMapsLink';

type Props = NativeStackScreenProps<RootStackParamList, 'NgoHome'>;
type RequestFilter = 'all' | 'pending' | 'in_progress' | 'resolved';

const PAGE_SIZE = 10;

export function NgoHomeScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { unreadCount } = useNotifications();
  const [alerts, setAlerts] = useState<SosAlert[]>([]);
  const [updatingAlertId, setUpdatingAlertId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<RequestFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const textAlign = language === 'ur' ? 'right' : 'left';
  const writingDirection = language === 'ur' ? 'rtl' : 'ltr';
  const direction = language === 'ur' ? 'rtl' : 'ltr';

  useEffect(() => subscribeLatestSosAlerts(setAlerts), []);

  const normalizeStatus = (status: SosAlert['status']): 'pending' | 'in_progress' | 'resolved' => {
    if (status === 'open') return 'pending';
    if (status === 'in_chat') return 'in_progress';
    return status;
  };

  const dashboardData = useMemo(() => {
    const pending = alerts.filter((a) => normalizeStatus(a.status) === 'pending').length;
    const inProgress = alerts.filter((a) => normalizeStatus(a.status) === 'in_progress').length;
    const resolved = alerts.filter((a) => normalizeStatus(a.status) === 'resolved').length;
    return { pending, inProgress, resolved };
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    if (activeFilter === 'all') return alerts;
    return alerts.filter((row) => normalizeStatus(row.status) === activeFilter);
  }, [activeFilter, alerts]);

  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const pagedAlerts = useMemo(() => {
    const from = (currentPage - 1) * PAGE_SIZE;
    return filteredAlerts.slice(from, from + PAGE_SIZE);
  }, [currentPage, filteredAlerts]);

  const handleMarkInProgress = async (alert: SosAlert) => {
    if (!user) return;
    setUpdatingAlertId(alert.id);
    try {
      const result = await markSosAlertInProgress(
        alert.id,
        user.uid,
        user.ngoName ?? user.displayName ?? 'NGO',
      );
      if (!result.ok) {
        if (result.reason === 'claimed_by_other_ngo') {
          Alert.alert(
            t('ngo.statusUpdateFailed'),
            t('ngo.claimedByOther', { name: alert.ngoName ?? 'another NGO' }),
          );
          return;
        }
        Alert.alert(t('ngo.statusUpdateFailed'));
        return;
      }
      Alert.alert(t('ngo.statusUpdated'));
    } catch {
      Alert.alert(t('ngo.statusUpdateFailed'));
    } finally {
      setUpdatingAlertId(null);
    }
  };

  const handleMarkResolved = async (alert: SosAlert) => {
    if (!user) return;
    setUpdatingAlertId(alert.id);
    try {
      const result = await markSosAlertResolved(alert.id, user.uid);
      if (!result.ok) {
        if (result.reason === 'claimed_by_other_ngo') {
          Alert.alert(
            t('ngo.statusUpdateFailed'),
            t('ngo.claimedByOther', { name: alert.ngoName ?? 'another NGO' }),
          );
          return;
        }
        Alert.alert(t('ngo.statusUpdateFailed'));
        return;
      }
      Alert.alert(t('ngo.statusUpdated'));
    } catch {
      Alert.alert(t('ngo.statusUpdateFailed'));
    } finally {
      setUpdatingAlertId(null);
    }
  };

  const filterTabs: Array<{ key: RequestFilter; label: string }> = [
    { key: 'all', label: t('ngo.filterAllRequests') },
    { key: 'pending', label: t('ngo.filterPendingRequests') },
    { key: 'in_progress', label: t('ngo.filterInProgressRequests') },
    { key: 'resolved', label: t('ngo.filterResolvedRequests') },
  ];

  return (
    <ScreenLayout title={t('ngo.dashboardTitle')} subtitle={t('ngo.dashboardSubtitle')}>
      <View style={[styles.card, blockDirection(direction)]}>
        <View style={[styles.topActionRow, flexRowWithDirection(direction)]}>
          <Pressable
            onPress={() => navigation.navigate('Profile')}
            style={({ pressed }) => [styles.headerIconBtn, pressed && styles.headerIconBtnPressed]}
            accessibilityRole="button"
            accessibilityLabel={t('home.openProfileA11y')}
          >
            <Ionicons name="person-circle-outline" size={28} color={colors.primaryDark} />
          </Pressable>
          <NotificationBell
            unreadCount={unreadCount}
            onPress={() => navigation.navigate('Notifications')}
            accessibilityLabel={t('home.openNotificationsA11y')}
          />
        </View>
        <Text style={[styles.ngoNameText, { textAlign, writingDirection }]}>
          {user?.ngoName?.trim() || user?.displayName?.trim() || 'NGO'}
        </Text>
        <Text style={[styles.profileHint, { textAlign, writingDirection }]}>{t('profile.hint')}</Text>
      </View>

      <View style={[styles.card, blockDirection(direction)]}>
        <Text style={[styles.heading, { textAlign, writingDirection }]}>{t('ngo.pieTitle')}</Text>
        <PieChart
          data={[
            { label: t('ngo.piePendingCases'), value: dashboardData.pending, color: '#f97316' },
            { label: t('ngo.pieInProgressCases'), value: dashboardData.inProgress, color: '#0ea5e9' },
            { label: t('ngo.pieResolvedCases'), value: dashboardData.resolved, color: '#22c55e' },
          ]}
        />
      </View>

      <View style={[styles.card, blockDirection(direction)]}>
        <Text style={[styles.heading, { textAlign, writingDirection }]}>{t('ngo.incomingSos')}</Text>
        <View style={[styles.filterTabsRow, flexRowWithDirection(direction)]}>
          {filterTabs.map((tab) => {
            const active = tab.key === activeFilter;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveFilter(tab.key)}
                style={({ pressed }) => [
                  styles.filterTab,
                  active && styles.filterTabActive,
                  pressed && styles.filterTabPressed,
                ]}
              >
                <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>
        {pagedAlerts.map((alert, cardIndex) => (
          <View
            key={alert.id}
            style={[styles.alertCard, cardIndex < pagedAlerts.length - 1 ? styles.alertCardSpacing : null]}
          >
            {(() => {
              const status = normalizeStatus(alert.status);
              const statusLine =
                status === 'in_progress' && alert.ngoName
                  ? t('ngo.statusInProgressBy', { name: alert.ngoName })
                  : displaySosStatus(status, t);
              const belongsToCurrentNgo = alert.ngoId === user?.uid;
              const blockedByOtherNgo = Boolean(alert.ngoId) && !belongsToCurrentNgo;
              const isBusy = updatingAlertId === alert.id;
              const otherNgoName = alert.ngoName?.trim() ? alert.ngoName : t('ngo.resolvedByUnknownNgo');
              const phoneTrim = alert.userPhone?.trim() ?? '';
              const emailTrim = alert.userEmail?.trim() ?? '';
              return (
                <>
                  <View style={styles.alertCardHeader}>
                    <View style={[styles.alertCardTitleRow, flexRowWithDirection(direction)]}>
                      <View style={styles.alertCardIconWrap}>
                        <Ionicons name="person" size={18} color={colors.primaryDark} />
                      </View>
                      <View style={styles.alertCardTitleText}>
                        <Text
                          style={[styles.alertName, { textAlign, writingDirection }]}
                          numberOfLines={2}
                        >
                          {alert.userName}
                        </Text>
                        <Text style={[styles.alertNameCaption, { textAlign, writingDirection }]}>
                          {t('ngo.sosRequestSubject')}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.alertMetaBlock}>
                    {phoneTrim ? (
                      <Pressable
                        onPress={async () => {
                          const ok = await openPhoneDialer(phoneTrim);
                          if (!ok) {
                            Alert.alert(t('maps.openLocationFailedTitle'), t('maps.openLocationFailedMsg'));
                          }
                        }}
                        accessibilityRole="link"
                        accessibilityLabel={t('ngo.phoneCallA11y')}
                        style={({ pressed }) => [pressed && styles.metaLinePressed]}
                      >
                        <Text
                          style={[styles.metaLine, styles.metaLineInteractive, { textAlign, writingDirection }]}
                          numberOfLines={2}
                        >
                          {t('ngo.phoneLabel', { phone: phoneTrim })}
                        </Text>
                      </Pressable>
                    ) : (
                      <Text style={[styles.metaLine, { textAlign, writingDirection }]}>
                        {t('ngo.phoneLabel', { phone: '—' })}
                      </Text>
                    )}
                    {emailTrim ? (
                      <Pressable
                        onPress={async () => {
                          const ok = await openEmailComposer(emailTrim);
                          if (!ok) {
                            Alert.alert(t('maps.openLocationFailedTitle'), t('maps.openLocationFailedMsg'));
                          }
                        }}
                        accessibilityRole="link"
                        accessibilityLabel={t('ngo.emailOpenA11y')}
                        style={({ pressed }) => [pressed && styles.metaLinePressed]}
                      >
                        <Text
                          style={[styles.metaLine, styles.metaLineInteractive, { textAlign, writingDirection }]}
                          numberOfLines={2}
                        >
                          {t('ngo.emailLabel', { email: emailTrim })}
                        </Text>
                      </Pressable>
                    ) : (
                      <Text style={[styles.metaLine, { textAlign, writingDirection }]}>
                        {t('ngo.emailLabel', { email: '—' })}
                      </Text>
                    )}
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
                        style={({ pressed }) => [
                          styles.locationChip,
                          flexRowWithDirection(direction),
                          pressed && styles.locationChipPressed,
                        ]}
                      >
                        <Ionicons name="map-outline" size={18} color={colors.primaryDark} />
                        <Text
                          style={[styles.locationChipText, { textAlign, writingDirection }]}
                          numberOfLines={2}
                        >
                          {t('ngo.locationShortOpen')}
                        </Text>
                        <Ionicons name="open-outline" size={16} color={colors.primaryDark} />
                      </Pressable>
                    ) : (
                      <Text style={[styles.metaLine, { textAlign, writingDirection }]}>
                        {t('ngo.locationLabel', { url: '—' })}
                      </Text>
                    )}
                  </View>

                  <View style={styles.alertDivider} />

                  {blockedByOtherNgo ? (
                    <View style={[styles.statusCallout, styles.statusCalloutWarning]}>
                      <Text
                        style={[
                          styles.statusCalloutText,
                          styles.statusCalloutTextWarning,
                          { textAlign, writingDirection },
                        ]}
                      >
                        {t('ngo.claimedByOther', { name: otherNgoName })}
                      </Text>
                    </View>
                  ) : status === 'resolved' ? (
                    <View style={[styles.statusCallout, styles.statusCalloutResolved]}>
                      <Text
                        style={[
                          styles.statusCalloutText,
                          styles.statusCalloutTextResolved,
                          { textAlign, writingDirection },
                        ]}
                      >
                        {t('ngo.cardStatusResolvedBy', {
                          name: alert.ngoName?.trim() ? alert.ngoName : t('ngo.resolvedByUnknownNgo'),
                        })}
                      </Text>
                    </View>
                  ) : (
                    <View style={[styles.statusCallout, styles.statusCalloutNeutral]}>
                      <Text style={[styles.statusMetaCaption, { textAlign, writingDirection }]}>
                        {t('ngo.statusHeading')}
                      </Text>
                      <Text style={[styles.statusMetaValue, { textAlign, writingDirection }]}>
                        {statusLine}
                      </Text>
                    </View>
                  )}

                  <View style={[styles.alertActionsRow, flexRowWithDirection(direction)]}>
                    <View style={styles.alertActionGrow}>
                      <PrimaryButton
                        label={t('ngo.markInProgress')}
                        variant="filled"
                        fullWidth
                        disabled={isBusy || status !== 'pending' || blockedByOtherNgo}
                        onPress={() => void handleMarkInProgress(alert)}
                      />
                    </View>
                    <View style={styles.alertActionGrow}>
                      <PrimaryButton
                        label={t('ngo.markResolved')}
                        variant="outline"
                        fullWidth
                        disabled={isBusy || status !== 'in_progress' || !belongsToCurrentNgo}
                        onPress={() => void handleMarkResolved(alert)}
                      />
                    </View>
                  </View>
                  <PrimaryButton
                    label={t('home.openChat')}
                    icon="chatbubble-ellipses-outline"
                    variant="tertiary"
                    fullWidth
                    disabled={blockedByOtherNgo || status === 'resolved'}
                    onPress={() => {
                      if (!user) return;
                      navigation.navigate('Chat', {
                        chatId: getChatThreadId(alert.id, user.uid),
                        alertId: alert.id,
                        userId: alert.userId,
                        ngoId: user.uid,
                        otherPersonName: alert.userName,
                      });
                      void ensureChatForAlert({
                        alertId: alert.id,
                        userId: alert.userId,
                        ngoId: user.uid,
                        ngoName: user.ngoName ?? user.displayName ?? 'NGO',
                        userName: alert.userName,
                      }).catch(() => {
                        Alert.alert(
                          t('ngo.statusUpdateFailed'),
                          t('ngo.claimedByOther', { name: alert.ngoName ?? 'another NGO' }),
                        );
                      });
                    }}
                  />
                </>
              );
            })()}
          </View>
        ))}
        {filteredAlerts.length === 0 ? (
          <Text style={[styles.empty, { textAlign, writingDirection }]}>{t('ngo.noIncomingSos')}</Text>
        ) : null}
        {filteredAlerts.length > 0 ? (
          <View style={[styles.paginationRow, flexRowWithDirection(direction)]}>
            <Pressable
              onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage <= 1}
              style={({ pressed }) => [
                styles.pageButton,
                currentPage <= 1 && styles.pageButtonDisabled,
                pressed && currentPage > 1 && styles.pageButtonPressed,
              ]}
            >
              <Text style={styles.pageButtonText}>{t('ngo.paginationPrev')}</Text>
            </Pressable>
            <Text style={[styles.pageText, { textAlign, writingDirection }]}>
              {t('ngo.paginationPage', { current: currentPage, total: totalPages })}
            </Text>
            <Pressable
              onPress={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              style={({ pressed }) => [
                styles.pageButton,
                currentPage >= totalPages && styles.pageButtonDisabled,
                pressed && currentPage < totalPages && styles.pageButtonPressed,
              ]}
            >
              <Text style={styles.pageButtonText}>{t('ngo.paginationNext')}</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
  },
  topActionRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
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
  ngoNameText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  profileHint: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    fontWeight: '500',
  },
  heading: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 15,
  },
  row: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  markRead: {
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 13,
  },
  notificationRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: spacing.sm,
  },
  notificationTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13,
  },
  notificationBody: {
    color: colors.textMuted,
    fontSize: 13,
  },
  alertCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md + 4,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 4,
    gap: spacing.md,
  },
  alertCardSpacing: {
    marginBottom: spacing.md,
  },
  alertCardHeader: {
    gap: spacing.xs,
  },
  alertCardTitleRow: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  alertCardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertCardTitleText: {
    flex: 1,
    minWidth: 0,
  },
  alertName: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  alertNameCaption: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.2,
  },
  alertMetaBlock: {
    gap: spacing.sm,
  },
  metaLine: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  metaLineInteractive: {
    color: colors.primaryDark,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  metaLinePressed: {
    opacity: 0.85,
  },
  locationChip: {
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'stretch',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  locationChipPressed: {
    opacity: 0.88,
    backgroundColor: '#99f6e4',
  },
  locationChipText: {
    flex: 1,
    minWidth: 0,
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: '700',
  },
  alertDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    alignSelf: 'stretch',
  },
  statusCallout: {
    borderRadius: radii.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    alignSelf: 'stretch',
  },
  statusCalloutNeutral: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusCalloutWarning: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  statusCalloutResolved: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  statusMetaCaption: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.4,
    marginBottom: spacing.xs,
  },
  statusMetaValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 22,
  },
  statusCalloutText: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    color: colors.text,
  },
  statusCalloutTextWarning: {
    color: '#92400e',
  },
  statusCalloutTextResolved: {
    color: '#166534',
  },
  alertActionsRow: {
    gap: spacing.sm,
    alignSelf: 'stretch',
    alignItems: 'stretch',
  },
  alertActionGrow: {
    flex: 1,
    minWidth: 0,
    alignSelf: 'stretch',
  },
  filterTabsRow: {
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterTab: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  filterTabActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryBorder,
  },
  filterTabPressed: {
    opacity: 0.85,
  },
  filterTabText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  filterTabTextActive: {
    color: colors.primaryDark,
  },
  paginationRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  pageButton: {
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: radii.md,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  pageButtonPressed: {
    opacity: 0.86,
  },
  pageButtonDisabled: {
    opacity: 0.45,
  },
  pageButtonText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
  pageText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  empty: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
