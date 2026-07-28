import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  ImageBackground
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../utils/supabase";
import { getCurrentUser } from "../utils/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

type ModelType   = "text" | "image" | "video";
type VideoFormat = "fal" | "direct";
type ImageFormat = "pollinations" | "url";
type ApiFormat   =
  | "openai" | "anthropic" | "google" | "cohere" | "mistral"
  | "deepseek" | "xai" | "perplexity" | "azure"
  | "stability" | "replicate" | "fal" | "ideogram" | "bfl"
  | "leonardo" | "getimg" | "segmind"
  | "runway" | "luma" | "pika" | "haiper" | "pixverse" | "vidu" | "minimax"
  | "elevenlabs" | "cartesia" | "playht" | "murf"
  | "voyage" | "jina" | "ollama" | "huggingface";

type CustomModel = {
  id: string;
  user_id: string;
  name: string;
  api_url: string;
  api_key: string;
  model: string;
  type: ModelType;
  system_prompt: string;
  video_format: VideoFormat | null;
  image_format: ImageFormat | null;
  api_format: ApiFormat;
  supports_vision: boolean;
  created_at: string;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  imageUrl?: string;
  videoUrl?: string;
};

type History = {
  role: "system" | "user" | "assistant";
  content: string | any[];
};

// ─── Presets ─────────────────────────────────────────────────────────────────

const PRESETS: {
  label: string; apiUrl: string; model: string;
  type: ModelType; apiFormat: ApiFormat;
  imageFormat?: ImageFormat; videoFormat?: VideoFormat;
}[] = [
  { label: "OpenAI",        apiUrl: "https://api.openai.com/v1/chat/completions",                                 model: "gpt-4o",                  type: "text",  apiFormat: "openai"    },
  { label: "Anthropic",     apiUrl: "https://api.anthropic.com/v1/messages",                                     model: "claude-opus-4-5",         type: "text",  apiFormat: "anthropic" },
  { label: "Groq",          apiUrl: "https://api.groq.com/openai/v1/chat/completions",                          model: "llama-3.3-70b-versatile", type: "text",  apiFormat: "openai"    },
  { label: "OpenRouter",    apiUrl: "https://openrouter.ai/api/v1/chat/completions",                            model: "",                        type: "text",  apiFormat: "openai"    },
  { label: "Gemini",        apiUrl: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", model: "gemini-2.0-flash",        type: "text",  apiFormat: "openai"    },
  { label: "Mistral",       apiUrl: "https://api.mistral.ai/v1/chat/completions",                               model: "mistral-large-latest",    type: "text",  apiFormat: "openai"    },
  { label: "Ollama",        apiUrl: "http://localhost:11434/v1/chat/completions",                               model: "llama3",                  type: "text",  apiFormat: "openai"    },
  { label: "DALL·E",        apiUrl: "https://api.openai.com/v1/images/generations",                             model: "dall-e-3",                type: "image", apiFormat: "openai",   imageFormat: "url"          },
  { label: "Pollinations",  apiUrl: "",                                                                          model: "flux",                    type: "image", apiFormat: "openai",   imageFormat: "pollinations" },
  { label: "fal · Kling",   apiUrl: "https://queue.fal.run/fal-ai/kling-video/v2.1/standard/text-to-video",    model: "kling-video",             type: "video", apiFormat: "openai",   videoFormat: "fal"          },
  { label: "fal · MiniMax", apiUrl: "https://queue.fal.run/fal-ai/minimax/video-01",                           model: "minimax-video-01",        type: "video", apiFormat: "openai",   videoFormat: "fal"          },
  { label: "Cohere",        apiUrl: "https://api.cohere.ai/v2/chat",                                           model: "command-a-03-2025",       type: "text",  apiFormat: "cohere"    },
  { label: "DeepSeek",      apiUrl: "https://api.deepseek.com/chat/completions",                               model: "deepseek-chat",           type: "text",  apiFormat: "openai"    },
  { label: "xAI",           apiUrl: "https://api.x.ai/v1/chat/completions",                                    model: "grok-4",                  type: "text",  apiFormat: "openai"    },
  { label: "Together AI",   apiUrl: "https://api.together.xyz/v1/chat/completions",                            model: "meta-llama/Llama-3.3-70B-Instruct-Turbo", type: "text", apiFormat: "openai" },
  { label: "Fireworks AI",  apiUrl: "https://api.fireworks.ai/inference/v1/chat/completions",                  model: "accounts/fireworks/models/llama-v3p3-70b-instruct", type: "text", apiFormat: "openai" },
  { label: "Cerebras",      apiUrl: "https://api.cerebras.ai/v1/chat/completions",                             model: "llama-4-scout-17b-16e-instruct", type: "text", apiFormat: "openai" },
  { label: "SambaNova",     apiUrl: "https://api.sambanova.ai/v1/chat/completions",                            model: "Meta-Llama-3.3-70B-Instruct", type: "text", apiFormat: "openai" },
  { label: "Perplexity",    apiUrl: "https://api.perplexity.ai/chat/completions",                              model: "sonar-pro",               type: "text",  apiFormat: "openai"    },
  { label: "Stability AI",  apiUrl: "https://api.stability.ai/v2beta/stable-image/generate/core",              model: "stable-image-core",       type: "image", apiFormat: "stability" },
  { label: "Ideogram",      apiUrl: "https://api.ideogram.ai/generate",                                        model: "ideogram-v3",             type: "image", apiFormat: "ideogram"  },
  { label: "Black Forest",  apiUrl: "https://api.bfl.ai/v1/flux-pro",                                          model: "flux-pro",                type: "image", apiFormat: "bfl"       },
  { label: "Replicate",     apiUrl: "https://api.replicate.com/v1/predictions",                                model: "flux-dev",                type: "image", apiFormat: "replicate" },
  { label: "Leonardo AI",   apiUrl: "https://cloud.leonardo.ai/api/rest/v1/generations",                       model: "phoenix",                 type: "image", apiFormat: "leonardo"  },
  { label: "Getimg.ai",     apiUrl: "https://api.getimg.ai/v1/stable-diffusion/text-to-image",                 model: "flux-dev",                type: "image", apiFormat: "getimg"    },
];



const C = {
  bg:       "#09090971",              
  surface:  "#191817",              
  surfaceHigh: "#0f1010",            // elevated surface (active states)
  border:   "rgba(240, 233, 233, 0)",
  border2:  "rgba(255,255,255,0.10)",
  text:     "#eeecea",               // warm off-white
  muted:    "rgba(240, 231, 231, 0.87)",
  dim:      "rgba(255, 255, 255, 0.92)",
  userBg:   "rgba(92, 87, 87, 0.3)",
  inputBg:  "#0f0f0e",
  sendBtn:  "#454340",               // off-white send button
  sendIcon: "#e9e3dd",               // dark icon on send button
};

// ─── Supabase helpers ─────────────────────────────────────────────────────────

async function fetchModels(userId: string): Promise<CustomModel[]> {
  const { data, error } = await supabase
    .from("custom_models").select("*").eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CustomModel[];
}

async function insertModel(
  userId: string,
  fields: Omit<CustomModel, "id" | "user_id" | "created_at">,
): Promise<CustomModel> {
  const { data, error } = await supabase
    .from("custom_models").insert({ ...fields, user_id: userId }).select().single();
  if (error) throw error;
  return data as CustomModel;
}

async function deleteModel(id: string): Promise<void> {
  await supabase.from("custom_models").delete().eq("id", id);
}

async function updateModel(
  id: string,
  fields: Omit<CustomModel, "id" | "user_id" | "created_at">,
): Promise<CustomModel> {
  const { data, error } = await supabase
    .from("custom_models").update(fields).eq("id", id).select().single();
  if (error) throw error;
  return data as CustomModel;
}

async function loadSession(
  userId: string,
  botId: string,
): Promise<{ messages: Message[]; history: History[] } | null> {
  const { data, error } = await supabase
    .from("chat_sessions").select("messages")
    .eq("user_id", userId).eq("bot_id", botId)
    .order("updated_at", { ascending: false }).limit(1).single();
  if (error || !data) return null;
  const stored = data.messages as any[];
  if (!stored?.length) return null;
  const messages: Message[] = stored.map((m: any, i: number) => ({
    id: `s-${i}`,
    role: m.role === "user" ? "user" : "assistant",
    text: m.content || m.text || "",
    imageUrl: m.image_url || undefined,
    videoUrl: m.video_url || undefined,
  }));
  return { messages, history: messages.map(m => ({ role: m.role, content: m.text })) };
}

async function saveSession(
  userId: string, botId: string, messages: Message[], _history: History[],
): Promise<void> {
  const stored = messages.map(m => ({
    role: m.role, content: m.text,
    image_url: m.imageUrl || null, video_url: m.videoUrl || null,
  }));
  const { data: existing } = await supabase
    .from("chat_sessions").select("id")
    .eq("user_id", userId).eq("bot_id", botId)
    .order("updated_at", { ascending: false }).limit(1).single();
  if (existing) {
    await supabase.from("chat_sessions").update({ messages: stored }).eq("id", existing.id);
  } else {
    await supabase.from("chat_sessions").insert({ user_id: userId, bot_id: botId, messages: stored });
  }
}

async function clearSession(userId: string, botId: string): Promise<void> {
  await supabase.from("chat_sessions").delete()
    .eq("user_id", userId).eq("bot_id", botId);
}

const localCache: Record<string, { messages: Message[]; history: History[] }> = {};

function initCache(model: CustomModel) {
  if (!localCache[model.id]) {
    const greeting =
      model.type === "image" ? "Describe what you'd like me to generate."
      : model.type === "video" ? "Describe the video you want me to create."
      : "How can I help you today?";
    localCache[model.id] = {
      messages: [{ id: "0", role: "assistant", text: greeting }],
      history: model.system_prompt ? [{ role: "system", content: model.system_prompt }] : [],
    };
  }
  return localCache[model.id];
}

// ─── Blinking cursor ──────────────────────────────────────────────────────────

function BlinkCursor() {
  const op = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(op, { toValue: 0, duration: 550, useNativeDriver: true }),
        Animated.timing(op, { toValue: 1, duration: 550, useNativeDriver: true }),
      ]),
    ).start();
  }, [op]);
  return (
    <Animated.Text style={{ color: C.muted, fontSize: 15, lineHeight: 24, opacity: op }}>
      {" ▍"}
    </Animated.Text>
  );
}

// ─── Message row ──────────────────────────────────────────────────────────────

type MsgProps = { item: Message; isStreaming: boolean; modelInitial: string };

function MessageRow({ item, isStreaming, modelInitial }: MsgProps) {
  const isUser = item.role === "user";

  if (isUser) {
    return (
      <View style={row.userWrap}>
        <View style={row.userBubble}>
          <Text style={row.userText} selectable>{item.text}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={row.asstWrap}>
      {/* Avatar */}
      <View style={row.avatar}>
        <Text style={row.avatarLetter}>{modelInitial}</Text>
      </View>

      <View style={row.asstBody}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={row.image} resizeMode="cover" />
        ) : item.videoUrl ? (
          <View style={row.videoCard}>
            <Ionicons name="play-circle-outline" size={22} color={C.muted} />
            <Text style={row.videoLabel}>Video ready</Text>
          </View>
        ) : (
          <Text style={row.asstText} selectable>
            {item.text}
            {isStreaming ? <BlinkCursor /> : null}
          </Text>
        )}
      </View>
    </View>
  );
}

// ─── Add / Edit model sheet ───────────────────────────────────────────────────

function AddModelSheet({
  initialModel, onSave, onClose,
}: {
  initialModel?: CustomModel;
  onSave: (fields: Omit<CustomModel, "id" | "user_id" | "created_at">) => Promise<void>;
  onClose: () => void;
}) {
  const isEditing = !!initialModel;
  const [name, setName]                     = useState(initialModel?.name ?? "");
  const [apiKey, setApiKey]                 = useState(initialModel?.api_key ?? "");
  const [apiUrl, setApiUrl]                 = useState(initialModel?.api_url ?? "");
  const [model, setModel]                   = useState(initialModel?.model ?? "");
  const [type, setType]                     = useState<ModelType>(initialModel?.type ?? "text");
  const [apiFormat, setApiFormat]           = useState<ApiFormat>(initialModel?.api_format ?? "openai");
  const [imageFormat, setImageFormat]       = useState<ImageFormat>(initialModel?.image_format ?? "url");
  const [videoFormat, setVideoFormat]       = useState<VideoFormat>(initialModel?.video_format ?? "fal");
  const [systemPrompt, setSystemPrompt]     = useState(initialModel?.system_prompt ?? "");
  const [supportsVision, setSupportsVision] = useState(initialModel?.supports_vision ?? false);
  const [showSys, setShowSys]               = useState(!!(initialModel?.system_prompt));
  const [keyVisible, setKeyVisible]         = useState(false);
  const [saving, setSaving]                 = useState(false);

  const applyPreset = (p: typeof PRESETS[0]) => {
    setApiUrl(p.apiUrl); setModel(p.model); setType(p.type); setApiFormat(p.apiFormat);
    if (p.imageFormat) setImageFormat(p.imageFormat);
    if (p.videoFormat) setVideoFormat(p.videoFormat);
    if (!name) setName(p.label);
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert("Name required", "Give this model a name."); return; }
    const isPoll = type === "image" && imageFormat === "pollinations";
    if (!isPoll && !apiKey.trim()) { Alert.alert("API key required", "Enter your API key."); return; }
    if (!isPoll && !apiUrl.trim()) { Alert.alert("Endpoint required", "Enter the API endpoint URL."); return; }
    setSaving(true);
    try {
      await onSave({
        name: name.trim(), api_key: isPoll ? "" : apiKey.trim(),
        api_url: isPoll ? "" : apiUrl.trim(), model: model.trim(), type,
        api_format: apiFormat, image_format: type === "image" ? imageFormat : null,
        video_format: type === "video" ? videoFormat : null,
        system_prompt: systemPrompt.trim(),
        supports_vision: type === "text" ? supportsVision : false,
      });
      onClose();
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to save.");
    } finally { setSaving(false); }
  };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={sh.root}>
        <View style={sh.handle} />
        <View style={sh.header}>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={sh.cancel}>Cancel</Text>
          </Pressable>
          <Text style={sh.title}>{isEditing ? "Edit model" : "Add model"}</Text>
          <Pressable onPress={handleSave} disabled={saving} hitSlop={12}>
            <Text style={[sh.done, saving && { opacity: 0.3 }]}>
              {saving ? "Saving…" : isEditing ? "Save" : "Add"}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={sh.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Quick fill */}
          <Text style={sh.sectionLabel}>QUICK FILL</Text>
          <ScrollView
            horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 6, paddingBottom: 22 }}
          >
            {PRESETS.map(p => (
              <Pressable key={p.label} style={sh.chip} onPress={() => applyPreset(p)}>
                <Text style={sh.chipText}>{p.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Name */}
          <Text style={sh.sectionLabel}>NAME</Text>
          <View style={sh.group}>
            <TextInput
              style={sh.input} placeholder="My GPT-4o"
              placeholderTextColor={C.dim} value={name} onChangeText={setName}
            />
          </View>

          {/* API Key */}
          {!(type === "image" && imageFormat === "pollinations") && (
            <>
              <Text style={sh.sectionLabel}>API KEY</Text>
              <View style={sh.group}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TextInput
                    style={[sh.input, { flex: 1, borderWidth: 0 }]}
                    placeholder="sk-…" placeholderTextColor={C.dim}
                    value={apiKey} onChangeText={setApiKey}
                    secureTextEntry={!keyVisible} autoCapitalize="none" autoCorrect={false}
                  />
                  <Pressable onPress={() => setKeyVisible(v => !v)} hitSlop={12} style={{ paddingRight: 14 }}>
                    <Ionicons name={keyVisible ? "eye-off-outline" : "eye-outline"} size={17} color={C.dim} />
                  </Pressable>
                </View>
              </View>
            </>
          )}

          {/* Endpoint & model */}
          <Text style={sh.sectionLabel}>ENDPOINT & MODEL</Text>
          <View style={sh.group}>
            <TextInput
              style={[sh.input, sh.inputDivider]}
              placeholder="https://api.openai.com/v1/chat/completions"
              placeholderTextColor={C.dim} value={apiUrl} onChangeText={setApiUrl}
              autoCapitalize="none" autoCorrect={false} keyboardType="url"
            />
            <TextInput
              style={sh.input} placeholder="gpt-4o"
              placeholderTextColor={C.dim} value={model} onChangeText={setModel}
              autoCapitalize="none" autoCorrect={false}
            />
          </View>

          {/* Type */}
          <Text style={sh.sectionLabel}>TYPE</Text>
          <View style={sh.group}>
            <View style={sh.segRow}>
              {(["text", "image", "video"] as ModelType[]).map(t => (
                <Pressable
                  key={t} style={[sh.seg, type === t && sh.segActive]}
                  onPress={() => setType(t)}
                >
                  <Text style={[sh.segText, type === t && sh.segTextActive]}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Text-specific */}
          {type === "text" && (
            <>
              <Text style={sh.sectionLabel}>API FORMAT</Text>
              <View style={sh.group}>
                <ScrollView
                  horizontal showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 4, paddingVertical: 6, gap: 4 }}
                >
                  {(["openai","anthropic","cohere","google","deepseek","xai","perplexity",
                    "azure","mistral","fal","replicate","stability","ideogram","bfl","leonardo",
                    "getimg","runway","luma","pika","vidu","minimax","elevenlabs","cartesia",
                    "playht","murf","voyage","jina","ollama","huggingface"] as ApiFormat[]).map(f => (
                    <Pressable
                      key={f}
                      style={[sh.fmtChip, apiFormat === f && sh.fmtChipActive]}
                      onPress={() => setApiFormat(f)}
                    >
                      <Text style={[sh.fmtText, apiFormat === f && sh.fmtTextActive]}>{f}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              <Text style={sh.sectionLabel}>OPTIONS</Text>
              <View style={sh.group}>
                <View style={sh.toggleRow}>
                  <Text style={sh.toggleLabel}>Supports image input (vision)</Text>
                  <Switch
                    value={supportsVision} onValueChange={setSupportsVision}
                    trackColor={{ false: "rgba(255,255,255,0.10)", true: "rgba(255,255,255,0.55)" }}
                    thumbColor={supportsVision ? C.text : "rgba(255,255,255,0.4)"}
                  />
                </View>
              </View>
            </>
          )}

          {/* Image-specific */}
          {type === "image" && (
            <>
              <Text style={sh.sectionLabel}>IMAGE FORMAT</Text>
              <View style={sh.group}>
                <View style={sh.segRow}>
                  {([["url", "Direct URL"], ["pollinations", "Pollinations"]] as [ImageFormat, string][]).map(([f, label]) => (
                    <Pressable key={f} style={[sh.seg, imageFormat === f && sh.segActive]} onPress={() => setImageFormat(f)}>
                      <Text style={[sh.segText, imageFormat === f && sh.segTextActive]}>{label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* Video-specific */}
          {type === "video" && (
            <>
              <Text style={sh.sectionLabel}>VIDEO FORMAT</Text>
              <View style={sh.group}>
                <View style={sh.segRow}>
                  {([["fal", "fal.ai (queue)"], ["direct", "Direct URL"]] as [VideoFormat, string][]).map(([f, label]) => (
                    <Pressable key={f} style={[sh.seg, videoFormat === f && sh.segActive]} onPress={() => setVideoFormat(f)}>
                      <Text style={[sh.segText, videoFormat === f && sh.segTextActive]}>{label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* System prompt */}
          {type === "text" && (
            <>
              <Pressable
                style={sh.collapsRow}
                onPress={() => setShowSys(v => !v)}
              >
                <Text style={sh.sectionLabel}>SYSTEM PROMPT</Text>
                <Ionicons name={showSys ? "chevron-up" : "chevron-down"} size={13} color={C.dim} />
              </Pressable>
              {showSys && (
                <View style={sh.group}>
                  <TextInput
                    style={[sh.input, { minHeight: 90, paddingTop: 14, textAlignVertical: "top" }]}
                    placeholder="You are a helpful assistant."
                    placeholderTextColor={C.dim}
                    value={systemPrompt} onChangeText={setSystemPrompt}
                    multiline
                  />
                </View>
              )}
            </>
          )}

          <View style={{ height: 56 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function Explore() {
  const insets = useSafeAreaInsets();

  const [userId, setUserId]               = useState<string | null>(null);
  const [models, setModels]               = useState<CustomModel[]>([]);
  const [activeId, setActiveId]           = useState<string | null>(null);
  const [messages, setMessages]           = useState<Message[]>([]);
  const [input, setInput]                 = useState("");
  const [loading, setLoading]             = useState(false);
  const [streamingId, setStreamingId]     = useState<string | null>(null);
  const [addOpen, setAddOpen]             = useState(false);
  const [editingModel, setEditingModel]   = useState<CustomModel | null>(null);
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [loadingModels, setLoadingModels] = useState(true);

  const historyRef   = useRef<History[]>([]);
  const messagesRef  = useRef<Message[]>([]);
  const listRef      = useRef<FlatList<Message>>(null);
  const abortRef     = useRef<AbortController | null>(null);
  const sidebarAnim  = useRef(new Animated.Value(0)).current;
  const streamBuf    = useRef<string>("");
  const rafRef       = useRef<number | null>(null);

  const activeModel = useMemo(
    () => models.find(m => m.id === activeId) ?? null,
    [models, activeId],
  );

  // Sidebar spring
  useEffect(() => {
    Animated.spring(sidebarAnim, {
      toValue: sidebarOpen ? 1 : 0,
      useNativeDriver: true,
      tension: 80, friction: 14,
    }).start();
  }, [sidebarOpen, sidebarAnim]);

  // Auth init
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const user = await getCurrentUser();
      if (!mounted) return;
      if (user) {
        setUserId(user.id);
        try {
          const list = await fetchModels(user.id);
          if (mounted) {
            setModels(list);
            if (list.length > 0) switchToModel(list[0], user.id);
          }
        } catch { /* silent */ }
        finally { if (mounted) setLoadingModels(false); }
      } else {
        if (mounted) { setUserId(null); setModels([]); setLoadingModels(false); }
      }
    };
    init();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUserId(session.user.id);
        const list = await fetchModels(session.user.id);
        if (mounted) {
          setModels(list);
          if (list.length > 0 && !activeId) switchToModel(list[0], session.user.id);
        }
      } else {
        setUserId(null); setModels([]); setActiveId(null);
      }
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // RAF-batched flush for streaming
  const scheduleFlush = useCallback((msgId: string) => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const t = streamBuf.current;
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, text: t } : m));
    });
  }, []);

  const flushFinal = useCallback((msgId: string) => {
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    const t = streamBuf.current;
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, text: t } : m));
  }, []);

  const switchToModel = useCallback(async (model: CustomModel, uid?: string) => {
    abortRef.current?.abort();
    const id = uid ?? userId;
    setActiveId(model.id); setInput(""); setLoading(false);
    setStreamingId(null); setSidebarOpen(false);
    if (id) {
      const session = await loadSession(id, model.id);
      if (session) { historyRef.current = session.history; setMessages(session.messages); return; }
    }
    const cache = initCache(model);
    historyRef.current = [...cache.history];
    setMessages([...cache.messages]);
  }, [userId]);

  const handleAddModel = useCallback(async (fields: Omit<CustomModel, "id" | "user_id" | "created_at">) => {
    if (!userId) throw new Error("You must be logged in.");
    const created = await insertModel(userId, fields);
    setModels(prev => [...prev, created]);
    switchToModel(created);
  }, [userId, switchToModel]);

  const handleEditModel = useCallback(async (fields: Omit<CustomModel, "id" | "user_id" | "created_at">) => {
    if (!editingModel) return;
    const updated = await updateModel(editingModel.id, fields);
    setModels(prev => prev.map(m => m.id === updated.id ? updated : m));
    setEditingModel(null);
  }, [editingModel]);

  const handleDeleteModel = useCallback((model: CustomModel) => {
    Alert.alert(`Remove "${model.name}"?`, "This will also delete its chat history.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove", style: "destructive", onPress: async () => {
          await deleteModel(model.id);
          if (userId) await clearSession(userId, model.id).catch(() => {});
          const updated = models.filter(m => m.id !== model.id);
          setModels(updated);
          if (activeId === model.id) {
            if (updated.length > 0) switchToModel(updated[0]);
            else { setActiveId(null); setMessages([]); historyRef.current = []; }
          }
        },
      },
    ]);
  }, [models, activeId, userId, switchToModel]);

  const resetChat = useCallback(async () => {
    if (!activeModel) return;
    abortRef.current?.abort();
    const greeting =
      activeModel.type === "image" ? "Describe what you'd like me to generate."
      : activeModel.type === "video" ? "Describe the video you want me to create."
      : "How can I help you today?";
    historyRef.current = activeModel.system_prompt
      ? [{ role: "system", content: activeModel.system_prompt }] : [];
    setMessages([{ id: "0", role: "assistant", text: greeting }]);
    setLoading(false); setStreamingId(null);
    if (userId) await clearSession(userId, activeModel.id).catch(() => {});
  }, [activeModel, userId]);

  const persist = useCallback(() => {
    if (!activeModel || !userId) return;
    localCache[activeModel.id] = { messages: messagesRef.current, history: historyRef.current };
    // Defer DB write to avoid blocking the UI frame
    setTimeout(() => {
      saveSession(userId, activeModel.id, messagesRef.current, historyRef.current).catch(() => {});
    }, 0);
  }, [activeModel, userId]);

  // ── Streaming ─────────────────────────────────────────────────────────────

  const sendText = useCallback(async (prompt: string, botMsgId: string, model: CustomModel) => {
    if (!model.api_url?.trim()) throw new Error("No endpoint URL configured.");
    if (!model.api_key?.trim()) throw new Error("No API key configured.");
    historyRef.current.push({ role: "user", content: prompt });
    abortRef.current = new AbortController();
    streamBuf.current = "";

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    let body: any;

    if (model.api_format === "anthropic") {
      headers["x-api-key"] = model.api_key;
      headers["anthropic-version"] = "2023-06-01";
      body = {
        model: model.model, max_tokens: 2048,
        messages: historyRef.current.filter(h => h.role !== "system"),
        stream: true,
      };
      const sys = historyRef.current.find(h => h.role === "system");
      if (sys) body.system = sys.content;
    } else {
      headers["Authorization"] = `Bearer ${model.api_key}`;
      body = { model: model.model, messages: historyRef.current, stream: true, max_tokens: 2048 };
    }

    const res = await fetch(model.api_url, {
      method: "POST", signal: abortRef.current.signal,
      headers, body: JSON.stringify(body),
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.error?.message ?? `HTTP ${res.status}`);
    }

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let remainder = "";

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = remainder + decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        remainder = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") break;
          try {
            const parsed = JSON.parse(payload);
            const delta =
              model.api_format === "anthropic"
                ? parsed?.delta?.text
                : parsed?.choices?.[0]?.delta?.content;
            if (delta) { streamBuf.current += delta; scheduleFlush(botMsgId); }
          } catch { /* malformed chunk */ }
        }
      }
    }

    flushFinal(botMsgId);
    const fullReply = streamBuf.current;
    if (!fullReply) throw new Error("Empty reply.");
    historyRef.current.push({ role: "assistant", content: fullReply });
  }, [scheduleFlush, flushFinal]);

  const sendImage = useCallback(async (prompt: string, botMsgId: string, model: CustomModel) => {
    if (model.image_format === "pollinations") {
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=${model.model}&width=1024&height=1024&seed=${Date.now()}&nologo=true`;
      setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: "", imageUrl } : m));
      return;
    }
    if (!model.api_url?.trim()) throw new Error("No endpoint URL configured.");
    if (!model.api_key?.trim()) throw new Error("No API key configured.");
    const res = await fetch(model.api_url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${model.api_key}` },
      body: JSON.stringify({ model: model.model, prompt, n: 1, size: "1024x1024" }),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error?.message ?? `HTTP ${res.status}`); }
    const data = await res.json();
    const imageUrl = data?.data?.[0]?.url;
    if (!imageUrl) throw new Error("No image returned.");
    setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: "", imageUrl } : m));
  }, []);

  const sendVideo = useCallback(async (prompt: string, botMsgId: string, model: CustomModel) => {
    if (!model.api_url?.trim()) throw new Error("No endpoint URL configured.");
    if (!model.api_key?.trim()) throw new Error("No API key configured.");
    setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: "Starting generation…" } : m));

    if (model.video_format === "fal") {
      const sub = await fetch(model.api_url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Key ${model.api_key}` },
        body: JSON.stringify({ prompt }),
      });
      if (!sub.ok) { const e = await sub.json().catch(() => ({})); throw new Error(e.detail ?? `HTTP ${sub.status}`); }
      const { request_id: reqId } = await sub.json();
      if (!reqId) throw new Error("No request ID.");
      const pollUrl = `${model.api_url}/requests/${reqId}`;
      for (let i = 0; i < 120; i++) {
        await new Promise(r => setTimeout(r, 3000));
        const poll = await fetch(pollUrl, { headers: { Authorization: `Key ${model.api_key}` } });
        if (!poll.ok) continue;
        const pd = await poll.json();
        if (pd.status === "COMPLETED") {
          const videoUrl = pd.video?.url || pd.output?.video_url || pd.output?.video?.url || null;
          if (!videoUrl) throw new Error("No video URL in response.");
          setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: "", videoUrl } : m));
          return;
        }
        if (pd.status === "FAILED") throw new Error(pd.error ?? "Generation failed.");
        setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: `Generating… ${(i + 1) * 3}s` } : m));
      }
      throw new Error("Timed out waiting for video.");
    }

    const res = await fetch(model.api_url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${model.api_key}` },
      body: JSON.stringify({ model: model.model, prompt }),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error?.message ?? `HTTP ${res.status}`); }
    const data = await res.json();
    const videoUrl = data?.video_url || data?.data?.[0]?.url;
    if (!videoUrl) throw new Error("No video returned.");
    setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: "", videoUrl } : m));
  }, []);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading || !activeModel) return;
    const prompt = input.trim();
    const botMsgId = `${Date.now()}-b`;
    setMessages(prev => [
      ...prev,
      { id: `${Date.now()}-u`, role: "user", text: prompt },
      { id: botMsgId, role: "assistant", text: "" },
    ]);
    setInput(""); setLoading(true); setStreamingId(botMsgId);
    try {
      if (activeModel.type === "video") await sendVideo(prompt, botMsgId, activeModel);
      else if (activeModel.type === "image") await sendImage(prompt, botMsgId, activeModel);
      else await sendText(prompt, botMsgId, activeModel);
      persist();
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setMessages(prev => prev.map(m => m.id === botMsgId
        ? { ...m, text: err instanceof Error ? err.message : "Something went wrong." }
        : m,
      ));
    } finally {
      setLoading(false); setStreamingId(null);
    }
  }, [input, loading, activeModel, sendText, sendImage, sendVideo, persist]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const sideTranslate = sidebarAnim.interpolate({ inputRange: [0, 1], outputRange: [-276, 0] });
  const scrimOpacity  = sidebarAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  const modelInitial = activeModel ? activeModel.name.charAt(0).toUpperCase() : "A";

  const renderItem = useCallback(({ item }: { item: Message }) => (
    <MessageRow
      item={item}
      isStreaming={streamingId === item.id}
      modelInitial={modelInitial}
    />
  ), [streamingId, modelInitial]);

  const keyExtractor = useCallback((item: Message) => item.id, []);

  const inputPlaceholder =
    activeModel?.type === "video" ? "Describe a video…"
    : activeModel?.type === "image" ? "Describe an image…"
    : "Message";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <ImageBackground source = {require("../../assets/images/bgexplore.jpg")} style= {{flex:1}}>
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <Animated.View
          pointerEvents="box-none"
          style={[StyleSheet.absoluteFill, { zIndex: 50 }]}
        >
          {/* Scrim */}
          <Animated.View
            pointerEvents="auto"
            style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.6)", opacity: scrimOpacity }]}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setSidebarOpen(false)} />
          </Animated.View>

          {/* Panel */}
          <Animated.View
            style={[
              side.panel,
              { transform: [{ translateX: sideTranslate }], paddingTop: insets.top + 20 },
            ]}
          >
            <View style={side.header}>
              <Text style={side.title}>Models</Text>
              <Pressable
                style={side.addBtn}
                hitSlop={8}
                onPress={() => {
                  if (!userId) { Alert.alert("Sign in required", "Log in to save models."); return; }
                  setSidebarOpen(false);
                  setAddOpen(true);
                }}
              >
                <Ionicons name="add" size={18} color={C.text} />
              </Pressable>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 8, paddingBottom: 40 }}
            >
              {models.map(m => {
                const isActive = m.id === activeId;
                return (
                  <Pressable
                    key={m.id}
                    style={[side.item, isActive && side.itemActive]}
                    onPress={() => switchToModel(m)}
                    onLongPress={() => {
                      Alert.alert(m.name, undefined, [
                        { text: "Edit", onPress: () => { setEditingModel(m); setAddOpen(true); setSidebarOpen(false); } },
                        { text: "Delete", style: "destructive", onPress: () => handleDeleteModel(m) },
                        { text: "Cancel", style: "cancel" },
                      ]);
                    }}
                    delayLongPress={500}
                  >
                    <View style={[side.itemInitial, isActive && side.itemInitialActive]}>
                      <Text style={[side.itemInitialText, isActive && side.itemInitialTextActive]}>
                        {m.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[side.itemName, isActive && side.itemNameActive]} numberOfLines={1}>
                        {m.name}
                      </Text>
                      <Text style={side.itemSub} numberOfLines={1}>
                        {m.model || m.api_format}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}

              {models.length === 0 && !loadingModels && (
                <View style={{ alignItems: "center", paddingTop: 48, gap: 8 }}>
                  <Text style={{ color: C.dim, fontSize: 13 }}>No models yet</Text>
                </View>
              )}
            </ScrollView>
          </Animated.View>
        </Animated.View>
      )}

      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        {/* Top bar */}
        <View style={topbar.root}>
          <Pressable style={topbar.iconBtn} onPress={() => setSidebarOpen(true)} hitSlop={8}>
            <Ionicons name="menu-outline" size={21} color={C.muted} />
          </Pressable>

          <Pressable style={topbar.center} onPress={() => setSidebarOpen(true)}>
            <Text style={topbar.modelName} numberOfLines={1}>
              {activeModel ? activeModel.name : "Select a model"}
            </Text>
            <Ionicons name="chevron-down" size={12} color={C.dim} style={{ marginTop: 1 }} />
          </Pressable>

          <Pressable
            style={[topbar.iconBtn, !activeModel && { opacity: 0 }]}
            onPress={resetChat}
            disabled={!activeModel}
            hitSlop={8}
          >
            <Ionicons name="trash-outline" size={20} color={C.muted} />
          </Pressable>
        </View>

        {/* Empty state */}
        {!loadingModels && models.length === 0 && (
          <View style={empty.root}>
            <Text style={empty.title}>No models connected</Text>
            <Text style={empty.sub}>
              Add any model using your own API key.{"\n"}
              OpenAI, Anthropic, Groq, Ollama, and more.
            </Text>
            <Pressable
              style={empty.btn}
              onPress={() => { if (!userId) { Alert.alert("Sign in required"); return; } setAddOpen(true); }}
            >
              <Text style={empty.btnText}>Add a model</Text>
            </Pressable>
          </View>
        )}

        {/* Chat */}
        {activeModel && (
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 16}
          >
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              contentContainerStyle={chat.list}
              onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
              onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
              keyboardShouldPersistTaps="handled"
              removeClippedSubviews={Platform.OS === "android"}
              maxToRenderPerBatch={8}
              windowSize={10}
              initialNumToRender={14}
              showsVerticalScrollIndicator={false}
            />

            {/* Input bar */}
            <View style={[inputbar.wrap, { paddingBottom: Math.max(insets.bottom, 14) }]}>
              <View style={inputbar.row}>
                <TextInput
                  value={input}
                  onChangeText={setInput}
                  placeholder={inputPlaceholder}
                  placeholderTextColor={C.dim}
                  style={inputbar.field}
                  onSubmitEditing={sendMessage}
                  returnKeyType="send"
                  multiline
                  selectionColor={C.muted}
                  maxFontSizeMultiplier={1.2}
                  blurOnSubmit={false}
                />
                <Pressable
                  style={({ pressed }) => [inputbar.sendBtn, loading && inputbar.sendBtnStop, pressed && { opacity: 0.7 }]}
                  onPress={loading ? () => abortRef.current?.abort() : sendMessage}
                >
                  {loading ? (
                    <View style={inputbar.stopSquare} />
                  ) : (
                    <Ionicons
                      name={
                        activeModel.type === "video" ? "arrow-up"
                        : activeModel.type === "image" ? "arrow-up"
                        : "arrow-up"
                      }
                      size={15}
                      color={input.trim() ? C.sendIcon : C.muted}
                    />
                  )}
                </Pressable>
              </View>
              <Text style={inputbar.hint} numberOfLines={1}>
                {activeModel.model || activeModel.api_format} · {activeModel.name}
              </Text>
            </View>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>

      {addOpen && (
        <AddModelSheet
          initialModel={editingModel ?? undefined}
          onSave={editingModel ? handleEditModel : handleAddModel}
          onClose={() => { setAddOpen(false); setEditingModel(null); }}
        />
      )}
    </View>
    </ImageBackground>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const topbar = StyleSheet.create({
  root: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 8, paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  iconBtn: {
    width: 38, height: 38, borderRadius: 8,
    alignItems: "center", justifyContent: "center",
  },
  center: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 5,
  },
  modelName: {
    color: C.text, fontSize: 15, fontWeight: "600",
    letterSpacing: -0.2, maxWidth: 200,
  },
});

const side = StyleSheet.create({
  panel: {
    position: "absolute", left: 0, top: 0, bottom: 0, width: 276,
    backgroundColor: C.surface,
    borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: C.border2,
    zIndex: 51,
  },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 18, paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border,
  },
  title: { color: C.text, fontSize: 16, fontWeight: "700", letterSpacing: -0.3 },
  addBtn: {
    width: 28, height: 28, borderRadius: 7,
    backgroundColor: C.surfaceHigh,
    alignItems: "center", justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth, borderColor: C.border2,
  },
  item: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    marginHorizontal: 6, borderRadius: 9,
  },
  itemActive: { backgroundColor: C.surfaceHigh },
  itemInitial: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: C.surfaceHigh,
    alignItems: "center", justifyContent: "center",
  },
  itemInitialActive: { backgroundColor: "rgba(255,255,255,0.12)" },
  itemInitialText: { color: C.dim, fontSize: 12, fontWeight: "700" },
  itemInitialTextActive: { color: C.text },
  itemName: { color: C.muted, fontSize: 14, fontWeight: "500" },
  itemNameActive: { color: C.text, fontWeight: "600" },
  itemSub: { color: C.dim, fontSize: 11, marginTop: 1 },
});

const row = StyleSheet.create({
  userWrap: {
    flexDirection: "row", justifyContent: "flex-end",
    paddingHorizontal: 16, marginVertical: 3,
  },
  userBubble: {
    maxWidth: "76%",
    backgroundColor: C.userBg,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 18, borderBottomRightRadius: 4,
    borderWidth: StyleSheet.hairlineWidth, borderColor: C.border2,
  },
  userText: { color: C.text, fontSize: 15, lineHeight: 22 },

  asstWrap: {
    flexDirection: "row", alignItems: "flex-start",
    paddingHorizontal: 14, paddingVertical: 6, gap: 10,
  },
  avatar: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: C.surfaceHigh,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0, marginTop: 3,
  },
  avatarLetter: { color: C.muted, fontSize: 11, fontWeight: "700" },

  asstBody: { flex: 1, paddingTop: 2 },
  asstText: { color: "rgba(255,255,255,0.86)", fontSize: 15, lineHeight: 24 },

  image: { width: 256, height: 256, borderRadius: 12 },
  videoCard: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: C.surfaceHigh, borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth, borderColor: C.border2,
    alignSelf: "flex-start",
  },
  videoLabel: { color: C.muted, fontSize: 14 },
});

const chat = StyleSheet.create({
  list: { paddingVertical: 16, flexGrow: 1 },
});

const inputbar = StyleSheet.create({
  wrap: {
    paddingHorizontal: 12, paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.border,
    backgroundColor: C.bg,
    gap: 7,
  },
  row: {
    flexDirection: "row", alignItems: "flex-end", gap: 8,
    backgroundColor: C.inputBg,
    borderRadius: 24,
    paddingLeft: 16, paddingRight: 6, paddingTop: 8, paddingBottom: 8,
    borderWidth: StyleSheet.hairlineWidth, borderColor: C.border2,
  },
  field: {
    flex: 1, color: C.text, fontSize: 15, lineHeight: 22,
    maxHeight: 120, paddingTop: 2, paddingBottom: 2,
  },
  sendBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: C.sendBtn,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  sendBtnStop: {
    backgroundColor: C.surfaceHigh,
    borderWidth: StyleSheet.hairlineWidth, borderColor: C.border2,
  },
  stopSquare: {
    width: 9, height: 9, borderRadius: 2,
    backgroundColor: C.muted,
  },
  hint: {
    color: C.dim, fontSize: 11,
    textAlign: "center", letterSpacing: 0.1,
  },
});

const empty = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 44, gap: 10 },
  title: { color: C.text, fontSize: 19, fontWeight: "700", letterSpacing: -0.3 },
  sub: { color: C.muted, fontSize: 14, textAlign: "center", lineHeight: 22 },
  btn: {
    marginTop: 10,
    paddingHorizontal: 22, paddingVertical: 11,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth, borderColor: C.border2,
    backgroundColor: C.surfaceHigh,
  },
  btnText: { color: C.text, fontSize: 14, fontWeight: "600" },
});

const sh = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  handle: {
    width: 34, height: 3.5, borderRadius: 2,
    backgroundColor: "rgba(233, 224, 224, 0.12)",
    alignSelf: "center", marginTop: 10, marginBottom: 6,
  },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border,
  },
  title: { color: C.text, fontSize: 16, fontWeight: "600" },
  cancel: { color: C.muted, fontSize: 15, minWidth: 56 },
  done: { color: C.text, fontSize: 15, fontWeight: "600", minWidth: 56, textAlign: "right" },
  body: { paddingHorizontal: 20, paddingTop: 24 },
  sectionLabel: {
    color: C.dim, fontSize: 11, fontWeight: "600",
    letterSpacing: 0.7, marginBottom: 8, marginLeft: 2,
  },
  chip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8,
    backgroundColor: C.surfaceHigh,
    borderWidth: StyleSheet.hairlineWidth, borderColor: C.border2,
  },
  chipText: { color: C.muted, fontSize: 13, fontWeight: "500" },
  group: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth, borderColor: C.border,
    overflow: "hidden", marginBottom: 20,
  },
  input: { color: C.text, fontSize: 15, paddingHorizontal: 16, paddingVertical: 10 },
  inputDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border },
  segRow: { flexDirection: "row", padding: 4, gap: 4 },
  seg: { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: "center" },
  segActive: { backgroundColor: C.surfaceHigh },
  segText: { color: C.dim, fontSize: 13, fontWeight: "500" },
  segTextActive: { color: C.text, fontSize: 13, fontWeight: "600" },
  fmtChip: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 7, flexShrink: 0,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: StyleSheet.hairlineWidth, borderColor: C.border,
  },
  fmtChipActive: { backgroundColor: C.surfaceHigh },
  fmtText: { color: C.dim, fontSize: 12, fontWeight: "500" },
  fmtTextActive: { color: C.text, fontSize: 12, fontWeight: "600" },
  toggleRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 13,
  },
  toggleLabel: { color: C.text, fontSize: 15, flex: 1 },
  collapsRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: 12, paddingRight: 4,
  },
});
