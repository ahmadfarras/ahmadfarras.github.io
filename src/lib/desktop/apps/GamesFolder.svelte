<script lang="ts">
  import { games } from "$lib/games/registry";
  import { getOpenApp } from "../context";

  const openApp = getOpenApp();
</script>

<ul class="grid grid-cols-3 gap-2 p-4 sm:grid-cols-4" aria-label="Games">
  {#each games as game (game.id)}
    <li>
      <button type="button" class="game" on:click={() => openApp(game.id)}>
        <span class="tile"><svelte:component this={game.icon} class="h-3/5 w-3/5" /></span>
        <span class="text-xs font-semibold">{game.title}</span>
      </button>
    </li>
  {/each}
</ul>

<style>
  .game {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.375rem;
    width: 100%;
    padding: 0.5rem;
    border-radius: 0.5rem;
  }
  .game:hover {
    background: var(--os-hover);
  }
  .game:focus-visible {
    outline: 2px solid var(--os-accent);
  }
  .tile {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3.5rem;
    height: 3.5rem;
    border: 2px solid var(--os-ink);
    border-radius: 22%;
    background: #1a1d29;
  }
</style>
