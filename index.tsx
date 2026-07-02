import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";

import {
  Alert,
  Animated,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomModal, ModalConfig } from "../components/CustomModal";
export default function Home() {
  useEffect(() => {
  Alert.alert("Updates and Patches", ":New feedback system added\n:New and updated ui with Custom modal\n:Better layout and fixed some bugs with optimization\n:Search bar added with other AI models(Nvidias neomotron ultra, gemini and gpt-oss-120b )\nNew image generation models added as well\n\nRELEASE 1.2.0\n\nMore updates incoming and Please give us feedbacks(Yes the feedback button works and its on the top right corner of the home page)\n\nThanks for using the APP");
}, []);
  const router = useRouter();
  const scaleAI       = useRef(new Animated.Value(1)).current;
  const scaleFeedback = useRef(new Animated.Value(1)).current;
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig]   = useState<ModalConfig | null>(null);
  const showModal = (config: ModalConfig) => {
    setModalConfig(config);
    setModalVisible(true);
  };
  
  const bounce = (scale: Animated.Value, cb?: () => void) => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1,    duration: 80, useNativeDriver: true }),
    ]).start(cb);
  };
  const sendFeedback = async (rating: "Good" | "Bad") => {
    try {
      const res = await fetch("https://formspree.io/f/mojowgkw", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ feedback: rating, message: `User rated the app ${rating}` }),
      });
      showModal(res.ok
        ? { title: "✅ Thanks!", message: "Your feedback has been sent.", buttons: [{ text: "Close", style: "cancel" }] }
        : { title: "Error", message: "Failed to send feedback.", buttons: [{ text: "OK", style: "cancel" }] }
      );
    } catch {
      showModal({ title: "Error", message: "Network error. Try again.", buttons: [{ text: "OK", style: "cancel" }] });
    }
  };
  return (
    <ImageBackground
      source={require("../../assets/images/bg.jpg")}
      resizeMode="cover"
      style={styles.background}
    >
      <View style={styles.overlay} />
      <CustomModal
        visible={modalVisible}
        config={modalConfig}
        onClose={() => setModalVisible(false)}
      />
      <SafeAreaView style={styles.safeArea}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable
            style={styles.iconBtn}
            onPress={() => showModal({
              title: "ℹ️ About",
              message: "App is in development.\n\nWe use groq, openrouter and some opensource models to power our app\n\nWe do not own anything related to the AI except the API codes",
              buttons: [{ text: "Got it", style: "cancel" }],
            })}
          >
            <Text style={styles.iconBtnText}>?</Text>
          </Pressable>
          <Pressable
            style={styles.iconBtn}
            onPress={() => {
              bounce(scaleFeedback);
              showModal({
                title: "Rate Us",
                message: "How are we doing? Your feedback helps us improve.",
                buttons: [
                  { text: "👍 Good", onPress: () => sendFeedback("Good") },
                  { text: "👎 Bad",  onPress: () => sendFeedback("Bad"), style: "danger" },
                  { text: "Cancel",  style: "cancel" },
                ],
              });
            }}
          >
            <Animated.View style={{ transform: [{ scale: scaleFeedback }] }}>
              <MaterialIcons name="feedback" size={22} color="#fff" />
            </Animated.View>
          </Pressable>
        </View>
        {/* Main content */}
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.badge}>v1.2.0 BETA</Text>
            <Text style={styles.title}>Welcome</Text>
            <Text style={styles.subtitle}>
              Your personal AI assistant, powered by Groq
            </Text>
            <Pressable onPress={() => bounce(scaleAI, () => router.push("/explore"))}>
              <Animated.View style={[styles.primaryBtn, { transform: [{ scale: scaleAI }] }]}>
                <Text style={styles.primaryBtnText}>Launch Main AI Chat →</Text>
              </Animated.View>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  safeArea: { flex: 1 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnText: { color: "#fff", fontSize: 20, fontWeight: "700" },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 110,
  },
  card: {
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    top:-200,
  },
  badge: {
    color: "#00cc2c",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  subtitle: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  primaryBtn: {
    backgroundColor: "#00cc2c",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 50,
    marginTop: 24,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});