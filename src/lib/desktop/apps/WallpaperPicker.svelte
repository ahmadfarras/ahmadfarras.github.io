<script lang="ts">
  import { track } from "$lib/analytics";
  import { getWallpaperStore } from "../context";
  import { wallpapers } from "../wallpapers";

  const wallpaper = getWallpaperStore();

  function choose(id: string) {
    wallpaper.select(id);
    track("change-wallpaper", { wallpaper: id });
  }
</script>

<div class="space-y-4 p-6">
  <p class="text-sm text-gray-600 dark:text-gray-400">
    Pick a wallpaper. Your choice is remembered in this browser.
  </p>

  <ul class="grid grid-cols-2 gap-4 sm:grid-cols-3">
    {#each wallpapers as option (option.id)}
      {@const isSelected = option.id === $wallpaper.id}
      <li>
        <button
          type="button"
          class="option"
          class:selected={isSelected}
          aria-pressed={isSelected}
          on:click={() => choose(option.id)}
        >
          <span
            class="preview"
            class:dots={!option.src}
            style={option.src ? `background-image: url("${option.src}")` : ""}
          />
          <span class="text-sm font-semibold">{option.name}</span>
        </button>
      </li>
    {/each}
  </ul>
</div>

<style>
  .option {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
    padding: 0.375rem;
    border: 2px solid transparent;
    border-radius: 0.5rem;
    text-align: left;
  }
  .option:hover {
    background: var(--os-hover);
  }
  .option:focus-visible {
    outline: 2px solid var(--os-accent);
  }
  .option.selected {
    border-color: var(--os-accent);
  }
  .preview {
    display: block;
    aspect-ratio: 16 / 10;
    border: 1px solid var(--os-border);
    border-radius: 0.375rem;
    background-position: center;
    background-size: cover;
  }
  .preview.dots {
    background-color: var(--os-wallpaper);
    background-image: radial-gradient(var(--os-dot) 1px, transparent 1px);
    background-size: 10px 10px;
  }
</style>
