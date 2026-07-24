import { useColorScheme } from "react-native";
import { COLORS } from "../constants";

/**
 * 現在のカラースキームに応じたテーマカラーを返す。
 */
export function useTheme() {
  const scheme = useColorScheme();

  return {
    background: scheme === "dark" ? "#1a1a1a" : COLORS.background,
    surface: scheme === "dark" ? "#2a2a2a" : COLORS.surface,
    text: COLORS.text,
    textSecondary: scheme === "dark" ? "#aaaaaa" : COLORS.textSecondary,
    textMuted: scheme === "dark" ? "#777777" : COLORS.textMuted,
    border: scheme === "dark" ? "#3a3a3a" : COLORS.border,
    primary: COLORS.primary,
    accent: COLORS.accent,
    danger: COLORS.danger,
    success: COLORS.success,
  };
}
