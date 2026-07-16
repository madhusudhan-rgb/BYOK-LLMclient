import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export type ModalButton = {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "danger";
};

export type ModalConfig = {
  title: string;
  message: string;
  buttons: ModalButton[];
};

export function CustomModal({
  visible,
  config,
  onClose,
}: {
  visible: boolean;
  config: ModalConfig | null;
  onClose: () => void;
}) {
  if (!config) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.box}>
          <View style={s.body}>
            <Text style={s.title}>{config.title}</Text>
            <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
              <Text style={s.message}>{config.message}</Text>
            </ScrollView>
          </View>

          <View style={s.divider} />

          <View style={[s.btnRow, config.buttons.length > 2 && s.btnCol]}>
            {config.buttons.map((btn, i) => (
              <Pressable
                key={i}
                style={({ pressed }) => [
                  s.btn,
                  config.buttons.length > 2 && s.btnFull,
                  i < config.buttons.length - 1 && (
                    config.buttons.length > 2 ? s.btnBottomBorder : s.btnRightBorder
                  ),
                  pressed && s.btnPressed,
                ]}
                onPress={() => { onClose(); setTimeout(() => btn.onPress?.(), 300); }}
              >
                <Text style={[
                  s.btnText,
                  btn.style === "cancel" && s.btnTextCancel,
                  btn.style === "danger" && s.btnTextDanger,
                ]}>
                  {btn.text}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  box: {
    width: "100%",
    backgroundColor: "#1c1c1c",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    overflow: "hidden",
  },
  body: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  message: {
    color: "#888",
    fontSize: 14,
    lineHeight: 20,
  },
  divider: { height: 1, backgroundColor: "#2a2a2a" },

  btnRow: { flexDirection: "row" },
  btnCol: { flexDirection: "column" },

  btn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  btnFull: { flex: 0 },
  btnRightBorder: { borderRightWidth: 1, borderRightColor: "#2a2a2a" },
  btnBottomBorder: { borderBottomWidth: 1, borderBottomColor: "#2a2a2a" },
  btnPressed: { backgroundColor: "#252525" },

  btnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  btnTextCancel: { color: "#666" },
  btnTextDanger: { color: "#ff453a" },
});