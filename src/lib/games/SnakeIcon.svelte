<script lang="ts">
  // Same props as the flowbite icons it sits next to in the Games folder.
  export let size: "xs" | "sm" | "md" | "lg" | "xl" = "md";
  let className = "";
  export { className as class };

  const SIZES = { xs: "w-3 h-3", sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6", xl: "w-8 h-8" };
  const BODY = "#5ad35a";
  const HEAD = "#8ef08e";
  const APPLE = "#f25b5b";

  /** A coiled snake heading for an apple on an 8x8 pixel grid: [x, y, colour]. */
  const PIXELS: [number, number, string][] = [
    [1, 6, BODY], [2, 6, BODY], [3, 6, BODY], [4, 6, BODY], [5, 6, BODY],
    [5, 5, BODY], [5, 4, BODY], [4, 4, BODY], [3, 4, BODY], [2, 4, BODY],
    [2, 3, BODY], [2, 2, BODY], [3, 2, BODY], [4, 2, HEAD],
    [6, 1, APPLE], [6, 2, APPLE], [7, 1, APPLE], [7, 2, APPLE]
  ];
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 8 8"
  shape-rendering="crispEdges"
  class={className || SIZES[size]}
  role="img"
  aria-label="Snake"
>
  {#each PIXELS as [x, y, colour] (`${x}-${y}`)}
    <rect {x} {y} width="1" height="1" fill={colour} />
  {/each}
</svg>
