import Constants from "expo-constants";

type AppEnv = {
  OPENROUTER_API_KEY_1: string;
  OPENROUTER_API_KEY_2: string;
  GROQ_API_KEY: string;
  OPENAI_API_KEY: string;
  QWEN_API_KEY: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Partial<AppEnv>;

export const env: AppEnv = {
  OPENROUTER_API_KEY_1:
    String(extra.OPENROUTER_API_KEY_1 ?? process.env.OPENROUTER_API_KEY_1 ?? ""),
  OPENROUTER_API_KEY_2:
    String(extra.OPENROUTER_API_KEY_2 ?? process.env.OPENROUTER_API_KEY_2 ?? ""),
  GROQ_API_KEY: String(extra.GROQ_API_KEY ?? process.env.GROQ_API_KEY ?? ""),
  OPENAI_API_KEY: String(extra.OPENAI_API_KEY ?? process.env.OPENAI_API_KEY ?? ""),
  QWEN_API_KEY: String(extra.QWEN_API_KEY ?? process.env.QWEN_API_KEY ?? ""),
};

export function getEnv(key: keyof AppEnv): string {
  return env[key];
}
