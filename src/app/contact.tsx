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
  TextInput,
  View,
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
  const [focused, setFocused] = useState(false);

  const showModal = (config: ModalConfig) => {
    setModalConfig(config);
    setModalVisible(true);
  };

  const bounce = (ref: React.RefObject<Animated.Value>) => {
    Animated.sequence([
      Animated.timing(ref.current, { toValue: 0.96, duration: 70, useNativeDriver: true }),
      Animated.timing(ref.current, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const exitApp = () => {
    if (Platform.OS === "android") { BackHandler.exitApp(); return; }
    showModal({ title: "Exit", message: "Close the app from the app switcher.", buttons: [{ text: "OK", style: "cancel" }] });
  };

  const showPrivacyAlert = () => {
    showModal({
      title: "Terms & Conditions",
      message: "The app and its owner do not claim ownership of any third-party content presented (except the API key).\n\nTap Privacy Policy to read the full policy.",
      buttons: [
        { text: "Disagree", style: "danger", onPress: () => showModal({ title: "Access Denied", message: "You must accept the terms to continue.", buttons: [{ text: "Exit", style: "danger", onPress: exitApp }, { text: "Back" }] }) },
        { text: "Agree", onPress: () => showModal({ title: "Accepted", message: "You have agreed to the Terms and Conditions.", buttons: [{ text: "Continue" }] }) },
        { text: "Copyright Policy", onPress: () => Linking.openURL("https://github.com/madhusudhan-rgb/TSX-proj/blob/MAIN2/LICENSE") },
        { text: "Privacy Policy", onPress: () => Linking.openURL("https://github.com/madhusudhan-rgb/TSX-proj/blob/MAIN2/PRIVACY%20POLICY") },
      ],
    });
  };

  const handleSend = async () => {
    bounce(scaleSend);
    const trimmed = message.trim();
    if (!trimmed) {
      showModal({ title: "Empty Message", message: "Write something before sending.", buttons: [{ text: "OK", style: "cancel" }] });
      return;
    }
    const url = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("App Inquiry")}&body=${encodeURIComponent(trimmed)}`;
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      showModal({ title: "No Email App", message: `No email app found.\n\n${CONTACT_EMAIL}`, buttons: [{ text: "OK", style: "cancel" }] });
      return;
    }
    await Linking.openURL(url);
    setMessage("");
    showModal({ title: "Done", message: "Your email app is open. Hit send!", buttons: [{ text: "OK" }] });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <CustomModal visible={modalVisible} config={modalConfig} onClose={() => setModalVisible(false)} />

      {/* Page title */}
      <Text style={styles.pageTitle}>Contact</Text>

      {/* Email tap row */}
      <Pressable onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}>
        <View style={styles.emailRow}>
          <View>
            <Text style={styles.emailLabel}>Email</Text>
            <Text style={styles.emailValue}>{CONTACT_EMAIL}</Text>
          </View>
          <Text style={styles.emailArrow}>↗</Text>
        </View>
      </Pressable>

      <View style={styles.hr} />

      {/* Message box */}
      <Text style={styles.formLabel}>Send feedback or contact for inquiries</Text>
      <TextInput
        style={[styles.input, focused && styles.inputFocused]}
        placeholder="What's on your mind?"
        placeholderTextColor="#444"
        multiline
        textAlignVertical="top"
        value={message}
        onChangeText={setMessage}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <Pressable onPress={handleSend}>
        <Animated.View style={[styles.sendBtn, { transform: [{ scale: scaleSend.current }] }]}>
          <Text style={styles.sendBtnText}>Send</Text>
        </Animated.View>
      </Pressable>

      <View style={styles.hr} />

      {/* Bottom links */}
      <View style={styles.links}>
        {[
          { ref: scaleTerms, label: "Terms & Conditions", onPress: () => { bounce(scaleTerms); showPrivacyAlert(); } },
          {
            ref: scalerndm, label: "Resources", onPress: () => {
              bounce(scalerndm);
              showModal({ title: "Resources", message: "API powered by:\n\nGroq — https://groq.com\nOpenRouter — https://openrouter.ai", buttons: [{ text: "OK", style: "cancel" }] });
            }
          },
        ].map(({ ref, label, onPress }) => (
          <Pressable key={label} onPress={onPress}>
            <Animated.View style={{ transform: [{ scale: ref.current }] }}>
              <Text style={styles.linkText}>{label}</Text>
            </Animated.View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111" },
  content: { padding: 24, paddingTop: 64 },

  pageTitle: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 32,
    letterSpacing: -0.5,
  },

  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  emailLabel: { color: "#555", fontSize: 12, marginBottom: 4, fontWeight: "600" },
  emailValue: { color: "#fff", fontSize: 16, fontWeight: "500" },
  emailArrow: { color: "#555", fontSize: 20 },

  hr: { height: 1, backgroundColor: "#222", marginVertical: 28 },

  formLabel: { color: "#555", fontSize: 12, fontWeight: "600", marginBottom: 12 },
  input: {
    backgroundColor: "#181818",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#222",
    padding: 14,
    color: "#fff",
    fontSize: 15,
    minHeight: 140,
    lineHeight: 22,
    marginBottom: 12,
  },
  inputFocused: { borderColor: "#333" },

  sendBtn: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  sendBtnText: { color: "#111", fontWeight: "700", fontSize: 15 },

  links: { gap: 20 },
  linkText: { color: "#555", fontSize: 14, fontWeight: "500" },
});