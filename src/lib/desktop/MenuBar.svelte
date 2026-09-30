<script lang="ts">
  import { base } from "$app/paths";
  import { DarkMode } from "flowbite-svelte";
  import ViewSwitch from "$lib/components/ViewSwitch.svelte";
  import BatteryIndicator from "./BatteryIndicator.svelte";
  import Clock from "./Clock.svelte";
  import WifiIndicator from "./WifiIndicator.svelte";

  /** Title of the focused window, shown next to the logo like the app name on macOS. */
  export let activeTitle: string | null;
</script>

<header class="menu-bar">
  <a href="{base}/" class="brand">Farras OS</a>
  <span class="min-w-0 flex-1 truncate font-bold">{activeTitle ?? ""}</span>

  <div class="status">
    <ViewSwitch to="classic" compact />
    <DarkMode btnClass="rounded p-1 hover:bg-black/10 dark:hover:bg-white/10" />
    <WifiIndicator />
    <BatteryIndicator />
    <Clock />
  </div>
</header>

<style>
  .menu-bar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 0.75rem;
    height: 2.5rem;
    padding: 0 0.5rem;
    border-bottom: 1px solid var(--os-border);
    background: var(--os-chrome);
    font-size: 0.8125rem;
  }
  .brand {
    flex-shrink: 0;
    padding: 0.125rem 0.625rem;
    border: 2px solid var(--os-ink);
    border-radius: 0.375rem;
    background: var(--os-accent);
    color: #151515;
    font-size: 0.8125rem;
    font-weight: 800;
  }
  .status {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 0.75rem;
  }
</style>
