import { useCallback, useState } from "react";
import { useRoundStore } from "../store/roundStore";

export function useRound() {
  const store = useRoundStore();
  const [saving, setSaving] = useState(false);

  const saveRound = useCallback(async () => {
    const data = store.finishRound();
    if (!data || data.scores.length === 0) return null;

    setSaving(true);
    try {
      const { insertRound } = await import("../db/repositories/round");
      const { getDb } = await import("../db/index");
      const db = await getDb();
      const id = await insertRound(db, {
        place: data.place,
        playedAt: new Date().toISOString(),
        scores: data.scores,
        source: "manual",
      });
      return id;
    } finally {
      setSaving(false);
    }
  }, [store]);

  return {
    activeRound: store.activeRound,
    startRound: store.startRound,
    setScore: store.setScore,
    nextHole: store.nextHole,
    prevHole: store.prevHole,
    cancelRound: store.cancelRound,
    saveRound,
    saving,
  };
}
