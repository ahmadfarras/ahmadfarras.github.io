import { describe, expect, it, vi } from "vitest";
import {
  PRODUCTION_HOST,
  UMAMI_SCRIPT_URL,
  UMAMI_WEBSITE_ID,
  loadAnalytics,
  shouldLoadAnalytics,
  track
} from "./analytics";

/** Minimal stand-in for `document`: records appended scripts and answers the "already added?" query. */
const fakeDocument = () => {
  const appended: { src: string; defer: boolean; dataset: Record<string, string> }[] = [];
  return {
    appended,
    createElement: () => ({ src: "", defer: false, dataset: {} as Record<string, string> }),
    querySelector: () => (appended.length ? appended[0] : null),
    head: { appendChild: (el: (typeof appended)[number]) => appended.push(el) }
  };
};

describe("shouldLoadAnalytics", () => {
  it.each([
    { host: PRODUCTION_HOST, want: true },
    { host: "localhost", want: false },
    { host: "127.0.0.1", want: false },
    { host: "ahmadfarras.github.io", want: false },
    { host: `evil-${PRODUCTION_HOST}`, want: false }
  ])("$host -> $want", ({ host, want }) => {
    expect(shouldLoadAnalytics(host)).toBe(want);
  });
});

describe("loadAnalytics", () => {
  it("adds the Umami script with the site id on the live site", () => {
    const doc = fakeDocument();
    loadAnalytics(doc as never, PRODUCTION_HOST);
    expect(doc.appended).toHaveLength(1);
    expect(doc.appended[0]).toMatchObject({
      src: UMAMI_SCRIPT_URL,
      defer: true,
      dataset: { websiteId: UMAMI_WEBSITE_ID, domains: PRODUCTION_HOST }
    });
  });

  it("adds it only once", () => {
    const doc = fakeDocument();
    loadAnalytics(doc as never, PRODUCTION_HOST);
    loadAnalytics(doc as never, PRODUCTION_HOST);
    expect(doc.appended).toHaveLength(1);
  });

  it("does nothing during local development", () => {
    const doc = fakeDocument();
    loadAnalytics(doc as never, "localhost");
    expect(doc.appended).toHaveLength(0);
  });
});

describe("track", () => {
  it("forwards the event and data to Umami", () => {
    const umami = { track: vi.fn() };
    track("open-app", { app: "tetris" }, { umami });
    expect(umami.track).toHaveBeenCalledWith("open-app", { app: "tetris" });
  });

  it("is a no-op before Umami loads or without a window", () => {
    expect(() => track("game-start", undefined, {})).not.toThrow();
    expect(() => track("game-start", undefined, undefined)).not.toThrow();
  });

  it("swallows tracker errors", () => {
    const umami = {
      track: () => {
        throw new Error("blocked");
      }
    };
    expect(() => track("game-over", { score: 10 }, { umami })).not.toThrow();
  });
});
