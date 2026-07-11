import * as FileSystem from "expo-file-system/legacy";
import { Profile, supabase } from "./supabase";

// Sign up
export async function register(username: string, password: string) {
  const email = `${username.toLowerCase()}@app.local`;

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });

  if (signUpError) {
    console.error("Supabase signup error:", signUpError);
    const msg = signUpError.message || "";
    if (
      msg.includes("rate_limit") ||
      msg.includes("rate limit") ||
      msg.includes("Rate limit")
    ) {
      throw new Error(
        "Supabase email rate limit hit. Go to your Supabase dashboard → Authentication → Settings → " +
          "turn OFF 'Confirm email', save, then try again."
      );
    }
    throw new Error(signUpError.message || "Signup failed");
  }
  if (!signUpData.user) {
    throw new Error("No user returned from signup");
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: signUpData.user.id,
    username,
    display_name: username,
    avatar_url: null,
  });

  if (profileError) {
    console.warn(
      "Profile creation skipped (table may not exist):",
      profileError.message
    );
  }

  return true;
}

// Log in
export async function login(username: string, password: string) {
  const email = `${username.toLowerCase()}@app.local`;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Login error:", error);
    return false;
  }
  if (!data.user) return false;
  return true;
}

// Get current session user profile
export async function getCurrentUser(): Promise<Profile | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session?.user) return null;

  const user = sessionData.session.user;
  const username =
    user.user_metadata?.username ||
    user.email?.replace("@app.local", "") ||
    "User";

  // Try the profiles table first
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.warn("Profile fetch error:", profileError.message);
  }

  if (profile) {
    return {
      ...profile,
      display_name:
        profile.display_name || user.user_metadata?.display_name || username,
      avatar_url: profile.avatar_url || user.user_metadata?.avatar_url || null,
    };
  }

  // Fallback: use auth metadata
  return {
    id: user.id,
    username,
    display_name: user.user_metadata?.display_name || username,
    avatar_url: user.user_metadata?.avatar_url || null,
    created_at: user.created_at || new Date().toISOString(),
  };
}

// Log out
export async function logout() {
  await supabase.auth.signOut();
}

// Update profile
export async function updateProfile(updates: {
  username?: string;
  display_name?: string;
  avatar_url?: string | null;
}) {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session?.user) throw new Error("Not authenticated");

  const user = sessionData.session.user;
  const userId = user.id;

  const username =
    updates.username ||
    user.user_metadata?.username ||
    user.email?.replace("@app.local", "") ||
    "User";

  // 1) Upsert into profiles table
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, username, ...updates }, { onConflict: "id" });

  if (error) {
    console.error("Profile upsert failed:", error.message);
    throw new Error(`Profile save failed: ${error.message}`);
  }

  // 2) Mirror into auth user_metadata so getCurrentUser fallback stays in sync
  const metaUpdates: Record<string, any> = { username };
  if (updates.display_name !== undefined)
    metaUpdates.display_name = updates.display_name;
  if (updates.avatar_url !== undefined)
    metaUpdates.avatar_url = updates.avatar_url;

  const { error: metaError } = await supabase.auth.updateUser({
    data: metaUpdates,
  });

  if (metaError) {
    console.error("Auth metadata update failed:", metaError.message);
    throw new Error(`Profile save failed: ${metaError.message}`);
  }
}

// Upload avatar image to Supabase Storage.
//
// FIX (Android 404): fetch() cannot read Android content:// URIs returned by
// Expo ImagePicker — it always 404s. We use expo-file-system instead, which
// handles both file:// and content:// URIs correctly on Android.
//
// FIX (CDN caching): each upload gets a timestamp-based filename so the stored
// URL is always brand-new — no stale CDN cache can match it.
export async function uploadAvatar(uri: string): Promise<string> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session?.user) {
    throw new Error("Not authenticated");
  }

  // Verify the file exists before attempting to read it
  const fileInfo = await FileSystem.getInfoAsync(uri);
  if (!fileInfo.exists) {
    throw new Error("Could not read image file (file not found)");
  }

  // Read the file as base64 — works with both file:// and content:// URIs on Android
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  if (!base64 || base64.length === 0) {
    throw new Error("Could not read image file (empty file)");
  }

  // Convert base64 → Uint8Array for Supabase upload
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Infer extension from the URI (ImagePicker URIs usually have an extension)
  const uriLower = uri.toLowerCase();
  const ext = uriLower.includes(".png")
    ? "png"
    : uriLower.includes(".webp")
    ? "webp"
    : "jpg";

  const contentType =
    ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

  // Unique filename per upload → guaranteed fresh CDN URL every time
  const timestamp = Date.now();
  const userId = sessionData.session.user.id;
  const filePath = `${userId}/avatar-${timestamp}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, bytes, {
      upsert: true,
      contentType,
    });

  if (uploadError) {
    console.error("Upload error:", uploadError.message);
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
  console.log("Avatar publicUrl:", data.publicUrl);
  return data.publicUrl;
}
