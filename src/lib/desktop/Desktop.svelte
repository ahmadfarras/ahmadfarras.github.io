<script lang="ts">
  import { onMount } from "svelte";
  import AppWindow from "./AppWindow.svelte";
  import Taskbar from "./Taskbar.svelte";
  import { apps, windowAppsById } from "./apps";
  import { setOpenApp } from "./context";
  import { activeWindowId, createDesktopStore, initialRect } from "./windowManager";

  const COMPACT_BREAKPOINT = 768;
  const START_APP = "about";

  const desktop = createDesktopStore();
  let width = 0;
  let height = 0;

  $: desktopSize = { width, height };
  $: isCompact = width < COMPACT_BREAKPOINT;
  $: activeId = activeWindowId($desktop);
  $: visibleWindows = $desktop.windows.filter((win) => !win.isMinimized);

  function openApp(id: string) {
    const app = windowAppsById.get(id);
    if (!app) return;
    desktop.open(id, initialRect(app.size, $desktop.windows.length, desktopSize));
  }

  setOpenApp(openApp);
  onMount(() => openApp(START_APP));
</script>

<svelte:head>
  <title>Ahmad Farras Syafrin</title>
</svelte:head>

<div class="os">
  <main class="wallpaper" bind:clientWidth={width} bind:clientHeight={height}>
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

    {#each visibleWindows as win (win.id)}
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
    background-image: radial-gradient(var(--os-dot) 1px, transparent 1px);
    background-size: 22px 22px;
  }
  .icons {
    display: grid;
    grid-template-columns: repeat(3, auto);
    gap: 0.5rem;
    width: fit-content;
    padding: 1rem;
  }
  @media (min-width: 768px) {
    .icons {
      grid-template-columns: auto;
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
    font-size: 0.75rem;
    font-weight: 600;
  }
</style>
