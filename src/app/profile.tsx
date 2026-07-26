import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavbar } from "../context/NavbarContext";
import { getCurrentUser, logout } from "../utils/auth";
import { supabase } from "../utils/supabase";

export default function Profile() {
  const { setShowNavbar } = useNavbar();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setShowNavbar(true);
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function checkUser() {
    try {
      const u = await getCurrentUser();
      setUser(u);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    Alert.alert("Log out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={[s.fill, { backgroundColor: "#000", justifyContent: "center" }]}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  if (!user) {
    return (
      <ImageBackground source={require("../../assets/images/bgprof23.jpg")} style={s.fill}>
        <View style={s.overlay} />
        <SafeAreaView style={s.fill}>
          <View style={s.emptyInner}>
            <View style={s.emptyIcon}>
              <Ionicons name="person-outline" size={32} color="rgba(255,255,255,0.2)" />
            </View>
            <Text style={s.emptyTitle}>Sign in to sync</Text>
            <Text style={s.emptySubtitle}>
              Create an account to save your API keys and custom models across devices.
            </Text>
            <View style={s.emptyActions}>
              <Pressable style={s.primaryBtn} onPress={() => router.push("/login")}>
                <Text style={s.primaryBtnText}>Log in</Text>
              </Pressable>
              <Pressable style={s.secondaryBtn} onPress={() => router.push("/signup")}>
                <Text style={s.secondaryBtnText}>Sign up</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={require("../../assets/images/bgprof23.jpg")} style={s.fill}>
      <StatusBar barStyle="light-content" />
      <View style={s.overlay} />
      <SafeAreaView style={s.fill}>
        <ScrollView style={s.fill} contentContainerStyle={s.scroll}>
          {/* Profile Header */}
          <View style={s.header}>
            <View style={s.avatarWrap}>
              <View style={s.avatar}>
                <Text style={s.avatarText}>
                  {user.email?.charAt(0).toUpperCase() ?? "U"}
                </Text>
              </View>
              <Pressable style={s.editAvatar}>
                <Ionicons name="camera" size={14} color="#000" />
              </Pressable>
            </View>
            <Text style={s.email}>{user.email}</Text>
            <Text style={s.userId}>ID: {user.id.slice(0, 8)}...</Text>
          </View>

          {/* Stats */}
          <View style={s.statsRow}>
            <View style={s.stat}>
              <Text style={s.statVal}>—</Text>
              <Text style={s.statLab}>Models</Text>
            </View>
            <View style={[s.stat, s.statBorder]}>
              <Text style={s.statVal}>—</Text>
              <Text style={s.statLab}>Chats</Text>
            </View>
            <View style={s.stat}>
              <Text style={s.statVal}>Free</Text>
              <Text style={s.statLab}>Plan</Text>
            </View>
          </View>

          {/* Menu */}
          <View style={s.menu}>
            <Pressable style={s.menuItem} onPress={() => router.push("/apikeys")}>
              <View style={[s.menuIcon, { backgroundColor: "rgba(255,255,255,0.05)" }]}>
                <Ionicons name="key-outline" size={18} color="#fff" />
              </View>
              <Text style={s.menuText}>API Keys</Text>
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.2)" />
            </Pressable>

            <Pressable style={s.menuItem} onPress={() => router.push("/settingstab")}>
              <View style={[s.menuIcon, { backgroundColor: "rgba(255,255,255,0.05)" }]}>
                <Ionicons name="settings-outline" size={18} color="#fff" />
              </View>
              <Text style={s.menuText}>Settings</Text>
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.2)" />
            </Pressable>

            <Pressable style={s.menuItem}>
              <View style={[s.menuIcon, { backgroundColor: "rgba(255,255,255,0.05)" }]}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#fff" />
              </View>
              <Text style={s.menuText}>Privacy</Text>
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.2)" />
            </Pressable>

            <View style={s.divider} />

            <Pressable style={s.menuItem} onPress={handleLogout}>
              <View style={[s.menuIcon, { backgroundColor: "rgba(255,59,48,0.1)" }]}>
                <Ionicons name="log-out-outline" size={18} color="#ff3b30" />
              </View>
              <Text style={[s.menuText, { color: "#ff3b30" }]}>Log out</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  scroll: {
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 32,
  },
  avatarWrap: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "600",
  },
  editAvatar: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#000",
  },
  email: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  userId: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.05)",
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 24,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statBorder: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.1)",
  },
  statVal: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  statLab: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  menu: {
    backgroundColor: "rgba(255,255,255,0.05)",
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: 14,
  },
  emptyInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtitle: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  emptyActions: {
    width: "100%",
    gap: 12,
  },
  primaryBtn: {
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryBtn: {
    height: 50,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  secondaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
