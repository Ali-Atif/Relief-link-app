import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton, ScreenLayout } from '../components';
import { useAuth } from '../contexts/AuthContext';
import type { RootStackParamList } from '../navigation/types';
import { db } from '../services/firebase';
import { sendChatMessage, subscribeChatMessages, type ChatMessage } from '../services/chatService';
import { colors, radii, spacing } from '../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export function ChatScreen({ route, navigation }: Props) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [peerUserId, setPeerUserId] = useState(route.params.userId);
  const [peerNgoId, setPeerNgoId] = useState(route.params.ngoId);
  /** Only when survivor userId is missing from params (e.g. some notification deep links). NGOs always pass userId from SOS. */
  const [peerIdsLoading, setPeerIdsLoading] = useState(() => !route.params.userId?.trim());
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const scrollToEnd = () => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  };

  useEffect(() => subscribeChatMessages(route.params.chatId, setMessages), [route.params.chatId]);

  useEffect(() => {
    const u = route.params.userId?.trim() ?? '';
    if (u) {
      setPeerUserId(u);
      setPeerNgoId(route.params.ngoId?.trim() ?? '');
      setPeerIdsLoading(false);
      return;
    }
    let cancelled = false;
    setPeerIdsLoading(true);
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'chats', route.params.chatId));
        if (cancelled || !snap.exists()) {
          if (!cancelled) setPeerIdsLoading(false);
          return;
        }
        const d = snap.data() as { userId?: string; ngoId?: string };
        const uid = String(d.userId ?? '');
        const nid = String(d.ngoId ?? '');
        setPeerUserId(uid);
        setPeerNgoId(nid);
      } catch {
        /* keep empty; send stays disabled */
      } finally {
        if (!cancelled) setPeerIdsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [route.params.chatId, route.params.userId, route.params.ngoId]);

  const isSurvivor = user?.uid === peerUserId;
  const receiverId =
    user && peerUserId
      ? isSurvivor
        ? peerNgoId
        : peerUserId
      : '';
  const canSend =
    Boolean(user && peerUserId && receiverId) &&
    (isSurvivor ? Boolean(peerNgoId) : true);

  const send = async () => {
    if (!user || !receiverId) return;
    await sendChatMessage({
      chatId: route.params.chatId,
      senderId: user.uid,
      senderName: user.ngoName ?? user.displayName ?? 'Member',
      receiverId,
      text: input,
    });
    setInput('');
  };

  return (
    <ScreenLayout
      scrollable={false}
      title={`Chat with ${route.params.otherPersonName}`}
      subtitle="Real-time NGO and user chat"
      showBack={{
        label: 'Back',
        onPress: () => navigation.goBack(),
        accessibilityLabel: 'Go back',
      }}
    >
      <View style={styles.chatColumn}>
        <View style={styles.listWrap}>
          <FlatList
            ref={listRef}
            style={styles.list}
            data={messages}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            onContentSizeChange={scrollToEnd}
            onLayout={scrollToEnd}
            renderItem={({ item }) => {
              const isMine = user?.uid === item.senderId;
              return (
                <View style={[styles.bubble, isMine ? styles.myBubble : styles.otherBubble]}>
                  <Text style={styles.sender}>{item.senderName}</Text>
                  <Text style={styles.msg}>{item.text}</Text>
                </View>
              );
            }}
            ListEmptyComponent={<Text style={styles.empty}>No chat messages yet.</Text>}
          />
        </View>
        <View style={styles.composer}>
          {peerIdsLoading ? (
            <View style={styles.idsLoadingRow}>
              <ActivityIndicator size="small" color={colors.primaryDark} />
            </View>
          ) : null}
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type your message"
            placeholderTextColor={colors.textMuted}
            editable={Boolean(receiverId)}
            onFocus={() => {
              scrollToEnd();
              setTimeout(scrollToEnd, 250);
            }}
            returnKeyType="default"
            blurOnSubmit={false}
          />
          <PrimaryButton
            label="Send"
            icon="send-outline"
            disabled={!canSend || peerIdsLoading}
            onPress={() => void send()}
          />
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  chatColumn: {
    flex: 1,
    minHeight: 0,
    gap: spacing.sm,
  },
  listWrap: {
    flex: 1,
    minHeight: 200,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    padding: spacing.sm,
  },
  list: {
    flex: 1,
  },
  bubble: {
    padding: spacing.sm,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
    maxWidth: '85%',
  },
  myBubble: {
    backgroundColor: '#ccfbf1',
    alignSelf: 'flex-end',
  },
  otherBubble: {
    backgroundColor: '#e2e8f0',
    alignSelf: 'flex-start',
  },
  sender: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 2,
  },
  msg: {
    fontSize: 13,
    color: colors.text,
  },
  composer: {
    gap: spacing.sm,
  },
  idsLoadingRow: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
