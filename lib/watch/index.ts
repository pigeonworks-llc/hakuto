import { Platform } from "react-native";
import type { WatchConnectivityModule, WatchSessionState, WatchRoundData, WatchCommand } from "../../types/watch";

const MODULE_NAME = "WatchConnectivity";

function getNativeModule(): WatchConnectivityModule | null {
  if (Platform.OS !== "ios") return null;
  try {
    const ExpoModules = require("expo-modules-core");
    return ExpoModules.requireNativeModule(MODULE_NAME);
  } catch {
    return null;
  }
}

/** Watch セッション状態を取得 */
export async function getWatchSessionState(): Promise<WatchSessionState> {
  const module = getNativeModule();
  if (!module) {
    return { isPaired: false, isReachable: false, activationState: "notSupported" };
  }
  return await module.getSessionState();
}

/** Watch にメッセージを送信 */
export async function sendWatchMessage(message: WatchCommand): Promise<void> {
  const module = getNativeModule();
  if (!module) throw new Error("Watch connectivity not available");
  await module.sendMessage(message);
}

/** Watch からのデータ受信ハンドラ */
let messageHandler: ((data: WatchRoundData) => void) | null = null;

export function onWatchMessage(handler: (data: WatchRoundData) => void): void {
  const module = getNativeModule();
  if (!module) throw new Error("Watch connectivity not available");
  messageHandler = handler;
  module.onMessage(handler);
}

export function removeWatchMessageHandler(): void {
  const module = getNativeModule();
  if (!module) return;
  messageHandler = null;
  module.removeMessageHandler();
}

/** Watch が利用可能か簡易チェック */
export async function isWatchAvailable(): Promise<boolean> {
  try {
    const state = await getWatchSessionState();
    return state.isPaired;
  } catch {
    return false;
  }
}
