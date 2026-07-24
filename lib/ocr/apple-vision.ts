import type { OcrModule } from "../../types/ocr";

const MODULE_NAME = "AppleVisionOcr";

// Expo Modules API: iOS native module using Apple Vision
const AppleVisionOcr: OcrModule = {
  async recognizeText(imageUri: string): Promise<string> {
    try {
      // Expo native module bridge — Expo Modules API 経由で Swift 実装を呼ぶ
      const ExpoModules = require("expo-modules-core");
      const module = ExpoModules.requireNativeModule(MODULE_NAME);
      return await module.recognizeText(imageUri);
    } catch {
      throw new Error("AppleVisionOcr: native module not available");
    }
  },

  async isAvailable(): Promise<boolean> {
    try {
      const ExpoModules = require("expo-modules-core");
      const module = ExpoModules.requireNativeModule(MODULE_NAME);
      return module != null;
    } catch {
      return false;
    }
  },
};

export default AppleVisionOcr;
