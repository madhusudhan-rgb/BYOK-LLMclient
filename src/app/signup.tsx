import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { register } from "../utils/auth";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both username and password");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const success = await register(username.trim(), password);
      if (success) {
        Alert.alert("Success", "Account created! You can now log in.");
        router.push("/login");
      } else {
        Alert.alert("Error", "Username already exists or signup failed");
      }
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[s.bg, { backgroundColor: "#0c0c0c" }]}>
      <View style={s.overlay} />
      <View style={s.inner}>
        <Text style={s.title}>Create account</Text>
        <Text style={s.subtitle}>Sign up to get started</Text>

        <TextInput
          style={s.input}
          placeholder="Username"
          placeholderTextColor="rgba(255,255,255,0.35)"
          autoCapitalize="none"
          onChangeText={setUsername}
          value={username}
        />

        <TextInput
          style={s.input}
          placeholder="Password"
          placeholderTextColor="rgba(255,255,255,0.35)"
          secureTextEntry
          onChangeText={setPassword}
          value={password}
        />

        <TouchableOpacity
          style={[s.button, loading && s.buttonDisabled]}
          onPress={handleSignup}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading
            ? <ActivityIndicator color="#000" />
            : <Text style={s.buttonText}>Create account</Text>
          }
        </TouchableOpacity>

        <View style={s.footer}>
          <Text style={s.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push("/login")} hitSlop={8}>
            <Text style={s.footerLink}>Log in</Text>
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
