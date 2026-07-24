import { Platform } from "react-native";
import type { EventSubscription } from "expo-modules-core";
import type {
  HakutoWatchModule,
  WatchSessionState,
  WatchCommand,
  SyncRoundPayload,
} from "../../types/watch";

const MODULE_NAME = "HakutoWatchKit";

function getNativeModule(): HakutoWatchModule | null {
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
export async function sendWatchMessage(
  message: WatchCommand | SyncRoundPayload,
): Promise<void> {
  const module = getNativeModule();
  if (!module) throw new Error("Watch connectivity not available");
  await module.sendMessage(message);
}

/** Events API: Watch からのメッセージ購読 */
export function onWatchMessage(
  handler: (data: Record<string, unknown>) => void,
): EventSubscription {
  const ExpoModules = require("expo-modules-core");
  return ExpoModules.EventEmitter(getNativeModule()).addListener(
    "onMessage",
    handler,
  );
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
