import { describe, expect, it } from "vitest";
import {
  FOOD_POINTS,
  GRID_SIZE,
  advance,
  isInside,
  newGame,
  placeFood,
  samePoint,
  stepIntervalMs,
  turn,
  type Point,
  type SnakeState
} from "./snake";

const first = () => 0;

/** A game with an explicit snake and food, heading right. */
const game = (snake: Point[], food: Point | null = { x: 0, y: 0 }): SnakeState => ({
  ...newGame(first),
  snake,
  food
});

describe("samePoint / isInside", () => {
  it("compares coordinates", () => {
    expect(samePoint({ x: 1, y: 2 }, { x: 1, y: 2 })).toBe(true);
    expect(samePoint({ x: 1, y: 2 }, { x: 2, y: 1 })).toBe(false);
  });

  it.each([
    { point: { x: 0, y: 0 }, want: true },
    { point: { x: GRID_SIZE - 1, y: GRID_SIZE - 1 }, want: true },
    { point: { x: -1, y: 0 }, want: false },
    { point: { x: 0, y: GRID_SIZE }, want: false }
  ])("$point.x,$point.y inside: $want", ({ point, want }) => {
    expect(isInside(point)).toBe(want);
  });
});

describe("placeFood", () => {
  it("never lands on the snake", () => {
    const snake = [
      { x: 0, y: 0 },
      { x: 1, y: 0 }
    ];
    expect(placeFood(snake, first)).toEqual({ x: 2, y: 0 });
  });

  it("picks from the free cells using the random value", () => {
    const food = placeFood([], () => 0.999);
    expect(food).toEqual({ x: GRID_SIZE - 1, y: GRID_SIZE - 1 });
  });

  it("returns null when the board is full", () => {
    const full = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => ({
      x: i % GRID_SIZE,
      y: Math.floor(i / GRID_SIZE)
    }));
    expect(placeFood(full, first)).toBeNull();
  });
});

describe("newGame", () => {
  it("starts with a 3-long snake in the middle heading right, and food off the snake", () => {
    const state = newGame(first);
    expect(state.snake).toHaveLength(3);
    expect(state.snake[0]).toEqual({ x: GRID_SIZE / 2, y: GRID_SIZE / 2 });
    expect(state.direction).toBe("right");
    expect(state).toMatchObject({ score: 0, isOver: false, hasWon: false, queuedTurns: [] });
    expect(state.snake.some((p) => samePoint(p, state.food!))).toBe(false);
  });
});

describe("turn", () => {
  it("queues a perpendicular turn", () => {
    expect(turn(newGame(first), "up").queuedTurns).toEqual(["up"]);
  });

  it.each(["right", "left"] as const)("ignores %s while heading right", (direction) => {
    const state = newGame(first);
    expect(turn(state, direction)).toBe(state);
  });

  it("checks against the last queued turn, allowing quick double turns", () => {
    const upThenLeft = turn(turn(newGame(first), "up"), "left");
    expect(upThenLeft.queuedTurns).toEqual(["up", "left"]);
    const upThenDown = turn(turn(newGame(first), "up"), "down");
    expect(upThenDown.queuedTurns).toEqual(["up"]);
  });

  it("caps the queue and ignores input after game over", () => {
    const full = turn(turn(newGame(first), "up"), "left");
    expect(turn(full, "down")).toBe(full);
    const over = { ...newGame(first), isOver: true };
    expect(turn(over, "up")).toBe(over);
  });
});

describe("advance", () => {
  const start = [
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 }
  ];

  it("moves forward, keeping its length", () => {
    const next = advance(game(start));
    expect(next.snake).toEqual([
      { x: 6, y: 5 },
      { x: 5, y: 5 },
      { x: 4, y: 5 }
    ]);
    expect(next.score).toBe(0);
  });

  it("uses one queued turn per step", () => {
    const next = advance(turn(turn(game(start), "up"), "left"));
    expect(next.snake[0]).toEqual({ x: 5, y: 4 });
    expect(next.direction).toBe("up");
    expect(next.queuedTurns).toEqual(["left"]);
  });

  it("eats, grows, scores and places new food", () => {
    const next = advance(game(start, { x: 6, y: 5 }), first);
    expect(next.snake).toHaveLength(4);
    expect(next.score).toBe(FOOD_POINTS);
    expect(next.food).not.toBeNull();
    expect(next.snake.some((p) => samePoint(p, next.food!))).toBe(false);
  });

  it("crashes into a wall", () => {
    const atEdge = game([
      { x: GRID_SIZE - 1, y: 0 },
      { x: GRID_SIZE - 2, y: 0 }
    ]);
    const next = advance(atEdge);
    expect(next.isOver).toBe(true);
    expect(next.hasWon).toBe(false);
    expect(next.snake).toEqual(atEdge.snake);
  });

  it("crashes into its own body", () => {
    // A tight loop: heading up from (1,2) runs into (1,1).
    const loop = [
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 2, y: 1 },
      { x: 1, y: 1 },
      { x: 0, y: 1 }
    ];
    expect(advance({ ...game(loop), direction: "up" }).isOver).toBe(true);
  });

  it("may move into the cell the tail is leaving", () => {
    const square = [
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 2, y: 1 },
      { x: 1, y: 1 }
    ];
    const next = advance({ ...game(square), direction: "up" });
    expect(next.isOver).toBe(false);
    expect(next.snake[0]).toEqual({ x: 1, y: 1 });
  });

  it("wins when the snake fills the board", () => {
    // Every cell but (0,0) is snake; the head at (1,0) eats the last free cell.
    const cells: Point[] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      const row = Array.from({ length: GRID_SIZE }, (_, i) => ({
        x: y % 2 === 0 ? i : GRID_SIZE - 1 - i,
        y
      }));
      cells.push(...row);
    }
    const snake = cells.filter((p) => !samePoint(p, { x: 0, y: 0 }));
    const nearlyFull: SnakeState = { ...game(snake, { x: 0, y: 0 }), direction: "left" };
    expect(snake[0]).toEqual({ x: 1, y: 0 });
    const next = advance(nearlyFull);
    expect(next).toMatchObject({ isOver: true, hasWon: true, food: null });
  });

  it("does nothing once the game is over", () => {
    const over = { ...game(start), isOver: true };
    expect(advance(over)).toBe(over);
  });
});

describe("stepIntervalMs", () => {
  it("speeds up with each food and has a floor", () => {
    expect(stepIntervalMs(0)).toBe(150);
    expect(stepIntervalMs(FOOD_POINTS)).toBeLessThan(stepIntervalMs(0));
    expect(stepIntervalMs(FOOD_POINTS * 1000)).toBe(60);
  });
});
