<script>
  import { Timeline, TimelineItem } from "flowbite-svelte";
  import { companies } from "$lib/data/experience";
</script>

<div class="animate-glide max-w-lg p-6">
  <Timeline order="vertical">
    {#each companies as company (company.name)}
      <TimelineItem classDiv="ring-0" title={company.name} date={company.dates}>
        <svelte:fragment slot="icon">
          <span
            class="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-black"
          >
            <img src={company.logo} alt={company.name} />
          </span>
        </svelte:fragment>
        <p class="mb-4 text-base font-normal text-gray-500 dark:text-gray-400 whitespace-pre-line">
          {company.description}
        </p>
      </TimelineItem>
    {/each}
  </Timeline>
</div>

<style>
</style>
