<script lang="ts">
  import { scale } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { CloseOutline, ExpandOutline, MinusOutline } from "flowbite-svelte-icons";
  import { clampPosition, type DesktopStore, type Size, type WindowState } from "./windowManager";

  export let win: WindowState;
  export let title: string;
  export let desktop: DesktopStore;
  export let desktopSize: Size;
  export let isActive: boolean;
  export let isCompact: boolean;

  type Gesture = { kind: "move" | "resize"; pointerX: number; pointerY: number; origin: WindowState };
  let gesture: Gesture | null = null;

  $: isFullSize = isCompact || win.isMaximized;
  $: position = isFullSize
    ? `inset: 0; z-index: ${win.z};`
    : `left: ${win.x}px; top: ${win.y}px; width: ${win.width}px; height: ${win.height}px; z-index: ${win.z};`;

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
  style={position}
  on:pointerdown={() => desktop.focus(win.id)}
  on:keydown={handleKeydown}
  transition:scale={{ start: 0.94, duration: 180, easing: quintOut }}
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
