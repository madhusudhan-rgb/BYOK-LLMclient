import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavbar } from "../context/NavbarContext";

const ACTIVE   = "#ffffff";
const INACTIVE = "rgba(255,255,255,0.32)";
const PILL_W   = 56;
const SLOT_H   = 54;
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
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() =>
        Animated.spring(scale, { toValue: 0.75, friction: 6, tension: 220, useNativeDriver: true }).start()
      }
      onPressOut={() =>
        Animated.spring(scale, { toValue: 1, friction: 5, tension: 130, useNativeDriver: true }).start()
      }
      style={s.tabItem}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {descriptor?.options?.tabBarIcon?.({
          color: isFocused ? ACTIVE : INACTIVE,
          focused: isFocused,
          size: 22,
        })}
      </Animated.View>
    </Pressable>
  );
}

export default function AnimatedTabBar(props: TabBarProps) {
  const { showNavbar } = useNavbar();
  const insets = useSafeAreaInsets();

  // Single source of truth for open/closed — updated at the START of each
  // transition so pointerEvents switch immediately and can never get stuck.
  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef(false);   // ref mirrors state for use inside callbacks
  const animating = useRef(false);   // blocks double-triggers mid-animation

  const visibleRoutes = props.state.routes.filter(
    r => props.descriptors[r.key]?.options?.tabBarIcon != null,
  );
  const expandedH = visibleRoutes.length * SLOT_H;

  const screenY     = useRef(new Animated.Value(120)).current;
  const screenOp    = useRef(new Animated.Value(0)).current;
  const screenScale = useRef(new Animated.Value(0.92)).current;

  const pillHeight  = useRef(new Animated.Value(PILL_W)).current;
  const iconsOp     = useRef(new Animated.Value(0)).current;
  const iconsScale  = useRef(new Animated.Value(0.7)).current;
  const triggerOp   = useRef(new Animated.Value(1)).current;
  const triggerScl  = useRef(new Animated.Value(1)).current;

  // Stop all pill animations so their callbacks don't fire after we've moved on
  function stopPillAnims() {
    pillHeight.stopAnimation();
    iconsOp.stopAnimation();
    iconsScale.stopAnimation();
    triggerOp.stopAnimation();
    triggerScl.stopAnimation();
  }

  const collapseBar = useCallback(() => {
    // Flip state immediately — pointerEvents switch right away
    isOpenRef.current = false;
    setIsOpen(false);
    animating.current = true;

    stopPillAnims();

    Animated.parallel([
      Animated.spring(pillHeight, { toValue: PILL_W, friction: 7, tension: 70,  useNativeDriver: false }),
      Animated.timing(iconsOp,    { toValue: 0,       duration: 90,              useNativeDriver: true  }),
      Animated.spring(iconsScale, { toValue: 0.7,     friction: 7, tension: 110, useNativeDriver: true  }),
      Animated.timing(triggerOp,  { toValue: 1,       duration: 180, delay: 70,  useNativeDriver: true  }),
      Animated.spring(triggerScl, { toValue: 1,       friction: 6, tension: 120, useNativeDriver: true  }),
    ]).start(() => {
      animating.current = false;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(screenY,     { toValue: showNavbar ? 0 : 120,   friction: 9, tension: 65, useNativeDriver: true }),
      Animated.timing(screenOp,    { toValue: showNavbar ? 1 : 0,     duration: 180,            useNativeDriver: true }),
      Animated.spring(screenScale, { toValue: showNavbar ? 1 : 0.92,  friction: 9, tension: 80, useNativeDriver: true }),
    ]).start();
    if (!showNavbar) collapseBar();
  }, [showNavbar, collapseBar]);

  function expandBar() {
    if (isOpenRef.current || animating.current) return;

    // Flip state immediately
    isOpenRef.current = true;
    setIsOpen(true);
    animating.current = true;

    if (Platform.OS !== "web") Haptics.selectionAsync();

    stopPillAnims();

    Animated.parallel([
      Animated.spring(pillHeight, { toValue: expandedH, friction: 7, tension: 52,  useNativeDriver: false }),
      Animated.timing(triggerOp,  { toValue: 0,          duration: 90,              useNativeDriver: true  }),
      Animated.spring(triggerScl, { toValue: 0.5,        friction: 6, tension: 160, useNativeDriver: true  }),
      Animated.timing(iconsOp,    { toValue: 1,          duration: 200,             useNativeDriver: true  }),
      Animated.spring(iconsScale, { toValue: 1,          friction: 7, tension: 80,  useNativeDriver: true  }),
    ]).start(() => {
      animating.current = false;
    });
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

  const activeRoute      = props.state.routes[props.state.index];
  const activeDescriptor = props.descriptors[activeRoute?.key];
  const triggerDescriptor =
    activeDescriptor?.options?.tabBarIcon
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
      <Animated.View style={[s.shadow, { height: pillHeight }]}>

        <Animated.View
          pointerEvents={isOpen ? "none" : "auto"}
          style={[s.layer, { opacity: triggerOp, transform: [{ scale: triggerScl }] }]}
        >
          <Pressable onPress={expandBar} style={s.trigger}>
            {triggerDescriptor?.options?.tabBarIcon?.({
              color: ACTIVE, focused: true, size: 22,
            })}
          </Pressable>
        </Animated.View>

        <Animated.View
          pointerEvents={isOpen ? "auto" : "none"}
          style={[s.layer, s.tabsColumn, { opacity: iconsOp, transform: [{ scale: iconsScale }] }]}
        >
          {visibleRoutes.map(route => (
            <TabItem
              key={route.key}
              isFocused={activeRoute?.key === route.key}
              descriptor={props.descriptors[route.key]}
              onPress={() => handleTabPress(route.name)}
            />
          ))}
        </Animated.View>

      </Animated.View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrapper: {
    position: "absolute",
    right: 6,
    top : 600
  },

  shadow: {
    width: PILL_W,
    borderRadius: PILL_R,
    backgroundColor: "rgba(12, 12, 12, 0.18)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 255, 255, 0)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 20,
    overflow: "hidden",
  },

  layer: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },

  tabsColumn: {
    flexDirection: "column",
    justifyContent: "space-evenly",
    paddingVertical: 6,
  },

  trigger: {
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
});
