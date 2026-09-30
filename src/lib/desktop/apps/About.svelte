<script lang="ts">
  import { images } from "$lib/data/carousel";
  import ViewSwitch from "$lib/components/ViewSwitch.svelte";
  import { getOpenApp } from "../context";

  const openApp = getOpenApp();
  const year = new Date().getFullYear();
</script>

<div class="space-y-5 p-6">
  <div>
    <p class="eyebrow text-sm font-semibold uppercase tracking-wider">Hello, I'm</p>
    <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white">Ahmad Farras Syafrin</h1>
    <p class="mt-1 text-lg text-gray-600 dark:text-gray-300">
      Senior Software Engineer | Full Stack Engineer
    </p>
  </div>

  <p class="text-gray-600 dark:text-gray-400">
    Backend-focused engineer who has spent the last 8+ years building lending, card and banking
    products with Go and Java. Drag these windows around, open a few more from the desktop, and make
    yourself at home.
  </p>

  <div class="flex flex-wrap gap-2">
    {#each images as image (image.alt)}
      <span
        class="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
      >
        <img src={image.src} alt="" class="h-4 w-4 object-contain" />
        {image.alt}
      </span>
    {/each}
  </div>

  <div class="flex flex-wrap gap-3">
    <button type="button" class="action primary" on:click={() => openApp("experience")}>
      See my experience
    </button>
    <button type="button" class="action" on:click={() => openApp("contact")}>Get in touch</button>
  </div>

  <div
    class="flex flex-wrap items-center gap-3 border-t border-gray-200 pt-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400"
  >
    <span>Prefer a simple page?</span>
    <ViewSwitch to="classic" />
  </div>

  <p class="text-xs text-gray-500 dark:text-gray-400">
    © {year} Ahmad Farras Syafrin. All rights reserved.<br />
    Visits are counted with privacy-friendly analytics (Umami): no cookies, no personal data.
  </p>
</div>

<style>
  .eyebrow {
    color: var(--os-accent);
  }
  .action {
    padding: 0.5rem 1rem;
    border: 2px solid var(--os-ink);
    border-radius: 0.375rem;
    box-shadow: 0 3px 0 0 var(--os-ink);
    font-size: 0.875rem;
    font-weight: 700;
    transition: transform 0.1s;
  }
  .action:active {
    transform: translateY(3px);
    box-shadow: none;
  }
  .action.primary {
    background: var(--os-accent);
    color: #151515;
  }
</style>
