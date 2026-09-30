/** Helpers for the menu bar's clock, Wi-Fi and battery indicators. */

const MS_PER_MINUTE = 60_000;
const LOW_BATTERY_LEVEL = 0.2;

/** Delay until the next minute starts, so the clock flips exactly on the minute. */
export function msUntilNextMinute(now: Date): number {
  const elapsed = now.getSeconds() * 1000 + now.getMilliseconds();
  return MS_PER_MINUTE - elapsed;
}

export type WifiBars = 0 | 1 | 2 | 3;

/**
 * Bars to light up. `effectiveType` comes from the Network Information API
 * (Chromium only); without it an online connection shows full bars.
 */
export function wifiBars(isOnline: boolean, effectiveType?: string): WifiBars {
  if (!isOnline) return 0;
  switch (effectiveType) {
    case "slow-2g":
    case "2g":
      return 1;
    case "3g":
      return 2;
    default:
      return 3;
  }
}

export function wifiLabel(isOnline: boolean, effectiveType?: string): string {
  if (!isOnline) return "Offline";
  return effectiveType ? `Online (${effectiveType})` : "Online";
}

export interface BatteryStatus {
  /** 0 to 1, as reported by the Battery Status API. */
  level: number;
  charging: boolean;
}

export const batteryPercent = (level: number): number =>
  Math.round(Math.min(Math.max(level, 0), 1) * 100);

export const isBatteryLow = ({ level, charging }: BatteryStatus): boolean =>
  !charging && level <= LOW_BATTERY_LEVEL;

export function batteryLabel(battery: BatteryStatus): string {
  const percent = `${batteryPercent(battery.level)}%`;
  return battery.charging ? `Battery ${percent}, charging` : `Battery ${percent}`;
}
