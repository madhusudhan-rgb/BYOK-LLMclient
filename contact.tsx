import { ImageBackground } from "expo-image";
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
  View
} from "react-native";
import { CustomModal, ModalConfig } from "../components/CustomModal";

export default function Contact() {
  const scaleContact    = useRef(new Animated.Value(1)).current;
  const scaleTerms      = useRef(new Animated.Value(1)).current;
  const scaleComingSoon = useRef(new Animated.Value(1)).current;
  const scalerndm       = useRef(new Animated.Value(1)).current;

  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig,  setModalConfig]  = useState<ModalConfig | null>(null);

  const showModal = (config: ModalConfig) => { setModalConfig(config); setModalVisible(true); };

  const bounce = (scale: Animated.Value) => {
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
      "This app is provided for entertainment purposes only, and the developer is not responsible for any damage, harm, or loss resulting from its use.\n\nIF THERE IS ANY NOTICE OF USERS TRYING TO ABUSE THE API CODES ( you are able to put your own api codes due to the app being open source but you are not allowed to use the already hardcoded api codes for your own purposes) BY FIDDLING WITHT THE APK SERIOUS CONSEQUENCES WILL BE PLACED\n\n" +
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
              scale: scaleComingSoon, icon: "🔒", label: "# COMING SOON",
              style: "muted" as const,
              onPress: () => showModal({ title: "🔒 Coming Soon", message: "This feature is under development. Stay tuned!", buttons: [{ text: "Got it", style: "cancel" }] }),
            },
            {
              scale: scalerndm, icon: "🔗", label: "Resources",
              style: "green" as const,
              onPress: () => showModal({
                title: "Resources",
                message: "API powered by Groq : https://groq.com and OpenRouter :https://openrouter.ai\n\nBackground images sourced from Pinterest. All images provided are owned by their respective owners or the users who post the images in the Website.",
                buttons: [
                  { text: "Image#1",    onPress: () => Linking.openURL("https://www.pinterest.com/pin/1107955945860244149/") },
                  {text : "Image#2", onPress: ()=> Linking.openURL("https://www.pinterest.com/pin/632615078954601091/")},
                  { text: "OK", style: "cancel" },
                ],
              }),
            },
          ].map(({ scale, icon, label, style, onPress }) => (
            <Pressable key={label} onPress={() => { bounce(scale); onPress(); }}>
              <Animated.View style={[styles.btn, styles[`btn_${style}`], { transform: [{ scale }] }]}>
                <Text style={styles.btnIcon}>{icon}</Text>
                <Text style={[styles.btnText, style === "muted" && styles.btnTextMuted]}>{label}</Text>
              </Animated.View>
            </Pressable>
          ))}
          <View style = {styles.socialmedia}>
            <Pressable onPress={()=>Linking.openURL("https://www.instagram.com/airbusissocool102/")}>
          <Image
            style = {{width : 60, height: 60, borderRadius : 14, marginRight : 200, marginTop : 0}}
            source = {require("../../assets/images/insta.jpg")}
          /><Text style ={{color: "white"}}>Instagram</Text>
          </Pressable>
          <Pressable onPress = {()=> Linking.openURL("https://www.tiktok.com/@airbusissocool102")}>
            <Image
              style = {{width : 60, height : 60, borderRadius : 14, marginLeft : -190}}
              source = {require("../../assets/images/tt.jpg")} />
              <Text style ={{color: "white", marginLeft : -180}}>Tiktok</Text>
          </Pressable>
          <Pressable onPress = {()=> Linking.openURL("https://github.com/madhusudhan-rgb")}>
            <Image
              style = {{width : 60, height : 60, borderRadius : 34, marginLeft : -120}}
              source = {require("../../assets/images/github.png")} />
              <Text style ={{color: "white", marginLeft : -110}}>Github</Text>
          </Pressable>
           <Pressable onPress = {()=> Linking.openURL("https://x.com/twan1nbk")}>
            <Image
              style = {{width : 60, height : 60, borderRadius : 40, marginLeft : -60}}
              source = {require("../../assets/images/x.png")} />
              <Text style ={{color: "white", marginLeft : -50}}>X.COM</Text>
          </Pressable>
          <Text style ={{marginLeft : -290, marginTop: 100, color: "white", fontSize : 16}}>You can support me if you want!!!!</Text>
          
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
    flexDirection: "row",
    borderWidth :1.5,
    gap: 20,
    backgroundColor: "rgba(26,25,25,0.3)",
    padding: 12,
    borderRadius: 20,
    height : 200
  },
});