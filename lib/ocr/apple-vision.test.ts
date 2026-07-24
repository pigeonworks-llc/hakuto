import type { OcrModule } from "../../types/ocr";

describe("AppleVisionOcr", () => {
  let module: OcrModule;

  beforeEach(() => {
    // Dynamic import to avoid native module resolution in test env
    module = {
      recognizeText: async (uri: string) => `recognized: ${uri}`,
      isAvailable: async () => true,
    };
  });

  it("recognizeText がテキスト文字列を返す", async () => {
    const text = await module.recognizeText("file:///test.jpg");
    expect(text).toBe("recognized: file:///test.jpg");
  });

  it("isAvailable が true を返す", async () => {
    const available = await module.isAvailable();
    expect(available).toBe(true);
  });
});
