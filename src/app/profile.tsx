import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavbar } from "../context/NavbarContext";
import { getCurrentUser, logout, updateProfile, uploadAvatar } from "../utils/auth";
import { supabase } from "../utils/supabase";

export default function Profile() {
  const { setShowNavbar } = useNavbar();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setShowNavbar(true);
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        checkUser();
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [setShowNavbar]);

  async function checkUser() {
    try {
      const u = await getCurrentUser();
      setUser(u);
      if (u) setNewDisplayName(u.display_name || "");
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

  async function handlePickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission required", "Allow access to your photo library to change your profile picture.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setUploading(true);
      try {
        const publicUrl = await uploadAvatar(uri);
        await updateProfile({ avatar_url: publicUrl });
        await checkUser();
        Alert.alert("Success", "Profile picture updated.");
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to upload avatar.");
      } finally {
        setUploading(false);
      }
    }
  }

  async function handleUpdateDisplayName() {
    if (!newDisplayName.trim()) return;
    setUpdating(true);
    try {
      await updateProfile({ display_name: newDisplayName.trim() });
      await checkUser();
      setEditModalVisible(false);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to update display name.");
    } finally {
      setUpdating(false);
    }
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
            <Text style= {{color : "white", padding : 5, fontWeight : "200", fontSize : 25, margin : 10}}>Profile</Text>
            <View style={s.avatarWrap}>
              <View style={s.avatar}>
                {uploading ? (
                  <ActivityIndicator color="#fff" />
                ) : user.avatar_url ? (
                  <Image source={{ uri: user.avatar_url }} style={s.avatarImg} />
                ) : (
                  <Text style={s.avatarText}>
                    {user.display_name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || "U"}
                  </Text>
                )}
              </View>
              <Pressable style={s.editAvatar} onPress={handlePickImage} disabled={uploading}>
                <Ionicons name="camera" size={14} color="#000" />
              </Pressable>
            </View>
            <View style={s.nameContainer}>
              <Text style={s.displayName}>{user.display_name || user.username}</Text>
              <Pressable onPress={() => setEditModalVisible(true)} style={s.editNameBtn}>
                <Ionicons name="pencil" size={14} color="rgba(255,255,255,0.4)" />
              </Pressable>
            </View>
            <Text style={s.username}>@{user.username}</Text>
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

            <Pressable style={s.menuItem} onPress={() => router.push("/contact")}>
              <View style={[s.menuIcon, { backgroundColor: "rgba(255,255,255,0.05)" }]}>
                <Ionicons name="information-outline" size={18} color="#fff" />
              </View>
              <Text style={s.menuText}>Support</Text>
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

      {/* Edit Display Name Modal */}
      <Modal visible={editModalVisible} transparent animationType="fade" onRequestClose={() => setEditModalVisible(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>Edit Display Name</Text>
            <TextInput
              style={s.modalInput}
              value={newDisplayName}
              onChangeText={setNewDisplayName}
              placeholder="Display Name"
              placeholderTextColor="rgba(255,255,255,0.2)"
              autoFocus
            />
            <View style={s.modalButtons}>
              <Pressable style={s.modalBtnCancel} onPress={() => setEditModalVisible(false)}>
                <Text style={s.modalBtnCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={s.modalBtnSave} onPress={handleUpdateDisplayName} disabled={updating}>
                {updating ? <ActivityIndicator size="small" color="#000" /> : <Text style={s.modalBtnSaveText}>Save</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    overflow: "hidden",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
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
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  displayName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  editNameBtn: {
    padding: 4,
  },
  username: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    fontWeight: "500",
  },
  menu: {
    backgroundColor: "rgba(12, 12, 12, 0.56)",
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(6, 6, 6, 0)",
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
    backgroundColor: "rgba(255, 255, 255, 0.0)",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#1c1c1e",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 10,
    padding: 12,
    color: "#fff",
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalBtnCancel: {
    flex: 1,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnCancelText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 15,
    fontWeight: "600",
  },
  modalBtnSave: {
    flex: 1,
    height: 44,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnSaveText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "600",
  },
});
