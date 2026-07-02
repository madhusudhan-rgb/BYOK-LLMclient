declare global {
  namespace NodeJS {
    interface ProcessEnv {
      OPENROUTER_API_KEY_1?: string;
      OPENROUTER_API_KEY_2?: string;
      GROQ_API_KEY?: string;
      OPENAI_API_KEY?: string;
      QWEN_API_KEY?: string;
    }
  }
}

export { };

