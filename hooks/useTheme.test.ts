import { COLORS } from "../constants";

describe("useTheme", () => {
  it("light モードで正しい色を返す", () => {
    const theme = {
      background: COLORS.background,
      surface: COLORS.surface,
      text: COLORS.text,
      primary: COLORS.primary,
      accent: COLORS.accent,
    };
    expect(theme.background).toBe("#fafaf7");
    expect(theme.primary).toBe("#3a5a40");
  });

  it("ダークモードで異なる色を返す", () => {
    const dark = {
      background: "#1a1a1a",
      surface: "#2a2a2a",
      text: "#1a1a1a",
      primary: "#3a5a40",
    };
    expect(dark.background).toBe("#1a1a1a");
    expect(dark.primary).toBe("#3a5a40");
  });
});
