import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavbarProvider, useNavbar } from "../context/NavbarContext";
import { ErrorBoundary } from "../components/ErrorBoundary";
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
          bottom: 10,
          left: "5%",
          right: "5%",
          height: 60,
          borderRadius: 30,
          backgroundColor: "rgba(18, 18, 18, 0.9)",
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
          display: showNavbar ? "flex" : "none",
          paddingHorizontal: 10,
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
            <Ionicons name={focused ? "home" : "home-outline"} size={23} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "chatbox-ellipses" : "chatbox-ellipses-outline"} size={23} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settingstab"
        options={{
          href : null
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={17} color={color} />
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
      <Tabs.Screen
      name = "apikeys"
      options = {{
        href : null
      }}/>
    </Tabs>
  );
}

export default function TabLayout() {
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
