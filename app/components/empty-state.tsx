import { View, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface EmptyStateProps {
  icon: string
  title: string
  message: string
  isDark: boolean
}

export default function EmptyState({ icon, title, message, isDark }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon as any} size={80} color={isDark ? "#8BC34A" : "#4CAF50"} style={styles.icon} />
      <Text style={[styles.title, isDark && styles.titleDark]}>{title}</Text>
      <Text style={[styles.message, isDark && styles.messageDark]}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  icon: {
    marginBottom: 16,
    opacity: 0.8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
    textAlign: "center",
  },
  titleDark: {
    color: "#E0E0E0",
  },
  message: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
  },
  messageDark: {
    color: "#A0A0A0",
  },
})
