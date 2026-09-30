<script lang="ts">
  import { onMount } from "svelte";
  import { wifiBars, wifiLabel } from "./systemStatus";

  // Network Information API: Chromium only, so every access is optional.
  type Connection = EventTarget & { effectiveType?: string };

  let isOnline = true;
  let effectiveType: string | undefined;

  onMount(() => {
    const connection = (navigator as Navigator & { connection?: Connection }).connection;
    const update = () => {
      isOnline = navigator.onLine;
      effectiveType = connection?.effectiveType;
    };
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    connection?.addEventListener("change", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      connection?.removeEventListener("change", update);
    };
  });

  $: bars = wifiBars(isOnline, effectiveType);
  $: label = wifiLabel(isOnline, effectiveType);
</script>

<span class="indicator" role="img" aria-label={label} title={label}>
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
    <path d="M2 8.5a15 15 0 0 1 20 0" class:dim={bars < 3} />
    <path d="M5.5 12.5a10 10 0 0 1 13 0" class:dim={bars < 2} />
    <path d="M9 16.2a5 5 0 0 1 6 0" class:dim={bars < 1} />
    <circle cx="12" cy="19.5" r="1.2" fill="currentColor" stroke="none" class:dim={bars < 1} />
    {#if bars === 0}
      <path d="M4 3l16 18" />
    {/if}
  </svg>
</span>

<style>
  .indicator {
    display: flex;
    align-items: center;
  }
  .dim {
    opacity: 0.3;
  }
</style>
