import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Button } from "../../components/ui/Button";
import { COLORS } from "../../constants";
import { useOcr } from "../../hooks/useOcr";

export default function OcrConfirmScreen() {
  const {
    result,
    updateHoleScore,
    updateDate,
    clearResult,
  } = useOcr();

  const [saving, setSaving] = useState(false);
  const [place, setPlace] = useState("");

  // Clear OCR data when navigating away
  useFocusEffect(
    useCallback(() => {
      return () => {
        // cleanup on unmount
      };
    }, []),
  );

  if (!result) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>認識結果確認</Text>
        <Text style={styles.muted}>スキャンデータがありません</Text>
        <Button variant="primary" onPress={() => router.replace("/ocr/scan")}>
          スキャン画面へ
        </Button>
        <Button variant="ghost" onPress={() => router.back()}>
          戻る
        </Button>
      </View>
    );
  }

  const totalStrokes = result.holes.reduce(
    (sum, h) => sum + (h.strokes ?? 0),
    0,
  );
  const unrecognizedCount = result.holes.filter(
    (h) => h.strokes === null,
  ).length;

  const handleScoreChange = (index: number, text: string) => {
    const num = parseInt(text, 10);
    if (!isNaN(num) && num >= 1 && num <= 15) {
      updateHoleScore(index, num);
    }
  };

  const handleSave = async () => {
    if (result.holes.length === 0) {
      Alert.alert("エラー", "スコアデータがありません");
      return;
    }

    setSaving(true);
    try {
      const { insertRound } = await import("../../db/repositories/round");
      const { getDb } = await import("../../db/index");
      const db = await getDb();

      const scores = result.holes.map((h) => h.strokes ?? 0);
      const placeValue = place.trim() || result.courseName || null;
      const date = result.date ?? new Date().toISOString().slice(0, 10);

      await insertRound(db, {
        place: placeValue,
        playedAt: date,
        scores,
        source: "ocr",
      });

      clearResult();
      router.replace("/(tabs)/history");
    } catch (error) {
      Alert.alert("エラー", "スコアの保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>認識結果確認</Text>

      {/* Place */}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>場所</Text>
        <TextInput
          style={styles.input}
          value={place || (result.courseName ?? "")}
          onChangeText={(text) => setPlace(text)}
          placeholder="例: 河川敷公園"
          placeholderTextColor={COLORS.textMuted}
        />
      </View>

      {/* Date */}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>日付</Text>
        <TextInput
          style={styles.input}
          value={result.date ?? ""}
          onChangeText={updateDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={COLORS.textMuted}
        />
      </View>

      {/* Error count warning */}
      {unrecognizedCount > 0 && (
        <View style={styles.warning}>
          <Text style={styles.warningText}>
            ⚠ {unrecognizedCount} ホールの打数が認識できませんでした。
            該当ホールの値を手動で入力してください。
          </Text>
        </View>
      )}

      {/* Hole scores grid */}
      <View style={styles.scoresSection}>
        <Text style={styles.sectionTitle}>
          スコア (実打数: {totalStrokes})
        </Text>
        <View style={styles.grid}>
          {result.holes.map((hole, index) => (
            <View key={hole.holeNumber} style={styles.holeCard}>
              <Text style={styles.holeLabel}>{hole.holeNumber}</Text>
              <TextInput
                style={[
                  styles.scoreInput,
                  hole.strokes === null && styles.scoreInputInvalid,
                ]}
                value={hole.strokes !== null ? String(hole.strokes) : ""}
                onChangeText={(text) => handleScoreChange(index, text)}
                keyboardType="number-pad"
                placeholder="--"
                placeholderTextColor={COLORS.danger}
                maxLength={2}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          variant="primary"
          onPress={handleSave}
          disabled={saving || unrecognizedCount === result.holes.length}
        >
          {saving ? "保存中..." : "保存する"}
        </Button>
        <Button
          variant="outline"
          onPress={() => router.replace("/ocr/scan")}
        >
          再スキャン
        </Button>
        <Button variant="ghost" onPress={() => router.back()}>
          キャンセル
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, gap: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  field: { gap: 6 },
  fieldLabel: { fontSize: 14, fontWeight: "600", color: COLORS.textSecondary },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  warning: {
    backgroundColor: "#fff3cd",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ffc107",
  },
  warningText: { fontSize: 13, color: "#856404", lineHeight: 18 },
  scoresSection: { gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "flex-start",
  },
  holeCard: {
    width: "22%",
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 8,
    alignItems: "center",
    gap: 4,
  },
  holeLabel: { fontSize: 12, fontWeight: "600", color: COLORS.textSecondary },
  scoreInput: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    width: "100%",
    padding: 4,
  },
  scoreInputInvalid: { color: COLORS.danger },
  actions: { gap: 12, marginTop: 8 },
});
