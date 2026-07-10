import { AntDesign } from "@expo/vector-icons";

export type BotIcon =
  | { name: React.ComponentProps<typeof AntDesign>["name"]; color: string }
  | { image: any };

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




export function getBots(): Bot[] {
  return BOTS;
}

export const BOTS: Bot[] = [
  // ── Text ─────────────────────────────────────────────────────
  
  {
    id: "nemotron",
    name: "Nemotron Ultra",
    subtitle: "NVIDIA · via OpenRouter",
    icon: { image: require("../../assets/images/nvda.webp") },
    type: "text",
    apiUrl: "https://openrouter.ai/api/v1/chat/completions",
    apiKey: "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",
    model: "nvidia/nemotron-3-ultra-550b-a55b:free",
    systemPrompt: "You are a helpful assistant.",
  },
  {
    id: "openai-gpt-oss",
    name: "GPT-OSS 120B",
    subtitle: "OpenAI · via Groq",
    icon: { image: require("../../assets/images/openai.webp") },
    type: "text",
    apiUrl: "https://api.groq.com/openai/v1/chat/completions",
    apiKey: "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",
    model: "openai/gpt-oss-120b",
    systemPrompt: "You are a helpful assistant.",
  },
  {
    id: "Llama 3.1",
    name: "Llama 3.1",
    subtitle: "DECOMISSIONED",
    icon: { image: require("../../assets/images/llama.png") },
    type: "text",
    apiUrl: "https://api.groq.com/openai/v1/chat/completions",
    apiKey:"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",
    model: "llama-3.1-70b-versatile",
    systemPrompt: "You are a helpful assistant.",
  },
  {
    id: "Qwen ai",
    name: "Qwen ai",
    subtitle: "DECOMISSIONED",
    icon:  { image: require("../../assets/images/qwen.webp") },
    type: "text",
    apiUrl: "https://openrouter.ai/api/v1/chat/completions",
    apiKey: "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",
    model: "qwen/qwen3-coder:free",
    systemPrompt: "You are a helpful assistant.",
  },
  {
    id: "Mistral-24b",
    name: "Mistral-24b-venice-edition",
    subtitle: "DECOMISSIONED",
    icon:  { image: require("../../assets/images/mistral.webp") },
    type: "text",
    apiUrl: "https://openrouter.ai/api/v1/chat/completions",
    apiKey: "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",
    model: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
    systemPrompt: "You are a helpful assistant.",
  },
  

  // ── Image (Pollinations — free, no API key needed) ────────────
  {
    id: "pollinations-flux",
    name: "FLUX Schnell",
    subtitle: "Pollinations",
    icon:  { image: require("../../assets/images/flux.png") },
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
    id: "ByteDance-Seed/Seedream-3.0",
    name: "ByteDance-Seed/Seedream-3.0",
    subtitle: "Image generation",
    icon:  { image: require("../../assets/images/byte.png") },
    type: "image",
    imageFormat: "pollinations",
    apiUrl: "",
    apiKey: "",
    model: "ByteDance-Seed/Seedream-3.0",
    systemPrompt: "",
  },

];
