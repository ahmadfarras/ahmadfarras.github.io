<script lang="ts">
  import { onMount } from "svelte";
  import { browserStorage } from "$lib/browserStorage";
  import GameShell from "./GameShell.svelte";
  import { loadBestScore, saveBestScore } from "./highScore";
  import { drawBevelCell, drawGrid, startFrameLoop } from "./pixelCanvas";
  import {
    GRID_SIZE,
    advance,
    newGame,
    stepIntervalMs,
    turn,
    type Direction,
    type SnakeState
  } from "./snake";
  import type { GameStatus } from "./types";

  /** Canvas pixels per cell. The canvas is scaled up in CSS without smoothing for the pixel look. */
  const CELL = 8;
  const BOARD_BACKGROUND = "#11131b";
  const GRID_DOT = "#1d2130";
  const HEAD_COLOUR = "#8ef08e";
  const BODY_COLOUR = "#5ad35a";
  const FOOD_COLOUR = "#f25b5b";
  const LEAF_COLOUR = "#5ad35a";
  const EYE_COLOUR = "#11131b";
  const BEST_SCORE_KEY = "snake-best-score";

  const KEY_DIRECTIONS: Record<string, Direction> = {
    ArrowUp: "up",
    w: "up",
    ArrowDown: "down",
    s: "down",
    ArrowLeft: "left",
    a: "left",
    ArrowRight: "right",
    d: "right"
  };

  const storage = browserStorage();

  let game: SnakeState = newGame();
  let status: GameStatus = "ready";
  let best = 0;
  let canvas: HTMLCanvasElement;
  let sinceLastStep = 0;

  $: if (canvas) draw(game);

  function start() {
    if (status === "over" || status === "ready") game = newGame();
    status = "playing";
    sinceLastStep = 0;
  }

  function steer(direction: Direction) {
    if (status === "playing") game = turn(game, direction);
  }

  function handleKey(key: string): boolean {
    if (!(key in KEY_DIRECTIONS)) return false;
    steer(KEY_DIRECTIONS[key]);
    return true;
  }

  function onFrame(deltaMs: number) {
    if (status !== "playing") return;
    sinceLastStep += deltaMs;
    if (sinceLastStep < stepIntervalMs(game.score)) return;
    sinceLastStep = 0;
    game = advance(game);
    if (game.isOver) {
      status = "over";
      best = saveBestScore(storage, BEST_SCORE_KEY, game.score);
    }
  }

  function draw(state: SnakeState) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawGrid(ctx, GRID_SIZE, GRID_SIZE, CELL, BOARD_BACKGROUND, GRID_DOT);

    if (state.food) {
      // A pixel apple: red body with a small green leaf in the top-right corner.
      drawBevelCell(ctx, state.food.x, state.food.y, CELL, FOOD_COLOUR);
      ctx.fillStyle = LEAF_COLOUR;
      ctx.fillRect(state.food.x * CELL + CELL - 3, state.food.y * CELL, 2, 2);
    }

    state.snake.forEach((part, i) =>
      drawBevelCell(ctx, part.x, part.y, CELL, i === 0 ? HEAD_COLOUR : BODY_COLOUR)
    );
    drawEyes(ctx, state);
  }

  /** Two dark pixels on the head, placed on the side it's facing. */
  function drawEyes(ctx: CanvasRenderingContext2D, state: SnakeState) {
    const { x, y } = state.snake[0];
    const left = x * CELL;
    const top = y * CELL;
    const near = 2;
    const far = CELL - 3;
    const eyes: Record<Direction, [number, number][]> = {
      up: [[near, near], [far, near]],
      down: [[near, far], [far, far]],
      left: [[near, near], [near, far]],
      right: [[far, near], [far, far]]
    };
    ctx.fillStyle = EYE_COLOUR;
    for (const [dx, dy] of eyes[state.direction]) ctx.fillRect(left + dx, top + dy, 1, 1);
  }

  onMount(() => {
    best = loadBestScore(storage, BEST_SCORE_KEY);
    return startFrameLoop(onFrame);
  });
</script>

<GameShell
  name="Snake"
  instructions="Arrow keys or WASD steer, P pauses."
  {status}
  boardRatio={1}
  overTitle={game.hasWon ? "YOU WIN!" : "GAME OVER"}
  helpLines={["ARROWS STEER", "WASD STEER", "P PAUSE"]}
  onStart={start}
  onPause={() => (status = "paused")}
  onKey={handleKey}
>
  <canvas bind:this={canvas} width={GRID_SIZE * CELL} height={GRID_SIZE * CELL} />

  <dl slot="panel">
    <dt class="label">SCORE</dt>
    <dd>{game.score}</dd>
    <dt class="label">LENGTH</dt>
    <dd>{game.snake.length}</dd>
    <dt class="label">BEST</dt>
    <dd>{Math.max(best, game.score)}</dd>
  </dl>

  <div slot="controls" class="dpad">
    <button type="button" class="up" aria-label="Up" on:pointerdown|preventDefault={() => steer("up")}>▲</button>
    <button type="button" class="left" aria-label="Left" on:pointerdown|preventDefault={() => steer("left")}>◀</button>
    <button type="button" class="down" aria-label="Down" on:pointerdown|preventDefault={() => steer("down")}>▼</button>
    <button type="button" class="right" aria-label="Right" on:pointerdown|preventDefault={() => steer("right")}>▶</button>
  </div>
</GameShell>

<style>
  /* A cross-shaped D-pad: up on top, left/down/right underneath. */
  .dpad {
    display: grid;
    grid-template-columns: repeat(3, 4rem);
    grid-template-areas:
      ".    up    ."
      "left down right";
    justify-content: center;
    gap: 0.375rem;
  }
  .up {
    grid-area: up;
  }
  .left {
    grid-area: left;
  }
  .down {
    grid-area: down;
  }
  .right {
    grid-area: right;
  }
</style>
