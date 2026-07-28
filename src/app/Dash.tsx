import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { CustomModal, ModalConfig } from "../components/CustomModal";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48 - 12) / 2; // 2 columns with gap
const CARD = CARD_WIDTH;

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
  { name: "OpenRouter",   sub: "openrouter.ai",      url: "https://openrouter.ai/settings/credits",      image: require("../../assets/images/openrouter.png") },
  { name: "xAI",          sub: "x.ai",               url: "https://console.x.ai/",                        image: require("../../assets/images/ai.jpg") },
  { name: "DeepInfra",    sub: "deepinfra.com",      url: "https://deepinfra.com/dash/billing",          image: require("../../assets/images/deepinfra.png") },
  { name: "Cerebras",     sub: "cerebras.ai",        url: "https://cloud.cerebras.ai/",                  image: require("../../assets/images/cerebras.png") },
  { name: "SambaNova",    sub: "sambanova.ai",       url: "https://cloud.sambanova.ai/",                 image: require("../../assets/images/sambanova.jpg") },
  { name: "Fal",          sub: "fal.ai",             url: "https://fal.ai/dashboard/billing",            image: require("../../assets/images/fal.png") },
  { name: "AI21",         sub: "ai21.com",           url: "https://studio.ai21.com/account",             image: require("../../assets/images/ai21.webp") },
  { name: "NVIDIA NIM",   sub: "nvidia.com",         url: "https://build.nvidia.com/",                   image: require("../../assets/images/nvda.png") },
  { name: "Inference.net",sub: "inference.net",      url: "https://inference.net/",                      image: require("../../assets/images/inference.png") },
  { name: "Lepton AI",    sub: "lepton.ai",          url: "https://dashboard.lepton.ai/",               image: require("../../assets/images/lepton.png") },
  { name: "Novita AI",    sub: "novita.ai",          url: "https://novita.ai/",                          image: require("../../assets/images/novita.jpg") },
  { name: "Nebius AI",    sub: "nebius.ai",          url: "https://studio.nebius.ai/",                  image: require("../../assets/images/nebius.webp") },
  { name: "Cloudflare",   sub: "cloudflare.com",     url: "https://dash.cloudflare.com/",               image: require("../../assets/images/cloudflare.webp") },
  { name: "Azure OpenAI", sub: "azure.microsoft.com",url: "https://portal.azure.com/",                  image: require("../../assets/images/azure.png") },
  { name: "Amazon Bedrock", sub: "aws.amazon.com",   url: "https://console.aws.amazon.com/bedrock/",    image: require("../../assets/images/bedrock.jpg") },
  { name: "Vertex AI",    sub: "cloud.google.com",   url: "https://console.cloud.google.com/vertex-ai", image: require("../../assets/images/vertex.jpg") },
  { name: "IBM watsonx",  sub: "ibm.com",            url: "https://dataplatform.cloud.ibm.com/",        image: require("../../assets/images/watsonx.png") },
  { name: "Baseten",         sub: "baseten.co",         url: "https://app.baseten.co/",                     image: require("../../assets/images/basten.jpeg") },
  { name: "Modal",           sub: "modal.com",          url: "https://modal.com/",                          image: require("../../assets/images/modal.jpg") },
  { name: "Anyscale",        sub: "anyscale.com",       url: "https://console.anyscale.com/",              image: require("../../assets/images/anyscale.png") },
  { name: "RunPod",          sub: "runpod.io",          url: "https://www.runpod.io/console",              image: require("../../assets/images/runpod.webp") },
  { name: "Lambda",          sub: "lambdalabs.com",     url: "https://cloud.lambdalabs.com/",              image: require("../../assets/images/lambda.png") },
  { name: "AIMLAPI",         sub: "aimlapi.com",        url: "https://aimlapi.com/app",                    image: require("../../assets/images/aimlapi.png") },
  { name: "Hyperbolic",      sub: "hyperbolic.xyz",     url: "https://app.hyperbolic.xyz/",                image: require("../../assets/images/hyperbolic.webp") },
  { name: "Z.ai",            sub: "z.ai",               url: "https://chat.z.ai/",                         image: require("../../assets/images/zai.jpg") },
  { name: "Moonshot AI",     sub: "moonshot.ai",        url: "https://platform.moonshot.ai/",             image: require("../../assets/images/moonshot.jpg") },
  { name: "MiniMax",         sub: "minimax.io",         url: "https://platform.minimax.io/",              image: require("../../assets/images/mx.jpg") },
  { name: "SiliconFlow",     sub: "siliconflow.cn",     url: "https://cloud.siliconflow.cn/",             image: require("../../assets/images/miniflow.webp") },
  { name: "Tencent Hunyuan", sub: "tencent.com",        url: "https://hunyuan.tencent.com/",              image: require("../../assets/images/hunyuan.webp") },
  { name: "Baidu Qianfan",   sub: "baidu.com",          url: "https://console.bce.baidu.com/qianfan/",    image: require("../../assets/images/qianfan.png") },
  { name: "Alibaba Model Studio", sub: "alibabacloud.com", url: "https://modelscope.console.aliyun.com/", image: require("../../assets/images/alibaba.png") },
  { name: "ByteDance Volcano", sub: "volcengine.com",  url: "https://console.volcengine.com/ark",         image: require("../../assets/images/volcengine.png") },
  { name: "Snowflake Cortex", sub: "snowflake.com",    url: "https://app.snowflake.com/",                image: require("../../assets/images/snowflake.jpg") },
  { name: "Oracle OCI AI",   sub: "oracle.com",         url: "https://cloud.oracle.com/",                 image: require("../../assets/images/oracle.png") },
  { name: "SAP AI Core",     sub: "sap.com",            url: "https://ai-launchpad.cfapps.eu10.hana.ondemand.com/", image: require("../../assets/images/sap.png") },
  { name: "Predibase",       sub: "predibase.com",      url: "https://app.predibase.com/",                image: require("../../assets/images/predibase.png") },
  { name: "Crusoe Cloud",    sub: "crusoe.ai",          url: "https://console.crusoe.ai/",               image: require("../../assets/images/crusoe.webp") },
  { name: "Nscale",          sub: "nscale.com",         url: "https://console.nscale.com/",              image: require("../../assets/images/nscale.png") },
  { name: "Vast.ai",         sub: "vast.ai",            url: "https://cloud.vast.ai/",                    image: require("../../assets/images/vast.png") },
  { name: "Scaleway AI",     sub: "scaleway.com",       url: "https://console.scaleway.com/",            image: require("../../assets/images/scaleway.png") },
  { name: "GrokCloud",       sub: "grokcloud.com",      url: "https://app.grokcloud.com/",               image: require("../../assets/images/grokcloud.png") },
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

  const renderItem = ({ item }: { item: (typeof PROVIDERS)[number] }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.6}
      onPress={() => open(item)}
    >
      <Image source={item.image} style={styles.logo} />
      <Text style={styles.cardName}>{item.name}</Text>
      <Text style={styles.cardSub}>{item.sub}</Text>
    </TouchableOpacity>
  );

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

        {/* Grid - using FlatList for better performance with many items */}
        <FlatList
          data={PROVIDERS}
          renderItem={renderItem}
          keyExtractor={(item) => item.name}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        />
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
  logo: {
    width: 70,
    height: 50,
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
