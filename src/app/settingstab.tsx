import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
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

const KEYS = {
  haptics:    "@settings/haptics",
  timestamps: "@settings/timestamps",
};

type Profile = { id: string; full_name: string | null; email: string | null };

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

export default function SettingsScreen() {
  const [profile, setProfile]       = useState<Profile | null>(null);
  const [haptics, setHaptics]       = useState(true);
  const [timestamps, setTimestamps] = useState(false);
  const [chatCount, setChatCount]   = useState<number | null>(null);
  const [modelCount, setModelCount] = useState<number | null>(null);
  const [loading, setLoading]       = useState(true);

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

  async function toggleHaptics(v: boolean) {
    setHaptics(v);
    await AsyncStorage.setItem(KEYS.haptics, String(v));
    if (v) Haptics.selectionAsync();
  }

  async function toggleTimestamps(v: boolean) {
    setTimestamps(v);
    await AsyncStorage.setItem(KEYS.timestamps, String(v));
    if (haptics) Haptics.selectionAsync();
  }

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

  // Fixed deprecated constants
  const version = Constants?.expoConfig?.version ?? "1.5.0";
  const build   = (Constants?.expoConfig as any)?.android?.versionCode?.toString() ?? "1";
  const versionLabel = `${version} (${build})`;

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

          <SectionLabel label="ABOUT" />
          <Group>
            <Row
              label="Version"
              subtitle={versionLabel}
              last={true}
            />
          </Group>

          <View style={{ height: 48 }} />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  fill:    { flex: 1 },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0, 0, 0, 0.27)" },
  scroll:  { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 12 },

  pageTitle: {
    fontSize: 30,
    fontWeight: "300",
    color: "#fff",
    letterSpacing: -0.5,
    marginBottom: 24,
    marginLeft: 4,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.7,
    color: "rgba(246, 245, 245, 0.93)",
    marginTop: 22,
    marginBottom: 6,
    marginLeft: 4,
  },

  group: {
    backgroundColor: "rgba(11, 10, 10, 0.35)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(15, 15, 15, 0.14)",
    borderRadius: 14,
    overflow: "hidden",
  },

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
});
