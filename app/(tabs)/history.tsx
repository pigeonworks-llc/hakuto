import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { RoundCard } from "../../components/RoundCard";
import { COLORS } from "../../constants";
import type { Round } from "../../types";

export default function HistoryScreen() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setLoading(true);
        try {
          const { listRounds } = await import("../../db/repositories/round");
          const { getDb } = await import("../../db/index");
          const db = await getDb();
          setRounds(await listRounds(db));
        } finally {
          setLoading(false);
        }
      })();
    }, [])
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>ラウンド履歴</Text>
      {loading ? (
        <Text style={styles.empty}>読み込み中...</Text>
      ) : rounds.length === 0 ? (
        <Text style={styles.empty}>まだラウンドがありません</Text>
      ) : (
        <View style={styles.list}>
          {rounds.map((r) => (
            <RoundCard key={r.id} round={r} onPress={(id) => router.push(`/round/${id}`)} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, gap: 16 },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  list: { gap: 8 },
  empty: { fontSize: 14, color: COLORS.textMuted, textAlign: "center", paddingVertical: 40 },
});
