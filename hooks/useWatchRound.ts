import { useCallback, useEffect, useState } from "react";
import type { WatchRoundData, WatchSessionState } from "../types/watch";
import {
  getWatchSessionState,
  isWatchAvailable,
  sendWatchMessage,
} from "../lib/watch";

export function useWatchRound() {
  const [sessionState, setSessionState] = useState<WatchSessionState>({
    isPaired: false,
    isReachable: false,
    activationState: "notSupported",
  });
  const [watchAvailable, setWatchAvailable] = useState(false);
  const [watchData, setWatchData] = useState<WatchRoundData | null>(null);

  const refreshState = useCallback(async () => {
    const available = await isWatchAvailable();
    setWatchAvailable(available);
    if (available) {
      const state = await getWatchSessionState();
      setSessionState(state);
    }
  }, []);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  const startWatchRound = useCallback(
    async (courseName: string, holeCount: number) => {
      await sendWatchMessage({
        action: "startRound",
        courseName,
        holeCount,
      });
    },
    [],
  );

  const sendWatchScores = useCallback(async (scores: number[]) => {
    await sendWatchMessage({ action: "updateScores", scores });
  }, []);

  const endWatchRound = useCallback(async () => {
    await sendWatchMessage({ action: "endRound" });
  }, []);

  return {
    sessionState,
    watchAvailable,
    watchData,
    refreshState,
    startWatchRound,
    sendWatchScores,
    endWatchRound,
  };
}
