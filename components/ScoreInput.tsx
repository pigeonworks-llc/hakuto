import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, STROKE_RANGE } from "../constants";

interface Props {
  value: number | undefined;
  onChange: (strokes: number) => void;
}

const QUICK_BUTTONS = [3, 4, 5, 6, 7];

export function ScoreInput({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      {/* メイン表示 */}
      <View style={styles.mainValue}>
        <Text style={styles.valueText}>{value ?? "-"}</Text>
        <Text style={styles.valueLabel}>打</Text>
      </View>

      {/* クイック選択 */}
      <View style={styles.quickRow}>
        {QUICK_BUTTONS.map((n) => (
          <Pressable
            key={n}
            onPress={() => onChange(n)}
            style={[styles.quickBtn, value === n && styles.quickBtnActive]}
          >
            <Text style={[styles.quickLabel, value === n && styles.quickLabelActive]}>
              {n}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* +/- ボタン */}
      <View style={styles.stepperRow}>
        <Pressable
          onPress={() => value != null && value > STROKE_RANGE.min && onChange(value - 1)}
          style={styles.stepper}
        >
          <Text style={styles.stepperLabel}>-1</Text>
        </Pressable>
        <Pressable
          onPress={() => value != null && value < STROKE_RANGE.max && onChange(value + 1)}
          style={styles.stepper}
        >
          <Text style={styles.stepperLabel}>+1</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: 20 },
  mainValue: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  valueText: { fontSize: 64, fontWeight: "800", color: COLORS.text },
  valueLabel: { fontSize: 20, color: COLORS.textSecondary },
  quickRow: { flexDirection: "row", gap: 10 },
  quickBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  quickBtnActive: { backgroundColor: COLORS.primary },
  quickLabel: { fontSize: 20, fontWeight: "700", color: COLORS.primary },
  quickLabelActive: { color: "#fff" },
  stepperRow: { flexDirection: "row", gap: 16 },
  stepper: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepperLabel: { fontSize: 18, fontWeight: "700", color: COLORS.primary },
});
