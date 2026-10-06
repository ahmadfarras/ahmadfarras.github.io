<script lang="ts">
  import { projects } from "$lib/data/projects";
</script>

<ul class="space-y-2 p-4" aria-label="Projects">
  {#each projects as project (project.id)}
    <li>
      <a
        href={project.href}
        target="_blank"
        rel="noopener noreferrer"
        data-umami-event="open-link"
        data-umami-event-link={project.id}
        data-umami-event-from="projects"
        class="project"
      >
        <span class="tile"><svelte:component this={project.icon} class="h-3/5 w-3/5" /></span>
        <span class="min-w-0 space-y-1.5">
          <span class="block font-semibold text-gray-900 dark:text-white">
            {project.title}
            <span class="sr-only">(opens in a new tab)</span>
          </span>
          <span class="block text-sm text-gray-600 dark:text-gray-400">{project.description}</span>
          <span class="flex flex-wrap gap-1.5">
            {#each project.tags as tag (tag)}
              <span
                class="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                {tag}
              </span>
            {/each}
          </span>
        </span>
      </a>
    </li>
  {/each}
</ul>

<style>
  .project {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.5rem;
    border-radius: 0.5rem;
  }
  .project:hover {
    background: var(--os-hover);
  }
  .project:focus-visible {
    outline: 2px solid var(--os-accent);
  }
  .tile {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 3.5rem;
    height: 3.5rem;
    border: 2px solid var(--os-ink);
    border-radius: 22%;
    background: #1a1d29;
    color: #fff;
  }
</style>
