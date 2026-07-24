import type { OcrModule } from "../../types/ocr";

const MODULE_NAME = "MlKitOcr";

// Expo Modules API: Android native module using Google ML Kit
const MlKitOcr: OcrModule = {
  async recognizeText(imageUri: string): Promise<string> {
    try {
      const ExpoModules = require("expo-modules-core");
      const module = ExpoModules.requireNativeModule(MODULE_NAME);
      return await module.recognizeText(imageUri);
    } catch {
      throw new Error("MlKitOcr: native module not available");
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

export default MlKitOcr;
