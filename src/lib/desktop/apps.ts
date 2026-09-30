import type { ComponentType } from "svelte";
import {
  BriefcaseSolid,
  CodeOutline,
  GithubSolid,
  LinkedinSolid,
  MessagesSolid,
  UserCircleSolid
} from "flowbite-svelte-icons";
import About from "./apps/About.svelte";
import Contact from "./apps/Contact.svelte";
import Experience from "./apps/Experience.svelte";
import Stack from "./apps/Stack.svelte";
import type { Size } from "./windowManager";

interface BaseApp {
  id: string;
  title: string;
  icon: ComponentType;
}

/** Opens as a window on the desktop. */
export interface WindowApp extends BaseApp {
  kind: "window";
  content: ComponentType;
  size: Size;
}

/** Desktop shortcut to an external page. */
export interface LinkApp extends BaseApp {
  kind: "link";
  href: string;
}

export type DesktopApp = WindowApp | LinkApp;

export const apps: DesktopApp[] = [
  {
    kind: "window",
    id: "about",
    title: "About me",
    icon: UserCircleSolid,
    content: About,
    size: { width: 560, height: 460 }
  },
  {
    kind: "window",
    id: "experience",
    title: "Experience",
    icon: BriefcaseSolid,
    content: Experience,
    size: { width: 640, height: 560 }
  },
  {
    kind: "window",
    id: "stack",
    title: "Tech stack",
    icon: CodeOutline,
    content: Stack,
    size: { width: 520, height: 380 }
  },
  {
    kind: "window",
    id: "contact",
    title: "Contact",
    icon: MessagesSolid,
    content: Contact,
    size: { width: 420, height: 320 }
  },
  {
    kind: "link",
    id: "github",
    title: "GitHub",
    icon: GithubSolid,
    href: "https://github.com/ahmadfarras"
  },
  {
    kind: "link",
    id: "linkedin",
    title: "LinkedIn",
    icon: LinkedinSolid,
    href: "https://www.linkedin.com/in/ahmad-farras-syafrin/"
  }
];

export const windowAppsById = new Map(
  apps.filter((app): app is WindowApp => app.kind === "window").map((app) => [app.id, app])
);
