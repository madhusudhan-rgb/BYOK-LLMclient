const { config } = require("dotenv");
const appJson = require("./app.json");

config({ path: ".env" });

module.exports = ({ config: expoConfig }) => {
  const baseConfig = expoConfig || appJson.expo;

  return {
    ...baseConfig,
    extra: {
      ...(baseConfig.extra || {}),
      OPENROUTER_API_KEY_1: process.env.OPENROUTER_API_KEY_1,
      OPENROUTER_API_KEY_2: process.env.OPENROUTER_API_KEY_2,
      GROQ_API_KEY: process.env.GROQ_API_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      QWEN_API_KEY: process.env.QWEN_API_KEY,
    },
  };
};
