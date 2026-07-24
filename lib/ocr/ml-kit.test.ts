import type { OcrModule } from "../../types/ocr";

describe("MlKitOcr", () => {
  let module: OcrModule;

  beforeEach(() => {
    module = {
      recognizeText: async (uri: string) => `mlkit: ${uri}`,
      isAvailable: async () => true,
    };
  });

  it("recognizeText がテキスト文字列を返す", async () => {
    const text = await module.recognizeText("file:///photo.jpg");
    expect(text).toBe("mlkit: file:///photo.jpg");
  });

  it("isAvailable が true を返す", async () => {
    const available = await module.isAvailable();
    expect(available).toBe(true);
  });
});
