<script lang="ts">
  import { onMount } from "svelte";
  import { browserStorage } from "$lib/browserStorage";
  import GameShell from "./GameShell.svelte";
  import { loadBestScore, saveBestScore } from "./highScore";
  import { drawBevelCell, drawGrid, startFrameLoop } from "./pixelCanvas";
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
    type GameState,
    type Piece
  } from "./tetris";
  import type { GameStatus } from "./types";

  /** Canvas pixels per cell. The canvas is scaled up in CSS without smoothing for the pixel look. */
  const CELL = 8;
  /** Cell colours by cell value (1-based piece index: I, O, T, S, Z, J, L). */
  const COLOURS = ["", "#3fd0f0", "#f7d038", "#a55eea", "#5ad35a", "#f25b5b", "#4a7cf0", "#f7a501"];
  const BOARD_BACKGROUND = "#11131b";
  const GRID_DOT = "#1d2130";
  const PREVIEW_CELLS = 4;
  const BEST_SCORE_KEY = "tetris-best-score";

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

  const nextPiece = createBag();
  const storage = browserStorage();

  let game: GameState = newGame(nextPiece);
  let status: GameStatus = "ready";
  let best = 0;
  let boardCanvas: HTMLCanvasElement;
  let previewCanvas: HTMLCanvasElement;
  let sinceLastDrop = 0;

  $: if (boardCanvas && previewCanvas) draw(game);

  function start() {
    if (status === "over" || status === "ready") game = newGame(nextPiece);
    status = "playing";
    sinceLastDrop = 0;
  }

  function act(action: Action) {
    if (status !== "playing") return;
    game = step(game, action, nextPiece);
    if (action === "softDrop" || action === "hardDrop") sinceLastDrop = 0;
    if (game.isOver) {
      status = "over";
      best = saveBestScore(storage, BEST_SCORE_KEY, game.score);
    }
  }

  function handleKey(key: string): boolean {
    if (!(key in KEY_ACTIONS)) return false;
    act(KEY_ACTIONS[key]);
    return true;
  }

  function onFrame(deltaMs: number) {
    if (status !== "playing") return;
    sinceLastDrop += deltaMs;
    if (sinceLastDrop >= dropIntervalMs(game.level)) {
      sinceLastDrop = 0;
      act("tick");
    }
  }

  function drawPiece(
    ctx: CanvasRenderingContext2D,
    piece: Pick<Piece, "matrix" | "x" | "y">,
    colour: string
  ) {
    piece.matrix.forEach((row, r) =>
      row.forEach((filled, c) => {
        if (filled && piece.y + r >= 0) drawBevelCell(ctx, piece.x + c, piece.y + r, CELL, colour);
      })
    );
  }

  function draw(state: GameState) {
    const board = boardCanvas.getContext("2d");
    const preview = previewCanvas.getContext("2d");
    if (!board || !preview) return;

    drawGrid(board, COLS, ROWS, CELL, BOARD_BACKGROUND, GRID_DOT);
    state.board.forEach((row, y) =>
      row.forEach((cell, x) => cell && drawBevelCell(board, x, y, CELL, COLOURS[cell]))
    );
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
    best = loadBestScore(storage, BEST_SCORE_KEY);
    return startFrameLoop(onFrame);
  });
</script>

<GameShell
  name="Tetris"
  instructions="Arrow keys move and rotate, Space drops, P pauses."
  {status}
  boardRatio={COLS / ROWS}
  helpLines={["←→ MOVE", "↑ ROTATE", "↓ SOFT DROP", "SPACE DROP", "P PAUSE"]}
  onStart={start}
  onPause={() => (status = "paused")}
  onKey={handleKey}
>
  <canvas bind:this={boardCanvas} width={COLS * CELL} height={ROWS * CELL} />

  <svelte:fragment slot="panel">
    <div>
      <p class="label">NEXT</p>
      <canvas
        bind:this={previewCanvas}
        width={PREVIEW_CELLS * CELL}
        height={PREVIEW_CELLS * CELL}
      />
    </div>
    <dl>
      <dt class="label">SCORE</dt>
      <dd>{game.score}</dd>
      <dt class="label">LINES</dt>
      <dd>{game.lines}</dd>
      <dt class="label">LEVEL</dt>
      <dd>{game.level}</dd>
      <dt class="label">BEST</dt>
      <dd>{Math.max(best, game.score)}</dd>
    </dl>
  </svelte:fragment>

  <div slot="controls" class="controls">
    <button type="button" aria-label="Move left" on:pointerdown|preventDefault={() => act("left")}>◀</button>
    <button type="button" aria-label="Rotate" on:pointerdown|preventDefault={() => act("rotate")}>⟳</button>
    <button type="button" aria-label="Move right" on:pointerdown|preventDefault={() => act("right")}>▶</button>
    <button type="button" aria-label="Soft drop" on:pointerdown|preventDefault={() => act("softDrop")}>▼</button>
    <button type="button" aria-label="Hard drop" on:pointerdown|preventDefault={() => act("hardDrop")}>⤓</button>
  </div>
</GameShell>

<style>
  .controls {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.5rem;
  }
</style>
