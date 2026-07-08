import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomModal, ModalConfig } from "../components/CustomModal";
import { useNavbar } from "../context/NavbarContext";
import { Link } from "expo-router";

export default function HomeScreen() {
  const { setShowNavbar } = useNavbar();
  const scaleFeedback = useRef(new Animated.Value(1));
  const bannerStart = 220;
  const bannerEnd = -600;
  const bannerX = useRef(new Animated.Value(bannerStart));

  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);

  useEffect(() => {
    setShowNavbar(true);
  }, [setShowNavbar]);

  const showModal = (config: ModalConfig) => {
    setModalConfig(config);
    setModalVisible(true);
  };

  const bounce = (scaleRef: React.RefObject<Animated.Value>, cb?: () => void) => {
    const scale = scaleRef.current;
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(cb);
  };

  const sendFeedback = async (rating: "Good" | "Bad") => {
    try {
      const res = await fetch("https://formspree.io/f/mojowgkw", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ feedback: rating, message: `User rated the app ${rating}` }),
      });
      showModal(
        res.ok
          ? { title: "Thanks!", message: "Your feedback has been sent.", buttons: [{ text: "Close", style: "cancel" }] }
          : { title: "Error", message: "Failed to send feedback.", buttons: [{ text: "OK", style: "cancel" }] }
      );
    } catch {
      showModal({ title: "Error", message: "Network error. Try again.", buttons: [{ text: "OK", style: "cancel" }] });
    }
  };

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(bannerX.current, { toValue: bannerEnd, duration: 10000, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(bannerX.current, { toValue: bannerStart, duration: 0, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [bannerEnd, bannerStart]);

  return (
    <ImageBackground
      source={require("../../assets/images/bg.jpg")}
      resizeMode="cover"
      style={styles.background}
    >
      <View style={styles.overlay} />
      <CustomModal visible={modalVisible} config={modalConfig} onClose={() => setModalVisible(false)} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <Pressable
            style={styles.iconBtn}
            onPress={() =>
              showModal({
                title: "About",
                message:
                  "App is in development.\n\nWe use groq, openrouter and some opensource models to power our app with their provided api keys\n\nWe do not own anything related to the AI except the API codes\n\nOpenAI, NVIDIA, Meta, Google AND THEIR RESPECTIVE LOGOS ARE TRADEMARKS OF THEIR OWNERS. THIS APP IS INDEPENDENT AND IS NOT AFFILIATED NOR ENDORSED BY THE COMPANIES PRESENTED.",
                buttons: [{ text: "Got it", style: "cancel" }],
              })
            }
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
                  { text: "Good", onPress: () => sendFeedback("Good") },
                  { text: "Bad", onPress: () => sendFeedback("Bad"), style: "danger" },
                  { text: "Cancel", style: "cancel" },
                ],
              });
            }}
          >
            <Animated.View style={{ transform: [{ scale: scaleFeedback.current }] }}>
              <MaterialIcons name="feedback" size={22} color="#fffcfc" />
            </Animated.View>
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.banner}>
            <Animated.View style={[styles.bannerTrack, { transform: [{ translateX: bannerX.current }] }]}>
              <View style={styles.bannerItem}>
                <Image source={require("../../assets/images/openai.png")} style={styles.bannerImage} />
                <Text style={styles.bannerText}>Gpt-0ss-120b - Open ai</Text>
              </View>
              <View style={styles.bannerItem}>
                <Image source={require("../../assets/images/nvda.webp")} style={styles.bannerImage} />
                <Text style={styles.bannerText}>Nemotron - Nvidia</Text>
              </View>
              <View style={styles.bannerItem}>
                <Image source={require("../../assets/images/gem.png")} style={styles.bannerImage} />
                <Text style={styles.bannerText}> Gemma - Google</Text>
              </View>
              <View style={styles.bannerItem}>
                <Image source={require("../../assets/images/llama.jpg")} style={styles.bannerImage} />
                <Text style={styles.bannerText}>LLama 3.1 - Meta</Text>
              </View>
              <View style={styles.bannerItem}>
                <Text style={styles.bannerText}>More updates coming soon!!! stay updated</Text>
              </View>
            </Animated.View>
          </View>

          <View style={styles.card}>
            <Text style={styles.badge}>v1.3.0 BETA</Text>
            <Text style={styles.title}>Welcome</Text>
            <Text style={styles.subtitle}>Access your personal AI assistant.</Text>

            <Link href="/explore" asChild>
              <Pressable style={{ width: "100%" }}>
                <View style={styles.primaryBtn}>
                  <Text style={styles.primaryBtnText}>Get Started</Text>
                </View>
              </Pressable>
            </Link>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.4)" },
  safeArea: { flex: 1 },
  topBar: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 8 },
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
  content: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 24 },
  banner: { width: "100%", height: 34, borderRadius: 999, overflow: "hidden", justifyContent: "center", position : "absolute", top: 700},
  bannerTrack: { flexDirection: "row", alignSelf: "flex-start", paddingHorizontal: 8, gap: 8 },
  bannerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 8,
  },
  bannerImage: { width: 25, height: 25, borderRadius: 2, marginRight: 6 },
  bannerText: { color: "#ffffff", fontSize: 12, fontWeight: "600", letterSpacing: 0.3 },
  card: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
  },
  badge: { color: "#00cc2c", fontSize: 11, fontWeight: "700", letterSpacing: 1.5, marginBottom: 10 },
  title: { color: "#fff", fontSize: 32, fontWeight: "800", letterSpacing: 0.5 },
  subtitle: { color: "rgba(255,255,255,0.5)", fontSize: 14, marginTop: 8, textAlign: "center", lineHeight: 20 },
  primaryBtn: {
    backgroundColor: "#00cc2c",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 50,
    marginTop: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});