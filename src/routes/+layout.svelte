<script lang="ts">
  import "../app.pcss";
  import { onMount } from "svelte";
  import { loadAnalytics } from "$lib/analytics";

  // After hydration, so analytics never delays the first paint or the desktop's boot screen.
  onMount(() => loadAnalytics(document, location.hostname));
</script>

<slot />
