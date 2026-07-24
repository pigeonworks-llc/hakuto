import { useRoundStore } from "./roundStore";

describe("roundStore", () => {
  beforeEach(() => {
    useRoundStore.setState({ activeRound: null });
  });

  it("初期状態は activeRound が null", () => {
    expect(useRoundStore.getState().activeRound).toBeNull();
  });

  it("startRound でラウンドを開始する", () => {
    useRoundStore.getState().startRound("c1", "日南町営", 8);
    const round = useRoundStore.getState().activeRound;
    expect(round).not.toBeNull();
    expect(round?.courseId).toBe("c1");
    expect(round?.holeCount).toBe(8);
    expect(round?.currentHole).toBe(1);
    expect(round?.scores).toEqual([]);
  });

  it("setScore で現在のホールに打数を設定する", () => {
    useRoundStore.getState().startRound("c1", "日南町営", 8);
    useRoundStore.getState().setScore(4);
    const round = useRoundStore.getState().activeRound;
    expect(round?.scores[0]).toBe(4);
  });

  it("nextHole で次のホールに進む", () => {
    useRoundStore.getState().startRound("c1", "日南町営", 8);
    useRoundStore.getState().setScore(4);
    useRoundStore.getState().nextHole();
    expect(useRoundStore.getState().activeRound?.currentHole).toBe(2);
  });

  it("prevHole で前のホールに戻る", () => {
    useRoundStore.getState().startRound("c1", "日南町営", 8);
    useRoundStore.getState().setScore(4);
    useRoundStore.getState().nextHole();
    useRoundStore.getState().prevHole();
    expect(useRoundStore.getState().activeRound?.currentHole).toBe(1);
  });

  it("finishRound で結果を返し activeRound をクリアする", () => {
    useRoundStore.getState().startRound("c1", "日南町営", 8);
    useRoundStore.getState().setScore(4);
    useRoundStore.getState().setScore(3);
    const result = useRoundStore.getState().finishRound();
    expect(result).not.toBeNull();
    expect(result!.scores).toEqual([4, 3]);
    expect(useRoundStore.getState().activeRound).toBeNull();
  });

  it("cancelRound で activeRound をクリアする", () => {
    useRoundStore.getState().startRound("c1", "日南町営", 8);
    useRoundStore.getState().cancelRound();
    expect(useRoundStore.getState().activeRound).toBeNull();
  });
});
