import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../../components/ui/Button";
import { COLORS } from "../../constants";

export default function OcrConfirmScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>認識結果確認</Text>
      <Text style={styles.muted}>Phase 2 で実装</Text>
      <Button variant="ghost" onPress={() => router.back()}>
        戻る
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background, alignItems: "center", justifyContent: "center", gap: 16, padding: 20 },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  muted: { fontSize: 14, color: COLORS.textMuted, textAlign: "center" },
});
