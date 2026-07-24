import { useCallback, useEffect, useState } from "react";
import type { Round, RoundWithScores } from "../types";

export function useHistory() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { listRounds } = await import("../db/repositories/round");
      const { getDb } = await import("../db/index");
      const db = await getDb();
      const data = await listRounds(db);
      setRounds(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getRoundDetail = useCallback(async (id: string): Promise<RoundWithScores | null> => {
    const { getRound } = await import("../db/repositories/round");
    const { getDb } = await import("../db/index");
    const db = await getDb();
    return await getRound(db, id);
  }, []);

  return { rounds, loading, refresh, getRoundDetail };
}
