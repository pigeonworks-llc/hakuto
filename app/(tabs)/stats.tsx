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

  const maxCourseRounds = Math.max(...courseStats.map((c) => c.rounds), 1);

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

      {/* Course breakdown with bar chart */}
      {courseStats.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>コース別</Text>
          {courseStats.map((cs) => (
            <View key={cs.courseId} style={styles.courseCard}>
              <View style={styles.courseHeader}>
                <Text style={styles.courseName}>{cs.courseName}</Text>
                <Text style={styles.courseRounds}>{cs.rounds} ラウンド</Text>
              </View>
              <View style={styles.courseBarOuter}>
                <View
                  style={[
                    styles.courseBar,
                    { width: `${(cs.rounds / maxCourseRounds) * 100}%` },
                  ]}
                />
              </View>
              <View style={styles.courseStats}>
                <Text style={styles.courseStat}>平均 {cs.averageStrokes}</Text>
                <Text style={styles.courseStat}>ベスト {cs.bestScore}</Text>
              </View>
            </View>
          ))}
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
  section: { gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text, marginTop: 4 },
  courseCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 8,
  },
  courseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  courseName: { fontSize: 15, fontWeight: "600", color: COLORS.text },
  courseRounds: { fontSize: 12, color: COLORS.textMuted },
  courseBarOuter: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  courseBar: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    opacity: 0.7,
  },
  courseStats: {
    flexDirection: "row",
    gap: 16,
  },
  courseStat: { fontSize: 13, color: COLORS.textSecondary },
});
