import { useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Image,
  ImageBackground,
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
      "The app and its owner do not claim ownership of any third-party content presented (except the API key).\n\n" +
      "This app is provided for entertainment purposes only, and the developer is not responsible for any damage, harm, or loss resulting from its use.\n\nIF THERE IS ANY NOTICE OF USERS TRYING TO ABUSE THE API CODES ( you are able to put your own api codes due to the app being open source but you are not allowed to use the already hardcoded api codes for your own purposes) BY FIDDLING WITHT THE APK SERIOUS CONSEQUENCES WILL BE PLACED\n\nScroll down for more\n\nOpenAI, NVIDIA, Meta, Alibaba, Mistral AI ,Bytedance, and THEIR RESPECTIVE LOGOS ARE TRADEMARKS OF THEIRS. THIS APP IS INDEPENDENT AND IS NOT AFFILIATED WITH NOR ENDORSED BY THE COMPANIES PRESENTED.\n\nAll your account information is stored safely from anyone trying to abuse\n\nAlthough there is no 100% guarentee please note that this app is still in early development\n\nYour chats with the AI models is stored unless you decide to reset the chat history. All your history is safeguarded and wont be looked through except in certain circumstances resulting from legal causes\n\nYOUR DATA MAY BE USED TO FURTHER IMRPOVE USER EXPEREINCE\n\n" +
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
        text: "Cpyright-policy",
        onPress: () =>
          Linking.openURL(
            "https://creativecommons.org/publicdomain/zero/1.0/legalcode.en"
          ),
      },
    ],
  });
};
  return (
    <ImageBackground source={require("../../assets/images/bg1.jpg")} style={styles.background}>
      <View style={styles.overlay} />
      <CustomModal visible={modalVisible} config={modalConfig} onClose={() => setModalVisible(false)} />

      <View style={styles.bg}>
        <View style={styles.header}>
          <Text style={styles.title}>Additional Info</Text>
          <Text style={styles.subtitle}>Contact, legal, and resource links</Text>
        </View>

        <View style={styles.card}>
          {[
            
            {
              scale: scaleTerms, icon: "📄", label: "Terms & Conditions",
              style: "secondary" as const,
              onPress: showPrivacyAlert,
            },
            {
              scale: scaleComingSoon, icon: "?", label: "What and why this app?",
              style: "secondary" as const,
              onPress: () => showModal({ title: "Information", message: "I am a 17 yr old ( as of 7/4/26 2:18pm est ) and i wanted to learn something productive during the summer instead of fooling around.\nCoding seemed to be the best option as its becoming more of a generalized thing\nI built this simply to get better at typescript and it might not be the best but hey it works!!!\n\n\n( I did use Ai to debug the config files and check for compiling issues when i made the apk )", buttons: [{ text: "Got it", style: "cancel" }] }),
            },
            {
              scale: scalerndm, icon: "🔗", label: "Resources",
              style: "green" as const,
              onPress: () => showModal({
                title: "Resources",
                message: "API powered by Groq : https://groq.com and OpenRouter :https://openrouter.ai\n\nBackground images sourced from Pinterest. All images provided are owned by their respective owners or the users who post the images in the Website.",
                buttons: [
                  { text: "Image#1",    onPress: () => Linking.openURL("https://www.pinterest.com/pin/630011435389349458/") },
                  { text : "Image#2", onPress: ()=> Linking.openURL("https://www.pinterest.com/pin/1107955945860730767/")},
                  {text : "Image#3", onPress: ()=> Linking.openURL("https://www.pinterest.com/pin/840906561705707566/")},
                  { text: "OK", style: "cancel" },
                ],
              }),
            },
          ].map(({ scale, icon, label, style, onPress }) => (
            <Pressable key={label} onPress={() => { bounce(scale); onPress(); }}>
              <Animated.View style={[styles.btn, styles[`btn_${style}`], { transform: [{ scale: scale.current }] }]}>
                <Text style={styles.btnIcon}>{icon}</Text>
                <Text style={styles.btnText}>{label}</Text>
              </Animated.View>
            </Pressable>
          ))}
          <View style={styles.socialmedia}>
            <Text style={styles.supportText}>You can support The dev (me) if you want!!!!</Text>
            <View style={styles.socialRow}>
              {socialLinks.map((item) => (
                <Pressable
                  key={item.label}
                  style={styles.socialItem}
                  onPress={() => Linking.openURL(item.url)}
                >
                  <Image style={[styles.socialImage, item.imageStyle]} source={item.image} />
                  <Text style={styles.socialLabel}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.55)" },
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