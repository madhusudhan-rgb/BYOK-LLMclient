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
  const [Apikey, setapikey] = useState("");
  const [Apiurlendpoint, setapiurl] = useState("");
  const [hidden, setHidden] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!Apikey.trim() || !Apiurlendpoint.trim()) {
      Alert.alert("Error", "Please enter both the api key and Api url endpoint");
      return;
    }

    setLoading(true);
    try {
      const success = await login(Apikey.trim(), Apiurlendpoint);

      if (success) {
        Alert.alert("Success");
        router.replace("/apikeys");
      } else {
        Alert.alert("Error", "Invalid credentials");
      }
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/bg4.avif")}
      style={styles.background}
    >
      <View style={styles.overlay} />

      <View style={styles.card}>
        <Text style={styles.title}>Personal API key integration</Text>

        <TextInput
          style={styles.input}
          placeholder="Your own api key"
          placeholderTextColor="#928c8c"
          value={Apikey}
          onChangeText={setapikey}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="url endpoint https://...."
            placeholderTextColor="#aba6a6"
            secureTextEntry={hidden}
            value={Apiurlendpoint}
            onChangeText={setapiurl}
          />

          <TouchableOpacity onPress={() => setHidden(!hidden)}>
            <Ionicons
              name={hidden ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="white"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.loginButton, loading && { opacity: 0.6 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginText}>Configure</Text>
          )}
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
overlay : {
  flex:1
},
 

  card: {
    width: "88%",
    padding: 25,
    borderRadius: 20,
    backgroundColor: "rgba(25, 25, 25, 0.31)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom :400
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "white",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 15,
    color: "#ffffff",
    marginBottom: 25,
  },

  input: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#2222223b",
    color: "white",
    paddingHorizontal: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#444",
  },

  passwordContainer: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#22222229",
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
    backgroundColor: "#1def4a",
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
