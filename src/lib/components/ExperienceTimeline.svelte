<script>
  import { Timeline, TimelineItem } from "flowbite-svelte";
  import { companies } from "$lib/data/experience";
</script>

<Timeline order="vertical">
  {#each companies as company (company.dates)}
    <TimelineItem classDiv="ring-0" title="{company.role} • {company.name}" date={company.dates}>
      <svelte:fragment slot="icon">
        <span
          class="absolute -start-3 flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-white p-0.5 ring-1 ring-gray-200 dark:ring-gray-600"
        >
          <img src={company.logo} alt={company.name} class="h-full w-full object-contain" />
        </span>
      </svelte:fragment>
      <p class="mb-4 text-base font-normal text-gray-500 dark:text-gray-400 whitespace-pre-line">
        {company.description}
      </p>
    </TimelineItem>
  {/each}
</Timeline>
