import { useState } from "react";
import { router } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "../../components/ui/Button";
import { ScoreInput } from "../../components/ScoreInput";
import { COLORS, HOLE_COUNTS } from "../../constants";
import { useRound } from "../../hooks/useRound";

export default function NewRoundScreen() {
  const [place, setPlace] = useState("");
  const [holeCount, setHoleCount] = useState<number>(8);
  const { activeRound, startRound, setScore, nextHole, prevHole, saveRound, saving } = useRound();

  // コース/場所選択
  if (!activeRound) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={styles.title}>新規ラウンド</Text>

        <View style={styles.field}>
          <Text style={styles.label}>場所（任意）</Text>
          <TextInput
            style={styles.input}
            value={place}
            onChangeText={setPlace}
            placeholder="例: 河川敷公園"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>ホール数</Text>
          <View style={styles.holeSelector}>
            {HOLE_COUNTS.map((n) => (
              <Pressable
                key={n}
                onPress={() => setHoleCount(n)}
                style={[styles.holeBtn, holeCount === n && styles.holeBtnActive]}
              >
                <Text style={[styles.holeBtnLabel, holeCount === n && styles.holeBtnLabelActive]}>
                  {n}H
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Button
          variant="primary"
          onPress={() => startRound(place.trim() || null, holeCount)}
        >
          ラウンド開始
        </Button>

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
      <Text style={styles.title}>
        {activeRound.place ?? `ラウンド`}
      </Text>
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
        実打数: {activeRound.scores.reduce((a: number, b: number) => a + b, 0)} 打
      </Text>
      {activeRound.scores.filter((s) => s === 1).length > 0 && (
        <Text style={styles.hioText}>
          ホールインワン: {activeRound.scores.filter((s) => s === 1).length} 回 (−3打)
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, gap: 20, alignItems: "center" },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.text, alignSelf: "flex-start" },
  label: { fontSize: 16, fontWeight: "600", color: COLORS.text, alignSelf: "flex-start" },
  holeIndicator: { fontSize: 18, fontWeight: "700", color: COLORS.accent },
  field: { width: "100%", gap: 8 },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: COLORS.text,
  },
  holeSelector: { flexDirection: "row", gap: 12 },
  holeBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  holeBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  holeBtnLabel: { fontSize: 16, fontWeight: "600", color: COLORS.text },
  holeBtnLabelActive: { color: "#fff" },
  navRow: { flexDirection: "row", gap: 16, marginTop: 10 },
  totalText: { fontSize: 18, fontWeight: "700", color: COLORS.textSecondary },
  hioText: { fontSize: 14, fontWeight: "600", color: COLORS.accent },
});
