import { useRef, useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomModal, ModalConfig } from "./components/CustomModal";

import { env } from "./utils/env";

const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const API_KEY = env.GROQ_API_KEY;

type Message = { id: string; role: "user" | "assistant"; text: string };
type ChatItem = { role: "system" | "user" | "assistant"; content: string };

const INITIAL: Message[] = [
  { id: "1", role: "assistant", text: "Hello! Ask me anything. I am your personalized AI chatbot." },
];

export default function ChatScreen() {
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig,  setModalConfig]  = useState<ModalConfig | null>(null);

  const listRef   = useRef<FlatList<Message>>(null);
  const historyRef = useRef<ChatItem[]>([
    { role: "system", content: "You are a helpful assistant." },
  ]);

  const showModal = (config: ModalConfig) => { setModalConfig(config); setModalVisible(true); };

  const addMessage = (role: "user" | "assistant", text: string) =>
    setMessages(prev => [...prev, { id: `${Date.now()}-${role}`, role, text }]);

  const resetChat = () => {
    setMessages(INITIAL);
    setInput("");
    historyRef.current = [{ role: "system", content: "You are a helpful assistant." }];
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const prompt = input.trim();
    addMessage("user", prompt);
    setInput("");
    setLoading(true);
    historyRef.current.push({ role: "user", content: prompt });

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
        body: JSON.stringify({ model: "llama-3.1-8b-instant", messages: historyRef.current }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message ?? `HTTP ${response.status}`);
      const reply = data?.choices?.[0]?.message?.content;
      if (!reply) throw new Error("The AI returned an empty reply.");
      historyRef.current.push({ role: "assistant", content: reply });
      addMessage("assistant", reply);
    } catch (err) {
      addMessage("assistant", `❌ ${err instanceof Error ? err.message : "Something went wrong."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        <CustomModal visible={modalVisible} config={modalConfig} onClose={() => setModalVisible(false)} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerText}>AI Chat</Text>
            <Text style={styles.headerSub}>Groq · Llama 3.1</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              style={styles.infoBtn}
              onPress={() => showModal({
                title: "ℹ️ About This Chat",
                message: "Free chatbot powered by Groq.\n\nLimits: 6,000 tokens/min · 500,000 tokens/day.\n\nContact for inquiries about token usage:\nmadhusudhant207@gmail.com\n+1 (772) 259-0947\n\nReplies will be sent within 1 business day.",
                buttons: [{ text: "Got it", style: "cancel" }],
              })}
            >
              <Text style={styles.infoBtnText}>?</Text>
            </Pressable>
            <Pressable style={styles.resetBtn} onPress={resetChat}>
              <Text style={styles.resetText}>Reset</Text>
            </Pressable>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.role === "user" ? styles.userBubble : styles.botBubble]}>
              <Text style={styles.bubbleText}>{item.text}</Text>
            </View>
          )}
        />

        {/* Input */}
        <View style={styles.bottom}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor="#555"
            style={styles.input}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            multiline
          />
          <Pressable
            style={[styles.sendBtn, loading && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={loading}
          >
            <Text style={styles.sendBtnText}>{loading ? "…" : "↑"}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0d0d0d" },
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    backgroundColor: "#141414",
  },
  headerLeft: { flex: 1 },
  headerText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  headerSub: { color: "#444", fontSize: 11, marginTop: 2 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  infoBtnText: { color: "rgba(255,255,255,0.5)", fontWeight: "700", fontSize: 14 },
  resetBtn: {
    backgroundColor: "#00cc2c",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  resetText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  list: { paddingVertical: 16, paddingHorizontal: 12, flexGrow: 1 },
  bubble: {
    padding: 12,
    marginVertical: 4,
    borderRadius: 18,
    maxWidth: "82%",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#0a84ff",
    borderBottomRightRadius: 4,
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    borderBottomLeftRadius: 4,
  },
  bubbleText: { color: "#fff", fontSize: 15, lineHeight: 22 },
  bottom: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom : 20,
    padding: 7,
    paddingBottom: Platform.OS === "ios" ? 12 : 16,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    backgroundColor: "#141414",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    color: "#fff",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 11,
    paddingBottom: 11,
    fontSize: 15,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#00cc2c",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: "#fff", fontSize: 20, fontWeight: "700" },
});