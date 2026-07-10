import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
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
import { Bot, BotType, getBots } from "../config/bots";
import { ImageBackground } from "react-native";
import { supabase } from "../utils/supabase";
import { getCurrentUser } from "../utils/auth";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  imageUrl?: string;
};
type History = { role: "system" | "user" | "assistant"; content: string };

// ── Supabase chat persistence ───────────────────────────────────

async function loadSessionFromSupabase(userId: string, botId: string): Promise<{ messages: Message[]; history: History[] } | null> {
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("messages")
    .eq("user_id", userId)
    .eq("bot_id", botId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

  const stored = data.messages as any[];
  if (!stored || stored.length === 0) return null;

  // Map stored messages back to Message+History
  const messages: Message[] = stored.map((m: any, i: number) => ({
    id: `s-${i}`,
    role: m.role === "user" ? "user" : "assistant",
    text: m.content || m.text || "",
    imageUrl: m.image_url || undefined,
  }));

  // Build history from messages (skip system prompt – it's on the bot config)
  const history: History[] = messages.map((m) => ({
    role: m.role,
    content: m.text,
  }));

  return { messages, history };
}

async function saveSessionToSupabase(userId: string, botId: string, messages: Message[], history: History[]) {
  // Save the conversation messages as a JSON array
  const storedMessages = messages.map((m) => ({
    role: m.role,
    content: m.text,
    image_url: m.imageUrl || null,
  }));

  // Upsert: try to find existing row, update it; otherwise insert
  const { data: existing } = await supabase
    .from("chat_sessions")
    .select("id")
    .eq("user_id", userId)
    .eq("bot_id", botId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (existing) {
    await supabase
      .from("chat_sessions")
      .update({ messages: storedMessages })
      .eq("id", existing.id);
  } else {
    await supabase
      .from("chat_sessions")
      .insert({ user_id: userId, bot_id: botId, messages: storedMessages });
  }
}

async function deleteSessionFromSupabase(userId: string, botId: string) {
  await supabase
    .from("chat_sessions")
    .delete()
    .eq("user_id", userId)
    .eq("bot_id", botId);
}

// ── Local fallback cache (when not logged in) ───────────────────
const localCache: Record<string, { messages: Message[]; history: History[] }> = {};

function getChatLocal(bot: Bot) {
  if (!localCache[bot.id]) {
    const greeting =
      bot.type === "image"
        ? `Hi! I'm ${bot.name}. Describe what you'd like me to draw.`
        : `Hi! I'm ${bot.name}. Ask me anything.`;
    localCache[bot.id] = {
      messages: [{ id: "0", role: "assistant", text: greeting }],
      history: bot.systemPrompt ? [{ role: "system", content: bot.systemPrompt }] : [],
    };
  }
  return localCache[bot.id];
}

const TYPE_BADGE: Record<BotType, { label: string; color: string }> = {
  text:  { label: "Text",  color: "#64c579" },
  image: { label: "Image", color: "#61a9c8" },
  video: { label: "Video", color: "#f97316" },
};

function isPlaceholderKey(value: string) {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return true;

  return [
    "test", "test-or", "test-groq",
    "your-", "your", "placeholder",
    "example", "demo", "fake", "sample", "changeme",
  ].some(token => normalized.includes(token));
}

function BotAvatar({ bot, size = 40 }: { bot: Bot; size?: number }) {
  if ("image" in bot.icon) {
    return (
      <Image
        source={bot.icon.image}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }
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
  const [userId,    setUserId]    = useState<string | null>(null);
  const bots = getBots();

  const historyRef = useRef<History[]>([]);
  const messagesRef = useRef<Message[]>([]);
  const listRef    = useRef<FlatList<Message>>(null);
  const abortRef   = useRef<AbortController | null>(null);
  const currentBotIdRef = useRef<string>("");

  const filtered = bots.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.subtitle.toLowerCase().includes(search.toLowerCase())
  );

  const openBot = async (bot: Bot) => {
    currentBotIdRef.current = bot.id;
    setActiveBot(bot);
    setMessages([]);
    setInput("");

    // Try Supabase first if logged in
    if (userId) {
      const loaded = await loadSessionFromSupabase(userId, bot.id);
      if (loaded) {
        historyRef.current = loaded.history;
        setMessages(loaded.messages);
        return;
      }
    }

    // Fallback to local cache
    const cache = getChatLocal(bot);
    historyRef.current = cache.history;
    setMessages([...cache.messages]);
  };

  // Keep messagesRef in sync with messages state
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const closeBot = async () => {
    abortRef.current?.abort();
    await persistCurrentChat();
    setActiveBot(null);
    setMessages([]);
  };

  const persistCurrentChat = async () => {
    if (!currentBotIdRef.current) return;
    const msgs = messagesRef.current;
    // Save to local cache always
    localCache[currentBotIdRef.current] = {
      messages: msgs,
      history: historyRef.current,
    };
    // Save to Supabase if logged in
    if (userId) {
      try {
        await saveSessionToSupabase(userId, currentBotIdRef.current, msgs, historyRef.current);
      } catch (err) {
        console.error("Failed to save chat to Supabase:", err);
      }
    }
  };

  const resetChat = async () => {
    if (!activeBot) return;
    abortRef.current?.abort();

    const greeting =
      activeBot.type === "image"
        ? `Hi! I'm ${activeBot.name}. Describe what you'd like me to draw.`
        : `Hi! I'm ${activeBot.name}. Ask me anything.`;
    const freshMessages: Message[] = [{ id: "0", role: "assistant", text: greeting }];
    const freshHistory: History[] = activeBot.systemPrompt
      ? [{ role: "system", content: activeBot.systemPrompt }]
      : [];

    setMessages(freshMessages);
    historyRef.current = freshHistory;
    setLoading(false);

    // Delete from Supabase if logged in
    if (userId) {
      try {
        await deleteSessionFromSupabase(userId, activeBot.id);
        // Also clear local cache entry
        delete localCache[activeBot.id];
      } catch (err) {
        console.error("Failed to delete session:", err);
      }
    }
  };

  // Load current user on mount
  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user) setUserId(user.id);
    });
  }, []);

  // ── Text (streaming) ──────────────────────────────────────────
  const sendText = async (prompt: string, botMsgId: string) => {
    if (!activeBot) throw new Error("No bot selected.");
    if (!activeBot.apiUrl?.trim()) throw new Error("This bot is not configured for chat.");
    if (!activeBot.apiKey?.trim() || isPlaceholderKey(activeBot.apiKey)) {
      throw new Error(`Please add a real API key for ${activeBot.name} in .env, then restart the app.`);
    }

    historyRef.current.push({ role: "user", content: prompt });
    abortRef.current = new AbortController();

    const isGroq = activeBot.apiUrl.includes("groq.com");
    const isOpenRouter = activeBot.apiUrl.includes("openrouter.ai");

    const res = await fetch(activeBot.apiUrl, {
      method: "POST",
      signal: abortRef.current.signal,
      headers: {
        "Content-Type": "application/json",
        ...(isGroq
          ? { Authorization: `Bearer ${activeBot.apiKey}` }
          : isOpenRouter
            ? { Authorization: `Bearer ${activeBot.apiKey}` }
            : { Authorization: `Bearer ${activeBot.apiKey}` }),
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
    if (!activeBot) throw new Error("No bot selected.");

    if (activeBot.imageFormat === "pollinations") {
      const encoded  = encodeURIComponent(prompt);
      const seed     = Date.now();
      const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?model=${activeBot!.model}&width=1024&height=1024&seed=${seed}&nologo=true`;
      setMessages(prev =>
        prev.map(m => m.id === botMsgId ? { ...m, text: "", imageUrl } : m)
      );
      return;
    }

    if (!activeBot.apiUrl?.trim()) throw new Error("This bot is not configured for image generation.");
    if (!activeBot.apiKey?.trim() || isPlaceholderKey(activeBot.apiKey)) {
      throw new Error(`Please add a real API key for ${activeBot.name} in .env, then restart the app.`);
    }

    const isGroq = activeBot.apiUrl.includes("groq.com");
    const isOpenRouter = activeBot.apiUrl.includes("openrouter.ai");

    const res = await fetch(activeBot.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(isGroq
          ? { Authorization: `Bearer ${activeBot.apiKey}` }
          : isOpenRouter
            ? { Authorization: `Bearer ${activeBot.apiKey}` }
            : { Authorization: `Bearer ${activeBot.apiKey}` }),
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
      // Persist after successful message
      await persistCurrentChat();
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

  //Bot List 
  if (!activeBot) {
    return (
      <ImageBackground  
      source = {require("../../assets/images/bg7.jpg")}
      style = {styles.background}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>AI Bots</Text>
          <Text style={styles.listSub}>{bots.length} available</Text>
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
      </ImageBackground>
    );
  }

  // Chat View
  const placeholder =
    activeBot.type === "image" ? "Describe an image…" : `Message ${activeBot.name}…`;

  return (
    <ImageBackground source={require("../../assets/images/bg7.jpg")} style={styles.background}>
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
            placeholderTextColor="#faf3f3"
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  avatar: {
    backgroundColor: "#c3c7be1a",
    borderWidth: 1,
    borderColor: "rgba(124, 15, 15, 0)",
    alignItems: "center",
    justifyContent: "center",
  },
  listHeader: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  listTitle: { color: "#ffffff", fontSize: 26, fontWeight: "800" },
  listSub: { color: "#f1e8e8", fontSize: 13, marginTop: 2 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: "#f5f5f501",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
    paddingHorizontal: 14,
  },
  searchInput: { flex: 1, color: "#e1d6d6", fontSize: 15, paddingVertical: 12 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  empty: { color: "#47444401", textAlign: "center", marginTop: 40, fontSize: 14 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#242222b8",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 250, 250, 0)",
    gap: 14,
  },
  cardBody: { flex: 1 },
  cardNameRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  cardName: { color: "#fdf2f2", fontSize: 16, fontWeight: "700" },
  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: "700" },
  cardSub: { color: "#f0e6e6", fontSize: 12, marginTop: 3 },
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
  userBubble: { alignSelf: "flex-end", backgroundColor: "#11f501", borderBottomRightRadius: 4 },
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
    padding: 10,
    paddingBottom: Platform.OS === "ios" ? 12 : 16,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    backgroundColor: "#141414",
    gap: 9,
  },
  chatInput: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    color: "#dfd5d5",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop:12,
    paddingBottom: 30,
    fontSize: 15,
    maxHeight: 120,
    marginBottom : 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "#00cc2c",
    alignItems: "center", justifyContent: "center",
    marginBottom : 34
  },
  sendBtnStop: { backgroundColor: "#cc2200" },
  background: {
    flex: 1,
    resizeMode: "cover",
  },
});
