import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PieChart, PrimaryButton, ScreenLayout } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import type { RootStackParamList } from '../navigation/types';
import { ensureChatForAlert } from '../services/chatService';
import { type SosAlert, subscribeLatestSosAlerts } from '../services/sosAlertsService';
import { colors, radii, spacing } from '../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'NgoHome'>;

export function NgoHomeScreen({ navigation }: Props) {
  const { user, logout, busy } = useAuth();
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const [alerts, setAlerts] = useState<SosAlert[]>([]);

  useEffect(() => subscribeLatestSosAlerts(setAlerts), []);

  const dashboardData = useMemo(() => {
    const open = alerts.filter((a) => a.status === 'open').length;
    const inChat = alerts.filter((a) => a.status === 'in_chat').length;
    const resolved = alerts.filter((a) => a.status === 'resolved').length;
    return { open, inChat, resolved };
  }, [alerts]);

  const activeAlerts = alerts.filter((item) => item.status !== 'resolved');

  return (
    <ScreenLayout title="NGO Dashboard" subtitle="SOS applications and chat requests from users">
      <View style={styles.profileCard}>
        <Text style={styles.profileTitle}>{user?.ngoName ?? 'NGO'}</Text>
        <Text style={styles.profileLine}>{`Contact: ${user?.displayName ?? '-'}`}</Text>
        <Text style={styles.profileLine}>{`Email: ${user?.email ?? '-'}`}</Text>
        <Text style={styles.profileLine}>{`Phone: ${user?.phone ?? '-'}`}</Text>
        <Text style={styles.profileLine}>{`Address: ${user?.address ?? '-'}`}</Text>
        <PrimaryButton
          label={busy ? 'Signing out...' : 'Sign out'}
          icon="log-out-outline"
          variant="outline"
          onPress={logout}
          disabled={busy}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Application Status Pie Chart</Text>
        <PieChart
          data={[
            { label: 'New SOS', value: dashboardData.open, color: '#ef4444' },
            { label: 'In Chat', value: dashboardData.inChat, color: '#0ea5e9' },
            { label: 'Resolved', value: dashboardData.resolved, color: '#22c55e' },
          ]}
        />
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.heading}>{`Notifications (${unreadCount} unread)`}</Text>
          <Pressable onPress={() => void markAllRead()}>
            <Text style={styles.markRead}>Mark all read</Text>
          </Pressable>
        </View>
        {notifications.slice(0, 4).map((item) => (
          <View key={item.id} style={styles.notificationRow}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationBody}>{item.body}</Text>
          </View>
        ))}
        {notifications.length === 0 ? <Text style={styles.empty}>No notifications yet.</Text> : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>User Applications</Text>
        {activeAlerts.map((alert) => (
          <View key={alert.id} style={styles.alertCard}>
            <Text style={styles.alertName}>{alert.userName}</Text>
            <Text style={styles.alertDetail}>{alert.userEmail ?? 'No email available'}</Text>
            <Text style={styles.alertDetail}>{`Location: ${alert.mapsUrl}`}</Text>
            <Text style={styles.alertDetail}>{`Status: ${alert.status}`}</Text>
            <PrimaryButton
              label="Open chat"
              icon="chatbubble-ellipses-outline"
              onPress={() => {
                if (!user) return;
                void ensureChatForAlert({
                  alertId: alert.id,
                  userId: alert.userId,
                  ngoId: user.uid,
                  ngoName: user.ngoName ?? user.displayName ?? 'NGO',
                  userName: alert.userName,
                }).then((chat) => {
                  navigation.navigate('Chat', {
                    chatId: chat.id,
                    alertId: alert.id,
                    userId: alert.userId,
                    ngoId: user.uid,
                    otherPersonName: alert.userName,
                  });
                });
              }}
            />
          </View>
        ))}
        {activeAlerts.length === 0 ? <Text style={styles.empty}>No active SOS applications.</Text> : null}
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
  profileCard: {
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: radii.md,
    backgroundColor: '#f0fdfa',
    padding: spacing.md,
    gap: spacing.sm,
  },
  profileTitle: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '800',
  },
  profileLine: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  heading: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
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
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: '#f8fafc',
  },
  alertName: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  alertDetail: {
    color: colors.textMuted,
    fontSize: 12,
  },
  empty: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
