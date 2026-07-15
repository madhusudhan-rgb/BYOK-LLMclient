import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { getCurrentUser, logout, updateProfile, uploadAvatar } from "../utils/auth";
import DateTimePicker from '@react-native-community/datetimepicker'
const { width: SCREEN_WIDTH } = Dimensions.get("window");
export default function Profile() {
  return (
    <ErrorBoundary>
      <ProfileContent />
    </ErrorBoundary>
  );
}
function ProfileContent() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [saving, setSaving] = useState(false);
  const bannerStart = 220;
  const bannerEnd = -200;
  const bannerX = useRef(new Animated.Value(bannerStart)).current;
  // Reload user data every time this screen gets focus
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          const current = await getCurrentUser();
          console.log("PROFILE LOADED:", current);
          if (!cancelled) {
            setUser(current);
            if (current) {
              setProfileImage(current.avatar_url);
              setDisplayName(current.display_name || current.username);
            } else {
              setProfileImage(null);
              setDisplayName("");
            }
          }
        } catch (error) {
          console.error("Failed to load user:", error);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [])
  );
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(bannerX, { toValue: bannerEnd, duration: 10000, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(bannerX, { toValue: bannerStart, duration: 0, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [bannerEnd, bannerStart]);
  const pickImage = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please log in to change your profile picture.");
      return;
    }
    const previousAvatar = profileImage;
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission Required", "Permission to access your photos is required.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        const uri = result.assets[0].uri;
        setProfileImage(uri);
        try {
          const publicUrl = await uploadAvatar(uri);
          console.log("Uploaded avatar:", publicUrl);
          await updateProfile({ avatar_url: publicUrl });
          setProfileImage(publicUrl);
          setUser((prev: any) =>
            prev ? { ...prev, avatar_url: publicUrl } : prev
          );
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
          setProfileImage(previousAvatar);
          Alert.alert("Upload Issue", message);
          console.error("Avatar upload failed:", message);
        }
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };
  const saveDisplayName = async () => {
    const trimmed = displayName.trim();
    if (!trimmed) {
      Alert.alert("Error", "Display name cannot be empty");
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ display_name: trimmed });
      setEditingName(false);
      setUser((prev: any) =>
        prev ? { ...prev, display_name: trimmed } : prev
      );
    } catch (err) {
      Alert.alert("Error", "Failed to save name");
    } finally {
      setSaving(false);
    }
  };
  const handleLogout = async () => {
    alert(displayName + "You have logged out");
    await logout();
    setUser(null);
    setProfileImage(null);
    router.replace("/login");
  };
  const avatarSource = profileImage
    ? { uri: profileImage }
    : require("../../assets/images/profile.jpg");
  return (
    <ImageBackground source={require("../../assets/images/login.avif")} style={styles.background}>
      <View style={styles.container}>
        <View style={styles.prof}>
          <Pressable style={styles.profileButton} onPress={() => setOpen(!open)}>
            <Ionicons name="menu" size={28} color="white" />
          </Pressable>
          <Pressable onPress={pickImage} style={styles.imageContainer}>
            <Image key={profileImage ?? "default"} source={avatarSource} style={styles.profimg} />
          </Pressable>
          {editingName ? (
            <View style={styles.editNameRow}>
              <TextInput
                style={styles.nameInput}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Display name"
                placeholderTextColor="#888"
                autoFocus
              />
              <Pressable style={styles.saveNameBtn} onPress={saveDisplayName} disabled={saving}>
                <Text style={styles.saveNameText}>{saving ? "..." : "Save"}</Text>
              </Pressable>
              <Pressable onPress={() => {
                setEditingName(false);
                setDisplayName(user?.display_name || user?.username || "");
              }}>
                <Ionicons name="close" size={20} color="#fff" />
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={() => setEditingName(true)} style={styles.nameContainer}>
              <Text style={styles.Proftext}>{displayName || "Tap to set name"}</Text>
              <Text style={styles.usernameText}>@{user?.username || "guest"}</Text>
            </Pressable>
          )}
          {user && (
            <Pressable style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          )}
          {open && (
            <View style={styles.popup}>
              {!user && (
                <Pressable style={styles.option} onPress={() => {
                  setOpen(false);
                  router.push("/login");
                }}>
                  <Text style={styles.optionText}>Login / Signup</Text>
                </Pressable>
              )}
              <Pressable style={styles.option} onPress={() => {
                setOpen(false);
                router.push("/contact");
              }}>
                <Text style={styles.optionText}>More info</Text>
              </Pressable>
              <Pressable style={styles.option} onPress={() => setOpen(false)}>
                <Text style={styles.optionText}>Close</Text>
              </Pressable>
            </View>
          )}
        </View>
        <View style={styles.content}>
          <View style={styles.banner}>
            <Animated.View style={[styles.bannerTrack, { transform: [{ translateX: bannerX }] }]}>
             <Text style={styles.bannerText}>
                  New models added!!! Check it out {displayName}
                   </Text>
            </Animated.View>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  prof: {
    width: SCREEN_WIDTH * 0.9,
    maxWidth: 360,
    borderRadius: 25,
    backgroundColor: "rgba(71, 67, 67, 0.24)",
    borderWidth: 1,
    borderColor: "rgba(186, 173, 173, 0.06)",
    padding: 20,
    paddingTop: 56,
    alignItems: "center",
    minHeight: 240,
    marginTop: 100,
  },
  imageContainer: { marginBottom: 12 },
  profimg: { width: 78, height: 78, borderRadius: 39 },
  nameContainer: { alignItems: "center", marginBottom: 16 },
  Proftext: { fontSize: 16, fontWeight: "bold", color: "white", textAlign: "center" },
  usernameText: { fontSize: 12, color: "#ffffff", textAlign: "center", marginTop: 2 },
  editNameRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 8 },
  nameInput: {
    backgroundColor: "#222",
    color: "white",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    minWidth: 140,
    borderWidth: 1,
    borderColor: "#444",
  },
  saveNameBtn: { backgroundColor: "#00cc2c", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  saveNameText: { color: "white", fontWeight: "700", fontSize: 13 },
  logoutBtn: { backgroundColor: "#cc2200", borderRadius: 10, paddingHorizontal: 20, paddingVertical: 8, marginTop: -174, height: 32, marginLeft : -230 },
  logoutText: { color: "white", fontWeight: "700", fontSize: 14 },
  profileButton: { position: "absolute", top: 16, right: 16 },
  popup: {
    position: "absolute",
    top: 56,
    right: 16,
    width: 200,
    backgroundColor: "#222",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 10,
  },
  option: { paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#333" },
  optionText: { color: "white", fontSize: 16 },
  content: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 24 },
  banner: { width: "120%", height: 34, borderRadius: 999, overflow: "hidden", justifyContent: "center", position: "absolute", bottom: 800 },
  bannerTrack: { flexDirection: "row", alignSelf: "flex-start", paddingHorizontal: 8, gap: 8 },
  bannerItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, marginRight: 8 },
  // bannerImage: { width: 25, height: 25, borderRadius: 2, marginRight: 6 },
  bannerText: { color: "#fff8f8", fontSize: 15, fontWeight: "600", letterSpacing: 0.3 },
});
