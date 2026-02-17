<script lang="ts">
  import "../app.pcss";
  import { base } from '$app/paths';
  import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Footer, FooterCopyright, DarkMode } from "flowbite-svelte";

  const year: number = new Date().getFullYear();
  import { page } from "$app/stores";
  $: activeUrl = $page.url.pathname;
</script>

<div class="container mx-auto min-h-screen max-w-5xl flex flex-col items-center justify-between">
  <Navbar class="bg-white dark:bg-black">
    <NavBrand href="{base}/">
      <span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white"
        >Ahmad Farras Syafrin</span
      >
    </NavBrand>
    <NavHamburger />
    <NavUl {activeUrl}>
      <NavLi class="p-2.5 md:p-2.5" href="{base}/experience">Experience</NavLi>
      <NavLi class="p-2.5 md:p-2.5" href="https://github.com/ahmadfarras">GitHub</NavLi>
      <NavLi class="p-2.5 md:p-2.5" href="https://www.linkedin.com/in/ahmad-farras-syafrin/">LinkedIn</NavLi>
      <DarkMode />
    </NavUl>
  </Navbar>

  <slot />

  <Footer class="p-7">
    <FooterCopyright href="{base}/" by="Ahmad Farras Syafrin" {year} />
  </Footer>
</div>
