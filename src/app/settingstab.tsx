import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  notifications: "@settings/notifications",
  alerts: "@settings/alerts",
};

export default function SettingsTab() {
  const [notifications, setNotifications] = useState(false);
  const [alerts, setAlerts] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [n, a] = await Promise.all([
        AsyncStorage.getItem(KEYS.notifications),
        AsyncStorage.getItem(KEYS.alerts),
      ]);

      if (n !== null) setNotifications(n === "true");
      if (a !== null) setAlerts(a === "true");

      setLoading(false);
    })();
  }, []);

  const toggle = async (
    key: string,
    value: boolean,
    setter: (v: boolean) => void
  ) => {
    setter(value);
    await AsyncStorage.setItem(key, String(value));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.main}>
      <Text style={styles.header}>Settings</Text>

      <View style={styles.row}>
        <View>
          <Text style={styles.label}>Notifications</Text>
          <Text style={styles.sub}>
            {notifications ? "On" : "Off"}
          </Text>
        </View>

        <Switch
          value={notifications}
          onValueChange={(v) =>
            toggle(KEYS.notifications, v, setNotifications)
          }
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={notifications ? "#f5dd4b" : "#f4f3f4"}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <View>
          <Text style={styles.label}>Alerts</Text>
          <Text style={styles.sub}>
            {alerts ? "On" : "Off"}
          </Text>
        </View>

        <Switch
          value={alerts}
          onValueChange={(v) => toggle(KEYS.alerts, v, setAlerts)}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={alerts ? "#f5dd4b" : "#f4f3f4"}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.88)",
    justifyContent: "center",
    alignItems: "center",
  },
  main: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.88)",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 30,
    color: "#fff",
    fontWeight: "300",
    marginBottom: 32,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  label: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "300",
  },
  sub: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 12,
    marginTop: 2,
  },
});