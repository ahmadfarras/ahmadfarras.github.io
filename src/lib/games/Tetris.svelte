<script lang="ts">
  import { onMount } from "svelte";
  import { browserStorage } from "$lib/browserStorage";
  import { loadBestScore, saveBestScore } from "./highScore";
  import {
    COLS,
    ROWS,
    SHAPES,
    cellValue,
    createBag,
    dropIntervalMs,
    dropY,
    newGame,
    step,
    type Action,
    type Board,
    type GameState,
    type Piece
  } from "./tetris";

  /** Canvas pixels per cell. The canvas is scaled up in CSS without smoothing for the pixel look. */
  const CELL = 8;
  /** Cell colours by cell value (1-based piece index: I, O, T, S, Z, J, L). */
  const COLOURS = ["", "#3fd0f0", "#f7d038", "#a55eea", "#5ad35a", "#f25b5b", "#4a7cf0", "#f7a501"];
  const BOARD_BACKGROUND = "#11131b";
  const GRID_DOT = "#1d2130";
  const PREVIEW_CELLS = 4;

  const KEY_ACTIONS: Record<string, Action> = {
    ArrowLeft: "left",
    a: "left",
    ArrowRight: "right",
    d: "right",
    ArrowUp: "rotate",
    w: "rotate",
    x: "rotate",
    ArrowDown: "softDrop",
    s: "softDrop",
    " ": "hardDrop"
  };

  type Status = "ready" | "playing" | "paused" | "over";

  const nextPiece = createBag();
  const storage = browserStorage();

  let game: GameState = newGame(nextPiece);
  let status: Status = "ready";
  let best = 0;
  let root: HTMLElement;
  let boardCanvas: HTMLCanvasElement;
  let previewCanvas: HTMLCanvasElement;
  let sinceLastDrop = 0;
  let lastFrame = 0;

  $: if (boardCanvas && previewCanvas) draw(game);

  function start() {
    if (status === "over" || status === "ready") game = newGame(nextPiece);
    status = "playing";
    sinceLastDrop = 0;
    root.focus();
  }

  function togglePause() {
    if (status === "playing") status = "paused";
    else if (status === "paused") start();
  }

  function act(action: Action) {
    if (status !== "playing") return;
    game = step(game, action, nextPiece);
    if (action === "softDrop" || action === "hardDrop") sinceLastDrop = 0;
    if (game.isOver) {
      status = "over";
      best = saveBestScore(storage, game.score);
    }
  }

  function frame(time: number) {
    const delta = lastFrame ? time - lastFrame : 0;
    lastFrame = time;
    if (status === "playing") {
      sinceLastDrop += delta;
      if (sinceLastDrop >= dropIntervalMs(game.level)) {
        sinceLastDrop = 0;
        act("tick");
      }
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (key === "p") {
      togglePause();
    } else if (key === "Enter" && status !== "playing") {
      start();
    } else if (key in KEY_ACTIONS) {
      act(KEY_ACTIONS[key]);
    } else {
      return;
    }
    // Arrow keys and Space would otherwise scroll the window content.
    event.preventDefault();
  }

  /** Pause when focus moves to another window or the Dock, so pieces don't fall unseen. */
  function pauseOnFocusLoss(event: FocusEvent) {
    if (status === "playing" && !root.contains(event.relatedTarget as Node | null)) {
      status = "paused";
    }
  }

  function drawCell(ctx: CanvasRenderingContext2D, x: number, y: number, colour: string) {
    const px = x * CELL;
    const py = y * CELL;
    ctx.fillStyle = colour;
    ctx.fillRect(px, py, CELL, CELL);
    // One-pixel bevel: light top/left edge, dark bottom/right edge.
    ctx.fillStyle = "rgb(255 255 255 / 0.35)";
    ctx.fillRect(px, py, CELL, 1);
    ctx.fillRect(px, py, 1, CELL);
    ctx.fillStyle = "rgb(0 0 0 / 0.35)";
    ctx.fillRect(px, py + CELL - 1, CELL, 1);
    ctx.fillRect(px + CELL - 1, py, 1, CELL);
  }

  function drawPiece(
    ctx: CanvasRenderingContext2D,
    piece: Pick<Piece, "matrix" | "x" | "y">,
    colour: string
  ) {
    piece.matrix.forEach((row, r) =>
      row.forEach((filled, c) => {
        if (filled && piece.y + r >= 0) drawCell(ctx, piece.x + c, piece.y + r, colour);
      })
    );
  }

  function drawBoard(ctx: CanvasRenderingContext2D, board: Board) {
    ctx.fillStyle = BOARD_BACKGROUND;
    ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);
    board.forEach((row, y) =>
      row.forEach((cell, x) => {
        if (cell) drawCell(ctx, x, y, COLOURS[cell]);
        else {
          ctx.fillStyle = GRID_DOT;
          ctx.fillRect(x * CELL + CELL / 2, y * CELL + CELL / 2, 1, 1);
        }
      })
    );
  }

  function draw(state: GameState) {
    const board = boardCanvas.getContext("2d");
    const preview = previewCanvas.getContext("2d");
    if (!board || !preview) return;

    drawBoard(board, state.board);
    if (!state.isOver) {
      const colour = COLOURS[cellValue(state.piece.type)];
      board.globalAlpha = 0.25;
      drawPiece(board, { ...state.piece, y: dropY(state.board, state.piece) }, colour);
      board.globalAlpha = 1;
      drawPiece(board, state.piece, colour);
    }

    preview.fillStyle = BOARD_BACKGROUND;
    preview.fillRect(0, 0, PREVIEW_CELLS * CELL, PREVIEW_CELLS * CELL);
    const matrix = SHAPES[state.next];
    const offset = Math.floor((PREVIEW_CELLS - matrix.length) / 2);
    drawPiece(preview, { matrix, x: offset, y: offset }, COLOURS[cellValue(state.next)]);
  }

  onMount(() => {
    best = loadBestScore(storage);
    let handle = requestAnimationFrame(function loop(time) {
      frame(time);
      handle = requestAnimationFrame(loop);
    });
    const pauseWhenHidden = () => document.hidden && status === "playing" && (status = "paused");
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => {
      cancelAnimationFrame(handle);
      document.removeEventListener("visibilitychange", pauseWhenHidden);
    };
  });
</script>

<!-- role="application": the game area deliberately takes focus and keyboard input so arrow keys
     drive the game instead of scrolling; every control is also a real button. -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions a11y-no-noninteractive-tabindex -->
<div
  bind:this={root}
  class="tetris"
  tabindex="0"
  role="application"
  aria-label="Tetris. Arrow keys move and rotate, Space drops, P pauses."
  on:keydown={handleKeydown}
  on:focusout={pauseOnFocusLoss}
>
  <div class="layout">
    <div class="board">
      <canvas bind:this={boardCanvas} width={COLS * CELL} height={ROWS * CELL} />
      {#if status !== "playing"}
        <div class="overlay">
          <p class="title">
            {status === "paused" ? "PAUSED" : status === "over" ? "GAME OVER" : "TETRIS"}
          </p>
          <button type="button" class="pixel-button" on:click={start}>
            {status === "paused" ? "RESUME" : status === "over" ? "PLAY AGAIN" : "START"}
          </button>
        </div>
      {/if}
    </div>

    <aside class="panel">
      <div>
        <p class="label">NEXT</p>
        <canvas
          class="preview"
          bind:this={previewCanvas}
          width={PREVIEW_CELLS * CELL}
          height={PREVIEW_CELLS * CELL}
        />
      </div>
      <dl class="stats">
        <dt class="label">SCORE</dt>
        <dd>{game.score}</dd>
        <dt class="label">LINES</dt>
        <dd>{game.lines}</dd>
        <dt class="label">LEVEL</dt>
        <dd>{game.level}</dd>
        <dt class="label">BEST</dt>
        <dd>{Math.max(best, game.score)}</dd>
      </dl>
      <p class="help">
        ←→ MOVE<br />↑ ROTATE<br />↓ SOFT DROP<br />SPACE DROP<br />P PAUSE
      </p>
    </aside>

    <div class="touch-controls" aria-label="Touch controls">
      <button type="button" aria-label="Move left" on:pointerdown|preventDefault={() => act("left")}>◀</button>
      <button type="button" aria-label="Rotate" on:pointerdown|preventDefault={() => act("rotate")}>⟳</button>
      <button type="button" aria-label="Move right" on:pointerdown|preventDefault={() => act("right")}>▶</button>
      <button type="button" aria-label="Soft drop" on:pointerdown|preventDefault={() => act("softDrop")}>▼</button>
      <button type="button" aria-label="Hard drop" on:pointerdown|preventDefault={() => act("hardDrop")}>⤓</button>
    </div>
  </div>
</div>

<style>
  .tetris {
    --panel-width: 5.5rem;
    --gap: 1rem;
    /* Lets the board size itself from the window's width as well as its height. */
    container-type: inline-size;
    height: 100%;
    background: #1a1d29;
    color: #e8eaf2;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    outline: none;
  }
  .tetris:focus-visible {
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
    /* Tallest board that still leaves room for the side panel: width is half the height. */
    max-height: min(30rem, calc((100cqw - 3 * var(--gap) - var(--panel-width)) * 2));
    aspect-ratio: 1 / 2;
    border: 3px solid #3a3f55;
  }
  canvas {
    display: block;
    width: 100%;
    height: 100%;
    image-rendering: pixelated;
  }
  .preview {
    width: 4rem;
    height: 4rem;
    border: 2px solid #3a3f55;
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
  .label {
    margin-bottom: 0.25rem;
    font-size: 0.6875rem;
    letter-spacing: 0.15em;
    color: #8b90a8;
  }
  .stats dd {
    margin-bottom: 0.625rem;
    font-size: 1.125rem;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }
  .help {
    font-size: 0.625rem;
    line-height: 1.6;
    letter-spacing: 0.05em;
    color: #8b90a8;
  }
  .touch-controls {
    display: none;
  }
  /* Phones and tablets: show on-screen buttons instead of the keyboard help. */
  @media (hover: none) {
    .help {
      display: none;
    }
    .touch-controls {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 0.5rem;
    }
    .touch-controls button {
      padding: 0.75rem 0;
      border: 2px solid #3a3f55;
      background: #262a3a;
      font-size: 1.25rem;
      touch-action: manipulation;
      user-select: none;
    }
    .touch-controls button:active {
      background: var(--os-accent);
      color: #151515;
    }
  }
</style>
