import { describe, expect, it } from "vitest";
import { apps, dockIconId, windowAppsById, type WindowApp } from "./apps";

const windowApps = apps.filter((app): app is WindowApp => app.kind === "window");

describe("apps", () => {
  it("has unique ids", () => {
    expect(new Set(apps.map((app) => app.id)).size).toBe(apps.length);
  });

  it("only puts apps in folders that exist", () => {
    for (const app of windowApps) {
      if (app.folder) expect(windowAppsById.has(app.folder)).toBe(true);
    }
  });

  it.each(["tetris", "snake"])("includes %s in the Games folder", (id) => {
    expect(windowAppsById.get(id)?.folder).toBe("games");
  });
});

describe("dockIconId", () => {
  it("uses the folder's icon for apps inside a folder", () => {
    expect(dockIconId(windowAppsById.get("tetris")!)).toBe("games");
  });

  it("uses the app's own icon otherwise", () => {
    expect(dockIconId(windowAppsById.get("about")!)).toBe("about");
  });
});
