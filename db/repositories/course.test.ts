import type { Course } from "../../types";

describe("course repository", () => {
  it("Course 型が正しく構築できる", () => {
    const course: Course = {
      id: "course-1",
      name: "日南町営グラウンド",
      holeCount: 8,
      createdAt: "2026-07-24T00:00:00.000Z",
      updatedAt: "2026-07-24T00:00:00.000Z",
    };
    expect(course.name).toBe("日南町営グラウンド");
    expect(course.holeCount).toBe(8);
  });
});
