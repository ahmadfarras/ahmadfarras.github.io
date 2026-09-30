<script lang="ts">
  import { onMount } from "svelte";
  import { scale } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { ImageSolid } from "flowbite-svelte-icons";
  import { fitInside, type Point, type Size } from "./windowManager";

  /** Where the pointer was, relative to the desktop. */
  export let at: Point;
  export let desktopSize: Size;
  export let onChangeWallpaper: () => void;
  export let onClose: () => void;

  let menu: HTMLElement;
  let size: Size = { width: 0, height: 0 };

  $: position = fitInside(at, size, desktopSize);

  const prefersReducedMotion =
    typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  onMount(() => {
    size = { width: menu.offsetWidth, height: menu.offsetHeight };
    menu.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  });

  function closeOnOutsidePointer(event: PointerEvent) {
    if (!menu.contains(event.target as Node)) onClose();
  }

  function choose(action: () => void) {
    onClose();
    action();
  }
</script>

<svelte:window
  on:pointerdown|capture={closeOnOutsidePointer}
  on:keydown={(event) => event.key === "Escape" && onClose()}
  on:resize={onClose}
  on:blur={onClose}
/>

<div
  bind:this={menu}
  class="menu"
  role="menu"
  aria-label="Desktop"
  style="left: {position.x}px; top: {position.y}px;"
  transition:scale={{ start: 0.95, duration: prefersReducedMotion ? 0 : 120, easing: cubicOut }}
>
  <button type="button" role="menuitem" class="item" on:click={() => choose(onChangeWallpaper)}>
    <ImageSolid size="sm" />
    Change wallpaper…
  </button>
</div>

<style>
  .menu {
    position: absolute;
    /* Above every window, whose z-index keeps growing as they get focused. */
    z-index: 2147483647;
    min-width: 12rem;
    padding: 0.25rem;
    border: 1px solid var(--os-border-strong);
    border-radius: 0.5rem;
    background: var(--os-window);
    box-shadow: 0 12px 32px rgb(0 0 0 / 0.25);
    transform-origin: top left;
  }
  .item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.5rem 0.75rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    text-align: left;
  }
  .item:hover,
  .item:focus-visible {
    background: var(--os-accent);
    color: #151515;
    outline: none;
  }
</style>
