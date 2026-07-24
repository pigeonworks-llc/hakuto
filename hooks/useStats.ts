import { useCallback, useEffect, useState } from "react";
import type { CourseStats, StatsSummary } from "../types";

export function useStats() {
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [courseStats, setCourseStats] = useState<CourseStats[]>([]);
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
        "SELECT ROUND(AVG(total_strokes), 1) as avg FROM (SELECT total_strokes FROM rounds ORDER BY date DESC, created_at DESC LIMIT 5)"
      );

      if (totals) {
        setSummary({
          totalRounds: totals.count,
          averageStrokes: totals.avg ?? 0,
          bestScore: totals.min ?? 0,
          recentAvgStrokes: recent?.avg ?? 0,
        });
      }

      const byCourse = await db.getAllAsync<CourseStats>(
        `SELECT course_id as courseId, course_name as courseName,
                COUNT(*) as rounds,
                ROUND(AVG(total_strokes), 1) as averageStrokes,
                MIN(total_strokes) as bestScore
         FROM rounds GROUP BY course_id ORDER BY rounds DESC`
      );
      setCourseStats(byCourse);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { summary, courseStats, loading, refresh };
}
