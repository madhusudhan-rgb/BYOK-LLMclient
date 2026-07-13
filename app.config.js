const path = require("path");
const fs = require("fs");
const appJson = require("./app.json");

let dotenv;
try {
  dotenv = require("dotenv");
} catch {
  dotenv = null;
}

const envPath = path.resolve(__dirname, ".env");
if (dotenv && fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

function readEnvValue(keys) {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

module.exports = ({ config: expoConfig }) => {
  const baseConfig = expoConfig || appJson.expo;

  return {
    ...baseConfig,
    extra: {
      ...(baseConfig.extra || {}),
      OPENROUTER_API_KEY_1: readEnvValue([
        "OPENROUTER_API_KEY_1",
        "EXPO_PUBLIC_OPENROUTER_API_KEY_1",
      ]),
      OPENROUTER_API_KEY_2: readEnvValue([
        "OPENROUTER_API_KEY_2",
        "EXPO_PUBLIC_OPENROUTER_API_KEY_2",
      ]),
      GROQ_API_KEY_1: readEnvValue(["GROQ_API_KEY_1", "EXPO_PUBLIC_GROQ_API_KEY_1"]),
      GROQ_API_KEY_2: readEnvValue(["GROQ_API_KEY_2", "EXPO_PUBLIC_GROQ_API_KEY_2"]),
      OPENAI_API_KEY: readEnvValue(["OPENAI_API_KEY", "EXPO_PUBLIC_OPENAI_API_KEY"]),
      QWEN_API_KEY: readEnvValue(["QWEN_API_KEY", "EXPO_PUBLIC_QWEN_API_KEY"]),
    },
  };
};