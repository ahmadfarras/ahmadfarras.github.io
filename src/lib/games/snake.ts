/** Snake rules, kept free of DOM and timers so they can be unit tested. */

export const GRID_SIZE = 16;
const START_LENGTH = 3;
const MAX_QUEUED_TURNS = 2;
export const FOOD_POINTS = 10;
const BASE_STEP_MS = 150;
const MIN_STEP_MS = 60;
const SPEED_UP_PER_FOOD_MS = 4;

export interface Point {
  x: number;
  y: number;
}

export type Direction = "up" | "down" | "left" | "right";

export interface SnakeState {
  /** Head first. */
  snake: Point[];
  direction: Direction;
  /** Turns pressed since the last step, so quick double-taps (e.g. up then left) both count. */
  queuedTurns: Direction[];
  food: Point | null;
  score: number;
  isOver: boolean;
  /** The snake filled the whole board. */
  hasWon: boolean;
}

const VECTORS: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

const OPPOSITE: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left"
};

export const samePoint = (a: Point, b: Point): boolean => a.x === b.x && a.y === b.y;

export const isInside = ({ x, y }: Point): boolean =>
  x >= 0 && y >= 0 && x < GRID_SIZE && y < GRID_SIZE;

/** A random empty cell, or null when the snake covers the whole board. */
export function placeFood(snake: Point[], random: () => number): Point | null {
  const occupied = new Set(snake.map(({ x, y }) => y * GRID_SIZE + x));
  const free: Point[] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (!occupied.has(y * GRID_SIZE + x)) free.push({ x, y });
    }
  }
  return free.length ? free[Math.floor(random() * free.length)] : null;
}

export function newGame(random: () => number = Math.random): SnakeState {
  const middle = Math.floor(GRID_SIZE / 2);
  const snake = Array.from({ length: START_LENGTH }, (_, i) => ({ x: middle - i, y: middle }));
  return {
    snake,
    direction: "right",
    queuedTurns: [],
    food: placeFood(snake, random),
    score: 0,
    isOver: false,
    hasWon: false
  };
}

/** Queues a turn; reversing into the snake's own neck or repeating a direction is ignored. */
export function turn(state: SnakeState, direction: Direction): SnakeState {
  if (state.isOver || state.queuedTurns.length >= MAX_QUEUED_TURNS) return state;
  const heading = state.queuedTurns.at(-1) ?? state.direction;
  if (direction === heading || direction === OPPOSITE[heading]) return state;
  return { ...state, queuedTurns: [...state.queuedTurns, direction] };
}

/** Moves the snake one cell: eat and grow, or crash into a wall or itself. */
export function advance(state: SnakeState, random: () => number = Math.random): SnakeState {
  if (state.isOver) return state;

  const [direction = state.direction, ...queuedTurns] = state.queuedTurns;
  const head = state.snake[0];
  const vector = VECTORS[direction];
  const nextHead = { x: head.x + vector.x, y: head.y + vector.y };
  const eats = state.food !== null && samePoint(nextHead, state.food);
  // Unless it eats, the tail moves out of the way this step, so the head may take its cell.
  const body = eats ? state.snake : state.snake.slice(0, -1);

  if (!isInside(nextHead) || body.some((part) => samePoint(part, nextHead))) {
    return { ...state, direction, queuedTurns: [], isOver: true };
  }

  const snake = [nextHead, ...body];
  const food = eats ? placeFood(snake, random) : state.food;
  return {
    snake,
    direction,
    queuedTurns,
    food,
    score: state.score + (eats ? FOOD_POINTS : 0),
    isOver: food === null,
    hasWon: food === null
  };
}

/** Milliseconds between steps: a little faster for every piece of food eaten. */
export const stepIntervalMs = (score: number): number =>
  Math.max(MIN_STEP_MS, BASE_STEP_MS - (score / FOOD_POINTS) * SPEED_UP_PER_FOOD_MS);
