<script lang="ts">
  // flowbite-svelte-icons has no game controller, so this mirrors its props (size, class).
  export let size: "xs" | "sm" | "md" | "lg" | "xl" = "md";
  let className = "";
  export { className as class };

  const SIZES = { xs: "w-3 h-3", sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6", xl: "w-8 h-8" };
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="currentColor"
  class={className || SIZES[size]}
  role="img"
  aria-label="Game controller"
>
  <!-- Controller body; the d-pad and two buttons are cut out with evenodd. -->
  <path
    fill-rule="evenodd"
    d="M7 6h10a5 5 0 0 1 4.9 4l1 5.2a3.2 3.2 0 0 1-5.6 2.7L15.5 16h-7l-1.8 1.9a3.2 3.2 0 0 1-5.6-2.7l1-5.2A5 5 0 0 1 7 6Z
       M7.2 8.5h1.6v1.7h1.7v1.6H8.8v1.7H7.2v-1.7H5.5v-1.6h1.7Z
       M16.5 9.6a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z
       M18.6 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
  />
</svg>
