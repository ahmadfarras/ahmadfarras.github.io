<script lang="ts">
  import { base } from "$app/paths";
  import { fade } from "svelte/transition";
  import { BOOT_FINISH_MS } from "./boot";

  /** True once the desktop is interactive: the bar fills up and the screen fades away. */
  export let isReady: boolean;

  const STEPS = ["Booting kernel…", "Starting window manager…", "Loading apps…", "Almost there…"];

  const prefersReducedMotion =
    typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
</script>

<!-- Everything here animates with CSS alone: it is prerendered and must move while the
     JavaScript is still downloading on a slow connection. -->
<div
  class="boot"
  class:ready={isReady}
  role="status"
  aria-live="polite"
  aria-label="Loading Farras OS"
  out:fade={{ duration: prefersReducedMotion ? 0 : BOOT_FINISH_MS }}
>
  <div class="logo">Farras OS</div>
  <p class="owner">Ahmad Farras Syafrin</p>

  <div class="bar" aria-hidden="true"><div class="fill" /></div>

  <ul class="steps" aria-hidden="true">
    {#each STEPS as step, index (step)}
      <li style="--index: {index}">{step}</li>
    {/each}
  </ul>

  <noscript>
    <p class="notice">
      This desktop needs JavaScript.
      <a href="{base}/classic">Open the classic view</a>
    </p>
  </noscript>
  <p class="notice slow">
    Taking a while? <a href="{base}/classic">Open the classic view</a>
  </p>
</div>

<style>
  .boot {
    position: absolute;
    inset: 0;
    /* Above the Dock and context menu. */
    z-index: 2147483647;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    background: #11131b;
    color: #e8eaf2;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }
  .logo {
    padding: 0.5rem 1.25rem;
    border: 3px solid #e8eaf2;
    border-radius: 0.625rem;
    background: #f7a501;
    color: #151515;
    font-family: ui-sans-serif, system-ui, sans-serif;
    font-size: 1.75rem;
    font-weight: 800;
    box-shadow: 0 5px 0 0 #e8eaf2;
    animation: pop 500ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  .owner {
    font-size: 0.75rem;
    letter-spacing: 0.15em;
    color: #8b90a8;
  }
  .bar {
    width: min(16rem, 70vw);
    height: 0.375rem;
    margin-top: 1.5rem;
    overflow: hidden;
    border-radius: 999px;
    background: #2c2f39;
  }
  /* Creeps towards 90% while loading; fills up once the desktop is ready. */
  .fill {
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background: #f7a501;
    transform: scaleX(0.9);
    transform-origin: left;
    animation: load 6s cubic-bezier(0.1, 0.7, 0.3, 1) both;
  }
  .ready .fill {
    animation: none;
    transform: scaleX(1);
    transition: transform 250ms ease-out;
  }
  .steps {
    position: relative;
    width: 100%;
    height: 1rem;
    font-size: 0.75rem;
    color: #8b90a8;
  }
  .steps li {
    position: absolute;
    inset: 0;
    text-align: center;
    opacity: 0;
    animation: step 1.6s ease-in-out calc(var(--index) * 1.6s) both;
  }
  /* The last step stays on screen for as long as loading takes. */
  .steps li:last-child {
    animation-name: last-step;
  }
  /* Pinned near the bottom so showing or hiding it never shifts the logo and progress bar. */
  .notice {
    position: absolute;
    bottom: 3rem;
    left: 50%;
    width: max-content;
    max-width: calc(100% - 2rem);
    transform: translateX(-50%);
    font-size: 0.75rem;
    text-align: center;
    color: #8b90a8;
  }
  .notice a {
    color: #f7a501;
    text-decoration: underline;
  }
  /* Offered only if loading drags on, e.g. on a poor connection. */
  .slow {
    opacity: 0;
    animation: appear 400ms ease-out 8s both;
  }
  .ready .slow {
    display: none;
  }
  @keyframes pop {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
  }
  @keyframes load {
    from {
      transform: scaleX(0);
    }
  }
  @keyframes step {
    15%,
    85% {
      opacity: 1;
    }
  }
  @keyframes last-step {
    to {
      opacity: 1;
    }
  }
  @keyframes appear {
    to {
      opacity: 1;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .logo,
    .fill,
    .steps li {
      animation: none;
    }
    .steps li:not(:first-child) {
      display: none;
    }
    .steps li:first-child {
      opacity: 1;
    }
  }
</style>
