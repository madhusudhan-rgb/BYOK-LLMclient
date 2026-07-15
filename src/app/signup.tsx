import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ImageBackground,
  Pressable,
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
    
    <ImageBackground 
   source={require("../../assets/images/bg4.avif")}
   style = {styles.background}>
    <View style={styles.container}>
      <View style = {styles.formContainer}>
      <Text style={styles.title}>Create an Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>
      <Text style = {{color : "white", fontWeight : "200", marginLeft : 60, marginTop : 20}}>Already have an account ? </Text>
      <Pressable onPress = {() => router.push("/login")}>
        <Text style = {{fontWeight : "700", color : "lightgreen", marginLeft : 190, marginTop : -17, fontSize : 16}}> Login </Text>
      </Pressable>
      </View>
    </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    
  },
   background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    color: "white",
    marginBottom: 20,
    marginLeft : 10,
    fontWeight : "700"
  },
  input: {
    backgroundColor: "rgba(243, 250, 243, 0.25)",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    color: "white",
    borderColor : "rgba(255, 255, 255, 0.3)",
    borderWidth : 1
  },
  button: {
    backgroundColor: "#00cc2c",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    width : 100,
    marginLeft : 104
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  formContainer: {
    backgroundColor: "rgba(40, 37, 37, 0.21)",
    padding: 20,
    borderRadius: 15,
    width : 350,
    height : 290,
    marginLeft : 12,
    borderWidth : 1,
    borderColor : "rgba(255, 252, 252, 0.58)"
  },
});
