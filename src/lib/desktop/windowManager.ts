import { writable } from "svelte/store";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowState extends Rect {
  id: string;
  z: number;
  isMinimized: boolean;
  isMaximized: boolean;
}

export interface DesktopState {
  windows: WindowState[];
  nextZ: number;
}

export interface Size {
  width: number;
  height: number;
}

export const MIN_WINDOW_SIZE: Size = { width: 320, height: 220 };
// Part of the title bar that must stay on screen so a window can always be grabbed back.
const VISIBLE_GRAB_AREA = 80;
const TITLE_BAR_HEIGHT = 40;
const CASCADE_OFFSET = 32;
const DESKTOP_PADDING = 24;
const ICON_COLUMN_WIDTH = 120;

export const emptyDesktop = (): DesktopState => ({ windows: [], nextZ: 1 });

const updateWindow = (
  state: DesktopState,
  id: string,
  change: (window: WindowState) => WindowState
): DesktopState => ({
  ...state,
  windows: state.windows.map((window) => (window.id === id ? change(window) : window))
});

export function focusWindow(state: DesktopState, id: string): DesktopState {
  const target = state.windows.find((window) => window.id === id);
  if (!target) return state;
  if (activeWindowId(state) === id) return state;

  const focused = updateWindow(state, id, (window) => ({
    ...window,
    z: state.nextZ,
    isMinimized: false
  }));
  return { ...focused, nextZ: state.nextZ + 1 };
}

export function openWindow(state: DesktopState, id: string, rect: Rect): DesktopState {
  if (state.windows.some((window) => window.id === id)) return focusWindow(state, id);

  const window: WindowState = {
    id,
    ...rect,
    z: state.nextZ,
    isMinimized: false,
    isMaximized: false
  };
  return { windows: [...state.windows, window], nextZ: state.nextZ + 1 };
}

export function closeWindow(state: DesktopState, id: string): DesktopState {
  return { ...state, windows: state.windows.filter((window) => window.id !== id) };
}

export function moveWindow(state: DesktopState, id: string, x: number, y: number): DesktopState {
  return updateWindow(state, id, (window) => ({ ...window, x, y }));
}

export function resizeWindow(
  state: DesktopState,
  id: string,
  width: number,
  height: number
): DesktopState {
  return updateWindow(state, id, (window) => ({
    ...window,
    width: Math.max(MIN_WINDOW_SIZE.width, width),
    height: Math.max(MIN_WINDOW_SIZE.height, height)
  }));
}

export function minimizeWindow(state: DesktopState, id: string): DesktopState {
  return updateWindow(state, id, (window) => ({ ...window, isMinimized: true }));
}

export function toggleMaximize(state: DesktopState, id: string): DesktopState {
  return updateWindow(state, id, (window) => ({ ...window, isMaximized: !window.isMaximized }));
}

/** Taskbar behaviour: clicking the active window minimizes it, anything else brings it forward. */
export function toggleFromTaskbar(state: DesktopState, id: string): DesktopState {
  return activeWindowId(state) === id ? minimizeWindow(state, id) : focusWindow(state, id);
}

export function activeWindowId(state: DesktopState): string | null {
  let active: WindowState | null = null;
  for (const window of state.windows) {
    if (window.isMinimized) continue;
    if (!active || window.z > active.z) active = window;
  }
  return active?.id ?? null;
}

/** Keeps enough of the title bar inside the desktop that the window can still be dragged. */
export function clampPosition(x: number, y: number, width: number, desktop: Size) {
  return {
    x: Math.min(Math.max(x, VISIBLE_GRAB_AREA - width), desktop.width - VISIBLE_GRAB_AREA),
    y: Math.min(Math.max(y, 0), desktop.height - TITLE_BAR_HEIGHT)
  };
}

/** Starting rect for a new window: cascaded so stacked windows don't hide each other. */
export function initialRect(preferred: Size, openCount: number, desktop: Size): Rect {
  const width = Math.min(preferred.width, desktop.width - DESKTOP_PADDING * 2);
  const height = Math.min(preferred.height, desktop.height - DESKTOP_PADDING * 2);
  const offset = (openCount % 6) * CASCADE_OFFSET;
  const centeredX = (desktop.width - width) / 2;
  const x = Math.max(ICON_COLUMN_WIDTH, centeredX) + offset;
  const y = Math.max(DESKTOP_PADDING, (desktop.height - height) / 3) + offset;
  const clamped = clampPosition(
    Math.min(x, desktop.width - width - DESKTOP_PADDING),
    Math.min(y, desktop.height - height - DESKTOP_PADDING),
    width,
    desktop
  );
  return { ...clamped, width, height };
}

export function createDesktopStore(initial: DesktopState = emptyDesktop()) {
  const { subscribe, update } = writable(initial);
  return {
    subscribe,
    open: (id: string, rect: Rect) => update((state) => openWindow(state, id, rect)),
    close: (id: string) => update((state) => closeWindow(state, id)),
    focus: (id: string) => update((state) => focusWindow(state, id)),
    move: (id: string, x: number, y: number) => update((state) => moveWindow(state, id, x, y)),
    resize: (id: string, width: number, height: number) =>
      update((state) => resizeWindow(state, id, width, height)),
    minimize: (id: string) => update((state) => minimizeWindow(state, id)),
    toggleMaximize: (id: string) => update((state) => toggleMaximize(state, id)),
    toggleFromTaskbar: (id: string) => update((state) => toggleFromTaskbar(state, id))
  };
}

export type DesktopStore = ReturnType<typeof createDesktopStore>;
