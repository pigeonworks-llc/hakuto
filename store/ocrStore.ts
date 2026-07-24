import { create } from "zustand";
import type { OcrResult, OcrSource, OcrStatus } from "../types/ocr";

interface OcrState {
  result: OcrResult | null;
  status: OcrStatus;
  source: OcrSource | null;
  imageUri: string | null;
  setScanning: (imageUri: string, source: OcrSource) => void;
  setProcessing: () => void;
  setResult: (result: OcrResult) => void;
  setError: (error: string) => void;
  clearResult: () => void;
  updateHoleScore: (holeIndex: number, strokes: number) => void;
  updateCourseName: (name: string) => void;
  updateDate: (date: string) => void;
}

export const useOcrStore = create<OcrState>((set, get) => ({
  result: null,
  status: "idle",
  source: null,
  imageUri: null,

  setScanning: (imageUri, source) => {
    set({ imageUri, source, status: "scanning" });
  },

  setProcessing: () => {
    set({ status: "processing" });
  },

  setResult: (result) => {
    set({ result, status: "done" });
  },

  setError: () => {
    set({ status: "error" });
  },

  clearResult: () => {
    set({ result: null, status: "idle", source: null, imageUri: null });
  },

  updateHoleScore: (holeIndex, strokes) => {
    const result = get().result;
    if (!result) return;
    const holes = [...result.holes];
    holes[holeIndex] = { ...holes[holeIndex], strokes };
    set({ result: { ...result, holes } });
  },

  updateCourseName: (name) => {
    const result = get().result;
    if (!result) return;
    set({ result: { ...result, courseName: name } });
  },

  updateDate: (date) => {
    const result = get().result;
    if (!result) return;
    set({ result: { ...result, date } });
  },
}));
