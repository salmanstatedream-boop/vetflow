import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Field } from '@/components/ui';
import { Colors, Fonts } from '@/constants/theme';
import { ownerApi, type ChatMessage } from '@/lib/api';

export default function ChatThreadScreen() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const load = useCallback(async () => {
    if (!threadId) return;
    try {
      const res = await ownerApi.threadMessages(threadId);
      setMessages(res.messages);
    } catch {
      setMessages([]);
    }
  }, [threadId]);

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 8000);
    return () => clearInterval(t);
  }, [load]);

  const send = async () => {
    if (!threadId || !body.trim()) return;
    setSending(true);
    try {
      const res = await ownerApi.sendMessage(threadId, body.trim());
      setMessages((prev) => [...prev, res.message]);
      setBody('');
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    } catch (err: unknown) {
      Alert.alert('Send failed', err instanceof Error ? err.message : 'Try again');
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 24}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => {
            const mine = item.senderType === 'owner';
            return (
              <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                <Text style={[styles.bubbleText, mine && { color: '#fff' }]}>
                  {item.body}
                </Text>
                <Text style={[styles.time, mine && { color: 'rgba(255,255,255,0.7)' }]}>
                  {new Date(item.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            );
          }}
        />
        <View style={styles.composer}>
          <View style={{ flex: 1 }}>
            <Field
              value={body}
              onChangeText={setBody}
              placeholder="Message your clinic…"
            />
          </View>
          <Pressable
            onPress={send}
            disabled={sending || !body.trim()}
            style={[styles.sendBtn, (!body.trim() || sending) && { opacity: 0.5 }]}
          >
            <Text style={styles.sendText}>{sending ? '…' : 'Send'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  list: { padding: 16, paddingBottom: 8 },
  bubble: {
    maxWidth: '82%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  mine: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  theirs: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    color: Colors.text,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: Fonts.regular,
  },
  time: { marginTop: 4, fontSize: 10, color: Colors.textMuted, fontFamily: Fonts.medium },
  composer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  sendBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sendText: { color: '#fff', fontFamily: Fonts.bold },
});
