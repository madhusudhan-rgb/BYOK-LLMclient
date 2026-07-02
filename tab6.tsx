import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { useNavbar } from "../context/NavbarContext";
import { CustomModal, ModalConfig } from "../components/CustomModal";

export default function GithubScreen() {
  const [openWeb, setOpenWeb]   = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig,  setModalConfig]  = useState<ModalConfig | null>(null);

  const webRef = useRef<WebView>(null);
  const insets = useSafeAreaInsets();
  const { setShowNavbar } = useNavbar();

  const showModal = (config: ModalConfig) => { setModalConfig(config); setModalVisible(true); };

  useEffect(() => { setShowNavbar(!openWeb); }, [openWeb, setShowNavbar]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <CustomModal visible={modalVisible} config={modalConfig} onClose={() => setModalVisible(false)} />

      {!openWeb ? (
        <View style={styles.basePage}>
          
            <Text style={styles.ghIcon}></Text>
            <Text style={styles.title}></Text>
            <Text style={styles.subtitle}>
              
            </Text>
            <Pressable
              style={styles.primaryBtn}
              onPress={() => showModal({
                title: "Continue to GitHub?",
                message: "You'll be taken to github.com/madhusudhan-rgb in a browser view inside the app.",
                buttons: [
                  { text: "Let's go →", onPress: () => setOpenWeb(true) },
                  { text: "Cancel", style: "cancel" },
                ],
              })}
            >
              <Text style={styles.primaryBtnText}>Github</Text>
            </Pressable>
            <Pressable
              style={styles.infoBtn}
              onPress={() => showModal({
                title: "ℹ️ Info",
                message: "Check out my GitHub to support the project or leave feedback.\n\ngithub.com/madhusudhan-rgb",
                buttons: [{ text: "Got it", style: "cancel" }],
              })}
            >
              <Text style={styles.infoBtnText}>Info</Text>
            </Pressable>
          </View>
       
      ) : (
        <View style={styles.webContainer}>
          <WebView
            ref={webRef}
            source={{ uri: "https://github.com/madhusudhan-rgb" }}
            style={styles.webView}
            startInLoadingState
          />
          <Pressable
            onPress={() => setOpenWeb(false)}
            style={[styles.exitBtn, { bottom: Math.max(insets.bottom + 16, 32) }]}
          >
            <Text style={styles.exitBtnText}>✕ Exit</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0d0d" },
  basePage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "#141414",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
  },
  ghIcon: { fontSize: 48, marginBottom: 12 },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 24,
  },
  primaryBtn: {
    backgroundColor: "#00cc2c",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
    width: 100,
    alignItems: "center",
    marginBottom: 10,
    
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  infoBtn: {
    paddingVertical: 7,
    paddingHorizontal: 28,
    borderRadius: 50,
    width: 100,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  infoBtnText: { color: "rgba(255,255,255,0.5)", fontWeight: "600", fontSize: 14 },
  webContainer: { flex: 1 },
  webView: { flex: 1 },
  exitBtn: {
    position: "absolute",
    right: 20,
    backgroundColor: "#cc2200",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 100,
  },
  exitBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});