import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../constants";
import type { Round } from "../types";

interface Props {
  round: Round;
  onPress: (id: string) => void;
}

function formatPlayedAt(playedAt: string): string {
  try {
    const d = new Date(playedAt);
    if (isNaN(d.getTime())) return playedAt;
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    const h = d.getHours().toString().padStart(2, "0");
    const min = d.getMinutes().toString().padStart(2, "0");
    return `${y}/${m}/${day} ${h}:${min}`;
  } catch {
    return playedAt;
  }
}

export function RoundCard({ round, onPress }: Props) {
  return (
    <Pressable onPress={() => onPress(round.id)} style={styles.card}>
      <View style={styles.left}>
        <Text style={styles.date}>{formatPlayedAt(round.playedAt)}</Text>
        <Text style={styles.course}>{round.place ?? "場所不明"}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.strokes}>{round.totalStrokes}</Text>
        <Text style={styles.sourceLabel}>{sourceLabel(round.source)}</Text>
      </View>
    </Pressable>
  );
}

function sourceLabel(source: Round["source"]): string {
  switch (source) {
    case "watch": return "⌚";
    case "ocr": return "📷";
    case "manual": return "";
  }
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  left: { gap: 4 },
  date: { fontSize: 14, color: COLORS.textSecondary },
  course: { fontSize: 16, fontWeight: "600", color: COLORS.text },
  right: { alignItems: "flex-end", gap: 2 },
  strokes: { fontSize: 28, fontWeight: "800", color: COLORS.primary },
  sourceLabel: { fontSize: 14 },
});
