import { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { WebView } from "react-native-webview";

const PROVIDERS = [
  { name: "Groq",         sub: "console.groq.com",        url: "https://console.groq.com/settings/organization/usage" },
  { name: "OpenAI",       sub: "platform.openai.com",      url: "https://platform.openai.com/usage" },
  { name: "Anthropic",    sub: "console.anthropic.com",    url: "https://console.anthropic.com/settings/usage" },
  { name: "Gemini",       sub: "aistudio.google.com",      url: "https://aistudio.google.com/" },
  { name: "Mistral",      sub: "console.mistral.ai",       url: "https://console.mistral.ai/usage/" },
  { name: "Cohere",       sub: "dashboard.cohere.com",     url: "https://dashboard.cohere.com/billing" },
  { name: "Together",     sub: "api.together.xyz",         url: "https://api.together.xyz/settings/billing" },
  { name: "Perplexity",   sub: "perplexity.ai",            url: "https://www.perplexity.ai/settings/api" },
  { name: "Fireworks",    sub: "fireworks.ai",             url: "https://fireworks.ai/account/billing" },
  { name: "Replicate",    sub: "replicate.com",            url: "https://replicate.com/account/billing" },
  { name: "Hugging Face", sub: "huggingface.co",           url: "https://huggingface.co/settings/billing" },
  { name: "DeepSeek",     sub: "platform.deepseek.com",    url: "https://platform.deepseek.com/usage" },
];

export default function Dash() {
  const [activeUrl, setActiveUrl]     = useState<string | null>(null);
  const [activeTitle, setActiveTitle] = useState("");
  const [webLoading, setWebLoading]   = useState(true);

  function open(p: (typeof PROVIDERS)[number]) {
    setActiveTitle(p.name);
    setActiveUrl(p.url);
    setWebLoading(true);
  }

  return (
    <ImageBackground
      source={require("../../assets/images/bgpfp5.jpg")}
      style={styles.bg}
    >
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.container}>

        <Text style={styles.title}>API Usage</Text>

        <View style={styles.list}>
          {PROVIDERS.map((p, i) => (
            <TouchableOpacity
              key={p.name}
              style={[
                styles.row,
                i === PROVIDERS.length - 1 && { borderBottomWidth: 0 },
              ]}
              activeOpacity={0.4}
              onPress={() => open(p)}
            >
              <View style={styles.rowText}>
                <Text style={styles.name}>{p.name}</Text>
                <Text style={styles.sub}>{p.sub}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      <Modal
        visible={!!activeUrl}
        animationType="slide"
        onRequestClose={() => setActiveUrl(null)}
      >
        <SafeAreaView style={styles.modal}>
          <View style={styles.bar}>
            <TouchableOpacity onPress={() => setActiveUrl(null)}>
              <Text style={styles.close}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.barTitle}>{activeTitle}</Text>
            <View style={{ width: 42 }} />
          </View>

          {webLoading && <View style={styles.progress} />}

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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },

  container: {
    paddingTop: 90,
    paddingBottom: 60,
    paddingHorizontal: 24,
  },

  title: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "200",
    letterSpacing: -0.3,
    marginBottom: 28,
  },

  list: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.07)",
  },

  rowText: { flex: 1 },

  name: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "300",
    marginBottom: 3,
    letterSpacing: 0.1,
  },

  sub: {
    color: "rgba(255,255,255,0.25)",
    fontSize: 11,
    letterSpacing: 0.3,
  },

  chevron: {
    color: "rgba(255,255,255,0.2)",
    fontSize: 22,
    fontWeight: "100",
  },

  modal: {
    flex: 1,
    backgroundColor: "#060606",
  },

  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },

  close: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 14,
    fontWeight: "300",
  },

  barTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "300",
    letterSpacing: 0.3,
  },

  progress: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
});