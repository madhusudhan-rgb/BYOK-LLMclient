declare global {
  namespace NodeJS {
    interface ProcessEnv {
      OPENROUTER_API_KEY_1?: string;
      OPENROUTER_API_KEY_2?: string;
      OPENROUTER_API_KEY_3?: string;
      GROQ_API_KEY_1?: string;
      GROQ_API_KEY_2?: string;
    }
  }
}

export { };

