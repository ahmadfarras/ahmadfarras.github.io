import { getContext, setContext } from "svelte";

const OPEN_APP_KEY = Symbol("open-app");

type OpenApp = (id: string) => void;

/** Lets window contents (e.g. About) open other apps without prop drilling through AppWindow. */
export const setOpenApp = (openApp: OpenApp) => setContext(OPEN_APP_KEY, openApp);
export const getOpenApp = () => getContext<OpenApp>(OPEN_APP_KEY);
