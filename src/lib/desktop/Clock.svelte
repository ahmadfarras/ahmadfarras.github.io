<script lang="ts">
  import { onMount } from "svelte";
  import { msUntilNextMinute } from "./systemStatus";

  const MS_PER_MINUTE = 60_000;
  // Null until mounted: the page is prerendered, so a server-side time would be the build time.
  let now: Date | null = null;

  onMount(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    const tick = () => (now = new Date());
    const firstTick = setTimeout(() => {
      tick();
      interval = setInterval(tick, MS_PER_MINUTE);
    }, msUntilNextMinute(tick()));
    return () => {
      clearTimeout(firstTick);
      clearInterval(interval);
    };
  });

</script>

{#if now}
  <time datetime={now.toISOString()} class="clock">
    <span class="date">
      {now.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" })}
    </span>
    <span>{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
  </time>
{/if}

<style>
  .clock {
    display: flex;
    gap: 0.5rem;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  @media (max-width: 639px) {
    .date {
      display: none;
    }
  }
</style>
