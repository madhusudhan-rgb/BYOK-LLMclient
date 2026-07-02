import { AntDesign } from "@expo/vector-icons";

export type BotIcon = {
  name: React.ComponentProps<typeof AntDesign>["name"];
  color: string;
};

export type BotType = "text" | "image" | "video";

export type Bot = {
  id: string;
  name: string;
  subtitle: string;
  icon: BotIcon;
  type: BotType;
  imageFormat?: "url" | "binary" | "pollinations";
  apiUrl: string;
  apiKey: string;
  model: string;
  systemPrompt: string;
};

import { env } from "../utils/env";

const OPENROUTER_CHAT = "https://openrouter.ai/api/v1/chat/completions";
const OR_KEY_1 = env.OPENROUTER_API_KEY_1;
const OR_KEY_2 = env.OPENROUTER_API_KEY_2;
const GROQ_API_KEY = env.GROQ_API_KEY;
const OPENAI_API_KEY = env.OPENAI_API_KEY;
const QWEN_API_KEY = env.QWEN_API_KEY;

export const BOTS: Bot[] = [
  // ── Text ─────────────────────────────────────────────────────
  {
    id: "gemini",
    name: "Gemma 4 31B",
    subtitle: "DECOMISSIONED",
    icon: { name: "google", color: "#d80a0a" },
    type: "text",
    apiUrl: OPENROUTER_CHAT,
    apiKey: OR_KEY_1,
    model: "google/gemma-4-31b-it:free",
    systemPrompt: "You are a helpful assistant.",
  },
  {
    id: "nemotron",
    name: "Nemotron Ultra",
    subtitle: "NVIDIA · via OpenRouter",
    icon: { name: "code", color: "#a78bfa" },
    type: "text",
    apiUrl: OPENROUTER_CHAT,
    apiKey: OR_KEY_2,
    model: "nvidia/nemotron-3-ultra-550b-a55b:free",
    systemPrompt: "You are a helpful assistant.",
  },
  {
    id: "openai-gpt-oss",
    name: "GPT-OSS 120B",
    subtitle: "OpenAI · via Groq",
    icon: { name: "open-a-i", color: "#e1ece3" },
    type: "text",
    apiUrl: "https://api.groq.com/openai/v1/chat/completions",
    apiKey: GROQ_API_KEY,
    model: "openai/gpt-oss-120b",
    systemPrompt: "You are a helpful assistant.",
  },
  {
    id: "Llama 3.1",
    name: "Llama 3.1",
    subtitle: "Llama 3.1 via groq",
    icon: { name: "code", color: "#e1ece3" },
    type: "text",
    apiUrl: "https://api.groq.com/openai/v1/chat/completions",
    apiKey: GROQ_API_KEY,
    model: "openai/gpt-oss-120b",
    systemPrompt: "You are a helpful assistant.",
  },
  {
    id: "Qwen ai",
    name: "Qwen ai",
    subtitle: "DECOMISSIONED",
    icon: { name: "code", color: "#11b730" },
    type: "text",
    apiUrl: "https://openrouter.ai/api/v1/chat/completions",
    apiKey: QWEN_API_KEY,
    model: "qwen/qwen3-coder:free",
    systemPrompt: "You are a helpful assistant.",
  },

  // ── Image (Pollinations — free, no API key needed) ────────────
  {
    id: "pollinations-flux",
    name: "FLUX Schnell",
    subtitle: "Pollinations",
    icon: { name: "code", color: "#38bdf8" },
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
    icon: { name: "code", color: "#818cf8" },
    type: "image",
    imageFormat: "pollinations",
    apiUrl: "",
    apiKey: "",
    model: "stable-diffusion",
    systemPrompt: "",
  },

];