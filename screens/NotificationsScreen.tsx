import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GuideBackChip } from '../components/GuideBackChip';
import { ScreenLayout } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../hooks/useNotifications';
import type { RootStackParamList } from '../navigation/types';
import { localizedNotification } from '../utils/notificationDisplay';
import { blockDirection, flexRowWithDirection } from '../utils/layoutRtl';
import { colors, radii, spacing } from '../utils/constants';
import { parseChatThreadId } from '../services/chatThreadIds';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

function formatWhen(iso: string | undefined, locale: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(locale === 'ur' ? 'ur-PK' : undefined);
}

export function NotificationsScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { notifications, markAllRead, markRead } = useNotifications();
  const direction = language === 'ur' ? 'rtl' : 'ltr';
  const textAlign = language === 'ur' ? 'right' : 'left';
  const writingDirection = language === 'ur' ? 'rtl' : 'ltr';

  useFocusEffect(
    useCallback(() => {
      void markAllRead();
    }, [markAllRead]),
  );

  const onBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate(user?.role === 'ngo' ? 'NgoHome' : 'Home');
    }
  }, [navigation, user?.role]);

  return (
    <ScreenLayout
      title={t('notifications.title')}
      subtitle={t('notifications.subtitle')}
    >
      <GuideBackChip
        label={t('nav.backChip')}
        onPress={onBack}
        accessibilityLabel={t('nav.backA11y')}
      />
      <View style={[styles.listWrap, blockDirection(direction)]}>
        {notifications.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={[styles.emptyText, { textAlign, writingDirection }]}>
              {t('notifications.empty')}
            </Text>
          </View>
        ) : (
          notifications.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => {
                if (!item.read) {
                  void markRead(item.id);
                }
                if (item.type === 'chat' && item.chatId && user) {
                  const parsed = parseChatThreadId(item.chatId);
                  const alertId = item.alertId ?? parsed?.alertId ?? item.chatId;
                  const peerNgoId = parsed?.ngoId ?? '';
                  const fallbackOtherName = user.role === 'ngo' ? 'User' : 'NGO';
                  navigation.navigate('Chat', {
                    chatId: item.chatId,
                    alertId,
                    userId: user.role === 'user' ? user.uid : '',
                    ngoId: user.role === 'ngo' ? user.uid : peerNgoId,
                    otherPersonName: fallbackOtherName,
                  });
                } else if (item.type === 'sos') {
                  if (user?.role === 'ngo') {
                    navigation.navigate('NgoHome');
                  } else {
                    navigation.navigate('Home');
                  }
                }
              }}
              style={({ pressed }) => [
                styles.item,
                !item.read && styles.itemUnread,
                pressed && styles.itemPressed,
              ]}
            >
              <View style={[styles.itemHead, flexRowWithDirection(direction)]}>
                <Text style={[styles.itemTitle, { textAlign, writingDirection }]}>
                  {localizedNotification(item, t).title}
                </Text>
                {!item.read ? <View style={styles.unreadDot} /> : null}
              </View>
              <Text style={[styles.itemBody, { textAlign, writingDirection }]}>
                {localizedNotification(item, t).body}
              </Text>
              <Text style={[styles.itemMeta, { textAlign, writingDirection }]}>
                {formatWhen(item.createdAtIso, language)}
              </Text>
            </Pressable>
          ))
        )}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  listWrap: {
    gap: spacing.sm,
  },
  emptyCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  item: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.xs,
  },
  itemUnread: {
    borderColor: colors.primary,
    backgroundColor: '#ecfeff',
  },
  itemPressed: {
    opacity: 0.85,
  },
  itemHead: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  itemTitle: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    fontWeight: '800',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
    backgroundColor: colors.emergency,
  },
  itemBody: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  itemMeta: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
