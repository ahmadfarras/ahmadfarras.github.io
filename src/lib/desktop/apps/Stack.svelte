<script>
  import { images } from "$lib/data/carousel";
</script>

<ul class="grid grid-cols-2 gap-3 p-6 sm:grid-cols-3">
  {#each images as image (image.alt)}
    <li
      class="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
    >
      <img src={image.src} alt="" class="h-12 w-12 object-contain" />
      <span class="text-sm font-semibold text-gray-800 dark:text-gray-100">{image.alt}</span>
    </li>
  {/each}
</ul>
