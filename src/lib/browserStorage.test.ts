import { afterEach, describe, expect, it, vi } from "vitest";
import { browserStorage } from "./browserStorage";

describe("browserStorage", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("is null where localStorage does not exist (server, prerender)", () => {
    expect(browserStorage()).toBeNull();
  });

  it("returns localStorage when available", () => {
    const fake = { getItem: () => null } as unknown as Storage;
    vi.stubGlobal("localStorage", fake);
    expect(browserStorage()).toBe(fake);
  });

  it("is null when touching localStorage throws", () => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      get: () => {
        throw new Error("SecurityError");
      }
    });
    expect(browserStorage()).toBeNull();
    delete (globalThis as { localStorage?: unknown }).localStorage;
  });
});
