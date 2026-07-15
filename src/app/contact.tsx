import { useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
} from "react-native";
import { CustomModal, ModalConfig } from "../components/CustomModal";

const CONTACT_EMAIL = "madhusudhant207@gmail.com";

export default function Contact() {
  const scaleTerms = useRef(new Animated.Value(1));
  const scalerndm = useRef(new Animated.Value(1));
  const scaleSend = useRef(new Animated.Value(1));

  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const [message, setMessage] = useState("");

  const showModal = (config: ModalConfig) => {
    setModalConfig(config);
    setModalVisible(true);
  };

  const bounce = (scaleRef: React.RefObject<Animated.Value>) => {
    const scale = scaleRef.current;
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.94, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const exitApp = () => {
    if (Platform.OS === "android") {
      BackHandler.exitApp();
      return;
    }
    showModal({
      title: "Exit",
      message: "Please close the app from the app switcher.",
      buttons: [{ text: "OK", style: "cancel" }],
    });
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
          text: "Copyright Policy",
          onPress: () =>
            Linking.openURL(
              "https://github.com/madhusudhan-rgb/TSX-proj/blob/MAIN2/LICENSE"
            ),
        },
        {
          text: "Privacy Policy",
          onPress: () =>
            Linking.openURL(
              "https://github.com/madhusudhan-rgb/TSX-proj/blob/MAIN2/PRIVACY%20POLICY"
            ),
        },
      ],
    });
  };

  const handleSend = async () => {
    bounce(scaleSend);
    const trimmed = message.trim();
    if (!trimmed) {
      showModal({
        title: "Empty Message",
        message: "Please write something before sending.",
        buttons: [{ text: "OK", style: "cancel" }],
      });
      return;
    }

    // Build mailto: URL — opens the device's email client with your address,
    // subject, and the user's typed message pre-filled.
    const subject = encodeURIComponent("App Inquiry");
    const body = encodeURIComponent(trimmed);
    const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;

    const canOpen = await Linking.canOpenURL(mailtoUrl);
    if (!canOpen) {
      showModal({
        title: "No Email App Found",
        message:
          "No email app is set up on this device. Please email us directly at:\n\n" +
          CONTACT_EMAIL,
        buttons: [{ text: "OK", style: "cancel" }],
      });
      return;
    }

    await Linking.openURL(mailtoUrl);
    // Clear the input and confirm after opening the email client
    setMessage("");
    showModal({
      title: "Email Client Opened",
      message:
        "Your email app has opened with the message pre-filled. Just hit Send!",
      buttons: [{ text: "OK" }],
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <CustomModal
        visible={modalVisible}
        config={modalConfig}
        onClose={() => setModalVisible(false)}
      />

      <View style={styles.bg}>
        <View style={styles.header}>
          <Text style={styles.title}>Additional Info</Text>
          <Text style={styles.subtitle}>Contact, legal, and resource links</Text>
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
              scale: scalerndm,
              icon: "🔗",
              label: "Resources",
              style: "green" as const,
              onPress: () =>
                showModal({
                  title: "Resources",
                  message:
                    "API powered by Groq: https://groq.com\nand OpenRouter: https://openrouter.ai",
                  buttons: [{ text: "OK", style: "cancel" }],
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

          {/* Inquiry form */}
          <View style={styles.inquiryCard}>
            <Text style={styles.inquiryTitle}>Send an Inquiry</Text>

            <TextInput
              style={styles.input}
              placeholder="Write your message here..."
              placeholderTextColor="rgba(255,255,255,0.35)"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={message}
              onChangeText={setMessage}
            />

            <Pressable
              onPress={handleSend}
            >
              <Animated.View
                style={[
                  styles.sendBtn,
                  { transform: [{ scale: scaleSend.current }] },
                ]}
              >
                <Text style={styles.sendBtnText}>✉️  Send Message</Text>
              </Animated.View>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },
  scrollContent: {
    flexGrow: 1,
  },
  bg: { flex: 1, justifyContent: "center", padding: 24 },
  header: { marginBottom: 24 },
  title: { color: "#fff", fontSize: 28, fontWeight: "800" },
  subtitle: { color: "rgba(255,255,255,0.45)", fontSize: 14, marginTop: 6 },
  card: { gap: 12 },

  btn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 12,
  },
  btn_primary: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  btn_secondary: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  btn_muted: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  btn_green: {
    backgroundColor: "#00cc2c",
    borderWidth: 1,
    borderColor: "#00aa24",
  },
  btnIcon: { fontSize: 20 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700", flex: 1 },

  inquiryCard: {
    marginTop: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(26,25,25,0.3)",
    padding: 16,
    borderRadius: 20,
    gap: 12,
  },
  inquiryTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "rgba(83, 88, 83, 0.25)",
    padding: 12,
    borderRadius: 10,
    borderColor: "rgba(255, 255, 255, 0.26)",
    borderWidth: 1,
    minHeight: 140,
    color: "white",
    fontSize: 15,
    lineHeight: 22,
  },
  sendBtn: {
    backgroundColor: "#00cc2c",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
