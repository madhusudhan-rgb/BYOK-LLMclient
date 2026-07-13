import { MaterialIcons } from "@expo/vector-icons";
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
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomModal, ModalConfig } from "../components/CustomModal";
import { useNavbar } from "../context/NavbarContext";

export default function HomeScreen() {
  const { setShowNavbar } = useNavbar();
  const scaleFeedback = useRef(new Animated.Value(1));
  const bannerStart = 220;
  const bannerEnd = -900;
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
      Animated.timing(scale, { toValue: 0.93, duration: 200, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 6, duration:200, useNativeDriver: true }),
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
        Animated.timing(bannerX.current, { toValue: bannerEnd, duration: 13000, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(bannerX.current, { toValue: bannerStart, duration: 0, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [bannerEnd, bannerStart]);

  
    return (
      <ImageBackground source = {require("../../assets/images/bg.avif")} style  ={styles.bgg}>
  <View style={styles.container}>
    <CustomModal
      visible={modalVisible}
      config={modalConfig}
      onClose={() => setModalVisible(false)}
    />

    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <Pressable
          style={styles.iconBtn}
          onPress={() =>
            showModal({
              title: "About",
              message:
                "App is in development.\n\nWe use groq, openrouter and some opensource models to power our app with their provided api keys\n\nWe do not own anything related to the AI except the API codes\n\nFELLOW USERS PLEASE USE THE APP RESPONSIBLY\n\nOpenAI, NVIDIA, Meta, Alibaba, Fluxschnell, Bytedance, Mistral Ai AND THEIR RESPECTIVE LOGOS ARE TRADEMARKS OF THEIR OWNERS. THIS APP IS INDEPENDENT AND IS NOT AFFILIATED NOR ENDORSED BY THE COMPANIES PRESENTED.\n\n",
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
                {
                  text: "Bad",
                  onPress: () => sendFeedback("Bad"),
                  style: "danger",
                },
                {
                  text: "UPDATES",
                  onPress: () =>
                    Linking.openURL(
                      "https://github.com/madhusudhan-rgb/TSX-proj"
                    ),
                },
                { text: "Cancel", style: "cancel" },
              ],
            });
          }}
        >
          <Animated.View
            style={{ transform: [{ scale: scaleFeedback.current }] }}
          >
            <MaterialIcons
              name="feedback"
              size={22}
              color="#fffcfc"
            />
          </Animated.View>
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.banner}>
          <Animated.View
            style={[
              styles.bannerTrack,
              { transform: [{ translateX: bannerX.current }] },
            ]}
          >
            <View style={styles.bannerItem}>
              <Image
                source={require("../../assets/images/openai.png")}
                style={styles.bannerImage}
              />
              <Text style={styles.bannerText}>Gpt-0ss-120b - Open ai</Text>
            </View>

            <View style={styles.bannerItem}>
              <Image
                source={require("../../assets/images/nvda.webp")}
                style={styles.bannerImage}
              />
              <Text style={styles.bannerText}>Nemotron - Nvidia</Text>
            </View>

            <View style={styles.bannerItem}>
              <Image
                source={require("../../assets/images/qwen.webp")}
                style={styles.bannerImage}
              />
              <Text style={styles.bannerText}>Qwen - Alibaba</Text>
            </View>

            <View style={styles.bannerItem}>
              <Image
                source={require("../../assets/images/llama.png")}
                style={styles.bannerImage}
              />
              <Text style={styles.bannerText}>LLama 3.1 - Meta</Text>
            </View>

            <View style={styles.bannerItem}>
              <Image
                source={require("../../assets/images/mistral.webp")}
                style={styles.bannerImage}
              />
              <Text style={styles.bannerText}>Mistral - Mistral AI</Text>
            </View>

            <View style={styles.bannerItem}>
              <Image
                source={require("../../assets/images/byte.png")}
                style={styles.bannerImage}
              />
              <Text style={styles.bannerText}>
                Bytedance-seed-3.0 - Bytedance
              </Text>
            </View>

            <View style={styles.bannerItem}>
              <Image
                source={require("../../assets/images/flux.png")}
                style={styles.bannerImage}
              />
              <Text style={styles.bannerText}>Flux - FluxSchnell</Text>
            </View>

            <View style={styles.bannerItem}>
              <Text style={styles.bannerText}></Text>
            </View>
          </Animated.View>
        </View>

        <View style={styles.card}>
          <Text style={styles.badge}>v1.2.0</Text>
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>Access the AI Playground</Text>

          <Link href="/login" asChild>
            <Pressable style={{ width: "100%" }}>
              <View style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Login / Sign Up</Text>
              </View>
            </Pressable>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  </View>
  </ImageBackground>
);
}


const styles = StyleSheet.create({
 container: {
 flex:1
},
bgg:{
  flex:1
},
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
  banner: { width: "120%", height: 34, borderRadius: 999, overflow: "hidden", justifyContent: "center", position : "absolute", top: 700},
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
  bannerText: { color: "#000000", fontSize: 12, fontWeight: "600", letterSpacing: 0.3 },
  card: {
    width: "100%",
    backgroundColor: "rgba(42, 40, 40, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.14)",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    marginBottom : 100
  },
  badge: { color: "#00cc2c", fontSize: 11, fontWeight: "700", letterSpacing: 1.5, marginBottom: 10 },
  title: { color: "#fcf8f8", fontSize: 32, fontWeight: "800", letterSpacing: 0.5 },
  subtitle: { color: "rgba(255,255,255,0.5)", fontSize: 14, marginTop: 8, textAlign: "center", lineHeight: 20 },
  primaryBtn: {
    backgroundColor: "#00cc2c",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 50,
    marginTop: 18,
    alignItems: "center",
    justifyContent: "center",
    width : 140,
    height :50,
    marginLeft : 80
  },
  primaryBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
});