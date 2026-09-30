<script lang="ts">
  import { onMount } from "svelte";
  import { track } from "$lib/analytics";
  import type { GameStatus } from "./types";

  /**
   * Shared frame for the pixel games: board + side panel layout, the start/pause/game-over
   * overlay, keyboard focus, P to pause, Enter to start, and pausing when focus or the tab is lost.
   * The game owns its state and just reacts to onStart/onPause/onKey.
   */
  export let name: string;
  /** Read by screen readers when the game area is focused. */
  export let instructions: string;
  export let status: GameStatus;
  /** Reported with the game-over analytics event. */
  export let score: number;
  /** Board width / height, e.g. 0.5 for Tetris' 10x20 well. */
  export let boardRatio: number;
  export let overTitle = "GAME OVER";
  export let helpLines: string[] = [];
  export let onStart: () => void;
  export let onPause: () => void;
  /** Game-specific keys; return true when the key was used so the page doesn't scroll. */
  export let onKey: (key: string) => boolean;

  let root: HTMLElement;
  let previousStatus = status;

  $: if (status !== previousStatus) {
    if (status === "over") track("game-over", { game: name, score });
    previousStatus = status;
  }

  $: title = status === "paused" ? "PAUSED" : status === "over" ? overTitle : name.toUpperCase();
  $: buttonLabel = status === "paused" ? "RESUME" : status === "over" ? "PLAY AGAIN" : "START";

  function start() {
    if (status !== "paused") track("game-start", { game: name });
    onStart();
    root.focus();
  }

  function handleKeydown(event: KeyboardEvent) {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    let handled = true;
    if (key === "p" && status === "playing") onPause();
    else if (key === "p" && status === "paused") start();
    else if (key === "Enter" && status !== "playing") start();
    else handled = status === "playing" && onKey(key);
    if (handled) event.preventDefault();
  }

  /** Pause when focus moves to another window or the Dock, so nothing happens unseen. */
  function pauseOnFocusLoss(event: FocusEvent) {
    if (status === "playing" && !root.contains(event.relatedTarget as Node | null)) onPause();
  }

  onMount(() => {
    const pauseWhenHidden = () => {
      if (document.hidden && status === "playing") onPause();
    };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => document.removeEventListener("visibilitychange", pauseWhenHidden);
  });
</script>

<!-- role="application": the game area deliberately takes focus and keyboard input so arrow keys
     drive the game instead of scrolling; every control is also a real button. -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions a11y-no-noninteractive-tabindex -->
<div
  bind:this={root}
  class="game"
  tabindex="0"
  role="application"
  aria-label="{name}. {instructions}"
  on:keydown={handleKeydown}
  on:focusout={pauseOnFocusLoss}
>
  <div class="layout">
    <div class="board" style="--ratio: {boardRatio}">
      <slot />
      {#if status !== "playing"}
        <div class="overlay">
          <p class="title">{title}</p>
          <button type="button" class="pixel-button" on:click={start}>{buttonLabel}</button>
        </div>
      {/if}
    </div>

    <aside class="panel">
      <slot name="panel" />
      {#if helpLines.length}
        <p class="help">
          {#each helpLines as line (line)}{line}<br />{/each}
        </p>
      {/if}
    </aside>

    <div class="touch-controls" aria-label="Touch controls">
      <slot name="controls" />
    </div>
  </div>
</div>

<style>
  .game {
    --panel-width: 5.5rem;
    --gap: 1rem;
    --frame: #3a3f55;
    --muted: #8b90a8;
    /* Lets the board size itself from the window's width as well as its height. */
    container-type: inline-size;
    height: 100%;
    background: #1a1d29;
    color: #e8eaf2;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    outline: none;
  }
  .game:focus-visible {
    box-shadow: inset 0 0 0 2px var(--os-accent);
  }
  .layout {
    display: grid;
    grid-template-columns: auto var(--panel-width);
    grid-template-rows: minmax(0, 1fr) auto;
    gap: var(--gap);
    height: 100%;
    padding: var(--gap);
  }
  .board {
    position: relative;
    align-self: start;
    height: 100%;
    /* Tallest board that still leaves room for the side panel at this aspect ratio. */
    max-height: min(30rem, calc((100cqw - 3 * var(--gap) - var(--panel-width)) / var(--ratio)));
    aspect-ratio: var(--ratio);
    border: 3px solid var(--frame);
  }
  .game :global(canvas) {
    display: block;
    width: 100%;
    height: 100%;
    image-rendering: pixelated;
  }
  .overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    background: rgb(17 19 27 / 0.8);
  }
  .title {
    font-size: 1.125rem;
    font-weight: 800;
    letter-spacing: 0.15em;
    color: var(--os-accent);
  }
  .pixel-button {
    padding: 0.5rem 1rem;
    border: 2px solid #e8eaf2;
    background: var(--os-accent);
    color: #151515;
    font-weight: 800;
    letter-spacing: 0.1em;
    box-shadow: 3px 3px 0 #000;
  }
  .pixel-button:active {
    transform: translate(3px, 3px);
    box-shadow: none;
  }
  .panel {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-width: 0;
  }
  /* Shared look for what games put in the panel slot. */
  .panel :global(.label) {
    margin-bottom: 0.25rem;
    font-size: 0.6875rem;
    letter-spacing: 0.15em;
    color: var(--muted);
  }
  .panel :global(dd) {
    margin-bottom: 0.625rem;
    font-size: 1.125rem;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }
  .panel :global(canvas) {
    width: 4rem;
    height: 4rem;
    border: 2px solid var(--frame);
  }
  .help {
    font-size: 0.625rem;
    line-height: 1.6;
    letter-spacing: 0.05em;
    color: var(--muted);
  }
  .touch-controls {
    display: none;
  }
  /* Phones and tablets: on-screen buttons instead of the keyboard help. */
  @media (hover: none) {
    .help {
      display: none;
    }
    .touch-controls {
      display: block;
      grid-column: 1 / -1;
    }
    .touch-controls :global(button) {
      padding: 0.75rem 0;
      border: 2px solid var(--frame);
      background: #262a3a;
      font-size: 1.25rem;
      touch-action: manipulation;
      user-select: none;
    }
    .touch-controls :global(button:active) {
      background: var(--os-accent);
      color: #151515;
    }
  }
</style>
