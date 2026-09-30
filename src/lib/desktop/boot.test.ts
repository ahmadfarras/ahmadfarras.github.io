import { describe, expect, it } from "vitest";
import { MIN_BOOT_MS, hasBooted, markBooted, remainingBootMs } from "./boot";

describe("remainingBootMs", () => {
  it.each([
    { name: "just started", elapsed: 0, want: MIN_BOOT_MS },
    { name: "part way", elapsed: 400, want: MIN_BOOT_MS - 400 },
    { name: "exactly the minimum", elapsed: MIN_BOOT_MS, want: 0 },
    { name: "slow network, already long enough", elapsed: 5000, want: 0 }
  ])("$name", ({ elapsed, want }) => {
    expect(remainingBootMs(elapsed)).toBe(want);
  });

  it("accepts a custom minimum", () => {
    expect(remainingBootMs(100, 300)).toBe(200);
  });
});

describe("hasBooted / markBooted", () => {
  it("boots once per tab", () => {
    expect(hasBooted()).toBe(false);
    markBooted();
    expect(hasBooted()).toBe(true);
  });
});
