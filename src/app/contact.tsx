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
  TouchableOpacity,
  View,
} from "react-native";
import { CustomModal, ModalConfig } from "../components/CustomModal";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const CONTACT_EMAIL = "madhusudhant207@gmail.com";

export default function Contact() {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const [message, setMessage] = useState("");
  const [focused, setFocused] = useState(false);

  const scaleSend = useRef(new Animated.Value(1)).current;

  const showModal = (config: ModalConfig) => {
    setModalConfig(config);
    setModalVisible(true);
  };

  const bounce = (ref: Animated.Value) => {
    Animated.sequence([
      Animated.timing(ref, { toValue: 0.96, duration: 70, useNativeDriver: true }),
      Animated.timing(ref, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const exitApp = () => {
    if (Platform.OS === "android") {
      BackHandler.exitApp();
    } else {
      showModal({
        title: "Close app",
        message: "Please close the app manually.",
        buttons: [{ text: "OK", style: "cancel" }],
      });
    }
  };

  const showPrivacyAlert = () => {
    showModal({
      title: "Privacy & Terms",
      message: `PRIVACY AND COPYRIGHT POLICIES\n\n# Privacy Policy & Terms of Use\n**Last Updated:** July 20, 2026\nBy using this App, you agree to this Privacy Policy and Terms of Use.\n\n# 2. Information We Collect\nDepending on how you use the App, we may collect:\n### Account Information\n* Username\n* Email address (if provided)\n* Profile picture\n* User ID\n\n### AI Conversations\n* Messages you send to AI models\n* AI-generated responses\n* Conversation timestamps\n* Api key is also saved in the database as the app requires users to put their own \n* It is safeguarded from abuse\n\n### Device Information\n* Device model\n* Operating system version\n* App version\n* Anonymous crash logs\n* Diagnostic information\n\n### Usage Information\n* Features used\n* App performance data\n* Error reports\n* General analytics\n\n---\n\n# 3. How We Use Your Information\nYour information may be used to:\n* Provide AI chat functionality.\n* Synchronize your account across devices.\n* Save your conversation history.\n* Improve app performance.\n* Prevent abuse and fraud.\n\n# 4. AI Providers\nThe App communicates with third-party AI providers, including OpenAI, NVIDIA, Meta, Mistral, and Google. When you send a prompt, your message may be transmitted to the selected provider for processing.\n\n# 7. API Keys\nThis project is open source. Users supply their own API keys. Attempting to abuse developer-provided credentials is prohibited.\n\n# 16. Disclaimer\nThe App is provided "AS IS". The developer makes no guarantees regarding accuracy of AI responses.\n\n[Full Copyright (CC0 1.0) and Terms are preserved in the system logs.]`,
      buttons: [
        {
          text: "Decline",
          style: "danger",
          onPress: () =>
            showModal({
              title: "Required",
              message: "You must accept the terms to use the app.",
              buttons: [{ text: "Exit App", style: "danger", onPress: exitApp }, { text: "Back" }],
            }),
        },
        {
          text: "Accept",
          onPress: () =>
            showModal({
              title: "Accepted",
              message: "Thank you for accepting the terms.",
              buttons: [{ text: "Continue" }],
            }),
        },
      ],
    });
  };

  const handleSend = async () => {
    bounce(scaleSend);
    const trimmed = message.trim();
    if (!trimmed) {
      showModal({ title: "Error", message: "Please enter a message.", buttons: [{ text: "OK", style: "cancel" }] });
      return;
    }
    const url = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("App Feedback")}&body=${encodeURIComponent(trimmed)}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      setMessage("");
    } else {
      showModal({ title: "Error", message: `Could not open mail app.\n\nPlease email: ${CONTACT_EMAIL}`, buttons: [{ text: "OK", style: "cancel" }] });
    }
  };

  return (
    <View style={s.fill}>
      <ScrollView
        style={s.container}
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <CustomModal visible={modalVisible} config={modalConfig} onClose={() => setModalVisible(false)} />

        {/* Header */}
        <View style={s.header}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.5 }]}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={s.pageTitle}>Support</Text>
        </View>

        {/* Contact Row */}
        <TouchableOpacity onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)} style={s.emailCard} activeOpacity={0.7}>
          <View>
            <Text style={s.cardLabel}>SUPPORT EMAIL</Text>
            <Text style={s.cardValue}>{CONTACT_EMAIL}</Text>
          </View>
          <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>

        <View style={s.divider} />

        {/* Form */}
        <Text style={s.formLabel}>SEND FEEDBACK</Text>
        <TextInput
          style={[s.input, focused && s.inputFocused]}
          placeholder="How can we help?"
          placeholderTextColor="rgba(255,255,255,0.25)"
          multiline
          value={message}
          onChangeText={setMessage}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        <Pressable onPress={handleSend}>
          <Animated.View style={[s.sendBtn, { transform: [{ scale: scaleSend }] }]}>
            <Text style={s.sendBtnText}>SEND MESSAGE</Text>
          </Animated.View>
        </Pressable>

        <View style={s.divider} />

        {/* Legal */}
        <View style={s.footer}>
          <TouchableOpacity onPress={showPrivacyAlert} style={s.footerLink} activeOpacity={0.6}>
            <Text style={s.footerLinkText}>PRIVACY POLICY & TERMS</Text>
          </TouchableOpacity>
          <Text style={s.footerNote}>© 2024 LLMclient. All rights reserved.</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1, backgroundColor: "#0c0c0c" },
  container: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 60 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    marginTop: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  pageTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },

  emailCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.1)",
  },
  cardLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 32,
  },

  formLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 16,
    color: "#fff",
    fontSize: 15,
    minHeight: 150,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  inputFocused: {
    borderColor: "rgba(255,255,255,0.25)",
  },
  sendBtn: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 14,
  },

  footer: {
    alignItems: "center",
    gap: 12,
  },
  footerLink: {
    padding: 10,
  },
  footerLinkText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  footerNote: {
    color: "rgba(255,255,255,0.2)",
    fontSize: 11,
  },
});
