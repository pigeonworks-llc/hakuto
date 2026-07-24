import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../../components/ui/Button";
import { RoundCard } from "../../components/RoundCard";
import { COLORS } from "../../constants";
import type { Round } from "../../types";

export default function HomeScreen() {
  const [recentRounds, setRecentRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);
  const [watchAvailable, setWatchAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "ios") return;
    (async () => {
      try {
        const { isWatchAvailable } = await import("../../lib/watch");
        setWatchAvailable(await isWatchAvailable());
      } catch {
        // Watch connectivity not available
      }
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setLoading(true);
        try {
          const { listRounds } = await import("../../db/repositories/round");
          const { getDb } = await import("../../db/index");
          const db = await getDb();
          const rounds = await listRounds(db);
          setRecentRounds(rounds.slice(0, 5));
        } finally {
          setLoading(false);
        }
      })();
    }, [])
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.brandSection}>
        <Text style={styles.title}>Hakuto</Text>
        <Text style={styles.subtitle}>一打ごとに、神話になる</Text>
      </View>

      <View style={styles.actions}>
        <Button variant="primary" onPress={() => router.push("/round/new")}>
          新規ラウンド
        </Button>
        <Button variant="outline" onPress={() => router.push("/ocr/scan")}>
          スコアカードスキャン
        </Button>
        {watchAvailable && (
          <Button variant="outline" onPress={() => router.push("/round/new")}>
            ⌚ Watchでラウンド
          </Button>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>最近のラウンド</Text>
        {loading ? (
          <Text style={styles.empty}>読み込み中...</Text>
        ) : recentRounds.length === 0 ? (
          <Text style={styles.empty}>まだラウンドがありません</Text>
        ) : (
          <View style={styles.roundList}>
            {recentRounds.map((r) => (
              <RoundCard key={r.id} round={r} onPress={(id) => router.push(`/round/${id}`)} />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, gap: 24 },
  brandSection: { alignItems: "center", paddingVertical: 24 },
  title: { fontSize: 36, fontWeight: "900", color: COLORS.primary, letterSpacing: 2 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  actions: { gap: 12 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  roundList: { gap: 8 },
  empty: { fontSize: 14, color: COLORS.textMuted, textAlign: "center", paddingVertical: 20 },
});
