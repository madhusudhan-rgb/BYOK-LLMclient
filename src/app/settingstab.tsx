import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import {
  Alert,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../utils/supabase";
import { getCurrentUser } from "../utils/auth";
import { isNativePlatformSupported } from "react-native-screens/lib/typescript/core";

// ─── Storage keys
const KEYS = {
  haptics:    "@settings/haptics",
  timestamps: "@settings/timestamps",
};

// ─── Types 
type Profile = { id: string; full_name: string | null; email: string | null };

// ─── Helpers
function initial(name: string | null | undefined) {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase();
}

// ─── Row components
function RowDivider() {
  return <View style={s.rowDivider} />;
}

function Row({
  label,
  subtitle,
  onPress,
  rightElement,
  destructive = false,
  last = false,
}: {
  label: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
  last?: boolean;
}) {
  return (
    <>
      <Pressable
        style={({ pressed }) => [s.row, pressed && onPress ? s.rowPressed : null]}
        onPress={onPress}
        disabled={!onPress && !rightElement}
      >
        <View style={s.rowLeft}>
          <Text style={[s.rowLabel, destructive && s.rowDestructive]}>{label}</Text>
          {subtitle ? <Text style={s.rowSub}>{subtitle}</Text> : null}
        </View>
        {rightElement ?? (
          onPress ? (
            <Ionicons name="chevron-forward" size={15} color="rgba(255,255,255,0.22)" />
          ) : null
        )}
      </Pressable>
      {!last && <RowDivider />}
    </>
  );
}

function SectionLabel({ label }: { label: string }) {
  return <Text style={s.sectionLabel}>{label}</Text>;
}

function Group({ children }: { children: React.ReactNode }) {
  return <View style={s.group}>{children}</View>;
}

// ─── Main screen───
export default function SettingsScreen() {
  const [profile, setProfile]       = useState<Profile | null>(null);
  const [haptics, setHaptics]       = useState(true);
  const [timestamps, setTimestamps] = useState(false);
  const [chatCount, setChatCount]   = useState<number | null>(null);
  const [modelCount, setModelCount] = useState<number | null>(null);
  const [loading, setLoading]       = useState(true);

  // ── Load everything on mount ──
  useEffect(() => {
    (async () => {
      const [h, ts, user] = await Promise.all([
        AsyncStorage.getItem(KEYS.haptics),
        AsyncStorage.getItem(KEYS.timestamps),
        getCurrentUser(),
      ]);
      if (h !== null)  setHaptics(h === "true");
      if (ts !== null) setTimestamps(ts === "true");

      if (user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .eq("id", user.id)
          .single();
        if (prof) setProfile(prof as Profile);

        const [{ count: cc }, { count: mc }] = await Promise.all([
          supabase
            .from("chat_sessions")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id),
          supabase
            .from("custom_models")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id),
        ]);
        setChatCount(cc ?? 0);
        setModelCount(mc ?? 0);
      }

      setLoading(false);
    })();
  }, []);

  // ── Toggle helpers ──
  async function toggleHaptics(v: boolean) {
     alert("Haptics : "  + haptics)
   
    setHaptics(v);
    
    await AsyncStorage.setItem(KEYS.haptics, String(v));
    
    if (v) Haptics.selectionAsync();
  }

  async function toggleTimestamps(v: boolean) {
    alert("Timestamps : " + timestamps)
    setTimestamps(v);
    await AsyncStorage.setItem(KEYS.timestamps, String(v));
    if (haptics) Haptics.selectionAsync();
  }

  // ── Destructive actions ──
  function confirmClearChats() {
    if (haptics) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Clear all chats?",
      `This will permanently delete ${chatCount ?? "all"} conversation${chatCount === 1 ? "" : "s"}. This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete all",
          style: "destructive",
          onPress: async () => {
            const user = await getCurrentUser();
            if (!user) return;
            await supabase.from("chat_sessions").delete().eq("user_id", user.id);
            setChatCount(0);
            if (haptics) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  }

  function confirmDeleteApiKeys() {
    if (haptics) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Delete all API keys?",
      `This will remove ${modelCount ?? "all"} saved model${modelCount === 1 ? "" : "s"} and their keys. This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete all",
          style: "destructive",
          onPress: async () => {
            const user = await getCurrentUser();
            if (!user) return;
            await supabase.from("custom_models").delete().eq("user_id", user.id);
            setModelCount(0);
            if (haptics) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  }

  function confirmSignOut() {
    if (haptics) Haptics.selectionAsync();
    Alert.alert("Sign out?", "You'll be returned to the login screen.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace("/login");
        },
      },
    ]);
  }

  // ── Version string ──
  // Note: In Expo SDK 57, use expoConfig from app.json or manifest.version
  const version = (Constants.expoConfig as any)?.version ?? "—";
  const build   = (Constants.expoConfig as any)?.ios?.buildNumber
    ?? (Constants.expoConfig as any)?.android?.versionCode?.toString()
    ?? null;
  const versionLabel = build ? `${version} (${build})` : version;

  // ── Render ──
  return (
    <ImageBackground source={require("../../assets/images/bgexplore.jpg")} style={s.fill}>
      <View style={s.overlay} />

      <SafeAreaView style={s.fill} edges={["top"]}>
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
        >
          
          <Text style={s.pageTitle}>Settings</Text>

          {/*Profile card */}
          {/* <Pressable
            style={({ pressed }) => [s.profileCard, pressed && s.rowPressed]}
            onPress={() => router.push("/profile")}
          >
            <View style={s.avatar}>
              <Text style={s.avatarText}>{initial(profile?.full_name)}</Text>
            </View>
            <View style={s.profileInfo}>
              <Text style={s.profileName} numberOfLines={1}>
                {loading ? "Loading…" : (profile?.full_name ?? "Your Account")}
              </Text>
              <Text style={s.profileEmail} numberOfLines={1}>
                {profile?.email ?? ""}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={15} color="rgba(255,255,255,0.22)" />
          </Pressable> */}

          {/* ── Notifications */}
          <SectionLabel label="NOTIFICATIONS" />
          <Group>
            <Row
              label="Notification settings"
              subtitle="Manage in system settings"
              onPress={() => Linking.openURL("app-settings:")}
              last
            />
          </Group>

          {/* ── Chat behavior */}
          <SectionLabel label="CHAT" />
          <Group>
            <Row
              label="Show timestamps"
              subtitle={timestamps ? "Shown" : "Hidden"}
              rightElement={
                <Switch
                  value={timestamps}
                  onValueChange={toggleTimestamps}
                  trackColor={{ false: "rgba(255,255,255,0.12)", true: "rgba(255,255,255,0.9)" }}
                  thumbColor={Platform.OS === "android" ? (timestamps ? "#000" : "#fff") : undefined}
                  ios_backgroundColor="rgba(255,255,255,0.12)"
                />
              }
            />
            <Row
              label="Haptic feedback"
              subtitle={haptics ? "On" : "Off"}
              rightElement={
                <Switch
                  value={haptics}
                  onValueChange={toggleHaptics}
                  trackColor={{ false: "rgba(255,255,255,0.12)", true: "rgba(255,255,255,0.9)" }}
                  thumbColor={Platform.OS === "android" ? (haptics ? "#000" : "#fff") : undefined}
                  ios_backgroundColor="rgba(255,255,255,0.12)"
                />
              }
            />
            <Row
              label="Clear chat history"
              subtitle={
                chatCount === null ? "Loading…"
                : chatCount === 0  ? "No conversations saved"
                : `${chatCount} conversation${chatCount === 1 ? "" : "s"}`
              }
              onPress={chatCount ? confirmClearChats : undefined}
              destructive={!!chatCount}
              last
            />
          </Group>

          {/* ── Models & keys  */}
          <SectionLabel label="MODELS & API KEYS" />
          <Group>
            <Row
              label="Manage models"
              subtitle={
                modelCount === null ? "Loading…"
                : modelCount === 0  ? "No models added"
                : `${modelCount} model${modelCount === 1 ? "" : "s"} saved`
              }
              onPress={() => router.push("/apikeys")}
            />
            <Row
              label="Delete all API keys"
              subtitle={modelCount ? "Removes all saved models and keys" : "Nothing to delete"}
              onPress={modelCount ? confirmDeleteApiKeys : undefined}
              destructive={!!modelCount}
              last
            />
          </Group>

          {/* ── About */}
          <SectionLabel label="ABOUT" />
          <Group>
            <Row
              label="Version"
              subtitle={versionLabel}
              last={false}
            />
            {/* <Row
              label="Rate the app"
              onPress={() =>
                Linking.openURL(
                  Platform.OS === "ios"
                    ? "https://apps.apple.com/app/idYOUR_APP_ID"
                    : "https://play.google.com/store/apps/details?id=YOUR_PACKAGE_NAME"
                )
              }
            />
            <Row
              label="Privacy policy"
              onPress={() => Linking.openURL("https://go")}
            />
            <Row
              label="Terms of service"
              onPress={() => Linking.openURL("https://your-domain.com/terms")}
              last
            /> */}
          </Group>

          {/* ── Sign out ────*/}
          <SectionLabel label="" />
          {/* <Group>
            <Pressable
              style={({ pressed }) => [s.row, s.signOutRow, pressed && s.rowPressed]}
              onPress={confirmSignOut}
            >
              <Text style={[s.rowLabel, s.rowDestructive, { textAlign: "center", flex: 1 }]}>
                Sign out
              </Text>
            </Pressable>
          </Group> */}

          <View style={{ height: 48 }} />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

// ─── Styles────────
const s = StyleSheet.create({
  fill:    { flex: 1 },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0, 0, 0, 0.27)" },
  scroll:  { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 12 },

  // Page header
  pageTitle: {
    fontSize: 30,
    fontWeight: "300",
    color: "#fff",
    letterSpacing: -0.5,
    marginBottom: 24,
    marginLeft: 4,
  },

  // Profile card
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(19, 19, 19, 0.69)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(5, 4, 4, 0)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  profileEmail: {
    color: "rgba(255,255,255,0.38)",
    fontSize: 13,
  },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.7,
    color: "rgba(246, 245, 245, 0.93)",
    marginTop: 22,
    marginBottom: 6,
    marginLeft: 4,
  },

  // Group container
  group: {
    backgroundColor: "rgba(11, 10, 10, 0.35)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(15, 15, 15, 0.14)",
    borderRadius: 14,
    overflow: "hidden",
  },

  // Row
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 13,
    minHeight: 50,
  },
  rowPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.13)",
  },
  rowLeft: {
    flex: 1,
    marginRight: 12,
    gap: 2,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: "400",
    color: "#fff",
  },
  rowSub: {
    fontSize: 12,
    color: "rgba(246, 237, 237, 0.82)",
    marginTop: 1,
  },
  rowDestructive: {
    color: "#ff453a",
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255, 255, 255, 0.33)",
    marginLeft: 16,
  },

  // Sign out row
  // signOutRow: {
  //   justifyContent: "center",
  // },
});