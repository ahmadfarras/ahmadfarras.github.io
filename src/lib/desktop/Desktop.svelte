<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import AppWindow from "./AppWindow.svelte";
  import ContextMenu from "./ContextMenu.svelte";
  import Taskbar from "./Taskbar.svelte";
  import { apps, windowAppsById } from "./apps";
  import { setOpenApp, setWallpaperStore } from "./context";
  import { createWallpaperStore } from "./wallpapers";
  import {
    activeWindowId,
    createDesktopStore,
    initialRect,
    type Point
  } from "./windowManager";

  const COMPACT_BREAKPOINT = 768;
  const START_APP = "about";

  const WALLPAPER_FADE_MS = 400;

  const desktop = createDesktopStore();
  const wallpaper = createWallpaperStore(browserStorage());
  let width = 0;
  let height = 0;
  let contextMenuAt: Point | null = null;

  $: desktopSize = { width, height };
  $: isCompact = width < COMPACT_BREAKPOINT;
  $: activeId = activeWindowId($desktop);

  function openApp(id: string) {
    const app = windowAppsById.get(id);
    if (!app) return;
    desktop.open(id, initialRect(app.size, $desktop.windows.length, desktopSize));
  }

  /** Right-click on the wallpaper or icons; windows keep the browser's own menu so text can be copied. */
  function openContextMenu(event: MouseEvent) {
    if ((event.target as HTMLElement).closest('[role="dialog"]')) return;
    event.preventDefault();
    const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect();
    contextMenuAt = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  }

  /** localStorage can throw on access when site data is blocked; treat that as "no storage". */
  function browserStorage(): Storage | null {
    try {
      return typeof localStorage === "undefined" ? null : localStorage;
    } catch {
      return null;
    }
  }

  const prefersReducedMotion = () =>
    typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  setOpenApp(openApp);
  setWallpaperStore(wallpaper);
  onMount(() => {
    wallpaper.load();
    openApp(START_APP);
  });
</script>

<svelte:head>
  <title>Ahmad Farras Syafrin</title>
</svelte:head>

<div class="os">
  <!-- The custom menu only replaces the browser's on the desktop background; it is also reachable via the Wallpaper icon. -->
  <main
    class="wallpaper"
    on:contextmenu={openContextMenu}
    class:has-image={$wallpaper.src !== null}
    bind:clientWidth={width}
    bind:clientHeight={height}
  >
    {#key $wallpaper.id}
      <div
        class="wallpaper-layer"
        class:dots={$wallpaper.src === null}
        style={$wallpaper.src ? `background-image: url("${$wallpaper.src}")` : ""}
        transition:fade={{ duration: prefersReducedMotion() ? 0 : WALLPAPER_FADE_MS }}
      />
    {/key}

    <ul class="icons" aria-label="Desktop">
      {#each apps as app (app.id)}
        <li>
          {#if app.kind === "link"}
            <a class="icon" href={app.href} target="_blank" rel="noopener noreferrer">
              <span class="icon-tile"><svelte:component this={app.icon} size="lg" /></span>
              <span class="icon-label">{app.title}</span>
            </a>
          {:else}
            <button type="button" class="icon" on:click={() => openApp(app.id)}>
              <span class="icon-tile"><svelte:component this={app.icon} size="lg" /></span>
              <span class="icon-label">{app.title}</span>
            </button>
          {/if}
        </li>
      {/each}
    </ul>

    {#each $desktop.windows as win (win.id)}
      {@const app = windowAppsById.get(win.id)}
      {#if app}
        <AppWindow
          {win}
          {desktop}
          {desktopSize}
          {isCompact}
          title={app.title}
          isActive={win.id === activeId}
        >
          <svelte:component this={app.content} />
        </AppWindow>
      {/if}
    {/each}

    {#if contextMenuAt}
      <ContextMenu
        at={contextMenuAt}
        {desktopSize}
        onChangeWallpaper={() => openApp("wallpaper")}
        onClose={() => (contextMenuAt = null)}
      />
    {/if}
  </main>

  <Taskbar windows={$desktop.windows} {activeId} {desktop} />
</div>

<style>
  .os {
    --os-wallpaper: #eeefe9;
    --os-dot: rgb(0 0 0 / 0.12);
    --os-window: #fdfdf8;
    --os-chrome: #e5e7e0;
    --os-border: #c4c6bc;
    --os-border-strong: #73756b;
    --os-text: #23251d;
    --os-muted: #65675e;
    --os-ink: #151515;
    --os-accent: #f7a501;
    --os-hover: rgb(0 0 0 / 0.07);
    --os-motion-duration: 280ms;
    --os-motion: var(--os-motion-duration) cubic-bezier(0.2, 0.8, 0.2, 1);
    display: flex;
    flex-direction: column;
    height: 100dvh;
    overflow: hidden;
    color: var(--os-text);
  }
  :global(.dark) .os {
    --os-wallpaper: #1d1f27;
    --os-dot: rgb(255 255 255 / 0.08);
    --os-window: #23252e;
    --os-chrome: #2c2f39;
    --os-border: #3b3e4a;
    --os-border-strong: #8a8d99;
    --os-text: #eef0f3;
    --os-muted: #a3a6b1;
    --os-ink: #e5e7eb;
    --os-hover: rgb(255 255 255 / 0.08);
  }
  .wallpaper {
    position: relative;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    background-color: var(--os-wallpaper);
  }
  .wallpaper-layer {
    position: absolute;
    inset: 0;
    background-position: center;
    background-size: cover;
  }
  .wallpaper-layer.dots {
    background-image: radial-gradient(var(--os-dot) 1px, transparent 1px);
    background-size: 22px 22px;
  }
  /* Image wallpapers have fixed colours, so tone them down to sit with the dark theme. */
  :global(.dark) .wallpaper-layer:not(.dots)::after {
    content: "";
    position: absolute;
    inset: 0;
    background: rgb(0 0 0 / 0.3);
  }
  .icons {
    position: relative;
    display: grid;
    grid-template-columns: repeat(3, auto);
    gap: 0.5rem;
    width: fit-content;
    padding: 1rem;
  }
  @media (min-width: 768px) {
    /* One column that wraps into a second one on short screens instead of being cut off. */
    .icons {
      grid-auto-flow: column;
      grid-template-columns: none;
      grid-template-rows: repeat(auto-fill, 5.5rem);
      height: 100%;
    }
  }
  .icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    width: 6rem;
    padding: 0.5rem;
    border-radius: 0.375rem;
    text-align: center;
  }
  .icon:hover {
    background: var(--os-hover);
  }
  .icon:focus-visible {
    outline: 2px solid var(--os-accent);
  }
  .icon-tile {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    border: 2px solid var(--os-ink);
    border-radius: 0.75rem;
    background: var(--os-window);
    box-shadow: 0 3px 0 0 var(--os-ink);
    transition: transform 0.1s;
  }
  .icon:active .icon-tile {
    transform: translateY(3px);
    box-shadow: none;
  }
  .icon-label {
    padding: 0 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
  }
  /* A theme-coloured backing keeps labels readable on any image, light or dark. */
  .has-image .icon-label {
    background: color-mix(in srgb, var(--os-window) 85%, transparent);
  }
  .has-image .icon:hover {
    background: color-mix(in srgb, var(--os-window) 30%, transparent);
  }
</style>
