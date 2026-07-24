import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../../components/ui/Button";
import { COLORS } from "../../constants";
import type { RoundWithScores } from "../../types";

export default function RoundDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [round, setRound] = useState<RoundWithScores | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setLoading(true);
        try {
          const { getRound } = await import("../../db/repositories/round");
          const { getDb } = await import("../../db/index");
          const db = await getDb();
          setRound(await getRound(db, id));
        } finally {
          setLoading(false);
        }
      })();
    }, [id])
  );

  if (loading) {
    return (
      <View style={styles.screen}>
        <Text style={styles.muted}>読み込み中...</Text>
      </View>
    );
  }

  if (!round) {
    return (
      <View style={styles.screen}>
        <Text style={styles.muted}>ラウンドが見つかりません</Text>
        <Button variant="ghost" onPress={() => router.back()}>
          戻る
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{round.courseName}</Text>
      <Text style={styles.date}>{round.date}</Text>
      <Text style={styles.total}>{round.totalStrokes} 打</Text>

      <View style={styles.grid}>
        {round.scores.map((s) => (
          <View key={s.id} style={styles.holeBox}>
            <Text style={styles.holeNum}>H{s.holeNumber}</Text>
            <Text style={styles.holeScore}>{s.strokes}</Text>
          </View>
        ))}
      </View>

      <Button variant="ghost" onPress={() => router.back()}>
        戻る
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, gap: 16, alignItems: "center" },
  title: { fontSize: 24, fontWeight: "800", color: COLORS.text },
  date: { fontSize: 14, color: COLORS.textSecondary },
  total: { fontSize: 48, fontWeight: "900", color: COLORS.primary },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    paddingVertical: 16,
  },
  holeBox: {
    width: 64,
    padding: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    gap: 4,
  },
  holeNum: { fontSize: 12, color: COLORS.textSecondary },
  holeScore: { fontSize: 22, fontWeight: "700", color: COLORS.text },
  muted: { fontSize: 14, color: COLORS.textMuted, textAlign: "center", paddingVertical: 40 },
});
