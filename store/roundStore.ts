import { create } from "zustand";

export interface RoundState {
  activeRound: {
    place: string | null;
    holeCount: number;
    scores: number[];
    currentHole: number;
  } | null;
  startRound: (place: string | null, holeCount: number) => void;
  setScore: (strokes: number) => void;
  nextHole: () => void;
  prevHole: () => void;
  finishRound: () => { place: string | null; scores: number[] } | null;
  cancelRound: () => void;
}

export const useRoundStore = create<RoundState>((set, get) => ({
  activeRound: null,

  startRound: (place, holeCount) => {
    set({
      activeRound: {
        place,
        holeCount,
        scores: [],
        currentHole: 1,
      },
    });
  },

  setScore: (strokes) => {
    const round = get().activeRound;
    if (!round) return;
    const scores = [...round.scores];
    scores[round.currentHole - 1] = strokes;
    set({ activeRound: { ...round, scores } });
  },

  nextHole: () => {
    const round = get().activeRound;
    if (!round || round.currentHole >= round.holeCount) return;
    set({ activeRound: { ...round, currentHole: round.currentHole + 1 } });
  },

  prevHole: () => {
    const round = get().activeRound;
    if (!round || round.currentHole <= 1) return;
    set({ activeRound: { ...round, currentHole: round.currentHole - 1 } });
  },

  finishRound: () => {
    const round = get().activeRound;
    if (!round) return null;
    const result = {
      place: round.place,
      scores: round.scores,
    };
    set({ activeRound: null });
    return result;
  },

  cancelRound: () => {
    set({ activeRound: null });
  },
}));
