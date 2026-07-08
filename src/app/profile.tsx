import { useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { getCurrentUser } from "../utils/auth";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

export default function Home() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [age, setAge] = useState(18); // reasonable default
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const increase = () => setAge((prev) => Math.min(120, prev + 1));
  const decrease = () => setAge((prev) => Math.max(1, prev - 1));

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Required", "Permission to access your photos is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const confirmAge = () => {
    Alert.alert("Age Set", `Your age has been set to: ${age}`);
    // TODO: Save age to backend/user profile here
  };

  useEffect(() => {
    const loadUser = async () => {
      const current = await getCurrentUser();
      setUser(current);
    };
    loadUser();
  }, []);

  return (
    <ImageBackground
      source={require("../../assets/images/bg4.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.prof}>
        {/* Profile Image */}
        <Pressable onPress={pickImage} style={styles.imageContainer}>
          <Image
            source={
              profileImage
                ? { uri: profileImage }
                : require("../../assets/images/profile.jpg")
            }
            style={styles.profimg}
          />
        </Pressable>

        {/* Username */}
        <Text style={styles.Proftext}>
          Name: {user ? user.username : "Guest"}
        </Text>

        {/* Age Stepper */}
        <View style={styles.ageContainer}>
          <Text style={styles.ageLabel}>Age : </Text>

          <Pressable style={styles.ageButton} onPress={decrease}>
            <Text style={styles.ageButtonText}>-</Text>
          </Pressable>

          <Text style={styles.ageText}>{age}</Text>

          <Pressable style={styles.ageButton} onPress={increase}>
            <Text style={styles.ageButtonText}>+</Text>
          </Pressable>

          <Pressable style={styles.ageverify} onPress={confirmAge}>
            <Text style={styles.checkmark}>✓</Text>
          </Pressable>
        </View>

        {/* Menu Button */}
        <Pressable
          style={styles.profileButton}
          onPress={() => setOpen(!open)}
        >
          <Ionicons name="menu" size={28} color="white" />
        </Pressable>

        {/* Popup Menu */}
        {open && (
          <View style={styles.popup}>
            <Pressable
              style={styles.option}
              onPress={() => {
                setOpen(false);
                router.push("/login");
              }}
            >
              <Text style={styles.optionText}>Login / Signup</Text>
            </Pressable>

            <Pressable
              style={styles.option}
              onPress={() => {
                setOpen(false);
                router.push("/contact");
              }}
            >
              <Text style={styles.optionText}>Info</Text>
            </Pressable>

            <Pressable
              style={styles.option}
              onPress={() => setOpen(false)}
            >
              <Text style={styles.optionText}>Close</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  prof: {
    width: 360,
    height: 340,
    borderRadius: 25,
    backgroundColor: "rgba(30, 28, 28, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 20,
    alignSelf: "center",
    marginTop: 80, // Adjusted from negative top
  },

  imageContainer: {
    alignSelf: "flex-start",
    marginTop: 10,
  },

  profimg: {
    width: 78,
    height: 78,
    borderRadius: 39,
  },

  Proftext: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },

  ageContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    gap: 1,
  },

  ageLabel: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },

  ageButton: {
    width: 15,
    height: 20,
    borderRadius: 8,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },

  ageButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  ageText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    minWidth: 35,
    textAlign: "center",
  },

  ageverify: {
    marginLeft: "auto",
    backgroundColor: "#4CAF50",
    width:20,
    height: 20,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight :190
  },

  checkmark: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },

  profileButton: {
    position: "absolute",
    top: 20,
    right: 20,
  },

  popup: {
    position: "absolute",
    top: 65,
    right: 20,
    width: 200,
    backgroundColor: "#222",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  option: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },

  optionText: {
    color: "white",
    fontSize: 16,
  },
});