import { useCallback, useEffect, useState } from "react";
import type { StatsSummary } from "../types";

export function useStats() {
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { getDb } = await import("../db/index");
      const db = await getDb();

      const totals = await db.getFirstAsync<{ count: number; avg: number; min: number }>(
        "SELECT COUNT(*) as count, ROUND(AVG(total_strokes), 1) as avg, MIN(total_strokes) as min FROM rounds"
      );
      const recent = await db.getFirstAsync<{ avg: number }>(
        "SELECT ROUND(AVG(total_strokes), 1) as avg FROM (SELECT total_strokes FROM rounds ORDER BY played_at DESC, created_at DESC LIMIT 5)"
      );

      if (totals) {
        setSummary({
          totalRounds: totals.count,
          averageStrokes: totals.avg ?? 0,
          bestScore: totals.min ?? 0,
          recentAvgStrokes: recent?.avg ?? 0,
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { summary, loading, refresh };
}
