/** Drawing helpers shared by the pixel-art games. Cells are squares of `size` canvas pixels. */

const HIGHLIGHT = "rgb(255 255 255 / 0.35)";
const SHADOW = "rgb(0 0 0 / 0.35)";

type Painter = Pick<CanvasRenderingContext2D, "fillRect"> & { fillStyle: unknown };

/** A cell with a one-pixel bevel: light top/left edge, dark bottom/right edge. */
export function drawBevelCell(ctx: Painter, x: number, y: number, size: number, colour: string) {
  const px = x * size;
  const py = y * size;
  ctx.fillStyle = colour;
  ctx.fillRect(px, py, size, size);
  ctx.fillStyle = HIGHLIGHT;
  ctx.fillRect(px, py, size, 1);
  ctx.fillRect(px, py, 1, size);
  ctx.fillStyle = SHADOW;
  ctx.fillRect(px, py + size - 1, size, 1);
  ctx.fillRect(px + size - 1, py, 1, size);
}

/** Fills the board and puts a faint dot in the middle of every cell. */
export function drawGrid(
  ctx: Painter,
  cols: number,
  rows: number,
  size: number,
  background: string,
  dot: string
) {
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, cols * size, rows * size);
  ctx.fillStyle = dot;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) ctx.fillRect(x * size + size / 2, y * size + size / 2, 1, 1);
  }
}

/** Calls `onFrame` with the milliseconds since the previous frame until the returned stop is called. */
export function startFrameLoop(onFrame: (deltaMs: number) => void): () => void {
  let previous: number | null = null;
  let handle = requestAnimationFrame(function loop(time) {
    onFrame(previous === null ? 0 : time - previous);
    previous = time;
    handle = requestAnimationFrame(loop);
  });
  return () => cancelAnimationFrame(handle);
}
