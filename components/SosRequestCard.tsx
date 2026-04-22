import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp } from '@react-navigation/native';
import React, { useEffect, useMemo } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '../navigation/types';
import { subscribeChatThreadsForAlertUser } from '../services/chatService';
import { getChatThreadId } from '../services/chatThreadIds';
import { rerequestSosAlert, type SosAlert } from '../services/sosAlertsService';
import { colors, radii, spacing } from '../utils/constants';
import { blockDirection, flexRowWithDirection } from '../utils/layoutRtl';
import { openMapsLink } from '../utils/openMapsLink';
import { displaySosStatus, normalizeSosStatus } from '../utils/sosStatusDisplay';

type TFn = (key: string, vars?: Record<string, string | number>) => string;

type Props = {
  alert: SosAlert;
  currentUserId: string | undefined;
  t: TFn;
  textAlign: 'left' | 'right';
  direction: 'ltr' | 'rtl';
  language: string;
  navigation: NavigationProp<RootStackParamList>;
  variant: 'inline' | 'card';
  rerequestingAlertId: string | null;
  onRerequestState: (id: string | null) => void;
};

function PendingAlertChatThreads({
  alertId,
  survivorUserId,
  textAlign,
  direction,
  t,
  navigation,
}: {
  alertId: string;
  survivorUserId: string;
  textAlign: 'left' | 'right';
  direction: 'ltr' | 'rtl';
  t: TFn;
  navigation: NavigationProp<RootStackParamList>;
}) {
  const [threads, setThreads] = React.useState<
    Array<{ threadId: string; ngoId: string; ngoName: string }>
  >([]);

  useEffect(
    () => subscribeChatThreadsForAlertUser(alertId, survivorUserId, setThreads),
    [alertId, survivorUserId],
  );

  if (threads.length === 0) return null;

  return (
    <View style={[cardStyles.threadList, blockDirection(direction)]}>
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
          <Text style={[cardStyles.actionLink, { textAlign }]}>{t('home.openChatWithNgo', { name: th.ngoName })}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function formatRequestDateLabel(iso: string | undefined, language: string): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleString(language === 'ur' ? 'ur-PK' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

const statusPillColor = (status: 'pending' | 'in_progress' | 'resolved') => {
  switch (status) {
    case 'pending':
      return { bg: '#fffbeb', border: '#fbbf24', text: '#92400e' };
    case 'in_progress':
      return { bg: '#eff6ff', border: '#3b82f6', text: '#1e3a8a' };
    default:
      return { bg: '#ecfdf5', border: '#34d399', text: '#065f46' };
  }
};

export function SosRequestCard({
  alert,
  currentUserId,
  t,
  textAlign,
  direction,
  language,
  navigation,
  variant,
  rerequestingAlertId,
  onRerequestState,
}: Props) {
  const status = normalizeSosStatus(alert.status);
  const assignedNgoId = alert.ngoId;
  const statusLine =
    status === 'in_progress' && alert.ngoName
      ? t('home.sosInProgressBy', { name: alert.ngoName })
      : displaySosStatus(alert.status, t);

  const dateLabel = useMemo(() => formatRequestDateLabel(alert.createdAtIso, language), [alert.createdAtIso, language]);

  const onRerequest = async () => {
    if (!currentUserId) return;
    onRerequestState(alert.id);
    try {
      await rerequestSosAlert(alert.id, currentUserId);
      Alert.alert(t('home.reRequestSuccess'));
    } catch {
      Alert.alert(t('home.reRequestError'));
    } finally {
      onRerequestState(null);
    }
  };

  const body = (
    <>
      {variant === 'card' ? (
        <View style={[cardStyles.cardHeader, flexRowWithDirection(direction)]}>
          <View style={cardStyles.timeRow}>
            <Ionicons name="time-outline" size={14} color={colors.textMuted} />
            <Text style={[cardStyles.timeText, { textAlign }]} numberOfLines={2}>
              {t('home.sosRequestTime', { date: dateLabel })}
            </Text>
          </View>
          <View
            style={[
              cardStyles.statusPill,
              { backgroundColor: statusPillColor(status).bg, borderColor: statusPillColor(status).border },
            ]}
          >
            <Text style={[cardStyles.statusPillText, { color: statusPillColor(status).text }]} numberOfLines={2}>
              {statusLine}
            </Text>
          </View>
        </View>
      ) : (
        <Text style={[cardStyles.titleInline, { textAlign }]}>{t('home.sosStatusLine', { status: statusLine })}</Text>
      )}

      <Text style={variant === 'card' ? [cardStyles.meta, { textAlign }] : [cardStyles.notificationText, { textAlign }]}>
        {`${alert.userName} · ${alert.userEmail ?? '—'}`}
      </Text>
      {alert.userPhone ? (
        <Text
          style={variant === 'card' ? [cardStyles.meta, { textAlign }] : [cardStyles.notificationText, { textAlign }]}
        >
          {alert.userPhone}
        </Text>
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
          <Text
            style={[
              variant === 'card' ? cardStyles.meta : cardStyles.notificationText,
              cardStyles.mapsLink,
              { textAlign },
            ]}
            numberOfLines={3}
          >
            {alert.mapsUrl}
          </Text>
        </Pressable>
      ) : null}
      {status === 'in_progress' && assignedNgoId ? (
        <View style={[cardStyles.settingRow, flexRowWithDirection(direction), { marginBottom: 0 }]}>
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
            <Text style={[cardStyles.actionLink, { textAlign }]}>{t('home.openChat')}</Text>
          </Pressable>
          <Pressable disabled={rerequestingAlertId === alert.id} onPress={() => void onRerequest()}>
            <Text
              style={[
                cardStyles.actionLink,
                { textAlign },
                rerequestingAlertId === alert.id ? cardStyles.disabledAction : null,
              ]}
            >
              {t('home.reRequest')}
            </Text>
          </Pressable>
        </View>
      ) : null}
      {status === 'pending' && currentUserId === alert.userId ? (
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

  if (variant === 'card') {
    return (
      <View style={cardStyles.card}>
        {body}
      </View>
    );
  }

  return <View style={cardStyles.inlineRow}>{body}</View>;
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    minWidth: 0,
  },
  timeText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    flex: 1,
  },
  statusPill: {
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
    maxWidth: '52%',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  titleInline: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  inlineRow: {
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 2,
  },
  meta: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
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
  settingRow: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  actionLink: {
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
});
