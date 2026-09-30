import { describe, expect, it } from "vitest";
import { BEST_SCORE_KEY, loadBestScore, saveBestScore } from "./highScore";

const fakeStorage = (initial?: string) => {
  const data = new Map<string, string>(initial === undefined ? [] : [[BEST_SCORE_KEY, initial]]);
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value)
  };
};

const throwing = {
  getItem: () => {
    throw new Error("blocked");
  },
  setItem: () => {
    throw new Error("blocked");
  }
};

describe("loadBestScore", () => {
  it.each([
    { name: "saved score", stored: "1200", want: 1200 },
    { name: "nothing saved", stored: undefined, want: 0 },
    { name: "garbage", stored: "abc", want: 0 },
    { name: "negative", stored: "-5", want: 0 }
  ])("$name", ({ stored, want }) => {
    expect(loadBestScore(fakeStorage(stored))).toBe(want);
  });

  it("is 0 without storage or when it throws", () => {
    expect(loadBestScore(null)).toBe(0);
    expect(loadBestScore(throwing)).toBe(0);
  });
});

describe("saveBestScore", () => {
  it("stores a new best", () => {
    const storage = fakeStorage("100");
    expect(saveBestScore(storage, 250)).toBe(250);
    expect(storage.data.get(BEST_SCORE_KEY)).toBe("250");
  });

  it("keeps the old best when the score is lower", () => {
    const storage = fakeStorage("900");
    expect(saveBestScore(storage, 250)).toBe(900);
    expect(storage.data.get(BEST_SCORE_KEY)).toBe("900");
  });

  it("still reports the best when storage is missing or throws", () => {
    expect(saveBestScore(null, 40)).toBe(40);
    expect(saveBestScore(throwing, 40)).toBe(40);
  });
});
