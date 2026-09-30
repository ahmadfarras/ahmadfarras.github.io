<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { browserStorage } from "$lib/browserStorage";
  import AppWindow from "./AppWindow.svelte";
  import BootScreen from "./BootScreen.svelte";
  import ContextMenu from "./ContextMenu.svelte";
  import Dock from "./Dock.svelte";
  import MenuBar from "./MenuBar.svelte";
  import { dockIconId, windowAppsById } from "./apps";
  import { BOOT_FINISH_MS, hasBooted, markBooted, remainingBootMs } from "./boot";
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
  // Used until the Dock has been measured, and the gap kept between it and the windows.
  const DOCK_FALLBACK_HEIGHT = 72;
  const DOCK_CLEARANCE = 16;

  const desktop = createDesktopStore();
  const wallpaper = createWallpaperStore(browserStorage());
  let width = 0;
  let height = 0;
  let dockHeight = 0;
  let contextMenuAt: Point | null = null;
  /** "booting" until the app is interactive, "finishing" while the boot screen fills and fades. */
  let bootPhase: "booting" | "finishing" | "done" = hasBooted() ? "done" : "booting";

  $: desktopSize = { width, height };
  /** The part of the desktop windows may use: everything above the Dock. */
  $: workArea = {
    width,
    height: Math.max(0, height - (dockHeight || DOCK_FALLBACK_HEIGHT) - DOCK_CLEARANCE)
  };
  $: isCompact = width < COMPACT_BREAKPOINT;
  $: activeId = activeWindowId($desktop);
  $: activeTitle = activeId ? (windowAppsById.get(activeId)?.title ?? null) : null;

  function openApp(id: string) {
    const app = windowAppsById.get(id);
    if (!app) return;
    desktop.open(id, initialRect(app.size, $desktop.windows.length, workArea));
  }

  /** Right-click on the wallpaper; windows and the Dock keep the browser's own menu (copy text, open links). */
  function openContextMenu(event: MouseEvent) {
    if ((event.target as HTMLElement).closest('[role="dialog"], nav')) return;
    event.preventDefault();
    const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect();
    contextMenuAt = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  }

  const prefersReducedMotion = () =>
    typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  setOpenApp(openApp);
  setWallpaperStore(wallpaper);
  onMount(() => {
    wallpaper.load();
    if (bootPhase === "done") {
      openApp(START_APP);
      return;
    }
    // performance.now() counts from the start of navigation, so a slow load skips the minimum.
    let finishTimer: ReturnType<typeof setTimeout> | undefined;
    const bootTimer = setTimeout(() => {
      bootPhase = "finishing";
      finishTimer = setTimeout(() => {
        bootPhase = "done";
        markBooted();
        openApp(START_APP);
      }, BOOT_FINISH_MS);
    }, remainingBootMs(performance.now()));
    return () => {
      clearTimeout(bootTimer);
      clearTimeout(finishTimer);
    };
  });
</script>

<svelte:head>
  <title>Ahmad Farras Syafrin</title>
</svelte:head>

<div class="os">
  {#if bootPhase !== "done"}
    <BootScreen isReady={bootPhase === "finishing"} />
  {/if}

  <MenuBar {activeTitle} />

  <!-- The custom menu only replaces the browser's on the desktop background; Wallpaper is also in the Dock. -->
  <main
    class="wallpaper"
    on:contextmenu={openContextMenu}
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

    {#each $desktop.windows as win (win.id)}
      {@const app = windowAppsById.get(win.id)}
      {#if app}
        <AppWindow
          {win}
          {desktop}
          desktopSize={workArea}
          {isCompact}
          title={app.title}
          dockIconId={dockIconId(app)}
          isActive={win.id === activeId}
        >
          <svelte:component this={app.content} />
        </AppWindow>
      {/if}
    {/each}

    <Dock windows={$desktop.windows} onOpen={openApp} bind:height={dockHeight} />

    {#if contextMenuAt}
      <ContextMenu
        at={contextMenuAt}
        {desktopSize}
        onChangeWallpaper={() => openApp("wallpaper")}
        onClose={() => (contextMenuAt = null)}
      />
    {/if}
  </main>
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
    --os-dock-bg: rgb(255 255 255 / 0.45);
    --os-dock-border: rgb(255 255 255 / 0.6);
    --os-motion-duration: 280ms;
    --os-motion: var(--os-motion-duration) cubic-bezier(0.2, 0.8, 0.2, 1);
    position: relative;
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
    --os-dock-bg: rgb(40 42 52 / 0.5);
    --os-dock-border: rgb(255 255 255 / 0.12);
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
</style>
