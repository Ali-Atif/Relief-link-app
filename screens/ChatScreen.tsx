import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton, ScreenLayout } from '../components';
import { useAuth } from '../contexts/AuthContext';
import type { RootStackParamList } from '../navigation/types';
import { sendChatMessage, subscribeChatMessages, type ChatMessage } from '../services/chatService';
import { colors, radii, spacing } from '../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export function ChatScreen({ route }: Props) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => subscribeChatMessages(route.params.chatId, setMessages), [route.params.chatId]);

  const receiverId = user?.uid === route.params.userId ? route.params.ngoId : route.params.userId;

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
    >
      <View style={styles.chatColumn}>
        <View style={styles.listWrap}>
          <FlatList
            style={styles.list}
            data={messages}
            keyExtractor={(item) => item.id}
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
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type your message"
            placeholderTextColor={colors.textMuted}
          />
          <PrimaryButton label="Send" icon="send-outline" onPress={() => void send()} />
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
