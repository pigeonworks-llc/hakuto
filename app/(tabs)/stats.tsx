import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../constants";
import type { CourseStats, StatsSummary } from "../../types";

export default function StatsScreen() {
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [courseStats, setCourseStats] = useState<CourseStats[]>([]);
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
            "SELECT ROUND(AVG(total_strokes), 1) as avg FROM (SELECT total_strokes FROM rounds ORDER BY date DESC, created_at DESC LIMIT 5)"
          );

          if (totals && totals.count > 0) {
            setSummary({
              totalRounds: totals.count,
              averageStrokes: totals.avg,
              bestScore: totals.min,
              recentAvgStrokes: recent?.avg ?? 0,
            });
          }

          const byCourse = await db.getAllAsync<CourseStats>(
            `SELECT course_id as courseId, course_name as courseName,
                    COUNT(*) as rounds,
                    ROUND(AVG(total_strokes), 1) as averageStrokes,
                    MIN(total_strokes) as bestScore
             FROM rounds GROUP BY course_id ORDER BY rounds DESC`
          );
          setCourseStats(byCourse);
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

      <View style={styles.summaryGrid}>
        <StatCard label="総ラウンド" value={`${summary.totalRounds}`} />
        <StatCard label="平均打数" value={`${summary.averageStrokes}`} />
        <StatCard label="ベスト" value={`${summary.bestScore}`} />
        <StatCard label="直近5平均" value={`${summary.recentAvgStrokes}`} />
      </View>

      {courseStats.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>コース別</Text>
          {courseStats.map((cs) => (
            <View key={cs.courseId} style={styles.courseRow}>
              <Text style={styles.courseName}>{cs.courseName}</Text>
              <Text style={styles.courseValue}>{cs.averageStrokes} 平均 / {cs.bestScore} ベスト</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, gap: 20 },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  empty: { fontSize: 14, color: COLORS.textMuted, textAlign: "center", paddingVertical: 40 },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: {
    flex: 1,
    minWidth: "45%",
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
  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  courseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  courseName: { fontSize: 15, fontWeight: "600", color: COLORS.text },
  courseValue: { fontSize: 14, color: COLORS.textSecondary },
});
