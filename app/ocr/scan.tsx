import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button } from "../../components/ui/Button";
import { COLORS } from "../../constants";
import { useOcr } from "../../hooks/useOcr";

export default function OcrScanScreen() {
  const { scanImage, processing, status, result } = useOcr();
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const hasStartedScan = useRef(false);

  const handleCameraCapture = async () => {
    try {
      const Camera = await import("expo-camera");
      const { status: perm } = await Camera.useCameraPermissions();
      if (!perm?.granted) {
        Alert.alert(
          "カメラ許可が必要です",
          "設定からカメラの使用を許可してください",
        );
        return;
      }

      const photo = await Camera.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });

      if (!photo.canceled && photo.assets[0]) {
        const uri = photo.assets[0].uri;
        setPreviewUri(uri);
        hasStartedScan.current = false;
      }
    } catch {
      Alert.alert("エラー", "カメラの起動に失敗しました");
    }
  };

  const handleAlbumPick = async () => {
    try {
      const ImagePicker = await import("expo-image-picker");
      const { status: perm } = await ImagePicker.useMediaLibraryPermissions();
      if (!perm?.granted) {
        Alert.alert(
          "フォトライブラリの許可が必要です",
          "設定から写真へのアクセスを許可してください",
        );
        return;
      }

      const photo = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });

      if (!photo.canceled && photo.assets[0]) {
        const uri = photo.assets[0].uri;
        setPreviewUri(uri);
        hasStartedScan.current = false;
      }
    } catch {
      Alert.alert("エラー", "画像の選択に失敗しました");
    }
  };

  const handleStartOcr = async () => {
    if (!previewUri || hasStartedScan.current) return;
    hasStartedScan.current = true;
    await scanImage(previewUri, previewUri.startsWith("file://") ? "album" : "camera");

    if (result) {
      router.replace("/ocr/confirm");
    }
  };

  const handleRetake = () => {
    setPreviewUri(null);
    hasStartedScan.current = false;
  };

  // Processing state
  if (processing || status === "scanning" || status === "processing") {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>スコアカードスキャン</Text>
        <View style={styles.processingContainer}>
          <Text style={styles.processingText}>スキャン中...</Text>
          <Text style={styles.muted}>画像を解析しています</Text>
        </View>
      </View>
    );
  }

  // Preview state — image selected, waiting to scan
  if (previewUri) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>スコアカードスキャン</Text>
        <Image source={{ uri: previewUri }} style={styles.preview} />
        <View style={styles.previewActions}>
          <Button variant="primary" onPress={handleStartOcr}>
            スキャン開始
          </Button>
          <Button variant="outline" onPress={handleRetake}>
            撮り直す
          </Button>
        </View>
      </View>
    );
  }

  // Initial state — choose input method
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>スコアカードスキャン</Text>
      <Text style={styles.muted}>
        スコアカードを撮影またはアルバムから選択して、{`\n`}
        打数を自動入力します
      </Text>

      <View style={styles.options}>
        <Pressable style={styles.optionCard} onPress={handleCameraCapture}>
          <Text style={styles.optionIcon}>📷</Text>
          <Text style={styles.optionLabel}>カメラで撮影</Text>
          <Text style={styles.optionDesc}>
            スコアカードを撮影してOCR認識
          </Text>
        </Pressable>

        <Pressable style={styles.optionCard} onPress={handleAlbumPick}>
          <Text style={styles.optionIcon}>🖼️</Text>
          <Text style={styles.optionLabel}>アルバムから選択</Text>
          <Text style={styles.optionDesc}>
            保存済みの画像を読み込む
          </Text>
        </Pressable>
      </View>

      <Button variant="ghost" onPress={() => router.back()}>
        戻る
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    padding: 20,
  },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  muted: { fontSize: 14, color: COLORS.textMuted, textAlign: "center", lineHeight: 20 },
  options: { width: "100%", gap: 16 },
  optionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  optionIcon: { fontSize: 32 },
  optionLabel: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  optionDesc: { fontSize: 12, color: COLORS.textMuted, textAlign: "center" },
  preview: { width: "100%", height: 300, borderRadius: 12, resizeMode: "contain" },
  previewActions: { width: "100%", gap: 12 },
  processingContainer: { alignItems: "center", gap: 8 },
  processingText: { fontSize: 18, fontWeight: "700", color: COLORS.primary },
});
