import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomModal, ModalConfig } from "../components/CustomModal";

const { width } = Dimensions.get("window");
const CARD = (Math.max(width, 300) - 48 - 12) / 2;

const PROVIDERS = [
  { name: "Groq",         sub: "groq.com",          url: "https://console.groq.com/settings/organization/usage",  image: require("../../assets/images/groq.png") },
  { name: "OpenAI",       sub: "openai.com",         url: "https://platform.openai.com/usage",                    image: require("../../assets/images/openai.png") },
  { name: "Anthropic",    sub: "anthropic.com",      url: "https://console.anthropic.com/settings/usage",         image: require("../../assets/images/Anthropic.jpg") },
  { name: "Gemini",       sub: "google.com",         url: "https://aistudio.google.com/",                         image: require("../../assets/images/gemini.png") },
  { name: "Mistral",      sub: "mistral.ai",         url: "https://console.mistral.ai/usage/",                    image: require("../../assets/images/mistral.jpg") },
  { name: "Cohere",       sub: "cohere.com",         url: "https://dashboard.cohere.com/billing",                 image: require("../../assets/images/cohere.png") },
  { name: "Together",     sub: "together.xyz",       url: "https://api.together.xyz/settings/billing",            image: require("../../assets/images/together.jpg") },
  { name: "Perplexity",   sub: "perplexity.ai",      url: "https://www.perplexity.ai/settings/api",               image: require("../../assets/images/perplexity.jpg") },
  { name: "Fireworks",    sub: "fireworks.ai",       url: "https://fireworks.ai/account/billing",                 image: require("../../assets/images/fireworks.png") },
  { name: "Replicate",    sub: "replicate.com",      url: "https://replicate.com/account/billing",                image: require("../../assets/images/replicate.png") },
  { name: "Hugging Face", sub: "huggingface.co",     url: "https://huggingface.co/settings/billing",              image: require("../../assets/images/huggingface.png") },
  { name: "DeepSeek",     sub: "deepseek.com",       url: "https://platform.deepseek.com/usage",                  image: require("../../assets/images/deepseek.webp") },
];

export default function Dash() {
  const [activeUrl, setActiveUrl]       = useState<string | null>(null);
  const [activeTitle, setActiveTitle]   = useState("");
  const [webLoading, setWebLoading]     = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig]   = useState<ModalConfig | null>(null);

  function open(p: (typeof PROVIDERS)[number]) {
    setActiveTitle(p.name);
    setActiveUrl(p.url);
    setWebLoading(true);
  }

  function showModal(config: ModalConfig) {
    setModalConfig(config);
    setModalVisible(true);
  }

  // Split into rows of 2
  const rows: (typeof PROVIDERS)[] = [];
  for (let i = 0; i < PROVIDERS.length; i += 2) {
    rows.push(PROVIDERS.slice(i, i + 2));
  }

  return (
    <ImageBackground source={require("../../assets/images/dash.bg.jpg")} style={styles.bg}>
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>API USAGE</Text>
            <Text style={styles.title}>Providers</Text>
          </View>
          <Pressable
            hitSlop={16}
            onPress={() =>
              showModal({
                title: "About",
                message:
                  "Log in to each provider to view your live usage data.",
                buttons: [{ text: "Got it", style: "cancel" }],
              })
            }
          >
            <Ionicons name="information-circle-outline" size={22} color="rgb(239, 236, 236)" />
          </Pressable>
        </View>

        {/* Grid */}
        <ScrollView
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        >
          {rows.map((row, ri) => (
            <View key={ri} style={styles.row}>
              {row.map((p) => (
                <TouchableOpacity
                  key={p.name}
                  style={styles.card}
                  activeOpacity={0.6}
                  onPress={() => open(p)}
                >
                  <Image source={p.image} style={styles.logo} />
                  <Text style={styles.cardName}>{p.name}</Text>
                  <Text style={styles.cardSub}>{p.sub}</Text>
                </TouchableOpacity>
              ))}
              {/* Fill empty slot if odd number */}
              {row.length === 1 && <View style={styles.cardEmpty} />}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
      {/* WebView Modal */}
      <Modal
        visible={!!activeUrl}
        animationType="slide"
        onRequestClose={() => setActiveUrl(null)}
      >
        <SafeAreaView style={styles.modal}>
          <View style={styles.bar}>
            <TouchableOpacity
              onPress={() => setActiveUrl(null)}
              hitSlop={12}
              style={styles.closeBtn}
            >
              <Ionicons name="chevron-down" size={18} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
            <Text style={styles.barTitle}>{activeTitle}</Text>
            <View style={{ width: 36 }} />
          </View>

          {webLoading && (
            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>
          )}

          {activeUrl && (
            <WebView
              source={{ uri: activeUrl }}
              style={{ flex: 1 }}
              onLoadStart={() => setWebLoading(true)}
              onLoadEnd={() => setWebLoading(false)}
              sharedCookiesEnabled
              thirdPartyCookiesEnabled
              javaScriptEnabled
              domStorageEnabled
            />
          )}
        </SafeAreaView>
      </Modal>

      {modalConfig && (
        <CustomModal
          visible={modalVisible}
          config={modalConfig}
          onClose={() => setModalVisible(false)}
        />
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg:   { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 29,
  },
  eyebrow: {
    color: "rgba(252, 245, 245, 0.89)",
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "600",
    marginBottom: 4,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "200",
    letterSpacing: -0.3,
  },
  grid: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  card: {
    width: CARD,
    backgroundColor: "rgba(21, 20, 20, 0.24)",
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 20,
    alignItems: "flex-start",
  },
  cardEmpty: {
    width: CARD,
  },
  logo: {
    width: 55,
    height: 40,
    borderRadius: 12,
    marginBottom: 16,
    resizeMode: "cover",
  },
  cardName: {
    color: "#eff0ee",
    fontSize: 15,
    fontWeight: "400",
    marginBottom: 3,
  },
  cardSub: {
    color: "rgb(243, 245, 240)",
    fontSize: 11,
    letterSpacing: 0.2,
  },
  modal: {
    flex: 1,
    backgroundColor: "#080808",
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.07)",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  barTitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "400",
    letterSpacing: 0.2,
  },
  progressTrack: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  progressFill: {
    width: "35%",
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.4)",
  },
});
