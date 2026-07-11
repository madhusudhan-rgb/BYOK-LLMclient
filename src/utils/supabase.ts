import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { DATABASE_CONFIG } from "../config/database";

const supabaseUrl = DATABASE_CONFIG.endpoint;
const supabaseAnonKey = DATABASE_CONFIG.publicKey;
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
// ── Profile type ────────────────────────────────────────────────
export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

// ── Chat History type ───────────────────────────────────────────
export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  image_url?: string;
};

export type ChatSession = {
  id: string;
  user_id: string;
  bot_id: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
};

