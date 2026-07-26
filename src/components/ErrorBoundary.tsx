import React, { Component, ReactNode } from "react";
import { StyleSheet, Text, View, ScrollView, Platform } from "react-native";

type Props = { children: ReactNode };
type State = { hasError: boolean; error?: Error; errorInfo?: React.ErrorInfo };

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Critical Boot Error</Text>
          <ScrollView style={styles.scroll}>
            <Text style={styles.message}>
              {this.state.error?.name}: {this.state.error?.message}
            </Text>
            <Text style={styles.stack}>
              {this.state.error?.stack}
            </Text>
            {this.state.errorInfo && (
              <Text style={styles.stack}>
                {this.state.errorInfo.componentStack}
              </Text>
            )}
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#0c0c0c",
  },
  scroll: {
    marginTop: 20,
  },
  title: {
    color: "#ff453a",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  message: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  stack: {
    color: "#888",
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
