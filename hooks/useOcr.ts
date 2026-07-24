import { useCallback, useState } from "react";
import type { OcrSource } from "../types/ocr";
import { useOcrStore } from "../store/ocrStore";
import { parseOcrText } from "../lib/ocr/grid-parser";
import { recognizeText } from "../lib/ocr";

export function useOcr() {
  const store = useOcrStore();
  const [processing, setProcessing] = useState(false);

  const scanImage = useCallback(
    async (imageUri: string, source: OcrSource) => {
      store.setScanning(imageUri, source);
      setProcessing(true);

      try {
        store.setProcessing();
        const rawText = await recognizeText(imageUri);
        const result = parseOcrText(rawText);
        const resultWithSource = { ...result, source };
        store.setResult(resultWithSource);
      } catch {
        store.setError("OCR 処理に失敗しました");
      } finally {
        setProcessing(false);
      }
    },
    [store],
  );

  return {
    result: store.result,
    status: store.status,
    source: store.source,
    imageUri: store.imageUri,
    processing,
    scanImage,
    clearResult: store.clearResult,
    updateHoleScore: store.updateHoleScore,
    updateCourseName: store.updateCourseName,
    updateDate: store.updateDate,
  };
}
