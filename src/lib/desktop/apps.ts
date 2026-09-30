import type { ComponentType } from "svelte";
import {
  BriefcaseSolid,
  CodeOutline,
  GithubSolid,
  LinkedinSolid,
  ImageSolid,
  MessagesSolid,
  UserCircleSolid
} from "flowbite-svelte-icons";
import About from "./apps/About.svelte";
import Contact from "./apps/Contact.svelte";
import Experience from "./apps/Experience.svelte";
import GamesFolder from "./apps/GamesFolder.svelte";
import Stack from "./apps/Stack.svelte";
import WallpaperPicker from "./apps/WallpaperPicker.svelte";
import GamepadIcon from "$lib/components/GamepadIcon.svelte";
import { games } from "$lib/games/registry";
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
  /**
   * Id of the folder app (e.g. "games") this app is opened from. It has no Dock icon of its own;
   * the folder's icon stands in for it (running dot, minimize target).
   */
  folder?: string;
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
    size: { width: 560, height: 660 }
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
    size: { width: 640, height: 610 }
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
    kind: "window",
    id: "games",
    title: "Games",
    icon: GamepadIcon,
    content: GamesFolder,
    size: { width: 420, height: 260 }
  },
  {
    kind: "window",
    id: "wallpaper",
    title: "Wallpaper",
    icon: ImageSolid,
    content: WallpaperPicker,
    size: { width: 560, height: 440 }
  },
  ...games,
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

/** Id of the Dock icon that represents an app: its folder's, or its own. */
export const dockIconId = (app: WindowApp): string => app.folder ?? app.id;

export const windowAppsById = new Map(
  apps.filter((app): app is WindowApp => app.kind === "window").map((app) => [app.id, app])
);
