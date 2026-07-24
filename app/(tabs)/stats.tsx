import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../constants";
import type { StatsSummary } from "../../types";

export default function StatsScreen() {
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setLoading(true);
        try {
          const { getDb } = await import("../../db/index");
          const db = await getDb();

          const totals = await db.getFirstAsync<{ count: number; avg: number; min: number }>(
            "SELECT COUNT(*) as count, ROUND(AVG(total_strokes), 1) as avg, MIN(total_strokes) as min FROM rounds"
          );
          const recent = await db.getFirstAsync<{ avg: number }>(
            "SELECT ROUND(AVG(total_strokes), 1) as avg FROM (SELECT total_strokes FROM rounds ORDER BY played_at DESC, created_at DESC LIMIT 5)"
          );

          if (totals && totals.count > 0) {
            setSummary({
              totalRounds: totals.count,
              averageStrokes: totals.avg,
              bestScore: totals.min,
              recentAvgStrokes: recent?.avg ?? 0,
            });
          }
        } finally {
          setLoading(false);
        }
      })();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.screen}>
        <Text style={styles.empty}>読み込み中...</Text>
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>統計</Text>
        <Text style={styles.empty}>データがまだありません</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>統計</Text>

      {/* Summary cards */}
      <View style={styles.summaryGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{summary.totalRounds}</Text>
          <Text style={styles.statLabel}>総ラウンド</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{summary.averageStrokes}</Text>
          <Text style={styles.statLabel}>平均打数</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{summary.bestScore}</Text>
          <Text style={styles.statLabel}>ベスト</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{summary.recentAvgStrokes}</Text>
          <Text style={styles.statLabel}>直近5平均</Text>
        </View>
      </View>

      {/* Trend indicator */}
      {summary.averageStrokes > 0 && summary.recentAvgStrokes > 0 && (
        <View style={styles.trendCard}>
          <Text style={styles.trendLabel}>全体平均 {summary.averageStrokes} → 直近 {summary.recentAvgStrokes}</Text>
          <Text style={[styles.trendValue, summary.recentAvgStrokes <= summary.averageStrokes ? styles.trendUp : styles.trendDown]}>
            {summary.recentAvgStrokes <= summary.averageStrokes ? "📈 改善傾向" : "📉 要練習"}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  empty: { fontSize: 14, color: COLORS.textMuted, textAlign: "center", paddingVertical: 40 },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: {
    flex: 1,
    minWidth: "46%",
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    gap: 4,
  },
  statValue: { fontSize: 28, fontWeight: "800", color: COLORS.primary },
  statLabel: { fontSize: 12, color: COLORS.textSecondary },
  trendCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    alignItems: "center",
    gap: 4,
  },
  trendLabel: { fontSize: 13, color: COLORS.textSecondary },
  trendValue: { fontSize: 16, fontWeight: "700" },
  trendUp: { color: COLORS.success },
  trendDown: { color: COLORS.danger },
});
