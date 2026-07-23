import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
//Aint finding keys here either buddy lol
// ─── Types ────────────────────────────────────────────────────────────────────

export type BotIcon =
  | { name: React.ComponentProps<typeof AntDesign>["name"]; color: string }
  | { image: any };

export type BotType = "text" | "image" | "video";
export type VideoFormat = "fal" | "direct";
export type ImageFormat = "pollinations" | "url" | "binary";

export type Bot = {
  id: string;
  name: string;
  subtitle: string;
  icon: BotIcon;
  type: BotType;
  imageFormat?: ImageFormat;
  videoFormat?: VideoFormat;
  apiUrl: string;
  apiKey: string;
  model: string;
  systemPrompt: string;
  supportsVision?: boolean;
  /** true for user-added bots stored in AsyncStorage */
  isCustom?: boolean;
};

// ─── AsyncStorage key ─────────────────────────────────────────────────────────

export const CUSTOM_BOTS_KEY = "@custom_bots_v1";

// ─── Custom bot CRUD ──────────────────────────────────────────────────────────

export async function loadCustomBots(): Promise<Bot[]> {
  try {
    const raw = await AsyncStorage.getItem(CUSTOM_BOTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Bot[];
  } catch {
    return [];
  }
}

export async function saveCustomBot(bot: Bot): Promise<void> {
  const existing = await loadCustomBots();
  const updated = [...existing.filter(b => b.id !== bot.id), bot];
  await AsyncStorage.setItem(CUSTOM_BOTS_KEY, JSON.stringify(updated));
}

export async function deleteCustomBot(id: string): Promise<void> {
  const existing = await loadCustomBots();
  await AsyncStorage.setItem(
    CUSTOM_BOTS_KEY,
    JSON.stringify(existing.filter(b => b.id !== id))
  );
}

// ─── Built-in bots ────────────────────────────────────────────────────────────

function getEnvKey(key: string): string {
  return (Constants.expoConfig as any)?.extra?.[key] || process.env[key] || "";
}

export function getBots(): Bot[] {
  return [

    // ── Text ─────────────────────────────────────────────────────────────────

    {
      id: "nemotron",
      name: "Nemotron Ultra",
      subtitle: "NVIDIA · via OpenRouter",
      icon: { image: require("../../assets/images/nvda.png") },
      type: "text",
      apiUrl: "https://openrouter.ai/api/v1/chat/completions",
      apiKey: getEnvKey("OPENROUTER_API_KEY_1"),
      model: "nvidia/nemotron-3-ultra-550b-a55b:free",
      systemPrompt: "You are a helpful assistant.",
    },
    {
      id: "openai-gpt-oss",
      name: "GPT-OSS 120B",
      subtitle: "OpenAI · via Groq",
      icon: { image: require("../../assets/images/openai.png") },
      type: "text",
      apiUrl: "https://api.groq.com/openai/v1/chat/completions",
      apiKey: getEnvKey("GROQ_API_KEY_1"),
      model: "openai/gpt-oss-120b",
      systemPrompt: "You are a helpful assistant.",
      supportsVision: true,
    },
    {
      id: "llama-3.1",
      name: "Llama 3.1",
      subtitle: "DECOMMISSIONED",
      icon: { image: require("../../assets/images/llama.png") },
      type: "text",
      apiUrl: "https://api.groq.com/openai/v1/chat/completions",
      apiKey: getEnvKey("GROQ_API_KEY_2"),
      model: "llama-3.1-70b-versatile",
      systemPrompt: "You are a helpful assistant.",
    },
    {
      id: "poolside",
      name: "Poolside Laguna",
      subtitle: "Poolside · via OpenRouter",
      icon: { image: require("../../assets/images/pool.jpg") },
      type: "text",
      apiUrl: "https://openrouter.ai/api/v1/chat/completions",
      apiKey: getEnvKey("OPENROUTER_API_KEY_2"),
      model: "poolside/laguna-m.1:free",
      systemPrompt: "You are a helpful assistant.",
    },
    {
      id: "cohere",
      name: "Cohere North Mini",
      subtitle: "Coding · via OpenRouter",
      icon: { image: require("../../assets/images/cohere.png") },
      type: "text",
      apiUrl: "https://openrouter.ai/api/v1/chat/completions",
      apiKey: getEnvKey("OPENROUTER_API_KEY_3"),
      model: "cohere/north-mini-code:free",
      systemPrompt: "You are a helpful assistant.",
    },

    // ── Image ─────────────────────────────────────────────────────────────────

    {
      id: "pollinations-flux",
      name: "FLUX Schnell",
      subtitle: "Pollinations",
      icon: { image: require("../../assets/images/flux.png") },
      type: "image",
      imageFormat: "pollinations",
      apiUrl: "",
      apiKey: "",
      model: "flux",
      systemPrompt: "",
    },
    {
      id: "pollinations-sd",
      name: "Stable Diffusion",
      subtitle: "Pollinations",
      icon: { name: "code", color: "#faf5f5" },
      type: "image",
      imageFormat: "pollinations",
      apiUrl: "",
      apiKey: "",
      model: "stable-diffusion",
      systemPrompt: "",
    },
    {
      id: "seedream",
      name: "Seedream 3.0",
      subtitle: "ByteDance · Pollinations",
      icon: { image: require("../../assets/images/byte.png") },
      type: "image",
      imageFormat: "pollinations",
      apiUrl: "",
      apiKey: "",
      model: "ByteDance-Seed/Seedream-3.0",
      systemPrompt: "",
    },

    // ── Video ─────────────────────────────────────────────────────────────────

    {
      id: "kling-video",
      name: "Kling 2.1",
      subtitle: "Text-to-video · fal.ai",
      icon: { image: require("../../assets/images/kling.png") },
      type: "video",
      videoFormat: "fal",
      apiUrl: "https://queue.fal.run/fal-ai/kling-video/v2.1/standard/text-to-video",
      apiKey: getEnvKey("FAL_API_KEY"),
      model: "kling-video",
      systemPrompt: "",
    },
    {
      id: "minimax-video",
      name: "MiniMax Video-01",
      subtitle: "Text-to-video · fal.ai",
      icon: { image: require("../../assets/images/mx.jpg") },
      type: "video",
      videoFormat: "fal",
      apiUrl: "https://queue.fal.run/fal-ai/minimax/video-01",
      apiKey: getEnvKey("FAL_API_KEY"),
      model: "minimax-video-01",
      systemPrompt: "",
    },

  ];
}
