import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../../components/ui/Button";
import { ScoreInput } from "../../components/ScoreInput";
import { COLORS } from "../../constants";
import { useRound } from "../../hooks/useRound";
import type { Course } from "../../types";

export default function NewRoundScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const { activeRound, startRound, setScore, nextHole, prevHole, saveRound, saving } = useRound();

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setLoadingCourses(true);
        try {
          const { listCourses } = await import("../../db/repositories/course");
          const { getDb } = await import("../../db/index");
          const db = await getDb();
          const all = await listCourses(db);
          setCourses(all);
          if (all.length > 0 && !selectedCourse) {
            setSelectedCourse(all[0]);
          }
        } finally {
          setLoadingCourses(false);
        }
      })();
    }, [])
  );

  // コース選択
  if (!activeRound) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={styles.title}>新規ラウンド</Text>

        {loadingCourses ? (
          <Text style={styles.muted}>読み込み中...</Text>
        ) : courses.length === 0 ? (
          <View style={styles.emptySection}>
            <Text style={styles.muted}>コースが登録されていません</Text>
            <Button variant="outline" onPress={() => router.push("/(tabs)/courses")}>
              コースを追加
            </Button>
          </View>
        ) : (
          <>
            <Text style={styles.label}>コースを選択</Text>
            <View style={styles.courseList}>
              {courses.map((c) => (
                <Button
                  key={c.id}
                  variant={selectedCourse?.id === c.id ? "primary" : "ghost"}
                  onPress={() => setSelectedCourse(c)}
                >
                  {c.name} ({c.holeCount}H)
                </Button>
              ))}
            </View>

            {selectedCourse && (
              <Button
                variant="primary"
                onPress={() => startRound(selectedCourse.id, selectedCourse.name, selectedCourse.holeCount)}
              >
                ラウンド開始
              </Button>
            )}
          </>
        )}

        <Button variant="ghost" onPress={() => router.back()}>
          戻る
        </Button>
      </ScrollView>
    );
  }

  // スコア入力中
  const currentScore = activeRound.scores[activeRound.currentHole - 1];

  const handleFinish = async () => {
    const id = await saveRound();
    if (id) {
      router.replace(`/round/${id}`);
    } else {
      Alert.alert("エラー", "スコアが入力されていません");
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{activeRound.courseName}</Text>
      <Text style={styles.holeIndicator}>
        {activeRound.currentHole} / {activeRound.holeCount} ホール
      </Text>

      <ScoreInput value={currentScore} onChange={setScore} />

      <View style={styles.navRow}>
        <Button variant="ghost" onPress={prevHole} disabled={activeRound.currentHole <= 1}>
          前へ
        </Button>
        <Button
          variant="primary"
          onPress={activeRound.currentHole >= activeRound.holeCount ? handleFinish : nextHole}
          disabled={saving}
        >
          {activeRound.currentHole >= activeRound.holeCount ? "ラウンド終了" : "次へ"}
        </Button>
      </View>

      <Text style={styles.totalText}>
        合計: {activeRound.scores.reduce((a: number, b: number) => a + b, 0)} 打
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, gap: 20, alignItems: "center" },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.text, alignSelf: "flex-start" },
  label: { fontSize: 16, fontWeight: "600", color: COLORS.text, alignSelf: "flex-start" },
  holeIndicator: { fontSize: 18, fontWeight: "700", color: COLORS.accent },
  courseList: { width: "100%", gap: 8 },
  navRow: { flexDirection: "row", gap: 16, marginTop: 10 },
  totalText: { fontSize: 18, fontWeight: "700", color: COLORS.textSecondary },
  muted: { fontSize: 14, color: COLORS.textMuted, textAlign: "center" },
  emptySection: { alignItems: "center", gap: 12 },
});
