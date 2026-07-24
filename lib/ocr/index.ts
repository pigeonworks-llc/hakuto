import { Platform } from "react-native";
import type { OcrModule } from "../../types/ocr";
import AppleVisionOcr from "./apple-vision";
import MlKitOcr from "./ml-kit";

/**
 * プラットフォームに応じた OCR モジュールを返す。
 * iOS → Apple Vision、Android → ML Kit。
 * それ以外のプラットフォームでは使用不可。
 */
function getOcrModule(): OcrModule | null {
  if (Platform.OS === "ios") {
    return AppleVisionOcr;
  }
  if (Platform.OS === "android") {
    return MlKitOcr;
  }
  return null;
}

/**
 * プラットフォームの OCR が利用可能か。
 */
export async function isOcrAvailable(): Promise<boolean> {
  const module = getOcrModule();
  if (!module) return false;
  try {
    return await module.isAvailable();
  } catch {
    return false;
  }
}

/**
 * 画像 URI からテキスト認識を実行する。
 */
export async function recognizeText(imageUri: string): Promise<string> {
  const module = getOcrModule();
  if (!module) {
    throw new Error(
      `OCR is not supported on ${Platform.OS}. Use iOS or Android.`,
    );
  }
  return await module.recognizeText(imageUri);
}
