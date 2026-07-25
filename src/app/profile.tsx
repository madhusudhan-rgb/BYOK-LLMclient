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
import {
  getCurrentUser,
  logout,
  updateProfile,
  uploadAvatar,
} from "../utils/auth";

// const { width: SCREEN_WIDTH } = Dimensions.get("window");

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
  // const [displayDate, setDisplayDate] = useState("");
  const [editingName, setEditingName] = useState(false);
  // const [editingDatejoined, setEditingDate] = useState(false);
  const [saving, setSaving] = useState(false);

  // const bannerX = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          const current = await getCurrentUser();
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
      return () => { cancelled = true; };
    }, [])
  );
//BANNER ANIMATION (buggy syntax but it works lol)
  // useEffect(() => {
  //   const animation = Animated.loop(
  //     Animated.sequence([
  //       Animated.timing(bannerX, {
  //         toValue: -500,
  //         duration: 10000,
  //         easing: Easing.linear,
  //         useNativeDriver: true,
  //       }),
  //       Animated.timing(bannerX, {
  //         toValue: SCREEN_WIDTH,
  //         duration: 0,
  //         useNativeDriver: true,
  //       }),
  //     ])
  //   );
  //   animation.start();
  //   return () => animation.stop();
  // }, []);

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
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled && result.assets?.[0]) {
        const uri = result.assets[0].uri;
        setProfileImage(uri);
        try {
          const publicUrl = await uploadAvatar(uri);
          await updateProfile({ avatar_url: publicUrl });
          setProfileImage(publicUrl);
          setUser((prev: any) => prev ? { ...prev, avatar_url: publicUrl } : prev);
        } catch (err) {
          setProfileImage(previousAvatar);
          Alert.alert("Upload Issue", err instanceof Error ? err.message : "Unknown error");
        }
      }
    } catch {
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const saveDisplayName = async () => {
    const trimmed = displayName.trim();
    if (!trimmed) { Alert.alert("Error", "Display name cannot be empty"); return; }
    setSaving(true);
    try {
      await updateProfile({ display_name: trimmed });
      setEditingName(false);
      setUser((prev: any) => prev ? { ...prev, display_name: trimmed } : prev);
    } catch {
      Alert.alert("Error", "Failed to save name");
    } finally {
      setSaving(false);
    }
  };
// const saveDisplayDate = async() => {
//   const trimmed  = displayDate.trim();
//   if (!trimmed ) {Alert.alert("error", "displaydate cannot be empty") ; return;}
//   setSaving(true);
//   try {
//     await updateProfile({ display_Date : trimmed});
//     setEditingDate(false);
//     setUser((prev : any) => prev ? {...prev, display_Date : trimmed}: prev);}
//     catch {
//       Alert.alert("error", "Failed to save date");
//     }
//     finally {
//       setSaving(false);
//     }
//   };

// }
  const handleLogout = async () => {
    Alert.alert("Log out", `Log out as ${displayName}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out", style: "destructive", onPress: async () => {
          await logout();
          setUser(null);
          setProfileImage(null);
          router.replace("/login");
        }
      },
    ]);
  };

  const avatarSource = profileImage
    ? { uri: profileImage }
    : require("../../assets/images/profile.jpg");

  return (
    <ImageBackground source = {require("../../assets/images/bgprof23.jpg")} style = {styles.bg}>
    <View style={[styles.bg]}>
      {/* Dark overlay */}
      <View style={styles.overlay} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>Profile</Text>
        <Pressable onPress={() => setOpen(!open)} style={styles.menuBtn}>
          <Ionicons name="menu" size={24} color="#fff" />
        </Pressable>
      </View>

      {/* Dropdown menu */}
      {open && (
        <View style={styles.popup}>
          {!user && (
            <Pressable style={styles.option} onPress={() => { setOpen(false); router.push("/login"); }}>
              <Text style={styles.optionText}>Login / Signup</Text>
            </Pressable>
          )}
          <Pressable style={styles.option} onPress={() => { setOpen(false); router.push("/contact"); }}>
            <Text style={styles.optionText}>More Info</Text>
          </Pressable>
          {/* <Pressable style={styles.option} onPress={() => {handleLogout}}>
            <Text style={styles.optionText}>Log out</Text>
          </Pressable> */}
           {/* Logout */}
          {user && (
        <Pressable style={styles.option} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      )}
          <Pressable style={styles.option} onPress={() => { setOpen(false); router.push("/settingstab"); }}>
            <Text style={styles.optionText}>Settings</Text>
          </Pressable>
          <Pressable style={[styles.option, { borderBottomWidth: 0 }]} onPress={() => setOpen(false)}>
            <Text style={styles.optionText}>Close</Text>
          </Pressable>
        </View>
      )}

      {/* Avatar + name */}
      
      <View style={styles.profileSection}>
        <Pressable onPress={pickImage} style={styles.avatarWrap}>
          <Image
            key={profileImage ?? "default"}
            source={avatarSource}
            style={styles.avatar}
          />
          <View style={styles.avatarBadge}>
            <Ionicons name="camera" size={12} color="#fff" />
          </View>
        </Pressable>
        {/* {editingDatejoined ? (
          <View style={styles.editRow}>
            <TextInput
              style={styles.nameInput}
              value={displayDate}
              onChangeText={setDisplayName}
              placeholder="Display name"
              placeholderTextColor="#555"
              autoFocus
            />
            <Pressable style={styles.saveBtn} onPress={saveDisplayDate} disabled={saving}>
              <Text style={styles.saveBtnText}>{saving ? "…" : "Save"}</Text>
            </Pressable>
            <Pressable onPress={() => { setEditingDate(false); setDisplayDate(user?.display_date || user?.date || ""); }}>
              <Ionicons name="close" size={20} color="#666" />
            </Pressable>
          </View>
        ) : (
              <Pressable onPress={() => setEditingDate(true)} style={styles.nameWrap}>
            <Text style={styles.displayName}>{displayName || "Tap to set a date"}</Text>
            <Text style={styles.username}>@{user?.username || "Date joined : N/A"}</Text>
          </Pressable>
        )} */}
        <Pressable onPress = {()=>alert("Date you joined feature is coming soon!!!")} style= {{position : "absolute", bottom  : 176}}>
          <Text style=  {{color : "white", fontWeight : "200"}}>Joined date : N/A</Text>
          </Pressable>
        {editingName ? (
          <View style={styles.editRow}>
            <TextInput
              style={styles.nameInput}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Display name"
              placeholderTextColor="#555"
              autoFocus
            />
            <Pressable style={styles.saveBtn} onPress={saveDisplayName} disabled={saving}>
              <Text style={styles.saveBtnText}>{saving ? "…" : "Save"}</Text>
            </Pressable>
            <Pressable onPress={() => { setEditingName(false); setDisplayName(user?.display_name || user?.username || ""); }}>
              <Ionicons name="close" size={20} color="#666" />
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => setEditingName(true)} style={styles.nameWrap}>
            <Text style={styles.displayName}>{displayName || "Tap to set name"}</Text>
            <Text style={styles.username}>@{user?.username || "guest"}</Text>
          </Pressable>
        )}
      </View>
    {/* Main banner */}
      {/* Scrolling banner */}
      {/* <View style={styles.bannerWrap}>
        <Animated.View style={{ transform: [{ translateX: bannerX }] }}>
          <Text style={styles.bannerText}>
            ✦ New models added! Check it out{displayName ? `, ${displayName}` : ""}
          </Text>
        </Animated.View>
      </View> */}
    </View>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(9, 9, 9, 0)",
  },

  /* Top bar */
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  screenTitle: { color: "#fafafa", fontSize: 18, fontWeight: "700" },
  menuBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(1, 1, 1, 0.75)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Popup */
  popup: {
    position: "absolute",
    top: 108,
    right: 20,
    width: 190,
    backgroundColor: "#0b0a0afe",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    overflow: "hidden",
    zIndex: 20,
    elevation: 10,
  },
  option: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
    
  },
  optionText: { color: "#efeeee", fontSize: 15 },

  /* Profile */
  profileSection: {
    alignItems: "center",
    paddingTop: 40,
    gap: 16,
    position : "absolute",
    right : 63,
    height  : 400,
    top : 100,
    width : "70%",
    borderRadius : 45,
    backgroundColor : "rgba(9, 9, 9, 0)"
  },
  avatarWrap: { position: "relative" },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: "rgba(0, 236, 16, 0.99)",
  },
  avatarBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#030303",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#111",
  },
  nameWrap: { alignItems: "center", gap: 4 },
  displayName: { color: "#fbf4f4", fontSize: 20, fontWeight: "200" },
  username: { color: "rgba(254, 243, 243, 0.72)", fontSize: 13 },

  /* Edit name */
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
  },
  nameInput: {
    flex: 1,
    backgroundColor: "#1c1c1c",
    color: "#f2e2e2",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#333",
  },
  saveBtn: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  saveBtnText: { color: "#111", fontWeight: "700", fontSize: 13 },

  /* Logout */
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "center",
    marginTop: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,69,58,0.3)",
    backgroundColor: "rgba(255,69,58,0.08)",
  },
  logoutText: { color: "#ff453a", fontWeight: "600", fontSize: 14 },

  /* Banner */
  // bannerWrap: {
  //   position: "absolute",
  //   bottom: 60,
  //   left: 0,
  //   right: 0,
  //   overflow: "hidden",
  //   paddingVertical: 8,
  //   backgroundColor: "rgba(0, 0, 0, 0)",
  // },
  // bannerText: {
  //   color: "#000000",
  //   fontSize: 14,
  //   fontWeight: "600",
  //   letterSpacing: 0.3,
  //   paddingHorizontal: 16,
  //   width: 500,
  // },
});