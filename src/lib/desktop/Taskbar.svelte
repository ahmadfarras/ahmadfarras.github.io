<script lang="ts">
  import { onMount } from "svelte";
  import { base } from "$app/paths";
  import { DarkMode } from "flowbite-svelte";
  import ViewSwitch from "$lib/components/ViewSwitch.svelte";
  import { windowAppsById } from "./apps";
  import type { DesktopStore, WindowState } from "./windowManager";

  export let windows: WindowState[];
  export let activeId: string | null;
  export let desktop: DesktopStore;

  const CLOCK_TICK_MS = 30_000;
  let now = new Date();

  onMount(() => {
    const timer = setInterval(() => (now = new Date()), CLOCK_TICK_MS);
    return () => clearInterval(timer);
  });

  $: time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
</script>

<nav class="taskbar" aria-label="Taskbar">
  <a href="{base}/" class="brand">Farras OS</a>

  <ul class="flex min-w-0 flex-1 gap-1 overflow-x-auto">
    {#each windows as win (win.id)}
      {@const app = windowAppsById.get(win.id)}
      {#if app}
        <li>
          <button
            type="button"
            class="task"
            class:active={win.id === activeId}
            class:minimized={win.isMinimized}
            aria-pressed={win.id === activeId}
            data-task-id={win.id}
            on:click={() => desktop.toggleFromTaskbar(win.id)}
          >
            <svelte:component this={app.icon} size="sm" />
            <span class="hidden sm:inline">{app.title}</span>
          </button>
        </li>
      {/if}
    {/each}
  </ul>

  <ViewSwitch to="classic" compact />
  <DarkMode btnClass="rounded p-1.5 hover:bg-black/10 dark:hover:bg-white/10" />
  <time class="clock">{time}</time>
</nav>

<style>
  .taskbar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 0.5rem;
    height: 3rem;
    padding: 0 0.5rem;
    border-top: 1px solid var(--os-border);
    background: var(--os-chrome);
  }
  .brand {
    flex-shrink: 0;
    padding: 0.25rem 0.75rem;
    border: 2px solid var(--os-ink);
    border-radius: 0.375rem;
    background: var(--os-accent);
    color: #151515;
    font-size: 0.875rem;
    font-weight: 800;
  }
  .task {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    white-space: nowrap;
  }
  .task:hover {
    background: var(--os-hover);
  }
  .task.active {
    background: var(--os-window);
    font-weight: 600;
    box-shadow: 0 1px 2px rgb(0 0 0 / 0.15);
  }
  .task.minimized {
    opacity: 0.6;
  }
  .clock {
    font-size: 0.875rem;
    font-variant-numeric: tabular-nums;
  }
</style>
