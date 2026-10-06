/**
 * Visitor analytics (Umami Cloud, EU region): cookieless and without personal data.
 * Everything that records an event goes through this file, so swapping to another
 * provider later (e.g. PostHog) only means changing it here.
 */

export const UMAMI_SCRIPT_URL = "https://cloud.umami.is/script.js";
export const UMAMI_WEBSITE_ID = "cdeeba37-c3f8-4bce-bb1d-123a1c0243f2";
/** Only the live site is tracked; local dev and previews are ignored. */
export const PRODUCTION_HOST = "ahmadfarrassyafrin.com";

/**
 * Events sent from code. Link clicks are tracked by Umami itself through data-umami-event
 * attributes: "open-link" (Dock, Contact, Projects) and "switch-view" (ViewSwitch).
 */
export type AnalyticsEvent =
  | "open-app"
  | "change-wallpaper"
  | "game-start"
  | "game-over";

type EventData = Record<string, string | number>;

interface Umami {
  track: (event: string, data?: EventData) => void;
}

declare global {
  interface Window {
    /** Set by the Umami script once it has loaded. */
    umami?: Umami;
  }
}

type AnalyticsWindow = Pick<Window, "umami">;
type ScriptDocument = Pick<Document, "createElement" | "querySelector"> & {
  head: Pick<HTMLHeadElement, "appendChild">;
};

export const shouldLoadAnalytics = (hostname: string): boolean => hostname === PRODUCTION_HOST;

/** Adds the Umami script once. Call it after the page is interactive so it never delays loading. */
export function loadAnalytics(doc: ScriptDocument, hostname: string) {
  if (!shouldLoadAnalytics(hostname)) return;
  if (doc.querySelector(`script[data-website-id="${UMAMI_WEBSITE_ID}"]`)) return;

  const script = doc.createElement("script");
  script.defer = true;
  script.src = UMAMI_SCRIPT_URL;
  script.dataset.websiteId = UMAMI_WEBSITE_ID;
  // A second guard on Umami's side, in case the script is ever loaded elsewhere.
  script.dataset.domains = PRODUCTION_HOST;
  doc.head.appendChild(script);
}

/**
 * Records a custom event. A no-op until the script has loaded, when it is blocked (ad
 * blockers) or off the live site; analytics must never break the page.
 */
export function track(
  event: AnalyticsEvent,
  data?: EventData,
  target: AnalyticsWindow | undefined = typeof window === "undefined" ? undefined : window
) {
  try {
    target?.umami?.track(event, data);
  } catch {
    // Ignore: a failing tracker is not the visitor's problem.
  }
}
