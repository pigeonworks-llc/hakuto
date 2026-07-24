import { Platform, Pressable, StyleSheet, Text } from "react-native";
import { COLORS } from "../../constants";

type Variant = "primary" | "secondary" | "outline" | "ghost";

interface Props {
  variant?: Variant;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
  children: React.ReactNode;
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: { backgroundColor: COLORS.primary },
  secondary: { backgroundColor: COLORS.accent },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  ghost: { backgroundColor: "transparent" },
  disabled: { opacity: 0.4 },
  label: { fontSize: 16, fontWeight: "700", color: "#fff" },
  labelOutline: { color: COLORS.primary },
  labelGhost: { color: COLORS.primary },
});

export function Button({ variant = "primary", onPress, disabled, testID, children }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      android_ripple={Platform.OS === "android" ? { color: "rgba(255,255,255,0.2)" } : undefined}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        disabled && styles.disabled,
        pressed && Platform.OS === "ios" && { opacity: 0.7 },
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === "outline" && styles.labelOutline,
          variant === "ghost" && styles.labelGhost,
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}
