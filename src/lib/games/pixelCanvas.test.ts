import { afterEach, describe, expect, it, vi } from "vitest";
import { drawBevelCell, drawGrid, startFrameLoop } from "./pixelCanvas";

/** Records every fillRect together with the fill style active at the time. */
const recorder = () => {
  const calls: [string, number, number, number, number][] = [];
  const ctx = {
    fillStyle: "" as unknown,
    fillRect(x: number, y: number, w: number, h: number) {
      calls.push([String(this.fillStyle), x, y, w, h]);
    }
  };
  return { ctx, calls };
};

describe("drawBevelCell", () => {
  it("fills the cell at its grid position, then draws the bevel edges", () => {
    const { ctx, calls } = recorder();
    drawBevelCell(ctx, 2, 3, 8, "#f00");
    expect(calls[0]).toEqual(["#f00", 16, 24, 8, 8]);
    expect(calls).toHaveLength(5);
    // Every edge stays inside the cell.
    for (const [, x, y, w, h] of calls) {
      expect(x).toBeGreaterThanOrEqual(16);
      expect(y).toBeGreaterThanOrEqual(24);
      expect(x + w).toBeLessThanOrEqual(24);
      expect(y + h).toBeLessThanOrEqual(32);
    }
  });
});

describe("drawGrid", () => {
  it("paints the background once and one dot per cell", () => {
    const { ctx, calls } = recorder();
    drawGrid(ctx, 3, 2, 8, "#000", "#111");
    expect(calls[0]).toEqual(["#000", 0, 0, 24, 16]);
    const dots = calls.slice(1);
    expect(dots).toHaveLength(6);
    expect(dots[0]).toEqual(["#111", 4, 4, 1, 1]);
  });
});

describe("startFrameLoop", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("reports the time between frames and stops when asked", () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => frames.push(cb));
    const cancel = vi.fn();
    vi.stubGlobal("cancelAnimationFrame", cancel);

    const deltas: number[] = [];
    const stop = startFrameLoop((delta) => deltas.push(delta));
    frames[0](1000);
    frames[1](1016);
    frames[2](1050);
    expect(deltas).toEqual([0, 16, 34]);

    stop();
    expect(cancel).toHaveBeenCalledWith(4);
  });
});
