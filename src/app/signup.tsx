import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { register } from "../utils/auth";
import { Ionicons } from "@expo/vector-icons";

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
    <ImageBackground source={require("../../assets/images/bg4.jpg")} style={s.bg}>
      <View style={s.overlay} />
      <View style={s.inner}>
        <Pressable
          onPress={() => router.push("/profile")}
          style={({ pressed }) => [
            {
              position: "absolute",
              top: 50,
              left: 20,
              zIndex: 10,
              opacity: pressed ? 0.5 : 1,
            }
          ]}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>

        <Text style={s.title}>Create account</Text>
        <Text style={s.subtitle}>Sign up to get started</Text>

        <TextInput
          style={s.input}
          placeholder="Username"
          placeholderTextColor="rgba(255,255,255,0.35)"
          autoCapitalize="none"
          onChangeText={setUsername}
          value={username}
          selectionColor="#fff"
        />

        <TextInput
          style={s.input}
          placeholder="Password"
          placeholderTextColor="rgba(255,255,255,0.35)"
          secureTextEntry
          onChangeText={setPassword}
          value={password}
          selectionColor="#fff"
        />

        <Pressable
          style={({ pressed }) => [s.button, (loading || pressed) && s.buttonDisabled]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#000" />
            : <Text style={s.buttonText}>Create account</Text>
          }
        </Pressable>

        <View style={s.footer}>
          <Text style={s.footerText}>Already have an account?</Text>
          <Pressable onPress={() => router.push("/login")} hitSlop={8} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
            <Text style={s.footerLink}>Log in</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.65)" },
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
