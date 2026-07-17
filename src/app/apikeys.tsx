import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ImageBackground,
  Modal,
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

// ─── Types ─────────────────────────────────────────────────────────────────────

type ModelType = "text" | "image" | "video";
type VideoFormat = "fal" | "direct";
type ImageFormat = "pollinations" | "url";
type ApiFormat = "openai" | "anthropic";

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

// ─── Provider presets ──────────────────────────────────────────────────────────

const PRESETS: {
  label: string;
  apiUrl: string;
  model: string;
  type: ModelType;
  apiFormat: ApiFormat;
  imageFormat?: ImageFormat;
  videoFormat?: VideoFormat;
}[] = [
  { label: "OpenAI",      apiUrl: "https://api.openai.com/v1/chat/completions",                                    model: "gpt-4o",                    type: "text",  apiFormat: "openai"    },
  { label: "Anthropic",   apiUrl: "https://api.anthropic.com/v1/messages",                                        model: "claude-opus-4-5",           type: "text",  apiFormat: "anthropic" },
  { label: "Groq",        apiUrl: "https://api.groq.com/openai/v1/chat/completions",                              model: "llama-3.3-70b-versatile",   type: "text",  apiFormat: "openai"    },
  { label: "OpenRouter",  apiUrl: "https://openrouter.ai/api/v1/chat/completions",                               model: "",                          type: "text",  apiFormat: "openai"    },
  { label: "Gemini",      apiUrl: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",     model: "gemini-2.0-flash",          type: "text",  apiFormat: "openai"    },
  { label: "Mistral",     apiUrl: "https://api.mistral.ai/v1/chat/completions",                                   model: "mistral-large-latest",      type: "text",  apiFormat: "openai"    },
  { label: "Ollama",      apiUrl: "http://localhost:11434/v1/chat/completions",                                   model: "llama3",                    type: "text",  apiFormat: "openai"    },
  { label: "DALL·E",      apiUrl: "https://api.openai.com/v1/images/generations",                                model: "dall-e-3",                  type: "image", apiFormat: "openai",   imageFormat: "url"         },
  { label: "Pollinations", apiUrl: "",                                                                            model: "flux",                      type: "image", apiFormat: "openai",   imageFormat: "pollinations" },
  { label: "fal · Kling", apiUrl: "https://queue.fal.run/fal-ai/kling-video/v2.1/standard/text-to-video",       model: "kling-video",               type: "video", apiFormat: "openai",   videoFormat: "fal"         },
  { label: "fal · MiniMax", apiUrl: "https://queue.fal.run/fal-ai/minimax/video-01",                            model: "minimax-video-01",          type: "video", apiFormat: "openai",   videoFormat: "fal"         },
];

const TYPE_LABEL: Record<ModelType, string> = { text: "Text", image: "Image", video: "Video" };

// ─── Supabase helpers ──────────────────────────────────────────────────────────

async function fetchModels(userId: string): Promise<CustomModel[]> {
  const { data, error } = await supabase
    .from("custom_models")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CustomModel[];
}

async function upsertModel(
  userId: string,
  model: Partial<CustomModel> & { id?: string }
): Promise<CustomModel> {
  if (model.id) {
    const { data, error } = await supabase
      .from("custom_models")
      .update(model)
      .eq("id", model.id)
      .select()
      .single();
    if (error) throw error;
    return data as CustomModel;
  }
  const { data, error } = await supabase
    .from("custom_models")
    .insert({ ...model, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data as CustomModel;
}

async function removeModel(id: string): Promise<void> {
  const { error } = await supabase.from("custom_models").delete().eq("id", id);
  if (error) throw error;
}

// ─── ModelForm ─────────────────────────────────────────────────────────────────

type FormState = {
  name: string;
  apiKey: string;
  apiUrl: string;
  model: string;
  type: ModelType;
  apiFormat: ApiFormat;
  imageFormat: ImageFormat;
  videoFormat: VideoFormat;
  systemPrompt: string;
  supportsVision: boolean;
};

function blankForm(): FormState {
  return {
    name: "", apiKey: "", apiUrl: "", model: "",
    type: "text", apiFormat: "openai",
    imageFormat: "url", videoFormat: "fal",
    systemPrompt: "", supportsVision: false,
  };
}

function modelToForm(m: CustomModel): FormState {
  return {
    name: m.name,
    apiKey: m.api_key,
    apiUrl: m.api_url,
    model: m.model,
    type: m.type,
    apiFormat: m.api_format,
    imageFormat: m.image_format ?? "url",
    videoFormat: m.video_format ?? "fal",
    systemPrompt: m.system_prompt,
    supportsVision: m.supports_vision,
  };
}

function ModelFormModal({
  initial,
  editingId,
  onSave,
  onClose,
}: {
  initial?: FormState;
  editingId?: string;
  onSave: (form: FormState) => Promise<void>;
  onClose: () => void;
}) {
  const [f, setF] = useState<FormState>(initial ?? blankForm());
  const [keyVisible, setKeyVisible] = useState(false);
  const [showPrompt, setShowPrompt] = useState(!!initial?.systemPrompt);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setF(prev => ({ ...prev, [k]: v }));

  const applyPreset = (p: typeof PRESETS[0]) => {
    setF(prev => ({
      ...prev,
      apiUrl: p.apiUrl,
      model: p.model,
      type: p.type,
      apiFormat: p.apiFormat,
      imageFormat: p.imageFormat ?? prev.imageFormat,
      videoFormat: p.videoFormat ?? prev.videoFormat,
      name: prev.name || p.label,
    }));
  };

  const handleSave = async () => {
    if (!f.name.trim()) { Alert.alert("Name required"); return; }
    if (!f.apiKey.trim()) { Alert.alert("API key required"); return; }
    if (f.type !== "image" || f.imageFormat !== "pollinations") {
      if (!f.apiUrl.trim()) { Alert.alert("Endpoint URL required"); return; }
    }
    setSaving(true);
    try {
      await onSave(f);
      onClose();
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={sh.sheet}>
        <View style={sh.header}>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={sh.cancel}>Cancel</Text>
          </Pressable>
          <Text style={sh.title}>{editingId ? "Edit model" : "Add model"}</Text>
          <Pressable onPress={handleSave} disabled={saving} hitSlop={8}>
            <Text style={[sh.done, saving && { opacity: 0.4 }]}>
              {saving ? "Saving…" : "Save"}
            </Text>
          </Pressable>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={sh.body} keyboardShouldPersistTaps="handled">

          {/* Presets */}
          <Text style={sh.sectionLabel}>QUICK FILL</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={sh.presetsRow}>
            {PRESETS.map(p => (
              <Pressable key={p.label} style={sh.pill} onPress={() => applyPreset(p)}>
                <Text style={sh.pillText}>{p.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Name */}
          <Text style={sh.sectionLabel}>NAME</Text>
          <View style={sh.group}>
            <TextInput
              style={sh.field}
              placeholder="My GPT-4o"
              placeholderTextColor="rgba(255,255,255,0.25)"
              value={f.name}
              onChangeText={v => set("name", v)}
            />
          </View>

          {/* API Key */}
          <Text style={sh.sectionLabel}>API KEY</Text>
          <View style={sh.group}>
            <View style={sh.fieldRow}>
              <TextInput
                style={[sh.field, { flex: 1, borderWidth: 0 }]}
                placeholder="sk-..."
                placeholderTextColor="rgba(255,255,255,0.25)"
                value={f.apiKey}
                onChangeText={v => set("apiKey", v)}
                secureTextEntry={!keyVisible}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable onPress={() => setKeyVisible(v => !v)} hitSlop={8} style={sh.eyeBtn}>
                <Ionicons
                  name={keyVisible ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color="rgba(255,255,255,0.35)"
                />
              </Pressable>
            </View>
          </View>

          {/* Endpoint & Model */}
          <Text style={sh.sectionLabel}>ENDPOINT & MODEL ID</Text>
          <View style={sh.group}>
            <TextInput
              style={[sh.field, sh.fieldDivider]}
              placeholder="https://api.openai.com/v1/chat/completions"
              placeholderTextColor="rgba(255,255,255,0.25)"
              value={f.apiUrl}
              onChangeText={v => set("apiUrl", v)}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <TextInput
              style={sh.field}
              placeholder="gpt-4o"
              placeholderTextColor="rgba(255,255,255,0.25)"
              value={f.model}
              onChangeText={v => set("model", v)}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Type */}
          <Text style={sh.sectionLabel}>TYPE</Text>
          <View style={sh.group}>
            <View style={sh.segRow}>
              {(["text", "image", "video"] as ModelType[]).map(t => (
                <Pressable
                  key={t}
                  style={[sh.seg, f.type === t && sh.segActive]}
                  onPress={() => set("type", t)}
                >
                  <Text style={[sh.segText, f.type === t && sh.segTextActive]}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Text-specific */}
          {f.type === "text" && (
            <>
              <Text style={sh.sectionLabel}>API FORMAT</Text>
              <View style={sh.group}>
                <View style={sh.segRow}>
                  {(["openai", "anthropic"] as ApiFormat[]).map(fmt => (
                    <Pressable
                      key={fmt}
                      style={[sh.seg, f.apiFormat === fmt && sh.segActive]}
                      onPress={() => set("apiFormat", fmt)}
                    >
                      <Text style={[sh.segText, f.apiFormat === fmt && sh.segTextActive]}>
                        {fmt === "openai" ? "OpenAI-compatible" : "Anthropic"}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Text style={sh.sectionLabel}>OPTIONS</Text>
              <View style={sh.group}>
                <View style={sh.toggleRow}>
                  <Text style={sh.toggleLabel}>Supports image input (vision)</Text>
                  <Switch
                    value={f.supportsVision}
                    onValueChange={v => set("supportsVision", v)}
                    trackColor={{ false: "rgba(255,255,255,0.1)", true: "rgba(255,255,255,0.6)" }}
                    thumbColor="#000"
                  />
                </View>
              </View>
            </>
          )}

          {/* Image-specific */}
          {f.type === "image" && (
            <>
              <Text style={sh.sectionLabel}>IMAGE FORMAT</Text>
              <View style={sh.group}>
                <View style={sh.segRow}>
                  {([["url", "Direct URL"], ["pollinations", "Pollinations"]] as [ImageFormat, string][]).map(([fmt, label]) => (
                    <Pressable
                      key={fmt}
                      style={[sh.seg, f.imageFormat === fmt && sh.segActive]}
                      onPress={() => set("imageFormat", fmt)}
                    >
                      <Text style={[sh.segText, f.imageFormat === fmt && sh.segTextActive]}>{label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* Video-specific */}
          {f.type === "video" && (
            <>
              <Text style={sh.sectionLabel}>VIDEO FORMAT</Text>
              <View style={sh.group}>
                <View style={sh.segRow}>
                  {([["fal", "fal.ai (queue)"], ["direct", "Direct URL"]] as [VideoFormat, string][]).map(([fmt, label]) => (
                    <Pressable
                      key={fmt}
                      style={[sh.seg, f.videoFormat === fmt && sh.segActive]}
                      onPress={() => set("videoFormat", fmt)}
                    >
                      <Text style={[sh.segText, f.videoFormat === fmt && sh.segTextActive]}>{label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* System prompt */}
          {f.type === "text" && (
            <>
              <Pressable
                style={sh.collapseHeader}
                onPress={() => setShowPrompt(v => !v)}
              >
                <Text style={sh.sectionLabel}>SYSTEM PROMPT</Text>
                <Ionicons
                  name={showPrompt ? "chevron-up" : "chevron-down"}
                  size={13}
                  color="rgba(255,255,255,0.3)"
                />
              </Pressable>
              {showPrompt && (
                <View style={sh.group}>
                  <TextInput
                    style={[sh.field, { minHeight: 90, paddingTop: 12 }]}
                    placeholder="You are a helpful assistant."
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    value={f.systemPrompt}
                    onChangeText={v => set("systemPrompt", v)}
                    multiline
                  />
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

// ─── Main screen ───────────────────────────────────────────────────────────────

export default function ApiKeyInput() {
  const [userId, setUserId]     = useState<string | null>(null);
  const [models, setModels]     = useState<CustomModel[]>([]);
  const [loading, setLoading]   = useState(true);
  const [addOpen, setAddOpen]   = useState(false);
  const [editing, setEditing]   = useState<CustomModel | null>(null);

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);
      try {
        setModels(await fetchModels(user.id));
      } catch (err) {
        console.error("Failed to load models:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async (form: FormState) => {
    if (!userId) throw new Error("Not logged in.");
    const payload: Partial<CustomModel> & { id?: string } = {
      id: editing?.id,
      name: form.name.trim(),
      api_key: form.apiKey.trim(),
      api_url: form.apiUrl.trim(),
      model: form.model.trim(),
      type: form.type,
      api_format: form.apiFormat,
      image_format: form.type === "image" ? form.imageFormat : null,
      video_format: form.type === "video" ? form.videoFormat : null,
      system_prompt: form.systemPrompt.trim(),
      supports_vision: form.type === "text" ? form.supportsVision : false,
    };
    const saved = await upsertModel(userId, payload);
    setModels(prev =>
      editing
        ? prev.map(m => m.id === saved.id ? saved : m)
        : [...prev, saved]
    );
    setEditing(null);
  };

  const handleDelete = (model: CustomModel) => {
    Alert.alert(
      `Remove "${model.name}"?`,
      "This will also delete its chat history.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            await removeModel(model.id);
            // Also clear chat session
            if (userId) {
              await supabase
                .from("chat_sessions")
                .delete()
                .eq("user_id", userId)
                .eq("bot_id", model.id)
                .match(() => {});
            }
            setModels(prev => prev.filter(m => m.id !== model.id));
          },
        },
      ]
    );
  };

  // Group models by type
  const grouped: Record<ModelType, CustomModel[]> = { text: [], image: [], video: [] };
  for (const m of models) grouped[m.type].push(m);
  const sections = (["text", "image", "video"] as ModelType[]).filter(
    t => grouped[t].length > 0
  );

  return (
    <ImageBackground source={require("../../assets/images/bg4.avif")} style={s.bg}>
      <View style={s.overlay} />
      <SafeAreaView style={s.fill}>

        {/* Header */}
        <View style={s.header}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={s.backBtn}>
            <Ionicons name="chevron-back" size={20} color="#fff" />
            <Text style={s.backLabel}>Back</Text>
          </Pressable>
          <Text style={s.headerTitle}>My Models</Text>
          <Pressable
            style={s.addBtn}
            onPress={() => { setEditing(null); setAddOpen(true); }}
            hitSlop={8}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </Pressable>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.body}
          showsVerticalScrollIndicator={false}
        >
          {/* Not logged in */}
          {!userId && !loading && (
            <View style={s.emptyState}>
              <Text style={s.emptyTitle}>Sign in to manage models</Text>
              <Text style={s.emptySubtitle}>
                Your models are saved to your account so they sync across devices.
              </Text>
              <Pressable style={s.emptyBtn} onPress={() => router.push("/login")}>
                <Text style={s.emptyBtnText}>Sign in</Text>
              </Pressable>
            </View>
          )}

          {/* Empty */}
          {userId && !loading && models.length === 0 && (
            <View style={s.emptyState}>
              <Text style={s.emptyTitle}>No models yet</Text>
              <Text style={s.emptySubtitle}>
                Add any AI model using your own API key.{"\n"}
                Works with OpenAI, Anthropic, Groq, Ollama, fal.ai, and more.
              </Text>
              <Pressable style={s.emptyBtn} onPress={() => setAddOpen(true)}>
                <Text style={s.emptyBtnText}>Add your first model</Text>
              </Pressable>
            </View>
          )}

          {/* Grouped model list */}
          {sections.map(type => (
            <View key={type} style={s.section}>
              <Text style={s.sectionLabel}>{TYPE_LABEL[type].toUpperCase()}</Text>
              <View style={s.group}>
                {grouped[type].map((model, i) => (
                  <View
                    key={model.id}
                    style={[s.row, i < grouped[type].length - 1 && s.rowDivider]}
                  >
                    {/* Model initial badge */}
                    <View style={s.initial}>
                      <Text style={s.initialText}>
                        {model.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    {/* Info */}
                    <View style={s.rowBody}>
                      <Text style={s.rowName}>{model.name}</Text>
                      <Text style={s.rowSub} numberOfLines={1}>
                        {model.model || model.api_url || "No endpoint"}
                      </Text>
                    </View>

                    {/* Actions */}
                    <View style={s.rowActions}>
                      <Pressable
                        onPress={() => { setEditing(model); setAddOpen(true); }}
                        hitSlop={8}
                        style={s.iconBtn}
                      >
                        <Ionicons name="pencil-outline" size={16} color="rgba(255,255,255,0.4)" />
                      </Pressable>
                      <Pressable
                        onPress={() => handleDelete(model)}
                        hitSlop={8}
                        style={s.iconBtn}
                      >
                        <Ionicons name="trash-outline" size={16} color="rgba(255,69,58,0.6)" />
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}

          <View style={{ height: 48 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Add / Edit modal */}
      {addOpen && (
        <ModelFormModal
          initial={editing ? modelToForm(editing) : undefined}
          editingId={editing?.id}
          onSave={handleSave}
          onClose={() => { setAddOpen(false); setEditing(null); }}
        />
      )}
    </ImageBackground>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  bg: { flex: 1 },
  fill: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.75)" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 3, minWidth: 70 },
  backLabel: { color: "#fff", fontSize: 16 },
  headerTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
  },
  addBtn: {
    minWidth: 70,
    alignItems: "flex-end",
  },

  body: { paddingHorizontal: 16, paddingTop: 8 },

  emptyState: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyTitle: { color: "#fff", fontSize: 20, fontWeight: "600" },
  emptySubtitle: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
  },
  emptyBtn: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 11,
  },
  emptyBtnText: { color: "#000", fontSize: 14, fontWeight: "600" },

  section: { marginBottom: 24 },
  sectionLabel: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 4,
  },
  group: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 13,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  initial: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  initialText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  rowBody: { flex: 1 },
  rowName: { color: "#fff", fontSize: 15, fontWeight: "500" },
  rowSub: { color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 2 },
  rowActions: { flexDirection: "row", gap: 4 },
  iconBtn: { padding: 6 },
});

const sh = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: "#111" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  title: { color: "#fff", fontSize: 16, fontWeight: "600" },
  cancel: { color: "rgba(255,255,255,0.5)", fontSize: 15 },
  done: { color: "#fff", fontSize: 15, fontWeight: "600" },
  body: { paddingHorizontal: 20, paddingTop: 24 },

  sectionLabel: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 2,
  },
  presetsRow: { gap: 6, marginBottom: 24 },
  pill: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.1)",
  },
  pillText: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "500" },

  group: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    marginBottom: 20,
  },
  field: {
    color: "#fff",
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  fieldDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  fieldRow: { flexDirection: "row", alignItems: "center" },
  eyeBtn: { paddingRight: 14 },

  segRow: { flexDirection: "row", padding: 4, gap: 4 },
  seg: { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: "center" },
  segActive: { backgroundColor: "rgba(255,255,255,0.12)" },
  segText: { color: "rgba(255,255,255,0.35)", fontSize: 13, fontWeight: "500" },
  segTextActive: { color: "#fff" },

  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  toggleLabel: { color: "#fff", fontSize: 15, flex: 1 },

  collapseHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    marginLeft: 2,
  },
});
