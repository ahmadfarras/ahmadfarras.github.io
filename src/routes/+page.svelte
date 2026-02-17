<script>
  import { images } from "$lib/data/carousel";
  import { Carousel, Heading, P, Tooltip } from "flowbite-svelte";
  import { scale } from "svelte/transition";
  import { quintOut } from "svelte/easing";

  const scaleAnimation = (x) => scale(x, { duration: 800, easing: quintOut });

  let image;
</script>

<div class="flex flex-col items-center">
  <Heading
    tag="h1"
    class="mb-4 text-center"
    customSize="text-4xl font-extrabold md:text-5xl lg:text-6xl">Ahmad Farras Syafrin</Heading
  >
  <P class="mb-6 text-center text-lg dark:text-gray-400 sm:px-16 lg:text-xl xl:px-48"
    >Software Engineer | Full Stack Developer</P
  >
  <div class="w-24">
    <Carousel
      {images}
      transition={scaleAnimation}
      id="carousel"
      class="flex w-24 max-h-24"
      imgClass="w-24 h-24 object-contain rounded-sm p-2"
      duration={1500}
      on:change={({ detail }) => (image = detail)}
    />
    <Tooltip triggeredBy="#carousel" placement="bottom">
      {image?.alt}
    </Tooltip>
  </div>
</div>

<style>
</style>
