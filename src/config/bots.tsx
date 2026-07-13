import { AntDesign } from "@expo/vector-icons";
import Constants from "expo-constants";

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


function getEnvKey(key: string): string {
  const value = (Constants.expoConfig as any)?.extra?.[key] || process.env[key] || "";
  return value;
}


export function getBots(): Bot[] {
  const bots: Bot[] = [
    // ── Text ─────────────────────────────────────────────────────
    
    {
      id: "nemotron",
      name: "Nemotron Ultra",
      subtitle: "NVIDIA · via OpenRouter",
      icon: { image: require("../../assets/images/nvda.webp") },
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
      icon: { image: require("../../assets/images/openai.webp") },
      type: "text",
      apiUrl: "https://api.groq.com/openai/v1/chat/completions",
      apiKey: getEnvKey("GROQ_API_KEY_1"),
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
      apiKey: getEnvKey("GROQ_API_KEY_2"),
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
      apiKey: getEnvKey("OPENROUTER_API_KEY_2"),
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
      apiKey: getEnvKey("OPENROUTER_API_KEY_1"),
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
  return bots;
}