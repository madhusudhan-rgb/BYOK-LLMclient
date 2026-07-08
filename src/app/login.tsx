import React, { useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { login } from "../utils/auth";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [hidden, setHidden] = useState(true);

  const handleLogin = async () => {
    const success = await login(username, password);

    if (success) {
      Alert.alert("Success", "Logged in!");
      router.replace("/profile");
    } else {
      Alert.alert("Error", "Invalid credentials");
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/bg4.jpg")}
      style={styles.background}
    >
      <View style={styles.overlay} />

      <View style={styles.card}>
        <Text style={styles.title}>Welcome Back</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#888"
          value={username}
          onChangeText={setUsername}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor="#888"
            secureTextEntry={hidden}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity onPress={() => setHidden(!hidden)}>
            <Ionicons
              name={hidden ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="white"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/signup")}>
          <Text style={styles.signupText}>
            Don't have an account?{" "}
            <Text style={styles.signupLink}>Create one</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.55)",
  },

  card: {
    width: "88%",
    padding: 25,
    borderRadius: 25,
    backgroundColor: "rgba(25,25,25,0.75)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "white",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 15,
    color: "#bbb",
    marginBottom: 25,
  },

  input: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#222",
    color: "white",
    paddingHorizontal: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#444",
  },

  passwordContainer: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#222",
    borderWidth: 1,
    borderColor: "#444",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 20,
  },

  passwordInput: {
    flex: 1,
    color: "white",
  },

  loginButton: {
    backgroundColor: "#00cc2c",
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  loginText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },

  signupText: {
    color: "#bbb",
    textAlign: "center",
  },

  signupLink: {
    color: "#00cc2c",
    fontWeight: "700",
  },
});