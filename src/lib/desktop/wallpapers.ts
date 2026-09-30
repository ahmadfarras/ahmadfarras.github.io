import { writable } from "svelte/store";
import { base } from "$app/paths";

export interface Wallpaper {
  id: string;
  name: string;
  /** Image URL; `null` is the theme-aware dot grid drawn in CSS. */
  src: string | null;
}

export const DEFAULT_WALLPAPER_ID = "dots";
export const WALLPAPER_STORAGE_KEY = "desktop-wallpaper";

export const wallpapers: Wallpaper[] = [
  { id: DEFAULT_WALLPAPER_ID, name: "Dots (default)", src: null },
  { id: "blob", name: "Sunset blob", src: `${base}/wallpapers/blob-scene-haikei.svg` },
  { id: "waves", name: "Ocean waves", src: `${base}/wallpapers/stacked-waves-haikei.svg` },
  { id: "steps", name: "Coral steps", src: `${base}/wallpapers/stacked-steps-haikei.svg` },
  { id: "wave", name: "Deep wave", src: `${base}/wallpapers/wave-haikei.svg` }
];

const wallpapersById = new Map(wallpapers.map((wallpaper) => [wallpaper.id, wallpaper]));

/** Unknown or missing ids (e.g. a wallpaper that was removed) fall back to the default. */
export function resolveWallpaper(id: string | null | undefined): Wallpaper {
  return wallpapersById.get(id ?? "") ?? wallpapersById.get(DEFAULT_WALLPAPER_ID)!;
}

type WallpaperStorage = Pick<Storage, "getItem" | "setItem">;

/**
 * Selected wallpaper, persisted per browser. Storage can be missing or throw
 * (private mode, blocked site data), so every access is best-effort.
 */
export function createWallpaperStore(storage: WallpaperStorage | null) {
  const { subscribe, set } = writable(resolveWallpaper(DEFAULT_WALLPAPER_ID));

  return {
    subscribe,
    load() {
      try {
        set(resolveWallpaper(storage?.getItem(WALLPAPER_STORAGE_KEY)));
      } catch {
        set(resolveWallpaper(DEFAULT_WALLPAPER_ID));
      }
    },
    select(id: string) {
      const wallpaper = resolveWallpaper(id);
      set(wallpaper);
      try {
        storage?.setItem(WALLPAPER_STORAGE_KEY, wallpaper.id);
      } catch {
        // Not persisting is fine: the choice still applies for this visit.
      }
    }
  };
}

export type WallpaperStore = ReturnType<typeof createWallpaperStore>;
