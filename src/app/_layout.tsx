import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { NavbarProvider } from "../context/NavbarContext";
import { ErrorBoundary } from "../components/ErrorBoundary";
import AnimatedTabBar from "../components/animated";


function TabContent() {
  return (
    <Tabs
      tabBar={(props) => <AnimatedTabBar {...props} />}
      
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
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
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={23}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused
                  ? "chatbox-ellipses"
                  : "chatbox-ellipses-outline"
              }
              size={23}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settingstab"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={17}
              color={color}
            />
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
        name="apikeys"
        options={{
          href: null,
        }}
      />
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