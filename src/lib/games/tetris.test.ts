import { describe, expect, it } from "vitest";
import {
  COLS,
  PIECE_TYPES,
  ROWS,
  SHAPES,
  cellValue,
  clearLines,
  collides,
  createBag,
  createBoard,
  dropIntervalMs,
  dropY,
  lineClearScore,
  levelForLines,
  mergePiece,
  movePiece,
  newGame,
  rotateClockwise,
  rotatePiece,
  spawnPiece,
  step,
  type Board,
  type GameState,
  type PieceType
} from "./tetris";

/** Deterministic piece source for tests. */
const sequence = (...types: PieceType[]) => {
  let i = 0;
  return () => types[i++ % types.length];
};

const fullRow = (value = 1) => Array(COLS).fill(value);

/** Board whose bottom `count` rows are full except for column `gap`. */
const boardWithGap = (count: number, gap: number): Board => {
  const board = createBoard();
  for (let r = ROWS - count; r < ROWS; r++) {
    board[r] = fullRow();
    board[r][gap] = 0;
  }
  return board;
};

describe("createBoard", () => {
  it("is ROWS x COLS and empty", () => {
    const board = createBoard();
    expect(board).toHaveLength(ROWS);
    expect(board.every((row) => row.length === COLS && row.every((c) => c === 0))).toBe(true);
  });

  it("gives every row its own array", () => {
    const board = createBoard();
    board[0][0] = 5;
    expect(board[1][0]).toBe(0);
  });
});

describe("cellValue", () => {
  it("maps each type to a distinct non-zero value", () => {
    const values = PIECE_TYPES.map(cellValue);
    expect(new Set(values).size).toBe(PIECE_TYPES.length);
    expect(values.every((v) => v > 0)).toBe(true);
  });
});

describe("spawnPiece", () => {
  it.each(PIECE_TYPES)("centres %s at the top without colliding", (type) => {
    const piece = spawnPiece(type);
    expect(piece.y).toBe(0);
    expect(piece.x).toBe(Math.floor((COLS - SHAPES[type].length) / 2));
    expect(collides(createBoard(), piece)).toBe(false);
  });
});

describe("rotateClockwise", () => {
  it("rotates a T to point right", () => {
    expect(rotateClockwise(SHAPES.T)).toEqual([
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0]
    ]);
  });

  it("returns to the start after four turns", () => {
    let matrix = SHAPES.L;
    for (let i = 0; i < 4; i++) matrix = rotateClockwise(matrix);
    expect(matrix).toEqual(SHAPES.L);
  });

  it("leaves the O unchanged", () => {
    expect(rotateClockwise(SHAPES.O)).toEqual(SHAPES.O);
  });
});

describe("collides", () => {
  const board = createBoard();
  it.each([
    { name: "inside the board", x: 3, y: 5, want: false },
    { name: "past the left wall", x: -1, y: 5, want: true },
    { name: "past the right wall", x: COLS - 2, y: 5, want: true },
    { name: "below the floor", x: 3, y: ROWS - 1, want: true },
    { name: "partly above the top", x: 3, y: -1, want: false }
  ])("$name", ({ x, y, want }) => {
    expect(collides(board, { ...spawnPiece("T"), x, y })).toBe(want);
  });

  it("detects filled cells", () => {
    const filled = createBoard();
    filled[6][4] = 1;
    expect(collides(filled, { ...spawnPiece("T"), x: 3, y: 5 })).toBe(true);
  });
});

describe("movePiece", () => {
  it("moves when free and returns null when blocked", () => {
    const board = createBoard();
    const piece = spawnPiece("O");
    expect(movePiece(board, piece, 1, 0)).toMatchObject({ x: piece.x + 1 });
    expect(movePiece(board, { ...piece, x: 0 }, -1, 0)).toBeNull();
  });
});

describe("rotatePiece", () => {
  it("rotates in open space", () => {
    const piece = { ...spawnPiece("T"), y: 5 };
    expect(rotatePiece(createBoard(), piece)?.matrix).toEqual(rotateClockwise(SHAPES.T));
  });

  it("kicks off the wall instead of refusing to turn", () => {
    // Vertical I hugging the right wall: its rotated row would stick out, so it gets nudged left.
    const vertical = rotateClockwise(SHAPES.I);
    const piece = { type: "I" as const, matrix: vertical, x: COLS - 3, y: 5 };
    const rotated = rotatePiece(createBoard(), piece);
    expect(rotated).not.toBeNull();
    expect(collides(createBoard(), rotated!)).toBe(false);
    expect(rotated!.x).toBeLessThan(piece.x);
  });

  it("returns null when no kick fits", () => {
    const board = createBoard().map(() => fullRow());
    board[5] = Array(COLS).fill(0);
    const flatI = { ...spawnPiece("I"), y: 4 };
    expect(rotatePiece(board, flatI)).toBeNull();
  });
});

describe("dropY", () => {
  it("lands on the floor of an empty board", () => {
    const piece = spawnPiece("O");
    expect(dropY(createBoard(), piece)).toBe(ROWS - 2);
  });

  it("lands on top of the stack", () => {
    const board = createBoard();
    board[ROWS - 1] = fullRow();
    expect(dropY(board, spawnPiece("O"))).toBe(ROWS - 3);
  });
});

describe("mergePiece", () => {
  it("writes the piece into a copy of the board", () => {
    const board = createBoard();
    const merged = mergePiece(board, { ...spawnPiece("O"), x: 0, y: 0 });
    expect(merged[0][0]).toBe(cellValue("O"));
    expect(merged[1][1]).toBe(cellValue("O"));
    expect(board[0][0]).toBe(0);
  });

  it("ignores cells above the top edge", () => {
    const merged = mergePiece(createBoard(), { ...spawnPiece("O"), x: 0, y: -1 });
    expect(merged[0][0]).toBe(cellValue("O"));
  });
});

describe("clearLines", () => {
  it.each([0, 1, 2, 4])("clears %i full rows and drops the rest", (count) => {
    const board = createBoard();
    board[ROWS - count - 1][0] = 7;
    for (let r = ROWS - count; r < ROWS; r++) board[r] = fullRow();
    const result = clearLines(board);
    expect(result.cleared).toBe(count);
    expect(result.board).toHaveLength(ROWS);
    expect(result.board[ROWS - 1][0]).toBe(7);
  });
});

describe("scoring and speed", () => {
  it.each([
    { cleared: 0, level: 3, want: 0 },
    { cleared: 1, level: 1, want: 100 },
    { cleared: 4, level: 2, want: 1600 },
    { cleared: 9, level: 1, want: 0 }
  ])("$cleared lines at level $level -> $want", ({ cleared, level, want }) => {
    expect(lineClearScore(cleared, level)).toBe(want);
  });

  it.each([
    { lines: 0, want: 1 },
    { lines: 9, want: 1 },
    { lines: 10, want: 2 },
    { lines: 35, want: 4 }
  ])("$lines lines -> level $want", ({ lines, want }) => {
    expect(levelForLines(lines)).toBe(want);
  });

  it("speeds up each level but never below the floor", () => {
    expect(dropIntervalMs(1)).toBe(800);
    expect(dropIntervalMs(2)).toBeLessThan(dropIntervalMs(1));
    expect(dropIntervalMs(99)).toBe(80);
  });
});

describe("createBag", () => {
  it("deals every piece once per bag of seven", () => {
    const next = createBag(() => 0.5);
    for (let bag = 0; bag < 3; bag++) {
      const dealt = Array.from({ length: 7 }, next);
      expect(new Set(dealt)).toEqual(new Set(PIECE_TYPES));
    }
  });
});

describe("newGame", () => {
  it("starts empty at level 1 with a current and next piece", () => {
    const game = newGame(sequence("T", "I"));
    expect(game).toMatchObject({ score: 0, lines: 0, level: 1, isOver: false, next: "I" });
    expect(game.piece.type).toBe("T");
    expect(game.board.flat().every((c) => c === 0)).toBe(true);
  });
});

describe("step", () => {
  const start = (): GameState => newGame(sequence("O", "T", "I"));

  it("moves left and right, staying put at the wall", () => {
    const next = sequence("I");
    const game = start();
    expect(step(game, "left", next).piece.x).toBe(game.piece.x - 1);
    expect(step(game, "right", next).piece.x).toBe(game.piece.x + 1);
    const atWall = { ...game, piece: { ...game.piece, x: 0 } };
    expect(step(atWall, "left", next)).toBe(atWall);
  });

  it("rotates", () => {
    const game = { ...newGame(sequence("T", "I")), piece: { ...spawnPiece("T"), y: 5 } };
    expect(step(game, "rotate", sequence("I")).piece.matrix).toEqual(rotateClockwise(SHAPES.T));
  });

  it("ticks down without points, soft drop earns a point", () => {
    const game = start();
    const ticked = step(game, "tick", sequence("I"));
    expect(ticked.piece.y).toBe(1);
    expect(ticked.score).toBe(0);
    expect(step(game, "softDrop", sequence("I")).score).toBe(1);
  });

  it("locks the piece and deals the next one when it can't fall", () => {
    const game = { ...start(), piece: { ...spawnPiece("O"), y: ROWS - 2 } };
    const locked = step(game, "tick", sequence("S"));
    expect(locked.board[ROWS - 1][game.piece.x]).toBe(cellValue("O"));
    expect(locked.piece.type).toBe("T");
    expect(locked.next).toBe("S");
  });

  it("hard drops for two points per row and locks", () => {
    const game = start();
    const dropped = step(game, "hardDrop", sequence("S"));
    expect(dropped.score).toBe((ROWS - 2) * 2);
    expect(dropped.board[ROWS - 1][game.piece.x]).toBe(cellValue("O"));
  });

  it("clears lines, scores them and levels up", () => {
    // A vertical I dropped into the one-column gap completes four rows at once (a "Tetris").
    const vertical = rotateClockwise(SHAPES.I); // filled cells are in column 2 of the matrix
    const game: GameState = {
      ...start(),
      board: boardWithGap(4, 0),
      lines: 8,
      piece: { type: "I", matrix: vertical, x: -2, y: 0 }
    };
    const result = step(game, "hardDrop", sequence("S"));
    expect(result.lines).toBe(12);
    expect(result.level).toBe(2);
    expect(result.score).toBe((ROWS - 4) * 2 + lineClearScore(4, 1));
    expect(result.board.flat().every((c) => c === 0)).toBe(true);
  });

  it("ends the game when the next piece can't spawn, then ignores input", () => {
    // Everything from row 2 down is filled (with a gap so nothing clears), so the O lands on
    // the top two rows and the T that follows has nowhere to appear.
    const board = createBoard();
    for (let r = 2; r < ROWS; r++) board[r] = [0, ...fullRow().slice(1)];
    const game: GameState = { ...newGame(sequence("O", "T")), board };
    const over = step(game, "hardDrop", sequence("S"));
    expect(over.isOver).toBe(true);
    expect(step(over, "left", sequence("S"))).toBe(over);
    expect(step(over, "tick", sequence("S"))).toBe(over);
  });
});
