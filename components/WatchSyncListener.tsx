import { useEffect } from "react";
import { Platform } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { onWatchMessage } from "../lib/watch";
import { parseSyncPayload } from "../lib/watch/syncPayload";
import { insertSyncedRound } from "../db/repositories/round";

/**
 * Watch からの `syncRound` メッセージを購読し、Phone の SQLite に保存する。
 * 画面を持たない (null を返す) ため、SQLiteProvider 配下に 1 つ置くだけでよい。
 * History 画面は useFocusEffect で再取得するので、保存後にフォーカスすれば反映される。
 */
export function WatchSyncListener() {
  const db = useSQLiteContext();

  useEffect(() => {
    if (Platform.OS !== "ios") return;

    let sub: { remove: () => void } | undefined;
    try {
      sub = onWatchMessage((data) => {
        const payload = parseSyncPayload(data);
        if (!payload) return;
        insertSyncedRound(db, payload).catch((e) => {
          console.warn("[WatchSync] ラウンド保存に失敗", e);
        });
      });
    } catch (e) {
      // ネイティブモジュール未ビルド (Expo Go 等) では購読不可 — 静かに無効化
      console.warn("[WatchSync] 購読を開始できません", e);
    }

    return () => sub?.remove();
  }, [db]);

  return null;
}
