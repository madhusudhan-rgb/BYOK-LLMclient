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

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [hidden, setHidden] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both username and password");
      return;
    }
    setLoading(true);
    try {
      const success = await login(username.trim(), password);
      if (success) {
        router.replace("/profile");
      } else {
        Alert.alert("Error", "Invalid username or password");
      }
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[s.bg, { backgroundColor: "#0c0c0c" }]}>
      <View style={s.overlay} />
      <View style={s.inner}>
        <Text style={s.title}>Welcome back</Text>
        <Text style={s.subtitle}>Sign in to continue</Text>

        <TextInput
          style={s.input}
          placeholder="Username"
          placeholderTextColor="rgba(255,255,255,0.35)"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />

        <View style={s.passwordRow}>
          <TextInput
            style={s.passwordInput}
            placeholder="Password"
            placeholderTextColor="rgba(255,255,255,0.35)"
            secureTextEntry={hidden}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setHidden(!hidden)} hitSlop={8}>
            <Ionicons
              name={hidden ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="rgba(255,255,255,0.4)"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[s.button, loading && s.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading
            ? <ActivityIndicator color="#000" />
            : <Text style={s.buttonText}>Log in</Text>
          }
        </TouchableOpacity>

        <View style={s.footer}>
          <Text style={s.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.push("/signup")} hitSlop={8}>
            <Text style={s.footerLink}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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

  input: {
    height: 50,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.07)",
    color: "#fff",
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 12,
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
    marginBottom: 12,
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
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "600",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    marginTop: 24,
  },
  footerText: { color: "rgba(255,255,255,0.4)", fontSize: 14 },
  footerLink: { color: "#fff", fontSize: 14, fontWeight: "500" },
});
