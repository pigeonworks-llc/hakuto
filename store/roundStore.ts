import { create } from "zustand";

export interface RoundState {
  activeRound: {
    courseId: string;
    courseName: string;
    holeCount: number;
    scores: number[];
    currentHole: number;
  } | null;
  startRound: (courseId: string, courseName: string, holeCount: number) => void;
  setScore: (strokes: number) => void;
  nextHole: () => void;
  prevHole: () => void;
  finishRound: () => { courseId: string; courseName: string; scores: number[] } | null;
  cancelRound: () => void;
}

export const useRoundStore = create<RoundState>((set, get) => ({
  activeRound: null,

  startRound: (courseId, courseName, holeCount) => {
    set({
      activeRound: {
        courseId,
        courseName,
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
      courseId: round.courseId,
      courseName: round.courseName,
      scores: round.scores,
    };
    set({ activeRound: null });
    return result;
  },

  cancelRound: () => {
    set({ activeRound: null });
  },
}));
