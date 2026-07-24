/** Apple Watch との接続状態 */
export interface WatchSessionState {
  isPaired: boolean;
  isReachable: boolean;
  activationState: "activated" | "inactive" | "notSupported";
}

/** Watch から iOS に送信されるラウンドデータ */
export interface WatchRoundData {
  courseName: string;
  holeCount: number;
  scores: number[];
  currentHole: number;
  timestamp: number;
}

/** iOS から Watch へのコマンド */
export interface WatchCommand {
  action: "startRound" | "endRound" | "updateScores";
  courseName?: string;
  holeCount?: number;
  roundId?: string;
  scores?: number[];
}

/** WCSession ネイティブモジュール interface */
export interface WatchConnectivityModule {
  /** 現在のセッション状態を取得 */
  getSessionState(): Promise<WatchSessionState>;
  /** Watch にメッセージを送信 */
  sendMessage(message: WatchCommand): Promise<void>;
  /** Watch からのメッセージ受信ハンドラを登録 */
  onMessage(handler: (data: WatchRoundData) => void): void;
  /** ハンドラの購読解除 */
  removeMessageHandler(): void;
}
