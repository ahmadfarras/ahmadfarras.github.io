<script lang="ts">
  import { apps, dockIconId, windowAppsById, type LinkApp, type WindowApp } from "./apps";
  import { dockScales } from "./dock";
  import type { WindowState } from "./windowManager";

  export let windows: WindowState[];
  export let onOpen: (id: string) => void;
  /** Rendered height, so the desktop can keep windows clear of the Dock. */
  export let height = 0;

  const windowApps = apps.filter(
    (app): app is WindowApp => app.kind === "window" && !app.folder
  );
  const linkApps = apps.filter((app): app is LinkApp => app.kind === "link");

  let items: HTMLElement;
  let restingCentres: number[] = [];
  let scales: number[] = [];

  /** Dock icons with at least one open window behind them (a folder counts its apps' windows). */
  $: runningIconIds = new Set(
    windows.map((win) => {
      const app = windowAppsById.get(win.id);
      return app ? dockIconId(app) : win.id;
    })
  );

  const prefersReducedMotion = () =>
    typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Magnify around the pointer using the icons' resting positions: measuring them while they
  // grow would feed the growth back into itself and make the Dock jitter.
  function startMagnify(event: PointerEvent) {
    if (event.pointerType !== "mouse" || prefersReducedMotion()) return;
    restingCentres = [...items.querySelectorAll<HTMLElement>(".dock-item")].map((item) => {
      const rect = item.getBoundingClientRect();
      return rect.left + rect.width / 2;
    });
  }

  function magnify(event: PointerEvent) {
    if (restingCentres.length === 0) return;
    scales = dockScales(restingCentres, event.clientX);
  }

  function stopMagnify() {
    restingCentres = [];
    scales = [];
  }

  const scaleAt = (index: number, current: number[]) => current[index] ?? 1;
</script>

<nav class="dock" aria-label="Dock" bind:offsetHeight={height}>
  <ul
    bind:this={items}
    class="items"
    on:pointerenter={startMagnify}
    on:pointermove={magnify}
    on:pointerleave={stopMagnify}
  >
    {#each windowApps as app, index (app.id)}
      <li class="dock-item" style="--scale: {scaleAt(index, scales)}">
        <button
          type="button"
          class="tile"
          aria-label={app.title}
          data-task-id={app.id}
          on:click={() => onOpen(app.id)}
        >
          <svelte:component this={app.icon} class="h-1/2 w-1/2" />
        </button>
        <span class="tooltip" aria-hidden="true">{app.title}</span>
        {#if runningIconIds.has(app.id)}
          <span class="running" aria-hidden="true" />
        {/if}
      </li>
    {/each}

    <li class="separator" aria-hidden="true" />

    {#each linkApps as app, index (app.id)}
      <li class="dock-item" style="--scale: {scaleAt(windowApps.length + index, scales)}">
        <a
          class="tile"
          href={app.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="{app.title} (opens in a new tab)"
          data-umami-event="open-link"
          data-umami-event-link={app.id}
          data-umami-event-from="dock"
        >
          <svelte:component this={app.icon} class="h-1/2 w-1/2" />
        </a>
        <span class="tooltip" aria-hidden="true">{app.title}</span>
      </li>
    {/each}
  </ul>
</nav>

<style>
  .dock {
    --tile: 3rem;
    position: absolute;
    bottom: 0.5rem;
    left: 50%;
    /* Above every window, whose z-index keeps growing as they get focused; below the context menu. */
    z-index: 2147483646;
    transform: translateX(-50%);
    max-width: calc(100% - 1rem);
    padding: 0.375rem 0.5rem 0.625rem;
    border: 1px solid var(--os-dock-border);
    border-radius: 1.25rem;
    background: var(--os-dock-bg);
    box-shadow: 0 10px 30px rgb(0 0 0 / 0.2);
    backdrop-filter: blur(18px) saturate(1.6);
    -webkit-backdrop-filter: blur(18px) saturate(1.6);
  }
  /* Eight icons plus the separator have to fit a 375px-wide phone. */
  @media (max-width: 639px) {
    .dock {
      --tile: 2.25rem;
    }
    .items {
      gap: 0.3125rem;
    }
  }
  .items {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
  }
  .dock-item {
    position: relative;
    display: flex;
    flex-shrink: 0;
    justify-content: center;
    width: calc(var(--tile) * var(--scale));
    height: var(--tile);
    transition: width 90ms ease-out;
  }
  .tile {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: var(--tile);
    height: var(--tile);
    border: 2px solid var(--os-ink);
    border-radius: 22%;
    background: var(--os-window);
    color: var(--os-text);
    /* Grow upwards out of the Dock, like macOS. */
    transform: scale(var(--scale));
    transform-origin: bottom center;
    transition: transform 90ms ease-out;
  }
  .tile:focus-visible {
    outline: 2px solid var(--os-accent);
    outline-offset: 2px;
  }
  .tooltip {
    position: absolute;
    bottom: calc(var(--tile) * var(--scale) + 0.625rem);
    padding: 0.125rem 0.5rem;
    border: 1px solid var(--os-border);
    border-radius: 0.375rem;
    background: var(--os-window);
    font-size: 0.75rem;
    font-weight: 600;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 120ms;
  }
  .dock-item:hover .tooltip,
  .dock-item:focus-within .tooltip {
    opacity: 1;
  }
  .running {
    position: absolute;
    bottom: -0.4375rem;
    width: 0.25rem;
    height: 0.25rem;
    border-radius: 50%;
    background: var(--os-text);
  }
  .separator {
    align-self: stretch;
    width: 1px;
    margin: 0.25rem 0.125rem;
    background: var(--os-border-strong);
    opacity: 0.5;
  }
  @media (prefers-reduced-motion: reduce) {
    .dock-item,
    .tile {
      transition: none;
    }
  }
</style>
