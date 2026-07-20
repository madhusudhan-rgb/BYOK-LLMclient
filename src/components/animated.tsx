import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavbar } from "../context/NavbarContext";

const ACTIVE   = "#ffffff";
const INACTIVE = "rgba(255,255,255,0.28)";
const PILL_W   = 56;          
const SLOT_H   = 56;          
const PILL_R   = PILL_W / 2;  
type TabBarProps = {
  state: {
    index: number;
    routes: { name: string; key: string; params?: unknown }[];
  };
  descriptors: Record<
    string,
    { options: { tabBarIcon?: (p: { color: string; focused: boolean; size: number }) => React.ReactNode } }
  >;
  navigation: { navigate: (name: string) => void };
};


function TabItem({
  isFocused,
  descriptor,
  onPress,
}: {
  isFocused: boolean;
  descriptor: TabBarProps["descriptors"][string];
  onPress: () => void;
}) {
  const pressScale = useRef(new Animated.Value(1)).current;

  function onPressIn() {
    Animated.spring(pressScale, {
      toValue: 0.78, friction: 6, tension: 200, useNativeDriver: true,
    }).start();
  }
  function onPressOut() {
    Animated.spring(pressScale, {
      toValue: 1, friction: 5, tension: 120, useNativeDriver: true,
    }).start();
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={s.tabItem}
      hitSlop={8}
    >
      <Animated.View style={[s.tabInner, { transform: [{ scale: pressScale }] }]}>
        {descriptor?.options?.tabBarIcon?.({
          color: isFocused ? ACTIVE : INACTIVE,
          focused: isFocused,
          size: 23,
        })}
      </Animated.View>
    </Pressable>
  );
}


export default function AnimatedTabBar(props: TabBarProps) {
  const { showNavbar } = useNavbar();
  const insets = useSafeAreaInsets();

  const isOpenRef = useRef(false);
  const [isOpen, setIsOpen] = useState(false);

  // Expanded height depends on route count — store in ref so expandBar can read it
  const expandedHRef = useRef(SLOT_H);

  // ── Screen slide in/out ──
  const screenY     = useRef(new Animated.Value(120)).current;
  const screenOp    = useRef(new Animated.Value(0)).current;
  const screenScale = useRef(new Animated.Value(0.92)).current;

  // ── Expand / collapse (pillHeight can't use native driver — layout prop) ──
  const pillHeight = useRef(new Animated.Value(PILL_W)).current; // starts as circle
  const iconsOp    = useRef(new Animated.Value(0)).current;
  const iconsScale = useRef(new Animated.Value(0.7)).current;
  const triggerOp  = useRef(new Animated.Value(1)).current;
  const triggerScl = useRef(new Animated.Value(1)).current;

  const collapseBar = useCallback(() => {
    Animated.parallel([
      Animated.spring(pillHeight,  { toValue: PILL_W, friction: 7, tension: 68,   useNativeDriver: false }),
      Animated.timing(iconsOp,     { toValue: 0,       duration: 100,              useNativeDriver: true  }),
      Animated.spring(iconsScale,  { toValue: 0.7,     friction: 7, tension: 100,  useNativeDriver: true  }),
      Animated.timing(triggerOp,   { toValue: 1,       duration: 200, delay: 80,  useNativeDriver: true  }),
      Animated.spring(triggerScl,  { toValue: 1,       friction: 6, tension: 120,  useNativeDriver: true  }),
    ]).start(() => {
      isOpenRef.current = false;
      setIsOpen(false);
    });
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(screenY,     { toValue: showNavbar ? 0   : 120,  friction: 9, tension: 65, useNativeDriver: true }),
      Animated.timing(screenOp,    { toValue: showNavbar ? 1   : 0,    duration: 180,            useNativeDriver: true }),
      Animated.spring(screenScale, { toValue: showNavbar ? 1   : 0.92, friction: 9, tension: 80, useNativeDriver: true }),
    ]).start();
    if (!showNavbar) collapseBar();
  }, [showNavbar]);

  function expandBar() {
    if (isOpenRef.current) return;
    isOpenRef.current = true;
    setIsOpen(true);

    if (Platform.OS !== "web") Haptics.selectionAsync();

    Animated.parallel([
      Animated.spring(pillHeight,  { toValue: expandedHRef.current, friction: 7, tension: 52,  useNativeDriver: false }),
      Animated.timing(triggerOp,   { toValue: 0,                    duration: 100,             useNativeDriver: true  }),
      Animated.spring(triggerScl,  { toValue: 0.5,                  friction: 6, tension: 150, useNativeDriver: true  }),
      Animated.timing(iconsOp,     { toValue: 1,                    duration: 200,             useNativeDriver: true  }),
      Animated.spring(iconsScale,  { toValue: 1,                    friction: 7, tension: 80,  useNativeDriver: true  }),
    ]).start();
  }

  const handleTabPress = useCallback(
    (name: string) => {
      if (!isOpenRef.current) return;
      if (Platform.OS !== "web") Haptics.selectionAsync();
      props.navigation.navigate(name);
      collapseBar();
    },
    [props.navigation, collapseBar],
  );

  // Visible routes only (href:null screens have no tabBarIcon)
  const visibleRoutes = props.state.routes.filter(
    (route) => props.descriptors[route.key]?.options?.tabBarIcon != null,
  );

  // Keep expanded height in sync with route count
  expandedHRef.current = visibleRoutes.length * SLOT_H;

  const activeRoute       = props.state.routes[props.state.index];
  const activeDescriptor  = props.descriptors[activeRoute?.key];
  const triggerDescriptor = activeDescriptor?.options?.tabBarIcon
    ? activeDescriptor
    : props.descriptors[visibleRoutes[0]?.key];

  const bottomOffset = Math.max(insets.bottom, 8) + 6;

  return (
    <Animated.View
      pointerEvents={showNavbar ? "auto" : "none"}
      style={[
        s.wrapper,
        { bottom: bottomOffset },
        { transform: [{ translateY: screenY }, { scale: screenScale }], opacity: screenOp },
      ]}
    >
      {/* Shadow wrapper — separate from overflow:hidden clip */}
      <Animated.View style={[s.shadow, { height: pillHeight }]}>
        <View style={s.pillClip}>

          {/* ── Collapsed: single icon (centred in the circle) ── */}
          <Animated.View
            pointerEvents={isOpen ? "none" : "auto"}
            style={[s.layer, { opacity: triggerOp, transform: [{ scale: triggerScl }] }]}
          >
            <Pressable onPress={expandBar} style={s.triggerPressable}>
              {triggerDescriptor?.options?.tabBarIcon?.({
                color: ACTIVE, focused: true, size: 23,
              })}
            </Pressable>
          </Animated.View>

          {/* ── Expanded: tab items stacked vertically ── */}
          <Animated.View
            pointerEvents={isOpen ? "auto" : "none"}
            style={[s.layer, s.tabsColumn, { opacity: iconsOp, transform: [{ scale: iconsScale }] }]}
          >
            {visibleRoutes.map((route) => (
              <TabItem
                key={route.key}
                isFocused={activeRoute?.key === route.key}
                descriptor={props.descriptors[route.key]}
                onPress={() => handleTabPress(route.name)}
              />
            ))}
          </Animated.View>

        </View>
      </Animated.View>
    </Animated.View>
  );
}


const s = StyleSheet.create({
 
  wrapper: {
    position: "absolute",
    top : 650,
    right :5,
    alignSelf: "center",
  },

  shadow: {
    width: PILL_W,
    borderRadius: PILL_R,
    backgroundColor: "rgba(10,10,10,0.84)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 28,
    elevation: 24,
  },

  pillClip: {
    flex: 1,
    borderRadius: PILL_R,
    overflow: "hidden",
  },

  layer: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },

  // Column of icons — fills the expanded pill vertically
  tabsColumn: {
    flexDirection: "column",
    paddingVertical: 4,
  },

  triggerPressable: {
    width: PILL_W,
    height: PILL_W,
    alignItems: "center",
    justifyContent: "center",
  },

  tabItem: {
    width: PILL_W,
    height: SLOT_H,
    alignItems: "center",
    justifyContent: "center",
  },

  tabInner: {
    alignItems: "center",
    justifyContent: "center",
  },
});
