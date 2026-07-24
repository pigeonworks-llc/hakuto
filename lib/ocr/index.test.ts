import { jest } from "@jest/globals";

// Mock Platform
jest.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

describe("isOcrAvailable / recognizeText", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("iOS で isOcrAvailable が期待通り動作する", async () => {
    // TS の dynamic import のみテスト — 実 Native module は mock
    const { isOcrAvailable } = await import("./index");
    // iOS では AppleVision がロードされ、native module 不在で false に fallback
    const available = await isOcrAvailable();
    expect(typeof available).toBe("boolean");
  });

  it("サポート外プラットフォームで recognizeText がエラーを投げる", async () => {
    jest.resetModules();
    jest.doMock("react-native", () => ({
      Platform: { OS: "web" },
    }));
    const { recognizeText } = await import("./index");
    await expect(recognizeText("test.jpg")).rejects.toThrow("not supported");
  });
});
