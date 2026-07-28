import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../utils/supabase";
import { getCurrentUser } from "../utils/auth";

type ModelType = "text" | "image" | "video";
type VideoFormat = "fal" | "direct";
type ImageFormat = "pollinations" | "url";

type ApiFormat =
  // Chat / Text
  | "openai"          // OpenAI-compatible APIs
  | "anthropic"       // Claude Messages API
  | "google"          // Gemini native API
  | "cohere"          // Cohere Command models
  | "mistral"         // Mistral native API
  | "deepseek"        // DeepSeek native API
  | "xai"             // Grok API
  | "perplexity"      // Perplexity API
  | "azure"           // Azure OpenAI
  // Image
  | "stability"       // Stability AI
  | "replicate"       // Replicate models
  | "fal"             // fal.ai models
  | "ideogram"        // Ideogram
  | "bfl"             // Black Forest Labs Flux
  | "leonardo"        // Leonardo AI
  | "getimg"          // Getimg.ai
  | "segmind"         // Segmind
  // Video
  | "runway"          // Runway
  | "luma"            // Luma Dream Machine
  | "pika"            // Pika
  | "haiper"         // Haiper
  | "pixverse"       // PixVerse
  | "vidu"            // Vidu
  | "minimax"         // MiniMax
  // Audio
  | "elevenlabs"      // ElevenLabs
  | "cartesia"        // Cartesia
  | "playht"          // PlayHT
  | "murf"            // Murf
  // Embeddings / Search
  | "voyage"          // Voyage AI
  | "jina"            // Jina AI
  // Local
  | "ollama"          // Ollama native API
  | "huggingface";    // HuggingFace native API

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

// Optimized: Batch updates for smoother streaming
const PRESETS: {
  label: string;
  apiUrl: string;
  model: string;
  type: ModelType;
  apiFormat: ApiFormat;
  imageFormat?: ImageFormat;
  videoFormat?: VideoFormat;
}[] = [
  { label: "OpenAI",       apiUrl: "https://api.openai.com/v1/chat/completions",                                 model: "gpt-4o",                  type: "text",  apiFormat: "openai"    },
  { label: "Anthropic",    apiUrl: "https://api.anthropic.com/v1/messages",                                     model: "claude-opus-4-5",         type: "text",  apiFormat: "anthropic" },
  { label: "Groq",         apiUrl: "https://api.groq.com/openai/v1/chat/completions",                          model: "llama-3.3-70b-versatile", type: "text",  apiFormat: "openai"    },
  { label: "OpenRouter",   apiUrl: "https://openrouter.ai/api/v1/chat/completions",                            model: "",                        type: "text",  apiFormat: "openai"    },
  { label: "Gemini",       apiUrl: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", model: "gemini-2.0-flash",        type: "text",  apiFormat: "openai"    },
  { label: "Mistral",      apiUrl: "https://api.mistral.ai/v1/chat/completions",                               model: "mistral-large-latest",    type: "text",  apiFormat: "openai"    },
  { label: "Ollama",       apiUrl: "http://localhost:11434/v1/chat/completions",                               model: "llama3",                  type: "text",  apiFormat: "openai"    },
  { label: "DALL·E",       apiUrl: "https://api.openai.com/v1/images/generations",                             model: "dall-e-3",                type: "image", apiFormat: "openai",   imageFormat: "url"          },
  { label: "Pollinations",   apiUrl: "",                                                                         model: "flux",                    type: "image", apiFormat: "openai",   imageFormat: "pollinations" },
  { label: "fal · Kling",    apiUrl: "https://queue.fal.run/fal-ai/kling-video/v2.1/standard/text-to-video",    model: "kling-video",             type: "video", apiFormat: "openai",   videoFormat: "fal"          },
  { label: "fal · MiniMax",  apiUrl: "https://queue.fal.run/fal-ai/minimax/video-01",                         model: "minimax-video-01",        type: "video", apiFormat: "openai",   videoFormat: "fal"          },
  { label: "Cohere",         apiUrl: "https://api.cohere.ai/v2/chat",                                         model: "command-a-03-2025",       type: "text",  apiFormat: "cohere" },
  { label: "DeepSeek",       apiUrl: "https://api.deepseek.com/chat/completions",                             model: "deepseek-chat",           type: "text",  apiFormat: "openai" },
  { label: "xAI",            apiUrl: "https://api.x.ai/v1/chat/completions",                                  model: "grok-4",                  type: "text",  apiFormat: "openai" },
  { label: "Together AI",    apiUrl: "https://api.together.xyz/v1/chat/completions",                            model: "meta-llama/Llama-3.3-70B-Instruct-Turbo", type: "text", apiFormat: "openai" },
  { label: "Fireworks AI",   apiUrl: "https://api.fireworks.ai/inference/v1/chat/completions",                   model: "accounts/fireworks/models/llama-v3p3-70b-instruct", type: "text", apiFormat: "openai" },
  { label: "Cerebras",       apiUrl: "https://api.cerebras.ai/v1/chat/completions",                            model: "llama-4-scout-17b-16e-instruct", type: "text", apiFormat: "openai" },
  { label: "SambaNova",      apiUrl: "https://api.sambanova.ai/v1/chat/completions",                             model: "Meta-Llama-3.3-70B-Instruct", type: "text", apiFormat: "openai" },
  { label: "Perplexity",     apiUrl: "https://api.perplexity.ai/chat/completions",                              model: "sonar-pro",               type: "text",  apiFormat: "openai" },
  { label: "Stability AI",   apiUrl: "https://api.stability.ai/v2beta/stable-image/generate/core",              model: "stable-image-core",       type: "image", apiFormat: "stability" },
  { label: "Ideogram",       apiUrl: "https://api.ideogram.ai/generate",                                       model: "ideogram-v3",             type: "image", apiFormat: "ideogram" },
  { label: "Black Forest",   apiUrl: "https://api.bfl.ai/v1/flux-pro",                                        model: "flux-pro",                type: "image", apiFormat: "bfl" },
  { label: "Replicate",      apiUrl: "https://api.replicate.com/v1/predictions",                                model: "flux-dev",                type: "image", apiFormat: "replicate" },
  { label: "Leonardo AI",    apiUrl: "https://cloud.leonardo.ai/api/rest/v1/generations",                       model: "phoenix",                 type: "image", apiFormat: "leonardo" },
  { label: "Getimg.ai",      apiUrl: "https://api.getimg.ai/v1/stable-diffusion/text-to-image",                 model: "flux-dev",                type: "image", apiFormat: "getimg" },
];

async function fetchModels(userId: string): Promise<CustomModel[]> {
  const { data, error } = await supabase
    .from("custom_models")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CustomModel[];
}

async function insertModel(
  userId: string,
  fields: Omit<CustomModel, "id" | "user_id" | "created_at">
): Promise<CustomModel> {
  const { data, error } = await supabase
    .from("custom_models")
    .insert({ ...fields, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data as CustomModel;
}

async function deleteModel(id: string): Promise<void> {
  await supabase.from("custom_models").delete().eq("id", id);
}

async function updateModel(
  id: string,
  fields: Omit<CustomModel, "id" | "user_id" | "created_at">
): Promise<CustomModel> {
  const { data, error } = await supabase
    .from("custom_models")
    .update(fields)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as CustomModel;
}

async function loadSession(
  userId: string,
  botId: string
): Promise<{ messages: Message[]; history: History[] } | null> {
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
  if (!stored?.length) return null;
  const messages: Message[] = stored.map((m: any, i: number) => ({
    id: `s-${i}`,
    role: m.role === "user" ? "user" : "assistant",
    text: m.content || m.text || "",
    imageUrl: m.image_url || undefined,
    videoUrl: m.video_url || undefined,
  }));
  return {
    messages,
    history: messages.map(m => ({ role: m.role, content: m.text })),
  };
}

async function saveSession(
  userId: string,
  botId: string,
  messages: Message[],
  history: History[]
): Promise<void> {
  const stored = messages.map(m => ({
    role: m.role,
    content: m.text,
    image_url: m.imageUrl || null,
    video_url: m.videoUrl || null,
  }));
  const { data: existing } = await supabase
    .from("chat_sessions")
    .select("id")
    .eq("user_id", userId)
    .eq("bot_id", botId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();
  if (existing) {
    await supabase.from("chat_sessions").update({ messages: stored }).eq("id", existing.id);
  } else {
    await supabase
      .from("chat_sessions")
      .insert({ user_id: userId, bot_id: botId, messages: stored });
  }
}

async function clearSession(userId: string, botId: string): Promise<void> {
  await supabase
    .from("chat_sessions")
    .delete()
    .eq("user_id", userId)
    .eq("bot_id", botId);
}

const localCache: Record<string, { messages: Message[]; history: History[] }> = {};

function initCache(model: CustomModel) {
  if (!localCache[model.id]) {
    const greeting =
      model.type === "image"
        ? `Hi! I'm ${model.name}. Describe what you'd like me to draw.`
        : model.type === "video"
        ? `Hi! I'm ${model.name}. Describe the video you want me to create.`
        : `Hi! I'm ${model.name}. How can I help?`;
    localCache[model.id] = {
      messages: [{ id: "0", role: "assistant", text: greeting }],
      history: model.system_prompt
        ? [{ role: "system", content: model.system_prompt }]
        : [],
    };
  }
  return localCache[model.id];
}

function AddModelSheet({
  initialModel,
  onSave,
  onClose,
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
  const [showSystemPrompt, setShowSystemPrompt] = useState(!!(initialModel?.system_prompt));
  const [keyVisible, setKeyVisible]         = useState(false);
  const [saving, setSaving]                 = useState(false);

  const applyPreset = (p: typeof PRESETS[0]) => {
    setApiUrl(p.apiUrl);
    setModel(p.model);
    setType(p.type);
    setApiFormat(p.apiFormat);
    if (p.imageFormat) setImageFormat(p.imageFormat);
    if (p.videoFormat) setVideoFormat(p.videoFormat);
    if (!name) setName(p.label);
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert("Name required", "Give this model a name."); return; }
    const isPollinationsImage = type === "image" && imageFormat === "pollinations";
    if (!isPollinationsImage && !apiKey.trim()) { Alert.alert("API key required", "Enter your API key."); return; }
    if (!isPollinationsImage && !apiUrl.trim()) { Alert.alert("Endpoint required", "Enter the API endpoint URL."); return; }
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        api_key: isPollinationsImage ? "" : apiKey.trim(),
        api_url: isPollinationsImage ? "" : apiUrl.trim(),
        model: model.trim(),
        type,
        api_format: apiFormat,
        image_format: type === "image" ? imageFormat : null,
        video_format: type === "video" ? videoFormat : null,
        system_prompt: systemPrompt.trim(),
        supports_vision: type === "text" ? supportsVision : false,
      });
      onClose();
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to save model.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={m.sheet}>
        <View style={m.handle} />
        <View style={m.sheetHeader}>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={m.cancelBtn}>Cancel</Text>
          </Pressable>
          <Text style={m.sheetTitle}>{isEditing ? "Edit model" : "Add model"}</Text>
          <Pressable onPress={handleSave} disabled={saving} hitSlop={12}>
            <Text style={[m.doneBtn, saving && { opacity: 0.35 }]}>
              {saving ? "Saving…" : isEditing ? "Save" : "Add"}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={m.sheetBody}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={m.sectionLabel}>QUICK FILL</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={m.presetsRow}>
            {PRESETS.map(p => (
              <Pressable key={p.label} style={m.presetPill} onPress={() => applyPreset(p)}>
                <Text style={m.presetText}>{p.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={m.sectionLabel}>NAME</Text>
          <View style={m.group}>
            <TextInput style={m.field} placeholder="My GPT-4o" placeholderTextColor="rgba(255,255,255,0.2)" value={name} onChangeText={setName} />
          </View>

          {!(type === "image" && imageFormat === "pollinations") && (
          <>
            <Text style={m.sectionLabel}>API KEY</Text>
            <View style={m.group}>
              <View style={m.fieldRow}>
                <TextInput style={[m.field, { flex: 1, borderWidth: 0 }]} placeholder="sk-..." placeholderTextColor="rgba(255,255,255,0.2)" value={apiKey} onChangeText={setApiKey} secureTextEntry={!keyVisible} autoCapitalize="none" autoCorrect={false} />
                <Pressable onPress={() => setKeyVisible(v => !v)} hitSlop={12} style={m.fieldIcon}>
                  <Ionicons name={keyVisible ? "eye-off-outline" : "eye-outline"} size={17} color="rgba(255,255,255,0.3)" />
                </Pressable>
              </View>
            </View>
          </>)}

          <Text style={m.sectionLabel}>ENDPOINT & MODEL</Text>
          <View style={m.group}>
            <TextInput style={[m.field, m.fieldDivider]} placeholder="https://api.openai.com/v1/chat/completions" placeholderTextColor="rgba(255,255,255,0.2)" value={apiUrl} onChangeText={setApiUrl} autoCapitalize="none" autoCorrect={false} keyboardType="url" />
            <TextInput style={m.field} placeholder="gpt-4o" placeholderTextColor="rgba(255,255,255,0.2)" value={model} onChangeText={setModel} autoCapitalize="none" autoCorrect={false} />
          </View>

          <Text style={m.sectionLabel}>TYPE</Text>
          <View style={m.group}>
            <View style={m.segmentRow}>
              {(["text", "image", "video"] as ModelType[]).map(t => (
                <Pressable key={t} style={[m.segment, type === t && m.segmentActive]} onPress={() => setType(t)}>
                  <Text style={[m.segmentText, type === t && m.segmentTextActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
                </Pressable>
              ))}
            </View>
          </View>

{type === "text" && (
            <>
              <Text style={m.sectionLabel}>API FORMAT</Text>
              <View style={m.group}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={m.apiFormatRow}>
                  {(["openai", "anthropic", "cohere", "google", "deepseek", "xai", "perplexity", "azure", "mistral", "fal", "replicate", "stability", "ideogram", "bfl", "leonardo", "getimg", "runway", "luma", "pika", "vidu", "minimax", "elevenlabs", "cartesia", "playht", "murf", "voyage", "jina", "ollama", "huggingface"] as ApiFormat[]).map(f => (
                    <Pressable key={f} style={[m.apiFormatPill, apiFormat === f && m.apiFormatPillActive]} onPress={() => setApiFormat(f)}>
                      <Text style={[m.apiFormatText, apiFormat === f && m.apiFormatTextActive]} numberOfLines={1}>{f}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
              <Text style={m.sectionLabel}>OPTIONS</Text>
              <View style={m.group}>
                <View style={m.toggleRow}>
                  <Text style={m.toggleLabel}>Supports image input (vision)</Text>
                  <Switch value={supportsVision} onValueChange={setSupportsVision} trackColor={{ false: "rgba(255,255,255,0.1)", true: "rgba(255,255,255,0.75)" }} thumbColor="#000" />
                </View>
              </View>
            </>
          )}

          {type === "image" && (
            <>
              <Text style={m.sectionLabel}>IMAGE FORMAT</Text>
              <View style={m.group}>
                <View style={m.segmentRow}>
                  {([["url", "Direct URL"], ["pollinations", "Pollinations"]] as [ImageFormat, string][]).map(([f, label]) => (
                    <Pressable key={f} style={[m.segment, imageFormat === f && m.segmentActive]} onPress={() => setImageFormat(f)}>
                      <Text style={[m.segmentText, imageFormat === f && m.segmentTextActive]}>{label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </>
          )}

          {type === "video" && (
            <>
              <Text style={m.sectionLabel}>VIDEO FORMAT</Text>
              <View style={m.group}>
                <View style={m.segmentRow}>
                  {([["fal", "fal.ai (queue)"], ["direct", "Direct URL"]] as [VideoFormat, string][]).map(([f, label]) => (
                    <Pressable key={f} style={[m.segment, videoFormat === f && m.segmentActive]} onPress={() => setVideoFormat(f)}>
                      <Text style={[m.segmentText, videoFormat === f && m.segmentTextActive]}>{label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </>
          )}

          {type === "text" && (
            <>
              <Pressable style={m.collapsibleHeader} onPress={() => setShowSystemPrompt(v => !v)}>
                <Text style={m.sectionLabel}>SYSTEM PROMPT</Text>
                <Ionicons name={showSystemPrompt ? "chevron-up" : "chevron-down"} size={13} color="rgba(255,255,255,0.25)" />
              </Pressable>
              {showSystemPrompt && (
                <View style={m.group}>
                  <TextInput style={[m.field, { minHeight: 88, paddingTop: 14 }]} placeholder="You are a helpful assistant." placeholderTextColor="rgba(255,255,255,0.2)" value={systemPrompt} onChangeText={setSystemPrompt} multiline />
                </View>
              )}
            </>
          )}
          <View style={{ height: 48 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function Explore() {
  const [userId, setUserId]                 = useState<string | null>(null);
  const [models, setModels]                 = useState<CustomModel[]>([]);
  const [activeId, setActiveId]             = useState<string | null>(null);
  const [messages, setMessages]             = useState<Message[]>([]);
  const [input, setInput]                   = useState("");
  const [loading, setLoading]               = useState(false);
  const [addOpen, setAddOpen]               = useState(false);
  const [editingModel, setEditingModel]     = useState<CustomModel | null>(null);
  const [loadingModels, setLoadingModels]   = useState(true);

  const historyRef  = useRef<History[]>([]);
  const messagesRef = useRef<Message[]>([]);
  const listRef     = useRef<FlatList<Message>>(null);
  const abortRef    = useRef<AbortController | null>(null);
  const inputScale  = useRef(new Animated.Value(1)).current;

  const activeModel = models.find(m => m.id === activeId) ?? null;

  useEffect(() => {
    let mounted = true;
    const checkUser = async () => {
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
        } catch (err) {
          console.error("Failed to load models:", err);
        } finally {
          if (mounted) setLoadingModels(false);
        }
      } else {
        if (mounted) {
          setUserId(null);
          setModels([]);
          setLoadingModels(false);
        }
      }
    };
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (mounted) {
        if (session?.user) {
          setUserId(session.user.id);
          const list = await fetchModels(session.user.id);
          if (mounted) {
            setModels(list);
            if (list.length > 0 && !activeId) switchToModel(list[0], session.user.id);
          }
        } else {
          setUserId(null);
          setModels([]);
          setActiveId(null);
        }
      }
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const switchToModel = async (model: CustomModel, uid?: string) => {
    abortRef.current?.abort();
    const id = uid ?? userId;
    setActiveId(model.id);
    setInput("");
    setLoading(false);
    if (id) {
      const session = await loadSession(id, model.id);
      if (session) {
        historyRef.current = session.history;
        setMessages(session.messages);
        return;
      }
    }
    const cache = initCache(model);
    historyRef.current = [...cache.history];
    setMessages([...cache.messages]);
  };

  const handleAddModel = async (fields: Omit<CustomModel, "id" | "user_id" | "created_at">) => {
    if (!userId) throw new Error("You must be logged in to add models.");
    const created = await insertModel(userId, fields);
    const updated = [...models, created];
    setModels(updated);
    switchToModel(created);
  };

  const handleEditModel = async (fields: Omit<CustomModel, "id" | "user_id" | "created_at">) => {
    if (!editingModel) return;
    const updated = await updateModel(editingModel.id, fields);
    setModels(prev => prev.map(m => m.id === updated.id ? updated : m));
    setEditingModel(null);
  };

  const handleDeleteModel = (model: CustomModel) => {
    Alert.alert(`Remove "${model.name}"?`, "This will also delete its chat history.", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: async () => {
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
  };

  const resetChat = async () => {
    if (!activeModel) return;
    abortRef.current?.abort();
    const greeting = activeModel.type === "image" ? `Hi! I'm ${activeModel.name}. Describe what you'd like me to draw.` : activeModel.type === "video" ? `Hi! I'm ${activeModel.name}. Describe the video you want me to create.` : `Hi! I'm ${activeModel.name}. How can I help?`;
    const fresh = [{ id: "0", role: "assistant" as const, text: greeting }];
    historyRef.current = activeModel.system_prompt ? [{ role: "system", content: activeModel.system_prompt }] : [];
    setMessages(fresh);
    setLoading(false);
    if (userId) await clearSession(userId, activeModel.id).catch(() => {});
  };

  const persist = async () => {
    if (!activeModel || !userId) return;
    localCache[activeModel.id] = { messages: messagesRef.current, history: historyRef.current };
    await saveSession(userId, activeModel.id, messagesRef.current, historyRef.current).catch(err => console.error("Save failed:", err));
  };

  // Optimized streaming with debounced UI updates for smoother performance
  const sendText = async (prompt: string, botMsgId: string, model: CustomModel) => {
    if (!model.api_url?.trim()) throw new Error("No endpoint URL configured.");
    if (!model.api_key?.trim()) throw new Error("No API key configured.");
    historyRef.current.push({ role: "user", content: prompt });
    abortRef.current = new AbortController();
    
    // Debounced update reference
    let lastUpdate = 0;
    const updateDebounced = (text: string) => {
      const now = Date.now();
      if (now - lastUpdate > 50) { // Update max 20 times per second
        lastUpdate = now;
        setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text } : m));
      }
    };
    
    if (model.api_format === "anthropic") {
      const body: any = { model: model.model, max_tokens: 1024, messages: historyRef.current.filter(h => h.role !== "system"), stream: true };
      const sysPmt = historyRef.current.find(h => h.role === "system");
      if (sysPmt) body.system = sysPmt.content;
      const res = await fetch(model.api_url, { method: "POST", signal: abortRef.current.signal, headers: { "Content-Type": "application/json", "x-api-key": model.api_key, "anthropic-version": "2023-06-01" }, body: JSON.stringify(body) });
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
              const parsed = JSON.parse(payload);
              const delta = parsed?.delta?.text;
              if (delta) {
                fullReply += delta;
                updateDebounced(fullReply);
              }
            } catch { }
          }
        }
      }
      setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: fullReply } : m));
      if (!fullReply) throw new Error("Empty reply.");
      historyRef.current.push({ role: "assistant", content: fullReply });
      return;
    }
    const res = await fetch(model.api_url, { method: "POST", signal: abortRef.current.signal, headers: { "Content-Type": "application/json", Authorization: `Bearer ${model.api_key}` }, body: JSON.stringify({ model: model.model, messages: historyRef.current, stream: true, max_tokens: 1024 }) });
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
            if (delta) {
              fullReply += delta;
              updateDebounced(fullReply);
            }
          } catch { }
        }
      }
    }
    setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: fullReply } : m));
    if (!fullReply) throw new Error("Empty reply.");
    historyRef.current.push({ role: "assistant", content: fullReply });
  };

  const sendImage = async (prompt: string, botMsgId: string, model: CustomModel) => {
    if (model.image_format === "pollinations") {
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=${model.model}&width=1024&height=1024&seed=${Date.now()}&nologo=true`;
      setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: "", imageUrl } : m));
      return;
    }
    if (!model.api_url?.trim()) throw new Error("No endpoint URL configured.");
    if (!model.api_key?.trim()) throw new Error("No API key configured.");
    const res = await fetch(model.api_url, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${model.api_key}` }, body: JSON.stringify({ model: model.model, prompt, n: 1, size: "1024x1024" }) });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error?.message ?? `HTTP ${res.status}`); }
    const data = await res.json();
    const imageUrl = data?.data?.[0]?.url;
    if (!imageUrl) throw new Error("No image returned.");
    setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: "", imageUrl } : m));
  };

  const sendVideo = async (prompt: string, botMsgId: string, model: CustomModel) => {
    if (!model.api_url?.trim()) throw new Error("No endpoint URL configured.");
    if (!model.api_key?.trim()) throw new Error("No API key configured.");
    setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: "Starting generation…" } : m));
    if (model.video_format === "fal") {
      const submitRes = await fetch(model.api_url, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Key ${model.api_key}` }, body: JSON.stringify({ prompt }) });
      if (!submitRes.ok) { const e = await submitRes.json().catch(() => ({})); throw new Error(e.detail ?? `HTTP ${submitRes.status}`); }
      const submitted = await submitRes.json();
      const requestId: string = submitted.request_id;
      if (!requestId) throw new Error("No request ID returned.");
      const pollUrl = `${model.api_url}/requests/${requestId}`;
      let videoUrl: string | null = null;
      for (let i = 0; i < 120; i++) {
        await new Promise(r => setTimeout(r, 3000));
        const pollRes = await fetch(pollUrl, { headers: { Authorization: `Key ${model.api_key}` } });
        if (!pollRes.ok) continue;
        const pollData = await pollRes.json();
        if (pollData.status === "COMPLETED") { videoUrl = pollData.video?.url || pollData.output?.video_url || pollData.output?.video?.url || null; break; }
        if (pollData.status === "FAILED") throw new Error(pollData.error ?? "Generation failed.");
        setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: `Generating… (${(i + 1) * 3}s)` } : m));
      }
      if (!videoUrl) throw new Error("Timed out waiting for video.");
      setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: "", videoUrl } : m));
      return;
    }
    const res = await fetch(model.api_url, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${model.api_key}` }, body: JSON.stringify({ model: model.model, prompt }) });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error?.message ?? `HTTP ${res.status}`); }
    const data = await res.json();
    const videoUrl = data?.video_url || data?.data?.[0]?.url;
    if (!videoUrl) throw new Error("No video returned.");
    setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: "", videoUrl } : m));
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || !activeModel) return;
    const prompt = input.trim();
    const botMsgId = `${Date.now()}-b`;
    Animated.sequence([ Animated.timing(inputScale, { toValue: 0.97, duration: 60, useNativeDriver: true }), Animated.timing(inputScale, { toValue: 1, duration: 60, useNativeDriver: true }) ]).start();
    setMessages(prev => [ ...prev, { id: `${Date.now()}-u`, role: "user", text: prompt }, { id: botMsgId, role: "assistant", text: "" } ]);
    setInput("");
    setLoading(true);
    try {
      if (activeModel.type === "video") await sendVideo(prompt, botMsgId, activeModel);
      else if (activeModel.type === "image") await sendImage(prompt, botMsgId, activeModel);
      else await sendText(prompt, botMsgId, activeModel);
      await persist();
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: err instanceof Error ? err.message : "Something went wrong." } : m));
    } finally { setLoading(false); }
  };

  return (
    <ImageBackground source={require("../../assets/images/bg1.jpg")} style={s.fill}>
      <View style={s.overlay} />
      <SafeAreaView style={s.fill}>
        <View style={s.tabBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
            {models.map(model => {
              const active = activeId === model.id;
              return (
                <Pressable key={model.id} style={[s.tab, active && s.tabActive]} onPress={() => switchToModel(model)} onLongPress={() => { Alert.alert(model.name, undefined, [ { text: "Edit", onPress: () => { setEditingModel(model); setAddOpen(true); } }, { text: "Delete", style: "destructive", onPress: () => handleDeleteModel(model) }, { text: "Cancel", style: "cancel" } ]); }} delayLongPress={500}>
                  <Text style={[s.tabText, active && s.tabTextActive]} numberOfLines={1}>{model.name}</Text>
                  {active && <View style={s.tabUnderline} />}
                </Pressable>
              );
            })}
            <Pressable style={s.addTab} onPress={() => { if (!userId) { Alert.alert("Sign in required", "Log in to save and manage your models."); return; } setAddOpen(true); }}>
              <Ionicons name="add" size={17} color="rgba(255,255,255,0.5)" />
            </Pressable>
            <Pressable style={s.information} onPress={() => Alert.alert("Info", "To make new tabs click on the + on the top left corner\nTo go to a new tab click on the messageicon or home icon on the right side and the location depends on the devices viewport size\n\nhave fun")}>
              <Ionicons name="information" size={23} color="white"/>
            </Pressable>
          </ScrollView>
          {activeModel && <Pressable onPress={resetChat} hitSlop={12} style={s.clearBtn}><Ionicons name="trash-outline" size={15} color="rgba(255,255,255,0.35)" /></Pressable>}
        </View>

        {!loadingModels && models.length === 0 && (
          <View style={s.emptyState}>
            <View style={s.emptyIcon}><Ionicons name="build" size={28} color="rgba(255,255,255,0.3)" /></View>
            <Text style={s.emptyTitle}>No models yet</Text>
            <Text style={s.emptySubtitle}>Tap + to add any AI model using your own API key.{"\n"}Works with OpenAI, Anthropic, Groq, Ollama, fal.ai, and more.</Text>
            <Pressable style={({ pressed }) => [s.emptyBtn, pressed && { opacity: 0.8 }]} onPress={() => { if (!userId) { Alert.alert("Login required", "Log in to save and manage your models."); return; } setAddOpen(true); }}><Text style={s.emptyBtnText}>Add your first model</Text></Pressable>
          </View>
        )}

        {activeModel && (
          <KeyboardAvoidingView style={s.fill} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}>
            <FlatList ref={listRef} data={messages} keyExtractor={m => m.id} contentContainerStyle={s.chatList} onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })} onLayout={() => listRef.current?.scrollToEnd({ animated: false })} keyboardShouldPersistTaps="handled" renderItem={({ item, index }) => {
                const isUser = item.role === "user";
                const prev = messages[index - 1];
                const showAvatar = !isUser && (!prev || prev.role === "user");
                return (
                  <View style={[s.msgRow, isUser && s.msgRowUser]}>
                    {!isUser && <View style={s.avatarCol}>{showAvatar ? <View style={s.botAvatar}><Text style={s.botAvatarText}>{activeModel.name.charAt(0).toUpperCase()}</Text></View> : <View style={{ width: 28 }} />}</View>}
                    <View style={[s.bubble, isUser ? s.userBubble : s.botBubble, (item.imageUrl || item.videoUrl) && s.mediaBubble]}>
                      {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={s.generatedImage} /> : item.videoUrl ? <View style={s.videoPlaceholder}><Ionicons name="play-circle-outline" size={34} color="rgba(255,255,255,0.5)" /><Text style={s.videoReadyText}>Video ready</Text></View> : <Text style={[s.bubbleText, isUser && s.userBubbleText]}>{item.text || (item.role === "assistant" && loading ? "▍" : "")}</Text>}
                    </View>
                  </View>
                );
              }}
            />
            <Animated.View style={[s.inputBar, { transform: [{ scale: inputScale }] }]}>
              <TextInput value={input} onChangeText={setInput} placeholder={activeModel.type === "video" ? "Describe a video…" : activeModel.type === "image" ? "Describe an image…" : "Message"} placeholderTextColor="rgba(255,255,255,0.25)" style={s.chatInput} onSubmitEditing={sendMessage} returnKeyType="send" multiline selectionColor="#fff" />
              <Pressable style={({ pressed }) => [s.sendBtn, loading && s.sendBtnStop, pressed && { opacity: 0.7 }]} onPress={loading ? () => abortRef.current?.abort() : sendMessage}>
                <Ionicons name={loading ? "stop" : activeModel.type === "video" ? "videocam" : activeModel.type === "image" ? "image-outline" : "arrow-up"} size={15} color={loading ? "rgba(255,255,255,0.45)" : "#000"} />
              </Pressable>
            </Animated.View>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
      {addOpen && <AddModelSheet initialModel={editingModel ?? undefined} onSave={editingModel ? handleEditModel : handleAddModel} onClose={() => { setAddOpen(false); setEditingModel(null); }} />}
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFill,
  backgroundColor: "rgba(0, 0, 0, 0.01)" },
  tabBar: { flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "transparent" },
  information: { width: 30, 
    height: 30,
    borderRadius: 23, 
    borderWidth: StyleSheet.hairlineWidth, 
    borderColor: "rgba(238, 228, 228, 0.06)", 
    alignItems: "center", 
    justifyContent: "center", 
    marginBottom: 8, 
    marginLeft: 12 },
  tabScroll: { 
    paddingHorizontal: 10, 
    paddingTop: 8, 
    paddingBottom: 0, 
    gap: 2, 
    alignItems: "flex-end" },
  tab: { 
    paddingHorizontal: 13, 
    paddingTop: 7, 
    paddingBottom: 10, 
    maxWidth: 148, 
    position: "relative" 
  },
  tabActive: {},
  tabText: { 
    color: "rgb(250, 248, 248)", 
    fontSize: 13,
     fontWeight: "500",
      letterSpacing: 0.1 },
  tabTextActive: {
     color: "#f5f2ec", 
     fontWeight: "600" },
  tabUnderline: { 
    position: "absolute", 
    bottom: 0, 
    left: 13, 
    right: 13, 
    height: 1.5, 
    backgroundColor: "#f2f0ea", 
    borderRadius: 1 },
  addTab: { 
    width: 30,
     height: 30, 
     borderRadius: 23, 
     borderWidth: StyleSheet.hairlineWidth,
      borderColor: "rgba(250, 238, 238, 0.06)", 
      alignItems: "center", 
      justifyContent: "center", 
      marginBottom: 8, 
      marginLeft: 4 },
  clearBtn: { 
    paddingRight: 16, 
    paddingLeft: 6, 
    paddingBottom: 17,
     alignSelf: "flex-end" },
  emptyState: { 
    flex: 1, 
    alignItems: "center",
     justifyContent: "center", 
     paddingHorizontal: 44, gap: 10 },
  emptyIcon: { 
    width: 56, 
    height: 56, 
    borderRadius: 16,
     backgroundColor: "rgba(36, 33, 33, 0.56)", 
     borderWidth: StyleSheet.hairlineWidth, 
     borderColor: "rgba(255,255,255,0.08)", 
     alignItems: "center", 
     justifyContent: "center", 
     marginBottom: 4 },
  emptyTitle: { 
    color: "#efe7e7",
     fontSize: 19, 
     fontWeight: "600", 
     letterSpacing: -0.2 },
  emptySubtitle: { 
    color: "rgba(255,255,255,0.38)", 
    fontSize: 14,
     textAlign: "center", 
    lineHeight: 21 },
  emptyBtn: { 
    marginTop: 10, 
    backgroundColor: "#f6ecec", 
    borderRadius: 10, 
    paddingHorizontal: 22,
     paddingVertical: 12 },
  emptyBtnText: { 
    color: "#000", 
    fontSize: 14, 
    fontWeight: "600" },
  chatList: { 
    paddingVertical: 16,
     paddingHorizontal: 14,
      flexGrow: 1,
       gap: 2 },
  msgRow: { 
    flexDirection: "row",
     alignItems: "flex-end",
      gap: 8,
       marginVertical: 2 },
  msgRowUser: { 
    flexDirection: "row-reverse" },
  avatarCol: { 
    width: 28, 
    alignItems: "center" },
  botAvatar: { 
    width: 28, 
    height: 28, 
    borderRadius: 9, 
    backgroundColor: "rgba(5, 5, 5, 0)", 
    borderWidth: StyleSheet.hairlineWidth, 
    borderColor: "rgba(255, 255, 255, 0.17)",
     alignItems: "center", 
     justifyContent: "center" },
  botAvatarText: { 
    color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "700" },
  bubble: { 
    borderRadius: 18, maxWidth: "78%", overflow: "hidden", paddingHorizontal: 14, paddingVertical: 10 },
  mediaBubble: { 
    padding: 0, backgroundColor: "transparent" },
  userBubble: { 
    backgroundColor: "rgba(235, 226, 226, 0.15)", borderBottomRightRadius: 5, borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(0, 0, 0, 0.1)" },
  botBubble: {
     backgroundColor: "rgba(240, 232, 232, 0.11)", borderBottomLeftRadius: 5, borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(255, 255, 255, 0.03)" },
  bubbleText: { 
    color: "rgba(255,255,255,0.82)", fontSize: 15, lineHeight: 22 },
  userBubbleText: { 
    color: "#fff" },
  generatedImage: { 
    width: 252, height: 252, borderRadius: 15 },
  videoPlaceholder: {
     width: 224, height: 126, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center", gap: 8 },
  videoReadyText: {
     color: "rgba(255,255,255,0.45)", fontSize: 13 },
  inputBar: {
     flexDirection: "row", alignItems: "flex-end", paddingLeft: 12, paddingRight: 68, paddingTop: 10, paddingBottom: Platform.OS === "ios" ? 16 : 14, backgroundColor: "transparent", gap: 10, width : "110%" },
  chatInput: { 
    flex: 1,
     backgroundColor: "rgba(64, 61, 61, 0.33)", 
     color: "#fff", borderRadius: 22, 
     paddingHorizontal: 16, 
     paddingTop: 10, 
     paddingBottom: 10, 
     fontSize: 15, 
     maxHeight: 120, 
     borderWidth: StyleSheet.hairlineWidth,
     borderColor: "rgba(255, 255, 255, 0)" },
  sendBtn: { 
    width: 38, height: 38, borderRadius: 19, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  sendBtnStop: { 
    backgroundColor: "rgba(255,255,255,0.08)", borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(255,255,255,0.1)" },
});

const m = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: "rgba(9, 10, 10, 0.99)" },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.15)", alignSelf: "center", marginTop: 10, marginBottom: 6 },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(255, 255, 255, 0.54)" },
  sheetTitle: { color: "#fff", fontSize: 16, fontWeight: "600", letterSpacing: -0.1 },
  cancelBtn: { color: "rgba(255,255,255,0.45)", fontSize: 15, minWidth: 56 },
  doneBtn:   { color: "#fff", fontSize: 15, fontWeight: "600", minWidth: 56, textAlign: "right" },
  sheetBody: { paddingHorizontal: 20, paddingTop: 24 },
  sectionLabel: { color: "rgba(255,255,255,0.28)", fontSize: 11, fontWeight: "600", letterSpacing: 0.7, marginBottom: 8, marginLeft: 2 },
  presetsRow: { gap: 6, marginBottom: 24 },
  presetPill: { paddingHorizontal: 13, paddingVertical: 7, borderRadius: 8, backgroundColor: "rgba(255, 255, 255, 0.05)", borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(255,255,255,0.09)" },
  presetText: { color: "rgba(255,255,255,0.65)", fontSize: 13, fontWeight: "500" },
  group: { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 13, borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 20 },
  field: { color: "#fff", fontSize: 15, paddingHorizontal: 16, paddingVertical: 14 },
  fieldDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(255,255,255,0.07)" },
  fieldRow: { flexDirection: "row", alignItems: "center" },
  fieldIcon: { paddingRight: 14 },
  segmentRow: { flexDirection: "row", padding: 4, gap: 4 },
  segment: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: "center" },
  segmentActive: { backgroundColor: "rgba(255,255,255,0.11)" },
  segmentText:       { color: "rgba(255,255,255,0.3)",  fontSize: 13, fontWeight: "500" },
  segmentTextActive: { color: "#fff",                    fontSize: 13, fontWeight: "600" },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 13 },
  toggleLabel: { color: "#fff", fontSize: 15, flex: 1 },
  collapsibleHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12, paddingRight: 4 },
  apiFormatRow: { paddingHorizontal: 4, paddingVertical: 6, gap: 4 },
  apiFormatPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(255,255,255,0.09)", flexShrink: 0 },
  apiFormatPillActive: { backgroundColor: "rgba(255,255,255,0.11)" },
  apiFormatText: { color: "rgba(255,255,255,0.3)", fontSize: 12, fontWeight: "500" },
  apiFormatTextActive: { color: "#fff", fontSize: 12, fontWeight: "600" },
});
