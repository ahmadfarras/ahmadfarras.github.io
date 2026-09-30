import { describe, expect, it } from "vitest";
import { DOCK_MAGNIFY_RANGE, DOCK_MAX_SCALE, dockScale, dockScales } from "./dock";

describe("dockScale", () => {
  it("is largest right under the pointer", () => {
    expect(dockScale(0)).toBe(DOCK_MAX_SCALE);
  });

  it("returns to normal at and beyond the range", () => {
    expect(dockScale(DOCK_MAGNIFY_RANGE)).toBe(1);
    expect(dockScale(DOCK_MAGNIFY_RANGE * 3)).toBe(1);
  });

  it("is symmetric left and right of the pointer", () => {
    expect(dockScale(-40)).toBe(dockScale(40));
  });

  it("shrinks steadily with distance", () => {
    const scales = [0, 20, 40, 60, 80, 100].map((d) => dockScale(d));
    for (let i = 1; i < scales.length; i++) expect(scales[i]).toBeLessThan(scales[i - 1]);
  });

  it("is halfway to the peak at half the range", () => {
    expect(dockScale(DOCK_MAGNIFY_RANGE / 2)).toBeCloseTo(1 + (DOCK_MAX_SCALE - 1) / 2);
  });

  it("honours custom max scale and range", () => {
    expect(dockScale(0, 2, 50)).toBe(2);
    expect(dockScale(50, 2, 50)).toBe(1);
  });
});

describe("dockScales", () => {
  it("scales each icon by its own distance to the pointer", () => {
    const [under, near, far] = dockScales([100, 160, 400], 100);
    expect(under).toBe(DOCK_MAX_SCALE);
    expect(near).toBeGreaterThan(1);
    expect(near).toBeLessThan(DOCK_MAX_SCALE);
    expect(far).toBe(1);
  });

  it("handles an empty dock", () => {
    expect(dockScales([], 0)).toEqual([]);
  });
});
