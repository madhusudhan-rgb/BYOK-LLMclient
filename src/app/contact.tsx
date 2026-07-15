import { useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CustomModal, ModalConfig } from "../components/CustomModal";

const socialLinks = [
  {
    label: "Instagram",
    url: "https://www.instagram.com/airbusissocool102/",
    image: require("../../assets/images/insta.jpg"),
    imageStyle: { borderRadius: 14 },
  },
  {
    label: "TikTok",
    url: "https://www.tiktok.com/@airbusissocool102",
    image: require("../../assets/images/tt.jpg"),
    imageStyle: { borderRadius: 14 },
  },
  {
    label: "GitHub",
    url: "https://github.com/madhusudhan-rgb",
    image: require("../../assets/images/github.png"),
    imageStyle: { borderRadius: 34 },
  },
  {
    label: "X",
    url: "https://x.com/twan1nbk",
    image: require("../../assets/images/x.png"),
    imageStyle: { borderRadius: 40 },
  },
] as const;

export default function Contact() {
  const scaleTerms = useRef(new Animated.Value(1));
  const scaleComingSoon = useRef(new Animated.Value(1));
  const scalerndm = useRef(new Animated.Value(1));

  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig,  setModalConfig]  = useState<ModalConfig | null>(null);

  const showModal = (config: ModalConfig) => { setModalConfig(config); setModalVisible(true); };

  const bounce = (scaleRef: React.RefObject<Animated.Value>) => {
    const scale = scaleRef.current;
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.94, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1,    duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const exitApp = () => {
    if (Platform.OS === "android") { BackHandler.exitApp(); return; }
    showModal({ title: "Exit", message: "Please close the app from the app switcher.", buttons: [{ text: "OK", style: "cancel" }] });
  };

  const showPrivacyAlert = () => {
  showModal({
    title: "Terms & Conditions",
    message:
      "The app and its owner do not claim ownership of any third-party content presented (except the API key).\n\nTO VIEW THE FULL PRIVACY POLICY CLICK ON PRIVACY POLICY!\n\n" +
      "By continuing, you agree to these terms.",
    buttons: [
      {
        text: "Disagree",
        style: "danger",
        onPress: () =>
          showModal({
            title: "Access Denied",
            message: "You must accept the terms to continue using the app.",
            buttons: [
              { text: "Exit", style: "danger", onPress: exitApp },
              { text: "Back" },
            ],
          }),
      },
      {
        text: "Agree",
        onPress: () =>
          showModal({
            title: "Accepted",
            message: "You have agreed to the Terms and Conditions.",
            buttons: [{ text: "Continue" }],
          }),
      },
      {
        text: "Cpyright-plcy",
        onPress: () =>
          Linking.openURL(
            "https://github.com/madhusudhan-rgb/TSX-proj/blob/MAIN2/LICENSE"
          ),
      },
      {
        text : "PRIVACY POLICY",
        onPress: ()=> Linking.openURL("https://github.com/madhusudhan-rgb/TSX-proj/blob/MAIN2/PRIVACY%20POLICY")
      }
    ],
  });
};
 return (
  <View style={styles.container}>
    <CustomModal
      visible={modalVisible}
      config={modalConfig}
      onClose={() => setModalVisible(false)}
    />

    <View style={styles.bg}>
      <View style={styles.header}>
        <Text style={styles.title}>Additional Info</Text>
        <Text style={styles.subtitle}>
          Contact, legal, and resource links
        </Text>
      </View>

      <View style={styles.card}>
        {[
          {
            scale: scaleTerms,
            icon: "📄",
            label: "Terms & Conditions",
            style: "secondary" as const,
            onPress: showPrivacyAlert,
          },
          {
            scale: scaleComingSoon,
            icon: "?",
            label: "What and why this app?",
            style: "secondary" as const,
            onPress: () =>
              showModal({
                title: "Information",
                message:
                  "I am a 17 yr old ( as of 7/4/26 2:18pm est ) and i wanted to learn something productive during the summer instead of fooling around.\nCoding seemed to be the best option as its becoming more of a generalized thing\nI built this simply to get better at typescript and it might not be the best but hey it works!!!\n\n\n( I did use Ai to debug the config files and check for compiling issues when i made the apk )",
                buttons: [{ text: "Got it", style: "cancel" }],
              }),
          },
          {
            scale: scalerndm,
            icon: "🔗",
            label: "Resources",
            style: "green" as const,
            onPress: () =>
              showModal({
                title: "Resources",
                message:
                  "API powered by Groq : https://groq.com and OpenRouter :https://openrouter.ai\n",
                buttons: [
                  
                  { text: "OK", style: "cancel" },
                ],
              }),
          },
        ].map(({ scale, icon, label, style, onPress }) => (
          <Pressable
            key={label}
            onPress={() => {
              bounce(scale);
              onPress();
            }}
          >
            <Animated.View
              style={[
                styles.btn,
                styles[`btn_${style}`],
                { transform: [{ scale: scale.current }] },
              ]}
            >
              <Text style={styles.btnIcon}>{icon}</Text>
              <Text style={styles.btnText}>{label}</Text>
            </Animated.View>
          </Pressable>
        ))}

        <View style={styles.socialmedia}>
          <Text style={styles.supportText}>
            You can support or contact The dev (me) if you want!!!!
          </Text>

          <View style={styles.socialRow}>
            {socialLinks.map((item) => (
              <Pressable
                key={item.label}
                style={styles.socialItem}
                onPress={() => Linking.openURL(item.url)}
              >
                <Image
                  style={[styles.socialImage, item.imageStyle]}
                  source={item.image}
                />
                <Text style={styles.socialLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </View>
  </View>
);
  
}

const styles = StyleSheet.create({
  
 container: {
  flex: 1,
  backgroundColor: "#111",
},
  bg: { flex: 1, justifyContent: "center", padding: 24 },
  header: { marginBottom: 24 },
  title: { color: "#fff", fontSize: 28, fontWeight: "800" },
  subtitle: { color: "rgba(255,255,255,0.45)", fontSize: 14, marginTop: 6 },
  card: { gap: 12 },
  btn: { flexDirection: "row", alignItems: "center", paddingVertical: 16, paddingHorizontal: 20, borderRadius: 16, gap: 12 },
  btn_primary:   { backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  btn_secondary: { backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  btn_muted:     { backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
  btn_green:     { backgroundColor: "#00cc2c", borderWidth: 1, borderColor: "#00aa24" },
  btnIcon: { fontSize: 20 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700", flex: 1 },
  btnTextMuted: { color: "rgba(255,255,255,0.35)" },
  socialmedia: {
    marginTop: 30,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(26,25,25,0.3)",
    padding: 14,
    borderRadius: 20,
    gap: 12,
  },
  supportText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
  socialRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  socialItem: {
    alignItems: "center",
    minWidth: 70,
    gap: 6,
  },
  socialImage: {
    width: 60,
    height: 60,
  },
  socialLabel: {
    color: "white",
    fontSize: 12,
  },
});