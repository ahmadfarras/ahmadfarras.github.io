import { describe, expect, it } from "vitest";
import { get } from "svelte/store";
import {
  DEFAULT_WALLPAPER_ID,
  WALLPAPER_STORAGE_KEY,
  createWallpaperStore,
  resolveWallpaper,
  wallpapers
} from "./wallpapers";

const fakeStorage = (initial: Record<string, string> = {}) => {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value)
  };
};

const throwingStorage = {
  getItem: () => {
    throw new Error("blocked");
  },
  setItem: () => {
    throw new Error("blocked");
  }
};

describe("wallpapers", () => {
  it("keeps the CSS dot grid as the first, default option", () => {
    expect(wallpapers[0]).toMatchObject({ id: DEFAULT_WALLPAPER_ID, src: null });
  });

  it("has unique ids", () => {
    expect(new Set(wallpapers.map((w) => w.id)).size).toBe(wallpapers.length);
  });
});

describe("resolveWallpaper", () => {
  it.each([
    { name: "known id", id: "waves", want: "waves" },
    { name: "unknown id", id: "removed-one", want: DEFAULT_WALLPAPER_ID },
    { name: "null", id: null, want: DEFAULT_WALLPAPER_ID },
    { name: "undefined", id: undefined, want: DEFAULT_WALLPAPER_ID },
    { name: "empty string", id: "", want: DEFAULT_WALLPAPER_ID }
  ])("$name", ({ id, want }) => {
    expect(resolveWallpaper(id).id).toBe(want);
  });
});

describe("createWallpaperStore", () => {
  it("starts on the default before anything is loaded", () => {
    expect(get(createWallpaperStore(fakeStorage())).id).toBe(DEFAULT_WALLPAPER_ID);
  });

  it("loads the saved wallpaper", () => {
    const store = createWallpaperStore(fakeStorage({ [WALLPAPER_STORAGE_KEY]: "blob" }));
    store.load();
    expect(get(store).id).toBe("blob");
  });

  it("falls back to the default for a stale saved id", () => {
    const store = createWallpaperStore(fakeStorage({ [WALLPAPER_STORAGE_KEY]: "gone" }));
    store.load();
    expect(get(store).id).toBe(DEFAULT_WALLPAPER_ID);
  });

  it("selects and persists a wallpaper", () => {
    const storage = fakeStorage();
    const store = createWallpaperStore(storage);
    store.select("steps");
    expect(get(store).id).toBe("steps");
    expect(storage.data.get(WALLPAPER_STORAGE_KEY)).toBe("steps");
  });

  it("persists the resolved id when selecting an unknown one", () => {
    const storage = fakeStorage();
    const store = createWallpaperStore(storage);
    store.select("nope");
    expect(get(store).id).toBe(DEFAULT_WALLPAPER_ID);
    expect(storage.data.get(WALLPAPER_STORAGE_KEY)).toBe(DEFAULT_WALLPAPER_ID);
  });

  it("still works when storage is missing or throws", () => {
    for (const storage of [null, throwingStorage]) {
      const store = createWallpaperStore(storage);
      store.load();
      expect(get(store).id).toBe(DEFAULT_WALLPAPER_ID);
      store.select("wave");
      expect(get(store).id).toBe("wave");
    }
  });
});
