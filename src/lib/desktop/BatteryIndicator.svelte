<script lang="ts">
  import { onMount } from "svelte";
  import {
    batteryLabel,
    batteryPercent,
    isBatteryLow,
    type BatteryStatus
  } from "./systemStatus";

  // Battery Status API: Chromium only. Without it the indicator stays hidden rather than guessing.
  type BatteryManager = EventTarget & BatteryStatus;

  const FILL_WIDTH = 16;
  let battery: BatteryStatus | null = null;

  onMount(() => {
    const getBattery = (navigator as Navigator & { getBattery?: () => Promise<BatteryManager> })
      .getBattery;
    if (!getBattery) return;

    let manager: BatteryManager | undefined;
    const update = () => {
      if (manager) battery = { level: manager.level, charging: manager.charging };
    };
    getBattery
      .call(navigator)
      .then((result) => {
        manager = result;
        update();
        manager.addEventListener("levelchange", update);
        manager.addEventListener("chargingchange", update);
      })
      .catch(() => {
        // Blocked by a permissions policy: keep the indicator hidden.
      });

    return () => {
      manager?.removeEventListener("levelchange", update);
      manager?.removeEventListener("chargingchange", update);
    };
  });
</script>

{#if battery}
  {@const percent = batteryPercent(battery.level)}
  {@const label = batteryLabel(battery)}
  <span class="indicator" class:low={isBatteryLow(battery)} role="img" aria-label={label} title={label}>
    <span class="percent" aria-hidden="true">{percent}%</span>
    <svg viewBox="0 0 24 12" width="26" height="13" aria-hidden="true">
      <rect x="0.75" y="0.75" width="20" height="10.5" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.5" />
      <rect x="22" y="3.5" width="1.75" height="5" rx="0.75" fill="currentColor" />
      <rect class="fill" x="2.75" y="2.75" width={(FILL_WIDTH * percent) / 100} height="6.5" rx="1" />
      {#if battery.charging}
        <path d="M11.5 1.5 8 6.5h3l-1 4 3.5-5h-3z" fill="var(--os-window)" stroke="currentColor" stroke-width="0.6" />
      {/if}
    </svg>
  </span>
{/if}

<style>
  .indicator {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }
  .fill {
    fill: currentColor;
  }
  .low .fill {
    fill: #e5484d;
  }
  @media (max-width: 639px) {
    .percent {
      display: none;
    }
  }
</style>
