import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bot, BOTS, BotType } from "../config/bots";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  imageUrl?: string;
};
type History = { role: "system" | "user" | "assistant"; content: string };

const chatCache: Record<string, { messages: Message[]; history: History[] }> = {};

function getChat(bot: Bot) {
  if (!chatCache[bot.id]) {
    const greeting =
      bot.type === "image"
        ? `Hi! I'm ${bot.name}. Describe what you'd like me to draw.`
        : `Hi! I'm ${bot.name}. Ask me anything.`;
    chatCache[bot.id] = {
      messages: [{ id: "0", role: "assistant", text: greeting }],
      history: bot.systemPrompt ? [{ role: "system", content: bot.systemPrompt }] : [],
    };
  }
  return chatCache[bot.id];
}

const TYPE_BADGE: Record<BotType, { label: string; color: string }> = {
  text:  { label: "Text",  color: "#64c579" },
  image: { label: "Image", color: "#61a9c8" },
  video: { label: "Video", color: "#f97316" },
};

function BotAvatar({ bot, size = 40 }: { bot: Bot; size?: number }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <AntDesign name={bot.icon.name} size={size * 0.52} color={bot.icon.color} />
    </View>
  );
}

export default function Explore() {
  const [search,    setSearch]    = useState("");
  const [activeBot, setActiveBot] = useState<Bot | null>(null);
  const [messages,  setMessages]  = useState<Message[]>([]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);

  const historyRef = useRef<History[]>([]);
  const listRef    = useRef<FlatList<Message>>(null);
  const abortRef   = useRef<AbortController | null>(null);

  const filtered = BOTS.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.subtitle.toLowerCase().includes(search.toLowerCase())
  );

  const openBot = (bot: Bot) => {
    const cache = getChat(bot);
    historyRef.current = cache.history;
    setMessages([...cache.messages]);
    setInput("");
    setActiveBot(bot);
  };

  const closeBot = () => {
    abortRef.current?.abort();
    if (activeBot) {
      chatCache[activeBot.id].messages = messages;
      chatCache[activeBot.id].history  = historyRef.current;
    }
    setActiveBot(null);
    setMessages([]);
  };

  const resetChat = () => {
    if (!activeBot) return;
    abortRef.current?.abort();
    const greeting =
      activeBot.type === "image"
        ? `Hi! I'm ${activeBot.name}. Describe what you'd like me to draw.`
        : `Hi! I'm ${activeBot.name}. Ask me anything.`;
    const fresh = {
      messages: [{ id: "0", role: "assistant" as const, text: greeting }],
      history: activeBot.systemPrompt
        ? [{ role: "system" as const, content: activeBot.systemPrompt }]
        : [],
    };
    chatCache[activeBot.id] = fresh;
    historyRef.current = fresh.history;
    setMessages([...fresh.messages]);
    setLoading(false);
  };

  // ── Text (streaming) ──────────────────────────────────────────
  const sendText = async (prompt: string, botMsgId: string) => {
    historyRef.current.push({ role: "user", content: prompt });
    abortRef.current = new AbortController();

    const res = await fetch(activeBot!.apiUrl, {
      method: "POST",
      signal: abortRef.current.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${activeBot!.apiKey}`,
      },
      body: JSON.stringify({
        model: activeBot!.model,
        messages: historyRef.current,
        stream: true,
        max_tokens: 1024,
      }),
    });

    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.error?.message ?? `HTTP ${res.status}`);
    }

    const reader  = res.body?.getReader();
    const decoder = new TextDecoder();
    let fullReply = "";

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") break;
          try {
            const delta = JSON.parse(payload)?.choices?.[0]?.delta?.content;
            if (delta) {
              fullReply += delta;
              setMessages(prev =>
                prev.map(m => m.id === botMsgId ? { ...m, text: fullReply } : m)
              );
            }
          } catch { /* ignore malformed chunks */ }
        }
      }
    } else {
      const data = await res.json();
      fullReply = data?.choices?.[0]?.message?.content ?? "";
      setMessages(prev =>
        prev.map(m => m.id === botMsgId ? { ...m, text: fullReply } : m)
      );
    }

    if (!fullReply) throw new Error("Empty reply from AI.");
    historyRef.current.push({ role: "assistant", content: fullReply });
  };

  // ── Image generation ──────────────────────────────────────────
  const sendImage = async (prompt: string, botMsgId: string) => {
    if (activeBot!.imageFormat === "pollinations") {
      const encoded  = encodeURIComponent(prompt);
      const seed     = Date.now();
      const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?model=${activeBot!.model}&width=1024&height=1024&seed=${seed}&nologo=true`;
      setMessages(prev =>
        prev.map(m => m.id === botMsgId ? { ...m, text: "", imageUrl } : m)
      );
      return;
    }

    const res = await fetch(activeBot!.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${activeBot!.apiKey}`,
      },
      body: JSON.stringify({
        model: activeBot!.model,
        prompt,
        n: 1,
        size: "1024x1024",
      }),
    });

    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.error?.message ?? `HTTP ${res.status}`);
    }

    const data = await res.json();
    const imageUrl = data?.data?.[0]?.url;
    if (!imageUrl) throw new Error("No image returned.");

    setMessages(prev =>
      prev.map(m => m.id === botMsgId ? { ...m, text: "", imageUrl } : m)
    );
  };

  // ── Dispatcher ────────────────────────────────────────────────
  const sendMessage = async () => {
    if (!input.trim() || loading || !activeBot) return;
    const prompt   = input.trim();
    const botMsgId = `${Date.now()}-b`;

    setMessages(prev => [
      ...prev,
      { id: `${Date.now()}-u`, role: "user",     text: prompt },
      { id: botMsgId,          role: "assistant", text: "" },
    ]);
    setInput("");
    setLoading(true);

    try {
      if (activeBot.type === "image") {
        await sendImage(prompt, botMsgId);
      } else {
        await sendText(prompt, botMsgId);
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setMessages(prev =>
        prev.map(m =>
          m.id === botMsgId
            ? { ...m, text: `❌ ${err instanceof Error ? err.message : "Something went wrong."}` }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Bot List ──────────────────────────────────────────────────
  if (!activeBot) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>AI Bots</Text>
          <Text style={styles.listSub}>{BOTS.length} available</Text>
        </View>

        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={16} color="#444" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search bots..."
            placeholderTextColor="#444"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={b => b.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No bots match "{search}"</Text>}
          renderItem={({ item: bot }) => {
            const badge = TYPE_BADGE[bot.type];
            return (
              <Pressable style={styles.card} onPress={() => openBot(bot)}>
                <BotAvatar bot={bot} size={48} />
                <View style={styles.cardBody}>
                  <View style={styles.cardNameRow}>
                    <Text style={styles.cardName}>{bot.name}</Text>
                    <View style={[styles.badge, { backgroundColor: badge.color + "22" }]}>
                      <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardSub}>{bot.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#333" />
              </Pressable>
            );
          }}
        />
      </SafeAreaView>
    );
  }

  // ── Chat View ─────────────────────────────────────────────────
  const placeholder =
    activeBot.type === "image" ? "Describe an image…" : `Message ${activeBot.name}…`;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        <View style={styles.chatHeader}>
          <Pressable style={styles.backBtn} onPress={closeBot}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </Pressable>
          <BotAvatar bot={activeBot} size={36} />
          <View style={styles.chatHeaderCenter}>
            <Text style={styles.chatHeaderName}>{activeBot.name}</Text>
            <Text style={styles.chatHeaderSub}>{activeBot.subtitle}</Text>
          </View>
          <Pressable style={styles.resetBtn} onPress={resetChat}>
            <Text style={styles.resetBtnText}>Reset</Text>
          </Pressable>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={m => m.id}
          contentContainerStyle={styles.chatList}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <View style={[
              styles.bubble,
              item.role === "user" ? styles.userBubble : styles.botBubble,
              item.imageUrl ? styles.imageBubble : null,
            ]}>
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.generatedImage}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.bubbleText}>
                  {item.text || (item.role === "assistant" && loading ? "▍" : "")}
                </Text>
              )}
            </View>
          )}
        />

        <View style={styles.inputBar}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={placeholder}
            placeholderTextColor="#444"
            style={styles.chatInput}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            multiline
          />
          <Pressable
            style={[styles.sendBtn, loading && styles.sendBtnStop]}
            onPress={loading ? () => abortRef.current?.abort() : sendMessage}
          >
            <Ionicons
              name={loading ? "stop" : activeBot.type === "image" ? "image" : "arrow-up"}
              size={22}
              color="#fff"
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0d0d0d" },
  avatar: {
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  listHeader: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  listTitle: { color: "#fff", fontSize: 26, fontWeight: "800" },
  listSub: { color: "#444", fontSize: 13, marginTop: 2 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: "#1a1a1a",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    paddingHorizontal: 14,
  },
  searchInput: { flex: 1, color: "#fff", fontSize: 15, paddingVertical: 12 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  empty: { color: "#444", textAlign: "center", marginTop: 40, fontSize: 14 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#141414",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    gap: 14,
  },
  cardBody: { flex: 1 },
  cardNameRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  cardName: { color: "#fff", fontSize: 16, fontWeight: "700" },
  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: "700" },
  cardSub: { color: "#555", fontSize: 12, marginTop: 3 },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    backgroundColor: "#141414",
    gap: 10,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.07)",
    alignItems: "center", justifyContent: "center",
  },
  chatHeaderCenter: { flex: 1 },
  chatHeaderName: { color: "#fff", fontSize: 15, fontWeight: "700" },
  chatHeaderSub: { color: "#444", fontSize: 11, marginTop: 1 },
  resetBtn: {
    backgroundColor: "#00cc2c",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  resetBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  chatList: { paddingVertical: 16, paddingHorizontal: 12, flexGrow: 1 },
  bubble: {
    marginVertical: 4,
    borderRadius: 18,
    maxWidth: "82%",
    overflow: "hidden",
    padding: 12,
  },
  imageBubble: { padding: 0 },
  userBubble: { alignSelf: "flex-end", backgroundColor: "#0a84ff", borderBottomRightRadius: 4 },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    borderBottomLeftRadius: 4,
  },
  bubbleText: { color: "#fff", fontSize: 15, lineHeight: 22 },
  generatedImage: { width: 260, height: 260, borderRadius: 16 },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    paddingBottom: Platform.OS === "ios" ? 12 : 16,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    backgroundColor: "#141414",
    gap: 8,
  },
  chatInput: {
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
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "#00cc2c",
    alignItems: "center", justifyContent: "center",
  },
  sendBtnStop: { backgroundColor: "#cc2200" },
});