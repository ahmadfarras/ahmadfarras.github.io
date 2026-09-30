<script>
  import { GithubSolid, LinkedinSolid } from "flowbite-svelte-icons";

  const links = [
    { label: "GitHub", handle: "@ahmadfarras", href: "https://github.com/ahmadfarras", icon: GithubSolid },
    {
      label: "LinkedIn",
      handle: "ahmad-farras-syafrin",
      href: "https://www.linkedin.com/in/ahmad-farras-syafrin/",
      icon: LinkedinSolid
    }
  ];
</script>

<div class="space-y-3 p-6">
  <p class="text-gray-600 dark:text-gray-400">Want to build something together? Reach me here:</p>
  {#each links as link (link.href)}
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      data-umami-event="open-link"
      data-umami-event-link={link.label.toLowerCase()}
      data-umami-event-from="contact"
      class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-colors dark:border-gray-700 dark:bg-gray-800"
    >
      <svelte:component this={link.icon} size="lg" class="text-gray-800 dark:text-gray-100" />
      <span>
        <span class="block font-semibold text-gray-900 dark:text-white">{link.label}</span>
        <span class="block text-sm text-gray-500 dark:text-gray-400">{link.handle}</span>
      </span>
    </a>
  {/each}
</div>
