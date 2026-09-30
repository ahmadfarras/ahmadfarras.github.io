/** Tetris rules, kept free of DOM and timers so they can be unit tested. */

export const COLS = 10;
export const ROWS = 20;

export const PIECE_TYPES = ["I", "O", "T", "S", "Z", "J", "L"] as const;
export type PieceType = (typeof PIECE_TYPES)[number];

/** 0 is empty; otherwise the 1-based index of the piece type that filled the cell. */
export type Cell = number;
export type Board = Cell[][];
export type Matrix = number[][];

export interface Piece {
  type: PieceType;
  matrix: Matrix;
  x: number;
  y: number;
}

export interface GameState {
  board: Board;
  piece: Piece;
  next: PieceType;
  score: number;
  lines: number;
  level: number;
  isOver: boolean;
}

export type Action = "left" | "right" | "rotate" | "softDrop" | "hardDrop" | "tick";

export const SHAPES: Record<PieceType, Matrix> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  O: [
    [1, 1],
    [1, 1]
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0]
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0]
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0]
  ]
};

/** Points per number of lines cleared at once, multiplied by the level (Tetris guideline). */
const LINE_SCORES = [0, 100, 300, 500, 800];
const SOFT_DROP_POINTS = 1;
const HARD_DROP_POINTS = 2;
const LINES_PER_LEVEL = 10;
const BASE_DROP_MS = 800;
const MIN_DROP_MS = 80;
const SPEED_UP_PER_LEVEL = 0.85;
/** Sideways nudges tried when a rotation is blocked, so pieces can turn next to walls. */
const WALL_KICKS = [0, -1, 1, -2, 2];

export const cellValue = (type: PieceType): Cell => PIECE_TYPES.indexOf(type) + 1;

export const createBoard = (): Board =>
  Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(0));

export function spawnPiece(type: PieceType): Piece {
  const matrix = SHAPES[type];
  return { type, matrix, x: Math.floor((COLS - matrix.length) / 2), y: 0 };
}

export function rotateClockwise(matrix: Matrix): Matrix {
  const size = matrix.length;
  return matrix.map((row, r) => row.map((_, c) => matrix[size - 1 - c][r]));
}

export function collides(board: Board, piece: Piece): boolean {
  return piece.matrix.some((row, r) =>
    row.some((filled, c) => {
      if (!filled) return false;
      const x = piece.x + c;
      const y = piece.y + r;
      if (x < 0 || x >= COLS || y >= ROWS) return true;
      return y >= 0 && board[y][x] !== 0;
    })
  );
}

/** The piece moved by (dx, dy), or null when that spot is blocked. */
export function movePiece(board: Board, piece: Piece, dx: number, dy: number): Piece | null {
  const moved = { ...piece, x: piece.x + dx, y: piece.y + dy };
  return collides(board, moved) ? null : moved;
}

export function rotatePiece(board: Board, piece: Piece): Piece | null {
  const matrix = rotateClockwise(piece.matrix);
  for (const kick of WALL_KICKS) {
    const rotated = { ...piece, matrix, x: piece.x + kick };
    if (!collides(board, rotated)) return rotated;
  }
  return null;
}

/** Row the piece would land on if dropped straight down. */
export function dropY(board: Board, piece: Piece): number {
  let y = piece.y;
  while (!collides(board, { ...piece, y: y + 1 })) y++;
  return y;
}

export function mergePiece(board: Board, piece: Piece): Board {
  const merged = board.map((row) => [...row]);
  const value = cellValue(piece.type);
  piece.matrix.forEach((row, r) =>
    row.forEach((filled, c) => {
      const y = piece.y + r;
      if (filled && y >= 0) merged[y][piece.x + c] = value;
    })
  );
  return merged;
}

export function clearLines(board: Board): { board: Board; cleared: number } {
  const kept = board.filter((row) => row.some((cell) => cell === 0));
  const cleared = ROWS - kept.length;
  const empty = Array.from({ length: cleared }, () => Array<Cell>(COLS).fill(0));
  return { board: [...empty, ...kept], cleared };
}

export const lineClearScore = (cleared: number, level: number): number =>
  (LINE_SCORES[cleared] ?? 0) * level;

export const levelForLines = (lines: number): number => Math.floor(lines / LINES_PER_LEVEL) + 1;

export const dropIntervalMs = (level: number): number =>
  Math.max(MIN_DROP_MS, Math.round(BASE_DROP_MS * SPEED_UP_PER_LEVEL ** (level - 1)));

/**
 * "7-bag" randomiser: every run of seven pieces contains each shape once, which avoids
 * long droughts of the I piece. `random` returns [0, 1) like Math.random.
 */
export function createBag(random: () => number = Math.random): () => PieceType {
  let bag: PieceType[] = [];
  return () => {
    if (bag.length === 0) {
      bag = [...PIECE_TYPES];
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
    }
    return bag.pop()!;
  };
}

export function newGame(nextPiece: () => PieceType): GameState {
  return {
    board: createBoard(),
    piece: spawnPiece(nextPiece()),
    next: nextPiece(),
    score: 0,
    lines: 0,
    level: 1,
    isOver: false
  };
}

/** Fixes the current piece in place, clears lines and brings in the next piece. */
function lockPiece(state: GameState, piece: Piece, nextPiece: () => PieceType): GameState {
  const { board, cleared } = clearLines(mergePiece(state.board, piece));
  const lines = state.lines + cleared;
  const spawned = spawnPiece(state.next);
  return {
    board,
    piece: spawned,
    next: nextPiece(),
    score: state.score + lineClearScore(cleared, state.level),
    lines,
    level: levelForLines(lines),
    isOver: collides(board, spawned)
  };
}

export function step(state: GameState, action: Action, nextPiece: () => PieceType): GameState {
  if (state.isOver) return state;
  const { board, piece } = state;

  switch (action) {
    case "left":
    case "right": {
      const moved = movePiece(board, piece, action === "left" ? -1 : 1, 0);
      return moved ? { ...state, piece: moved } : state;
    }
    case "rotate": {
      const rotated = rotatePiece(board, piece);
      return rotated ? { ...state, piece: rotated } : state;
    }
    case "softDrop":
    case "tick": {
      const moved = movePiece(board, piece, 0, 1);
      if (!moved) return lockPiece(state, piece, nextPiece);
      const bonus = action === "softDrop" ? SOFT_DROP_POINTS : 0;
      return { ...state, piece: moved, score: state.score + bonus };
    }
    case "hardDrop": {
      const y = dropY(board, piece);
      const dropped = { ...piece, y };
      const scored = { ...state, score: state.score + (y - piece.y) * HARD_DROP_POINTS };
      return lockPiece(scored, dropped, nextPiece);
    }
  }
}
