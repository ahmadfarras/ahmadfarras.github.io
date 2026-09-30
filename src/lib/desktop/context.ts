import { getContext, setContext } from "svelte";
import type { WallpaperStore } from "./wallpapers";

const OPEN_APP_KEY = Symbol("open-app");
const WALLPAPER_KEY = Symbol("wallpaper");

type OpenApp = (id: string) => void;

/** Lets window contents (e.g. About) open other apps without prop drilling through AppWindow. */
export const setOpenApp = (openApp: OpenApp) => setContext(OPEN_APP_KEY, openApp);
export const getOpenApp = () => getContext<OpenApp>(OPEN_APP_KEY);

/** Shares the desktop's wallpaper with the picker window. */
export const setWallpaperStore = (store: WallpaperStore) => setContext(WALLPAPER_KEY, store);
export const getWallpaperStore = () => getContext<WallpaperStore>(WALLPAPER_KEY);
