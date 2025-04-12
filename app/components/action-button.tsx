import { Pressable, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface ActionButtonProps {
  icon: string
  label: string
  onPress: () => void
  isDark: boolean
}

export default function ActionButton({ icon, label, onPress, isDark }: ActionButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, isDark && styles.buttonDark, pressed && styles.buttonPressed]}
      onPress={onPress}
    >
      <Ionicons name={icon as any} size={24} color={isDark ? "#8BC34A" : "#4CAF50"} />
      <Text style={[styles.label, isDark && styles.labelDark]}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDark: {
    backgroundColor: "rgba(30, 30, 30, 0.9)",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  label: {
    fontSize: 12,
    color: "#333333",
    marginTop: 4,
  },
  labelDark: {
    color: "#E0E0E0",
  },
})
