/** When to show the start-up boot screen, and for how long. */

/** Shortest time the boot screen stays up, so a fast load still reads as a deliberate boot. */
export const MIN_BOOT_MS = 900;
/** Time for the progress bar to fill and the screen to fade once the desktop is ready. */
export const BOOT_FINISH_MS = 350;

// Browser-only: set once the first boot finishes, so navigating back from the classic view
// within the same tab skips the boot screen. The prerender never calls markBooted().
let hasBootedInThisTab = false;

export const hasBooted = (): boolean => hasBootedInThisTab;

export function markBooted() {
  hasBootedInThisTab = true;
}

/** How much longer to keep the boot screen up, given how long the page has been loading. */
export const remainingBootMs = (elapsedMs: number, minimumMs = MIN_BOOT_MS): number =>
  Math.max(0, minimumMs - elapsedMs);
