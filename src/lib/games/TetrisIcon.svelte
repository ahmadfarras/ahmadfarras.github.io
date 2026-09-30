<script lang="ts">
  // Same props as the flowbite icons it sits next to in the Dock and Games folder.
  export let size: "xs" | "sm" | "md" | "lg" | "xl" = "md";
  let className = "";
  export { className as class };

  const SIZES = { xs: "w-3 h-3", sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6", xl: "w-8 h-8" };

  /** Four stacked tetrominoes on an 8x8 pixel grid: [x, y, colour]. */
  const PIXELS: [number, number, string][] = [
    [0, 4, "#f25b5b"], [1, 4, "#f25b5b"], [1, 5, "#f25b5b"], [2, 5, "#f25b5b"],
    [3, 2, "#a55eea"], [4, 2, "#a55eea"], [5, 2, "#a55eea"], [4, 3, "#a55eea"],
    [0, 6, "#3fd0f0"], [0, 7, "#3fd0f0"], [1, 7, "#3fd0f0"], [2, 7, "#3fd0f0"],
    [3, 6, "#f7a501"], [4, 6, "#f7a501"], [3, 7, "#f7a501"], [4, 7, "#f7a501"],
    [5, 5, "#5ad35a"], [6, 5, "#5ad35a"], [6, 6, "#5ad35a"], [7, 6, "#5ad35a"],
    [5, 7, "#4a7cf0"], [6, 7, "#4a7cf0"], [7, 7, "#4a7cf0"]
  ];
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 8 8"
  shape-rendering="crispEdges"
  class="{className || SIZES[size]}"
  role="img"
  aria-label="Tetris"
>
  {#each PIXELS as [x, y, colour] (`${x}-${y}`)}
    <rect {x} {y} width="1" height="1" fill={colour} />
  {/each}
</svg>
