import React, { useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { login } from "../utils/auth";

export default function ApiKeys() {
  const [apiKey, setApiKey] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [urlVisible, setUrlVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!apiKey.trim() || !apiUrl.trim()) {
      Alert.alert("Error", "Please enter both an API key and endpoint URL");
      return;
    }
    setLoading(true);
    try {
      const success = await login(apiKey.trim(), apiUrl.trim());
      if (success) {
        router.replace("/apikeys");
      } else {
        Alert.alert("Error", "Invalid credentials");
      }
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={require("../../assets/images/bg4.avif")} style={s.bg}>
      <View style={s.overlay} />
      <View style={s.inner}>
        <Text style={s.title}>API configuration</Text>
        <Text style={s.subtitle}>Connect your own API key and endpoint</Text>

        <Text style={s.label}>API Key</Text>
        <TextInput
          style={s.input}
          placeholder="sk-..."
          placeholderTextColor="rgba(255,255,255,0.25)"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
          value={apiKey}
          onChangeText={setApiKey}
        />

        <Text style={s.label}>Endpoint URL</Text>
        <View style={s.passwordRow}>
          <TextInput
            style={s.passwordInput}
            placeholder="https://api.example.com/v1"
            placeholderTextColor="rgba(255,255,255,0.25)"
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={!urlVisible}
            value={apiUrl}
            onChangeText={setApiUrl}
          />
          <TouchableOpacity onPress={() => setUrlVisible(!urlVisible)} hitSlop={8}>
            <Ionicons
              name={urlVisible ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="rgba(255,255,255,0.4)"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[s.button, loading && s.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading
            ? <ActivityIndicator color="#000" />
            : <Text style={s.buttonText}>Save configuration</Text>
          }
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.72)" },
  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "600",
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  subtitle: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 15,
    marginBottom: 32,
  },

  label: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.4,
    marginBottom: 7,
    marginLeft: 2,
  },

  input: {
    height: 50,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.07)",
    color: "#fff",
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.12)",
  },

  passwordRow: {
    height: 50,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.12)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
  },

  button: {
    height: 50,
    borderRadius: 11,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "600",
  },
});
