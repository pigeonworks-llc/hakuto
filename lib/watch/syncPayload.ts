import type { SyncRoundPayload } from "../../types/watch";

/**
 * Watch から届いた生メッセージを SyncRoundPayload に正規化する (不正なら null)。
 * react-native / expo に依存しない純粋関数 (単体テスト可能)。
 */
export function parseSyncPayload(
  data: Record<string, unknown>,
): SyncRoundPayload | null {
  if (data.action !== "syncRound") return null;
  if (typeof data.id !== "string") return null;
  if (!Array.isArray(data.scores)) return null;

  const scores = data.scores.filter(
    (s): s is number => typeof s === "number",
  );

  return {
    action: "syncRound",
    id: data.id,
    place: typeof data.place === "string" ? data.place : null,
    playedAt:
      typeof data.playedAt === "string"
        ? data.playedAt
        : new Date().toISOString(),
    scores,
    totalStrokes:
      typeof data.totalStrokes === "number" ? data.totalStrokes : 0,
  };
}
