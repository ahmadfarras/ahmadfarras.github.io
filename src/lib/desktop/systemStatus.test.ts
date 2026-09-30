import { describe, expect, it } from "vitest";
import {
  batteryLabel,
  batteryPercent,
  isBatteryLow,
  msUntilNextMinute,
  wifiBars,
  wifiLabel
} from "./systemStatus";

const at = (seconds: number, ms = 0) => new Date(2026, 8, 30, 11, 20, seconds, ms);

describe("msUntilNextMinute", () => {
  it.each([
    { name: "start of a minute", now: at(0), want: 60_000 },
    { name: "mid minute", now: at(30, 250), want: 29_750 },
    { name: "last millisecond", now: at(59, 999), want: 1 }
  ])("$name", ({ now, want }) => {
    expect(msUntilNextMinute(now)).toBe(want);
  });
});

describe("wifiBars", () => {
  it.each([
    { name: "offline", online: false, type: "4g", want: 0 },
    { name: "slow-2g", online: true, type: "slow-2g", want: 1 },
    { name: "2g", online: true, type: "2g", want: 1 },
    { name: "3g", online: true, type: "3g", want: 2 },
    { name: "4g", online: true, type: "4g", want: 3 },
    { name: "API unsupported", online: true, type: undefined, want: 3 },
    { name: "unknown type", online: true, type: "5g", want: 3 }
  ])("$name", ({ online, type, want }) => {
    expect(wifiBars(online, type)).toBe(want);
  });
});

describe("wifiLabel", () => {
  it.each([
    { online: false, type: "4g", want: "Offline" },
    { online: true, type: "3g", want: "Online (3g)" },
    { online: true, type: undefined, want: "Online" }
  ])("$want", ({ online, type, want }) => {
    expect(wifiLabel(online, type)).toBe(want);
  });
});

describe("batteryPercent", () => {
  it.each([
    { level: 0.456, want: 46 },
    { level: 1, want: 100 },
    { level: 0, want: 0 },
    { level: 1.2, want: 100 },
    { level: -0.1, want: 0 }
  ])("$level -> $want", ({ level, want }) => {
    expect(batteryPercent(level)).toBe(want);
  });
});

describe("isBatteryLow", () => {
  it.each([
    { name: "low and draining", level: 0.2, charging: false, want: true },
    { name: "low but charging", level: 0.1, charging: true, want: false },
    { name: "just above threshold", level: 0.21, charging: false, want: false }
  ])("$name", ({ level, charging, want }) => {
    expect(isBatteryLow({ level, charging })).toBe(want);
  });
});

describe("batteryLabel", () => {
  it("mentions charging only when charging", () => {
    expect(batteryLabel({ level: 0.85, charging: false })).toBe("Battery 85%");
    expect(batteryLabel({ level: 0.85, charging: true })).toBe("Battery 85%, charging");
  });
});
