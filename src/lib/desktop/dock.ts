/** macOS-style Dock magnification: icons swell as the pointer gets close. */

export const DOCK_MAX_SCALE = 1.5;
/** Horizontal distance (px) from the pointer at which an icon stops growing. */
export const DOCK_MAGNIFY_RANGE = 110;

/** Scale for an icon whose centre is `distance` px from the pointer; eased so the peak is smooth. */
export function dockScale(
  distance: number,
  maxScale = DOCK_MAX_SCALE,
  range = DOCK_MAGNIFY_RANGE
): number {
  const closeness = Math.max(0, 1 - Math.abs(distance) / range);
  const eased = closeness * closeness * (3 - 2 * closeness);
  return 1 + (maxScale - 1) * eased;
}

/** Scales for every icon given their resting centres and the pointer's x position. */
export const dockScales = (centres: number[], pointerX: number): number[] =>
  centres.map((centre) => dockScale(pointerX - centre));
