import { supabase, Profile } from "./supabase";

// ── Sign up ─────────────────────────────────────────────────────
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
    if (msg.includes("rate_limit") || msg.includes("rate limit") || msg.includes("Rate limit")) {
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
    console.log("Profile creation skipped (table may not exist):", profileError.message);
  }

  return true;
}

// ── Log in ──────────────────────────────────────────────────────
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

// ── Get current session user profile ────────────────────────────
export async function getCurrentUser(): Promise<Profile | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session?.user) return null;

  const user = sessionData.session.user;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profile) return profile;

  const username = user.user_metadata?.username || user.email?.replace("@app.local", "") || "User";
  return {
    id: user.id,
    username,
    display_name: username,
    avatar_url: null,
    created_at: user.created_at || new Date().toISOString(),
  };
}

// ── Log out ─────────────────────────────────────────────────────
export async function logout() {
  await supabase.auth.signOut();
}

// ── Update profile ──────────────────────────────────────────────
export async function updateProfile(updates: {
  display_name?: string;
  avatar_url?: string | null;
}) {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session?.user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", sessionData.session.user.id);

  if (error) {
    console.log("Profile update skipped (table may not exist):", error.message);
  }
}

// ── Upload avatar image to Supabase Storage ─────────────────────
export async function uploadAvatar(uri: string): Promise<string> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session?.user) throw new Error("Not authenticated");

  const ext = uri.split(".").pop()?.toLowerCase() || "jpg";
  const filePath = `avatars/${sessionData.session.user.id}.${ext}`;

  // Fetch the local URI as blob — works on both iOS and Android
  const response = await fetch(uri);
  const blob = await response.blob();

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, blob, {
      upsert: true,
      contentType: `image/${ext === "png" ? "png" : "jpeg"}`,
    });

  if (uploadError) {
    console.error("Upload error:", uploadError.message);
    throw new Error(
      "Avatar upload failed. Make sure you've run the SQL migration in the Supabase dashboard " +
      "to create the 'avatars' storage bucket, and that email confirmation is disabled. " +
      "Error: " + uploadError.message
    );
  }

  const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
  return urlData.publicUrl;
}
