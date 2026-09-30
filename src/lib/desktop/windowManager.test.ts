import { describe, expect, it } from "vitest";
import { get } from "svelte/store";
import {
  MIN_WINDOW_SIZE,
  activeWindowId,
  clampPosition,
  closeWindow,
  createDesktopStore,
  displayRect,
  emptyDesktop,
  focusWindow,
  initialRect,
  minimizeTransform,
  minimizeWindow,
  moveWindow,
  openWindow,
  resizeWindow,
  toggleFromTaskbar,
  toggleMaximize,
  type DesktopState
} from "./windowManager";

const rect = { x: 10, y: 20, width: 400, height: 300 };
const desktop = { width: 1280, height: 800 };

const withWindows = (...ids: string[]): DesktopState =>
  ids.reduce((state, id) => openWindow(state, id, rect), emptyDesktop());

const byId = (state: DesktopState, id: string) => state.windows.find((w) => w.id === id)!;

describe("openWindow", () => {
  it("adds a new window on top", () => {
    const state = withWindows("about", "stack");
    expect(state.windows.map((w) => w.id)).toEqual(["about", "stack"]);
    expect(byId(state, "stack").z).toBeGreaterThan(byId(state, "about").z);
    expect(byId(state, "about")).toMatchObject({ ...rect, isMinimized: false, isMaximized: false });
  });

  it("focuses and restores an already open window instead of duplicating it", () => {
    const state = minimizeWindow(withWindows("about", "stack"), "about");
    const reopened = openWindow(state, "about", { x: 0, y: 0, width: 1, height: 1 });
    expect(reopened.windows).toHaveLength(2);
    expect(byId(reopened, "about")).toMatchObject({ x: 10, isMinimized: false });
    expect(activeWindowId(reopened)).toBe("about");
  });
});

describe("closeWindow", () => {
  it("removes only the given window", () => {
    expect(closeWindow(withWindows("about", "stack"), "about").windows.map((w) => w.id)).toEqual([
      "stack"
    ]);
  });

  it("ignores unknown ids", () => {
    const state = withWindows("about");
    expect(closeWindow(state, "nope").windows).toHaveLength(1);
  });
});

describe("focusWindow", () => {
  it("raises the window above the others", () => {
    const state = focusWindow(withWindows("about", "stack"), "about");
    expect(activeWindowId(state)).toBe("about");
  });

  it("returns the same state when already active or unknown", () => {
    const state = withWindows("about", "stack");
    expect(focusWindow(state, "stack")).toBe(state);
    expect(focusWindow(state, "nope")).toBe(state);
  });
});

describe("moveWindow / resizeWindow", () => {
  it("moves the window", () => {
    expect(byId(moveWindow(withWindows("about"), "about", 50, 60), "about")).toMatchObject({
      x: 50,
      y: 60
    });
  });

  it("resizes but never below the minimum size", () => {
    const state = withWindows("about");
    expect(byId(resizeWindow(state, "about", 800, 500), "about")).toMatchObject({
      width: 800,
      height: 500
    });
    expect(byId(resizeWindow(state, "about", 10, 10), "about")).toMatchObject(MIN_WINDOW_SIZE);
  });
});

describe("minimize / maximize", () => {
  it("minimized windows are never active", () => {
    const state = minimizeWindow(withWindows("about", "stack"), "stack");
    expect(activeWindowId(state)).toBe("about");
    expect(activeWindowId(minimizeWindow(state, "about"))).toBeNull();
  });

  it("toggles maximize", () => {
    const once = toggleMaximize(withWindows("about"), "about");
    expect(byId(once, "about").isMaximized).toBe(true);
    expect(byId(toggleMaximize(once, "about"), "about").isMaximized).toBe(false);
  });
});

describe("toggleFromTaskbar", () => {
  it("minimizes the active window", () => {
    const state = toggleFromTaskbar(withWindows("about", "stack"), "stack");
    expect(byId(state, "stack").isMinimized).toBe(true);
  });

  it("brings back a background or minimized window", () => {
    const background = toggleFromTaskbar(withWindows("about", "stack"), "about");
    expect(activeWindowId(background)).toBe("about");

    const minimized = minimizeWindow(withWindows("about", "stack"), "stack");
    const restored = toggleFromTaskbar(minimized, "stack");
    expect(byId(restored, "stack").isMinimized).toBe(false);
    expect(activeWindowId(restored)).toBe("stack");
  });
});

describe("activeWindowId", () => {
  it("is null on an empty desktop", () => {
    expect(activeWindowId(emptyDesktop())).toBeNull();
  });
});

describe("clampPosition", () => {
  it.each([
    { name: "inside stays put", x: 100, y: 100, want: { x: 100, y: 100 } },
    { name: "too far left", x: -1000, y: 100, want: { x: 80 - 400, y: 100 } },
    { name: "too far right", x: 5000, y: 100, want: { x: 1280 - 80, y: 100 } },
    { name: "above the top", x: 100, y: -50, want: { x: 100, y: 0 } },
    { name: "below the bottom", x: 100, y: 5000, want: { x: 100, y: 800 - 40 } }
  ])("$name", ({ x, y, want }) => {
    expect(clampPosition(x, y, 400, desktop)).toEqual(want);
  });
});

describe("initialRect", () => {
  it("uses the preferred size when it fits and clears the icon column", () => {
    const result = initialRect({ width: 600, height: 400 }, 0, desktop);
    expect(result).toMatchObject({ width: 600, height: 400 });
    expect(result.x).toBeGreaterThanOrEqual(120);
    expect(result.y + result.height).toBeLessThanOrEqual(desktop.height);
  });

  it("cascades each additional window", () => {
    const first = initialRect({ width: 600, height: 400 }, 0, desktop);
    const second = initialRect({ width: 600, height: 400 }, 1, desktop);
    expect(second.x - first.x).toBe(32);
    expect(second.y - first.y).toBe(32);
  });

  it("shrinks to fit a small screen", () => {
    const result = initialRect({ width: 900, height: 900 }, 0, { width: 500, height: 600 });
    expect(result.width).toBe(452);
    expect(result.height).toBe(552);
    expect(result.x + result.width).toBeLessThanOrEqual(500);
  });
});

describe("displayRect", () => {
  it("returns the window's own rect when not full size", () => {
    const win = { ...rect, id: "about", z: 1, isMinimized: false, isMaximized: false };
    expect(displayRect(win, false, desktop)).toEqual(rect);
  });

  it("covers the whole desktop when full size", () => {
    expect(displayRect(rect, true, desktop)).toEqual({ x: 0, y: 0, ...desktop });
  });
});

describe("minimizeTransform", () => {
  it("moves the window centre onto the target and shrinks it", () => {
    // Window centre is (210, 170).
    expect(minimizeTransform(rect, { x: 300, y: 800 })).toBe("translate(90px, 630px) scale(0.1)");
  });

  it("handles targets up and to the left", () => {
    expect(minimizeTransform(rect, { x: 10, y: 20 })).toBe("translate(-200px, -150px) scale(0.1)");
  });
});

describe("createDesktopStore", () => {
  it("routes every action through the pure functions", () => {
    const store = createDesktopStore();
    store.open("about", rect);
    store.open("stack", rect);
    store.focus("about");
    store.move("about", 5, 6);
    store.resize("about", 500, 400);
    store.toggleMaximize("about");
    store.minimize("stack");
    let state = get(store);
    expect(byId(state, "about")).toMatchObject({ x: 5, y: 6, width: 500, isMaximized: true });
    expect(byId(state, "stack").isMinimized).toBe(true);

    store.toggleFromTaskbar("stack");
    store.close("about");
    state = get(store);
    expect(state.windows.map((w) => w.id)).toEqual(["stack"]);
    expect(activeWindowId(state)).toBe("stack");
  });
});
