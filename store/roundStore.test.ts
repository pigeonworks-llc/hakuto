import { useRoundStore } from "./roundStore";

describe("roundStore", () => {
  beforeEach(() => {
    useRoundStore.setState({ activeRound: null });
  });

  it("初期状態は activeRound が null", () => {
    expect(useRoundStore.getState().activeRound).toBeNull();
  });

  it("startRound を place/holeCount で開始する", () => {
    useRoundStore.getState().startRound("河川敷公園", 8);
    const round = useRoundStore.getState().activeRound;
    expect(round).not.toBeNull();
    expect(round?.place).toBe("河川敷公園");
    expect(round?.holeCount).toBe(8);
    expect(round?.currentHole).toBe(1);
    expect(round?.scores).toEqual([]);
  });

  it("startRound は place=null を許容する", () => {
    useRoundStore.getState().startRound(null, 8);
    expect(useRoundStore.getState().activeRound?.place).toBeNull();
  });

  it("setScore で現在のホールに打数を設定する", () => {
    useRoundStore.getState().startRound("公園", 8);
    useRoundStore.getState().setScore(4);
    const round = useRoundStore.getState().activeRound;
    expect(round?.scores[0]).toBe(4);
  });

  it("nextHole で次のホールに進む", () => {
    useRoundStore.getState().startRound("公園", 8);
    useRoundStore.getState().setScore(4);
    useRoundStore.getState().nextHole();
    expect(useRoundStore.getState().activeRound?.currentHole).toBe(2);
  });

  it("prevHole で前のホールに戻る", () => {
    useRoundStore.getState().startRound("公園", 8);
    useRoundStore.getState().setScore(4);
    useRoundStore.getState().nextHole();
    useRoundStore.getState().prevHole();
    expect(useRoundStore.getState().activeRound?.currentHole).toBe(1);
  });

  it("finishRound で place と scores を返し activeRound をクリアする", () => {
    useRoundStore.getState().startRound("河川敷公園", 8);
    useRoundStore.getState().setScore(4);
    useRoundStore.getState().nextHole();
    useRoundStore.getState().setScore(3);
    const result = useRoundStore.getState().finishRound();
    expect(result).not.toBeNull();
    expect(result!.place).toBe("河川敷公園");
    expect(result!.scores).toEqual([4, 3]);
    expect(useRoundStore.getState().activeRound).toBeNull();
  });

  it("cancelRound で activeRound をクリアする", () => {
    useRoundStore.getState().startRound("公園", 8);
    useRoundStore.getState().cancelRound();
    expect(useRoundStore.getState().activeRound).toBeNull();
  });

  it("courseId/courseName は activeRound に存在しない", () => {
    useRoundStore.getState().startRound("公園", 8);
    const round = useRoundStore.getState().activeRound!;
    expect("place" in round).toBe(true);
    expect("courseId" in round).toBe(false);
  });
});
