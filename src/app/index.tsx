import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  ImageBackground,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomModal, ModalConfig } from "../components/CustomModal";
import { useNavbar } from "../context/NavbarContext";
import Constants from "expo-constants";

const MODELS = [
  { image: require("../../assets/images/openai.png"),  label: "GPT-4o · OpenAI" },
  { image: require("../../assets/images/nvda.png"),   label: "Nemotron · NVIDIA" },
  { image: require("../../assets/images/pool.jpg"),    label: "Laguna · Poolside AI" },
  { image: require("../../assets/images/llama.png"),   label: "LLaMA 3.1 · Meta" },
  { image: require("../../assets/images/cohere.png"),  label: "Command · Cohere" },
  { image: require("../../assets/images/byte.png"),    label: "Seed 3.0 · ByteDance" },
  { image: require("../../assets/images/flux.png"),    label: "Flux · FluxSchnell" },
  { image: require("../../assets/images/kling.png"), label : "kling 2.1 - Kuaishou tech" },
  { image: require("../../assets/images/mx.jpg"), label: "Minimax - MiniMax group inc" }
];

export default function HomeScreen() {
  const { setShowNavbar } = useNavbar();
  const bannerX = useRef(new Animated.Value(0)).current;
  const scaleFeedback = useRef(new Animated.Value(1)).current;
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig]   = useState<ModalConfig | null>(null);

  useEffect(() => { setShowNavbar(true); }, [setShowNavbar]);

  const showModal = (config: ModalConfig) => {
    setModalConfig(config);
    setModalVisible(true);
  };

  const bounce = (ref: Animated.Value, cb?: () => void) => {
    Animated.sequence([
      Animated.timing(ref, { toValue: 0.92, duration: 100, useNativeDriver: true }),
      Animated.timing(ref, { toValue: 1,    duration: 80, useNativeDriver: true }),
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

  // Fixed deprecated Constants usage
  const version = Constants?.expoConfig?.version ?? "1.5.0";
  const build   = (Constants?.expoConfig as any)?.android?.versionCode?.toString() ?? "1";
  const versionLabel = `${version} (${build})`;

  const ITEM_WIDTH = 160;
  const STRIP_WIDTH = MODELS.length * ITEM_WIDTH;

  useEffect(() => {
    bannerX.setValue(0);
    const anim = Animated.loop(
      Animated.timing(bannerX, {
        toValue: -STRIP_WIDTH,
        duration: MODELS.length * 2800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [bannerX, STRIP_WIDTH]);

  const strip = [...MODELS, ...MODELS];

  return (
    <ImageBackground source={require("../../assets/images/bgind.jpg")} style={s.fill}>
      <View style={s.overlay} />
      <CustomModal visible={modalVisible} config={modalConfig} onClose={() => setModalVisible(false)} />
      <SafeAreaView style={s.fill}>
        <View style={s.topBar}>
          <Pressable onPress={() => showModal({
            title: "Version Number",
            message: "version:\t" + versionLabel,
            buttons: [{ text: "Ok", style: "cancel" }]
          })}>
            <Text style={s.version}>{versionLabel}</Text>
          </Pressable>
          <View style={s.topRight}>
            <Pressable
              style={s.iconBtn}
              onPress={() =>
                showModal({
                  title: "About",
                  message:
                    "This app is in development and in its early stages SO FEATURES ARE LIMITED.\n\nYou basically enter your own api keys and other things realted to use the app\n\nClick on the house/home icon on the right to open tabs to explore\n\nApp will recieve regular updates to its structure, ui, functionality and you can help the dev more by sending feedbacks!!!.\n\nThank you for using my app\n\nPlease use responsibly.",
                  buttons: [{ text: "Got it", style: "cancel" }],
                })
              }
            >
              <Ionicons name="information-outline" size={20} color="rgba(255,255,255,0.7)" />
            </Pressable>

            <Pressable
              style={s.iconBtn}
              onPress={() => {
                bounce(scaleFeedback);
                showModal({
                  title: "Feedback",
                  message: "How are we doing? Your feedback helps us improve.",
                  buttons: [
                    { text: "👍 Good", onPress: () => sendFeedback("Good") },
                    { text: "👎 Bad",  onPress: () => sendFeedback("Bad"), style: "danger" },
                    { text: "View Updates", onPress: () => Linking.openURL("https://github.com/madhusudhan-rgb/TSX-proj") },
                    { text: "Cancel", style: "cancel" },
                  ],
                });
              }}
            >
              <Animated.View style={{ transform: [{ scale: scaleFeedback }] }}>
                <MaterialIcons name="feedback" size={20} color="rgba(255,255,255,0.7)" />
              </Animated.View>
            </Pressable>
          </View>
        </View>
        <View style={s.hero}>
          <Text style={s.eyebrow}>LLM CLIENT</Text>
          <Text style={s.title}>Your models,{"\n"}one place.</Text>
          <Text style={s.subtitle}>
            Chat, generate images, and utilize the latest AI models — all in one app.
          </Text>

          <Link href="/login" asChild>
            <Pressable style={s.cta}>
              <Text style={s.ctaText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={16} color="#000" />
            </Pressable>
          </Link>
        </View>

        <View style={s.tickerWrap}>
          <Text style={s.tickerLabel}>COMPATIBLE MODELS</Text>
          <View style={s.ticker}>
            <Animated.View style={[s.tickerTrack, { transform: [{ translateX: bannerX }] }]}>
              {strip.map((model, i) => (
                <View key={i} style={s.tickerItem}>
                  <Image source={model.image} style={s.tickerImg} />
                  <Text style={s.tickerText}>{model.label}</Text>
                </View>
              ))}
            </Animated.View>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  version: {
    color: "rgb(251, 251, 251)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  topRight: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center", justifyContent: "center",
  },
  hero: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 0,
  },
  eyebrow: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 14,
  },
  title: {
    color: "#fff",
    fontSize: 44,
    fontWeight: "800",
    lineHeight: 50,
    letterSpacing: -1,
    marginBottom: 16,
  },
  subtitle: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 36,
    maxWidth: 300,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 50,
    paddingVertical: 13,
    paddingHorizontal: 24,
    gap: 8,
  },
  ctaText: { color: "#000", fontWeight: "700", fontSize: 15 },
  tickerWrap: { paddingBottom: 10 },
  tickerLabel: {
    color: "rgb(255, 255, 255)",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  ticker: { overflow: "hidden", height: 36 },
  tickerTrack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
  },
  tickerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 8,
    width: 160,
  },
  tickerImg: {
    width: 22, height: 22, borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  tickerText: {
    color: "rgba(255, 255, 255, 0.94)",
    fontSize: 12,
    fontWeight: "500",
  },
});
