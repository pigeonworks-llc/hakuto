/** Apple Watch との接続状態 */
export interface WatchSessionState {
  isPaired: boolean;
  isReachable: boolean;
  activationState: "activated" | "inactive" | "notSupported";
}

/** Watch から iOS に送信されるラウンドデータ */
export interface WatchRoundData {
  place: string | null;
  holeCount: number;
  scores: number[];
  currentHole: number;
  totalStrokes: number;
  timestamp: number;
}

/** iOS から Watch へのコマンド */
export interface WatchCommand {
  action: "startRound" | "endRound" | "updateScores";
  place?: string;
  holeCount?: number;
  roundId?: string;
  scores?: number[];
}

/** Watch から Phone へ同期される完全なラウンド */
export interface SyncRoundPayload {
  action: "syncRound";
  id: string;
  place: string | null;
  playedAt: string;
  scores: number[];
  totalStrokes: number;
}

/** WCSession ネイティブモジュール interface (Events API) */
export interface WatchConnectivityModule {
  /** 現在のセッション状態を取得 */
  getSessionState(): Promise<WatchSessionState>;
  /** Watch にメッセージを送信 */
  sendMessage(message: WatchCommand | SyncRoundPayload): Promise<void>;
  /** Events API: addListener / removeSubscription は Expo 自動生成 */
}
