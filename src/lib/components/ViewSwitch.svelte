<script lang="ts">
  import { base } from "$app/paths";
  import { RectangleListOutline, WindowOutline } from "flowbite-svelte-icons";

  /** The view this link switches to. */
  export let to: "desktop" | "classic";
  /** Hide the label on small screens, leaving only the icon. */
  export let compact = false;

  $: isDesktop = to === "desktop";
</script>

<a
  href={isDesktop ? `${base}/` : `${base}/classic`}
  class="flex items-center gap-2 whitespace-nowrap rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-black/5 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-white/10"
  aria-label="Switch to {to} view"
  data-umami-event="switch-view"
  data-umami-event-to={to}
>
  <svelte:component this={isDesktop ? WindowOutline : RectangleListOutline} size="sm" />
  <span class:hidden={compact} class:sm:inline={compact}>{isDesktop ? "Desktop view" : "Classic view"}</span>
</a>
