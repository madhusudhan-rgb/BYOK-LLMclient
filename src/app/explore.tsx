import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bot, BotType, getBots } from "../config/bots";
import { supabase } from "../utils/supabase";
import { getCurrentUser } from "../utils/auth";
import { Link } from "expo-router";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  imageUrl?: string;
};
type History = { role: "system" | "user" | "assistant"; content: string };
async function loadSessionFromSupabase(userId: string, botId: string): Promise<{ messages: Message[]; history: History[] } | null> {
  const { data, error } = await supabase
    .from("chat_sessions").select("messages")
    .eq("user_id", userId).eq("bot_id", botId)
    .order("updated_at", { ascending: false }).limit(1).single();
  if (error || !data) return null;
  const stored = data.messages as any[];
  if (!stored || stored.length === 0) return null;
  const messages: Message[] = stored.map((m: any, i: number) => ({
    id: `s-${i}`, role: m.role === "user" ? "user" : "assistant",
    text: m.content || m.text || "", imageUrl: m.image_url || undefined,
  }));
  return { messages, history: messages.map(m => ({ role: m.role, content: m.text })) };
}
async function saveSessionToSupabase(userId: string, botId: string, messages: Message[], history: History[]) {
  const stored = messages.map(m => ({ role: m.role, content: m.text, image_url: m.imageUrl || null }));
  const { data: existing } = await supabase.from("chat_sessions").select("id")
    .eq("user_id", userId).eq("bot_id", botId)
    .order("updated_at", { ascending: false }).limit(1).single();
  if (existing) {
    await supabase.from("chat_sessions").update({ messages: stored }).eq("id", existing.id);
  } else {
    await supabase.from("chat_sessions").insert({ user_id: userId, bot_id: botId, messages: stored });
  }
}
async function deleteSessionFromSupabase(userId: string, botId: string) {
  await supabase.from("chat_sessions").delete().eq("user_id", userId).eq("bot_id", botId);
}
const localCache: Record<string, { messages: Message[]; history: History[] }> = {};
function getChatLocal(bot: Bot) {
  if (!localCache[bot.id]) {
    const greeting = bot.type === "image"
      ? `Hi! I'm ${bot.name}. Describe what you'd like me to draw.`
      : `Hi! I'm ${bot.name}. Ask me anything.`;
    localCache[bot.id] = {
      messages: [{ id: "0", role: "assistant", text: greeting }],
      history: bot.systemPrompt ? [{ role: "system", content: bot.systemPrompt }] : [],
    };
  }
  return localCache[bot.id];
}
const TYPE_META: Record<BotType, { label: string; color: string; dim: string }> = {
  text:  { label: "Text",  color: "#4ade80", dim: "#4ade8020" },
  image: { label: "Image", color: "#60a5fa", dim: "#60a5fa20" },
  video: { label: "Video", color: "#fb923c", dim: "#fb923c20" },
};
function isPlaceholderKey(v: string) {
  const n = v.trim().toLowerCase();
  if (!n) return true;
  return ["test","your-","your","placeholder","example","demo","fake","sample","changeme"].some(t => n.includes(t));
}
function BotAvatar({ bot, size = 40 }: { bot: Bot; size?: number }) {
  if ("image" in bot.icon) {
    return <Image source={bot.icon.image} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  return (
    <View style={[s.avatarWrap, { width: size, height: size, borderRadius: size / 2 }]}>
      <AntDesign name={bot.icon.name} size={size * 0.42} color="#fff" />
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
  const historyRef      = useRef<History[]>([]);
  const messagesRef     = useRef<Message[]>([]);
  const listRef         = useRef<FlatList<Message>>(null);
  const abortRef        = useRef<AbortController | null>(null);
  const currentBotIdRef = useRef<string>("");
  const inputScale      = useRef(new Animated.Value(1)).current;
  const filtered = bots.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.subtitle.toLowerCase().includes(search.toLowerCase())
  );
  const openBot = async (bot: Bot) => {
    currentBotIdRef.current = bot.id;
    setActiveBot(bot);
    setMessages([]);
    setInput("");
    if (userId) {
      const loaded = await loadSessionFromSupabase(userId, bot.id);
      if (loaded) { historyRef.current = loaded.history; setMessages(loaded.messages); return; }
    }
    const cache = getChatLocal(bot);
    historyRef.current = cache.history;
    setMessages([...cache.messages]);
  };
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  const closeBot = async () => {
    abortRef.current?.abort();
    await persistCurrentChat();
    setActiveBot(null);
    setMessages([]);
  };
  const persistCurrentChat = async () => {
    if (!currentBotIdRef.current) return;
    const msgs = messagesRef.current;
    localCache[currentBotIdRef.current] = { messages: msgs, history: historyRef.current };
    if (userId) {
      try { await saveSessionToSupabase(userId, currentBotIdRef.current, msgs, historyRef.current); }
      catch (err) { console.error("Failed to save:", err); }
    }
  };
  const resetChat = async () => {
    if (!activeBot) return;
    abortRef.current?.abort();
    const greeting = activeBot.type === "image"
      ? `Hi! I'm ${activeBot.name}. Describe what you'd like me to draw.`
      : `Hi! I'm ${activeBot.name}. Ask me anything.`;
    setMessages([{ id: "0", role: "assistant", text: greeting }]);
    historyRef.current = activeBot.systemPrompt ? [{ role: "system", content: activeBot.systemPrompt }] : [];
    setLoading(false);
    if (userId) {
      try { await deleteSessionFromSupabase(userId, activeBot.id); delete localCache[activeBot.id]; }
      catch (err) { console.error("Failed to delete:", err); }
    }
  };
  useEffect(() => {
    getCurrentUser().then(u => { if (u) setUserId(u.id); });
  }, []);
  const sendText = async (prompt: string, botMsgId: string) => {
    if (!activeBot) throw new Error("No bot selected.");
    if (!activeBot.apiUrl?.trim()) throw new Error("Bot not configured for chat.");
    if (!activeBot.apiKey?.trim() || isPlaceholderKey(activeBot.apiKey))
      throw new Error(`Add a real API key for ${activeBot.name} in .env, then restart.`);
    historyRef.current.push({ role: "user", content: prompt });
    abortRef.current = new AbortController();
    const res = await fetch(activeBot.apiUrl, {
      method: "POST", signal: abortRef.current.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${activeBot.apiKey}` },
      body: JSON.stringify({ model: activeBot.model, messages: historyRef.current, stream: true, max_tokens: 1024 }),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error?.message ?? `HTTP ${res.status}`); }
    const reader = res.body?.getReader();
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
            if (delta) { fullReply += delta; setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: fullReply } : m)); }
          } catch { /* ignore */ }
        }
      }
    } else {
      const data = await res.json();
      fullReply = data?.choices?.[0]?.message?.content ?? "";
      setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: fullReply } : m));
    }
    if (!fullReply) throw new Error("Empty reply.");
    historyRef.current.push({ role: "assistant", content: fullReply });
  };
  //Image generation ai prompt call since pollination models dont need an actual api key
  const sendImage = async (prompt: string, botMsgId: string) => {
    if (!activeBot) throw new Error("No bot selected.");
    if (activeBot.imageFormat === "pollinations") {
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=${activeBot.model}&width=1024&height=1024&seed=${Date.now()}&nologo=true`;
      setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: "", imageUrl } : m));
      return;
    }
    if (!activeBot.apiUrl?.trim()) throw new Error("Bot not configured for image gen.");
    if (!activeBot.apiKey?.trim() || isPlaceholderKey(activeBot.apiKey))
      throw new Error(`Add a real API key for ${activeBot.name} in .env, then restart.`);
    const res = await fetch(activeBot.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${activeBot.apiKey}` },
      body: JSON.stringify({ model: activeBot.model, prompt, n: 1, size: "1024x1024" }),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error?.message ?? `HTTP ${res.status}`); }
    const data = await res.json();
    const imageUrl = data?.data?.[0]?.url;
    if (!imageUrl) throw new Error("No image returned.");
    setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: "", imageUrl } : m));
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || !activeBot) return;
    const prompt = input.trim();
    const botMsgId = `${Date.now()}-b`;
    Animated.sequence([
      Animated.timing(inputScale, { toValue: 0.97, duration: 60, useNativeDriver: true }),
      Animated.timing(inputScale, { toValue: 1, duration: 60, useNativeDriver: true }),
    ]).start();
    setMessages(prev => [
      ...prev,
      { id: `${Date.now()}-u`, role: "user", text: prompt },
      { id: botMsgId, role: "assistant", text: "" },
    ]);
    setInput("");
    setLoading(true);
    try {
      if (activeBot.type === "image") await sendImage(prompt, botMsgId);
      else await sendText(prompt, botMsgId);
      await persistCurrentChat();
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setMessages(prev => prev.map(m =>
        m.id === botMsgId ? { ...m, text: err instanceof Error ? err.message : "Something went wrong." } : m
      ));
    } finally {
      setLoading(false);
    }
  };

  // BOT LIST 
  if (!activeBot) {
    const featured = bots.slice(0, 5);
    const rest = filtered;
    return (
      <ImageBackground source={require("../../assets/images/chatbg2.avif")} style={s.fill}>
        <View style={s.overlay} />
        <SafeAreaView style={s.fill}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            <View style={s.listHeader}>
              <Text style={s.listTitle}>Models</Text>
            </View>

            {/* Featured strip with most ai models added lol. It looks mid and i might remove it*/}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.featuredList}>
              {featured.map(bot => (
                <Pressable key={bot.id} style={s.featuredPill} onPress={() => openBot(bot)}>
                  <BotAvatar bot={bot} size={20} />
                  <Text style={s.featuredPillText} numberOfLines={1}>{bot.name}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Search bar below the featured strip*/}
            <View style={s.searchRow}>
              <Ionicons name="search-outline" size={14} color="rgba(255,255,255,0.4)" />
              <TextInput
                style={s.searchInput}
                placeholder="Search"
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch("")} hitSlop={8}>
                  <Ionicons name="close-circle" size={14} color="rgba(255,255,255,0.35)" />
                </Pressable>
              )}
            </View>

            {/* All Ai models*/}
            <View style={s.listGroup}>
              {rest.length === 0 && (
                <Text style={s.empty}>No results for "{search}"</Text>
              )}
              {rest.map((bot, i) => (
                <Pressable
                  key={bot.id}
                  style={[s.row, i < rest.length - 1 && s.rowDivider]}
                  onPress={() => openBot(bot)}
                >
                  <BotAvatar bot={bot} size={38} />
                  <View style={s.rowBody}>
                    <Text style={s.rowName}>{bot.name}</Text>
                    <Text style={s.rowSub} numberOfLines={1}>{bot.subtitle}</Text>
                  </View>
                  <Text style={s.rowType}>{TYPE_META[bot.type].label}</Text>
                  <Ionicons name="chevron-forward" size={13} color="rgba(255,255,255,0.2)" />
                </Pressable>
              ))}
            </View>

            <View style={{ height: 48 }} />
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  //Chatbox
  const accentColor = TYPE_META[activeBot.type].color;

  return (
    <ImageBackground source={require("../../assets/images/chatbg2.avif")} style={s.fill}>
      <View style={s.overlay} />
      <SafeAreaView style={s.fill}>
        <KeyboardAvoidingView
          style={s.fill}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
        >
          {/* Headers */}
          <View style={s.chatHeader}>
            <Pressable onPress={closeBot} hitSlop={8} style={s.backBtn}>
              <Ionicons name="chevron-back" size={20} color="#fff" />
              <Text style={s.backLabel}>Models</Text>
            </Pressable>

            <View style={s.chatHeaderCenter}>
              <BotAvatar bot={activeBot} size={28} />
              <Text style={s.chatHeaderName}>{activeBot.name}</Text>
              <View style={[s.statusDot, { backgroundColor: loading ? "#facc15" : accentColor }]} />
            </View>

            <View style={s.chatHeaderActions}>
              <Link href="/apikeys" asChild>
                <Pressable hitSlop={8}>
                  <Ionicons name="key-outline" size={16} color="rgba(255,255,255,0.45)" />
                </Pressable>
              </Link>
              <Pressable onPress={resetChat} hitSlop={8}>
                <Ionicons name="trash-outline" size={16} color="rgba(255,255,255,0.45)" />
              </Pressable>
            </View>
          </View>

          {/* Messages */}
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={m => m.id}
            contentContainerStyle={s.chatList}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item, index }) => {
              const isUser = item.role === "user";
              const prevMsg = messages[index - 1];
              const showAvatar = !isUser && (!prevMsg || prevMsg.role === "user");

              return (
                <View style={[s.msgRow, isUser && s.msgRowUser]}>
                  {!isUser && (
                    <View style={s.msgAvatarCol}>
                      {showAvatar
                        ? <BotAvatar bot={activeBot} size={26} />
                        : <View style={{ width: 26 }} />
                      }
                    </View>
                  )}
                  <View style={[
                    s.bubble,
                    isUser ? s.userBubble : s.botBubble,
                    item.imageUrl && s.imageBubble,
                  ]}>
                    {item.imageUrl ? (
                      <Image source={{ uri: item.imageUrl }} style={s.generatedImage} resizeMode="cover" />
                    ) : (
                      <Text style={[s.bubbleText, isUser && s.userBubbleText]}>
                        {item.text || (item.role === "assistant" && loading ? "▍" : "")}
                      </Text>
                    )}
                  </View>
                </View>
              );
            }}
          />

          {/* Input box {sendmessage} */}
          <Animated.View style={[s.inputBar, { transform: [{ scale: inputScale }] }]}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={activeBot.type === "image" ? "Describe an image…" : "Message"}
              placeholderTextColor="rgba(255,255,255,0.3)"
              style={s.chatInput}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
              multiline
            />
            <Pressable
              style={[s.sendBtn, loading && s.sendBtnStop]}
              onPress={loading ? () => abortRef.current?.abort() : sendMessage}
            >
              <Ionicons
                name={loading ? "stop" : activeBot.type === "image" ? "image-outline" : "arrow-up"}
                size={16}
                color={loading ? "rgba(255,255,255,0.5)" : "#000"}
              />
            </Pressable>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0, 0, 0, 0.4)" },

  // Bot list
  listHeader: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  listTitle: { color: "#fff", fontSize: 28, fontWeight: "600", letterSpacing: -0.5 },

  // Featured pills
  featuredList: { paddingHorizontal: 20, paddingVertical: 16, gap: 8 },
  featuredPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.12)",
  },
  featuredPillText: { color: "#fff", fontSize: 13, fontWeight: "500" },

  // Search
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: Platform.OS === "ios" ? 9 : 7,
  },
  searchInput: { flex: 1, color: "#fff", fontSize: 15 },

  // Grouped lists for a better user interface look
  listGroup: {
    marginHorizontal: 16,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.05)",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 12,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  avatarWrap: {
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  rowBody: { flex: 1 },
  rowName: { color: "#fff", fontSize: 15, fontWeight: "500" },
  rowSub: { color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 1 },
  rowType: { color: "rgba(255,255,255,0.3)", fontSize: 12 },

  empty: { color: "rgba(255,255,255,0.3)", textAlign: "center", paddingVertical: 32, fontSize: 14 },

  // Chat
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 3, minWidth: 80 },
  backLabel: { color: "#fff", fontSize: 16, fontWeight: "400" },
  chatHeaderCenter: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  chatHeaderName: { color: "#fff", fontSize: 15, fontWeight: "600" },
  chatHeaderActions: { flexDirection: "row", alignItems: "center", gap: 16, minWidth: 80, justifyContent: "flex-end" },
  statusDot: { width: 6, height: 6, borderRadius: 3 },

  chatList: { paddingVertical: 20, paddingHorizontal: 16, flexGrow: 1, gap: 4 },

  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  msgRowUser: { flexDirection: "row-reverse" },
  msgAvatarCol: { width: 26, alignItems: "center" },

  bubble: {
    borderRadius: 18,
    maxWidth: "76%",
    overflow: "hidden",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  imageBubble: { padding: 0, backgroundColor: "transparent" },
  userBubble: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderBottomLeftRadius: 4,
  },
  bubbleText: { color: "rgba(255,255,255,0.85)", fontSize: 15, lineHeight: 22 },
  userBubbleText: { color: "#fff" },
  generatedImage: { width: 248, height: 248, borderRadius: 14 },

  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 12 : 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
    gap: 10,
  },
  chatInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
    color: "#fff",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 120,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.1)",
  },
  sendBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center", justifyContent: "center",
  },
  sendBtnStop: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
});
