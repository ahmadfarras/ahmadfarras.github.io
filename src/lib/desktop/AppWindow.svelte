<script lang="ts">
  import { scale } from "svelte/transition";
  import { backOut, cubicIn } from "svelte/easing";
  import { CloseOutline, ExpandOutline, MinusOutline } from "flowbite-svelte-icons";
  import {
    clampPosition,
    displayRect,
    minimizeTransform,
    type DesktopStore,
    type Point,
    type Size,
    type WindowState
  } from "./windowManager";

  export let win: WindowState;
  export let title: string;
  export let desktop: DesktopStore;
  export let desktopSize: Size;
  export let isActive: boolean;
  export let isCompact: boolean;
  /** Dock icon this window minimizes into. */
  export let dockIconId: string;

  type Gesture = { kind: "move" | "resize"; pointerX: number; pointerY: number; origin: WindowState };
  let gesture: Gesture | null = null;

  const prefersReducedMotion =
    typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const openTransition = { start: 0.85, duration: prefersReducedMotion ? 0 : 260, easing: backOut };
  const closeTransition = { start: 0.9, duration: prefersReducedMotion ? 0 : 150, easing: cubicIn };

  let element: HTMLElement;

  $: isFullSize = isCompact || win.isMaximized;
  $: rect = displayRect(win, isFullSize, desktopSize);
  $: transform = win.isMinimized ? `transform: ${minimizeTransform(rect, dockTarget())};` : "";
  $: style = `left: ${rect.x}px; top: ${rect.y}px; width: ${rect.width}px; height: ${rect.height}px; z-index: ${win.z}; ${transform}`;

  /** Centre of this window's Dock icon, relative to the desktop; bottom centre as a fallback. */
  function dockTarget(): Point {
    const fallback = { x: desktopSize.width / 2, y: desktopSize.height };
    const button = document.querySelector(`[data-task-id="${dockIconId}"]`);
    const parent = element?.offsetParent;
    if (!button || !parent) return fallback;
    const buttonRect = button.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    return {
      x: buttonRect.left + buttonRect.width / 2 - parentRect.left,
      y: buttonRect.top + buttonRect.height / 2 - parentRect.top
    };
  }

  function startGesture(event: PointerEvent, kind: Gesture["kind"]) {
    if (isFullSize || event.button !== 0) return;
    if (kind === "move" && (event.target as HTMLElement).closest("button")) return;
    // Stops the browser from starting a text selection while the pointer sweeps over other windows.
    event.preventDefault();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    gesture = { kind, pointerX: event.clientX, pointerY: event.clientY, origin: win };
  }

  function continueGesture(event: PointerEvent) {
    if (!gesture) return;
    const dx = event.clientX - gesture.pointerX;
    const dy = event.clientY - gesture.pointerY;
    const { origin } = gesture;
    if (gesture.kind === "resize") {
      desktop.resize(win.id, origin.width + dx, origin.height + dy);
      return;
    }
    const { x, y } = clampPosition(origin.x + dx, origin.y + dy, origin.width, desktopSize);
    desktop.move(win.id, x, y);
  }

  function endGesture() {
    gesture = null;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") desktop.close(win.id);
  }
</script>

<!-- Focus-on-click and Escape-to-close mirror native window behaviour; every control inside stays keyboard reachable. -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<section
  role="dialog"
  aria-label={title}
  tabindex="-1"
  class="window"
  class:active={isActive}
  class:full-size={isFullSize}
  class:dragging={gesture !== null}
  class:minimized={win.isMinimized}
  aria-hidden={win.isMinimized}
  inert={win.isMinimized}
  bind:this={element}
  {style}
  on:pointerdown={() => desktop.focus(win.id)}
  on:keydown={handleKeydown}
  in:scale={openTransition}
  out:scale={closeTransition}
>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <header
    class="title-bar"
    on:pointerdown={(event) => startGesture(event, "move")}
    on:pointermove={continueGesture}
    on:pointerup={endGesture}
    on:pointercancel={endGesture}
    on:dblclick={() => !isCompact && desktop.toggleMaximize(win.id)}
  >
    <h2 class="truncate text-sm font-bold">{title}</h2>
    <div class="flex items-center gap-1">
      <button type="button" class="control" aria-label="Minimize {title}" on:click={() => desktop.minimize(win.id)}>
        <MinusOutline size="sm" />
      </button>
      {#if !isCompact}
        <button
          type="button"
          class="control"
          aria-label="{win.isMaximized ? 'Restore' : 'Maximize'} {title}"
          on:click={() => desktop.toggleMaximize(win.id)}
        >
          <ExpandOutline size="sm" />
        </button>
      {/if}
      <button type="button" class="control close" aria-label="Close {title}" on:click={() => desktop.close(win.id)}>
        <CloseOutline size="sm" />
      </button>
    </div>
  </header>

  <div class="content">
    <slot />
  </div>

  {#if !isFullSize}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="resize-handle"
      aria-hidden="true"
      on:pointerdown={(event) => startGesture(event, "resize")}
      on:pointermove={continueGesture}
      on:pointerup={endGesture}
      on:pointercancel={endGesture}
    />
  {/if}
</section>

<style>
  .window {
    position: absolute;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid var(--os-border);
    border-radius: 0.5rem;
    background: var(--os-window);
    box-shadow: 0 8px 24px rgb(0 0 0 / 0.12);
    outline: none;
    transition:
      left var(--os-motion),
      top var(--os-motion),
      width var(--os-motion),
      height var(--os-motion),
      border-radius var(--os-motion),
      transform var(--os-motion),
      opacity 160ms ease-out,
      visibility 0s;
  }
  .window.minimized {
    opacity: 0;
    pointer-events: none;
    visibility: hidden;
    /* Fade late so the shrink stays visible; hide only after it ends so it can't be tabbed into. */
    transition:
      left var(--os-motion),
      top var(--os-motion),
      width var(--os-motion),
      height var(--os-motion),
      transform var(--os-motion),
      opacity var(--os-motion-duration) cubic-bezier(0.7, 0, 1, 1),
      visibility 0s var(--os-motion-duration);
  }
  /* Direct manipulation must follow the pointer 1:1. */
  .window.dragging {
    transition: none;
  }
  .window.active {
    border-color: var(--os-border-strong);
    box-shadow: 0 16px 40px rgb(0 0 0 / 0.22);
  }
  .window.full-size {
    border: 0;
    border-radius: 0;
  }
  .window.dragging {
    user-select: none;
  }
  @media (prefers-reduced-motion: reduce) {
    .window {
      transition: none;
    }
  }
  .title-bar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    height: 2.5rem;
    padding: 0 0.5rem 0 0.75rem;
    border-bottom: 1px solid var(--os-border);
    background: var(--os-chrome);
    cursor: grab;
    touch-action: none;
  }
  .window:not(.active) .title-bar {
    color: var(--os-muted);
  }
  .window.full-size .title-bar {
    cursor: default;
  }
  .window.dragging .title-bar {
    cursor: grabbing;
  }
  .control {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 0.25rem;
    color: var(--os-muted);
  }
  .control:hover {
    background: var(--os-hover);
    color: var(--os-text);
  }
  .control.close:hover {
    background: var(--os-accent);
    color: #151515;
  }
  .control:focus-visible {
    outline: 2px solid var(--os-accent);
  }
  .content {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }
  .resize-handle {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 1rem;
    height: 1rem;
    cursor: nwse-resize;
    touch-action: none;
    background: linear-gradient(135deg, transparent 50%, var(--os-border-strong) 50%);
  }
</style>
