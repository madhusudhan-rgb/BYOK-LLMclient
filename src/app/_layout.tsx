import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavbarProvider, useNavbar } from "../context/NavbarContext";
import { ErrorBoundary } from "../components/ErrorBoundary";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

const ACCENT   = "#00cc2c";
const INACTIVE = "rgba(255,255,255,0.3)";

function TabContent() {
  const { showNavbar } = useNavbar();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: 12,
          left: 24,
          right: 24,
          height: 65,
          borderRadius: 50,
          backgroundColor: "rgba(18, 18, 18, 0.32)",
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
          display: showNavbar ? "flex" : "none",
          paddingHorizontal: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 20,
          elevation: 20,
        
        },
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: INACTIVE,
        tabBarItemStyle: {
          paddingVertical: 8,
          borderRadius: 30,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "chatbox-ellipses" : "chatbox-ellipses-outline"} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="signup"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="contact"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  const [isReady, setReady] = useState(false);

  useEffect(() => {
    // Hide splash screen when app is ready
    SplashScreen.hideAsync();
    setReady(true);
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <NavbarProvider>
            <TabContent />
          </NavbarProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
  },
});