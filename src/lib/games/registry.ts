import type { WindowApp } from "$lib/desktop/apps";
import Tetris from "./Tetris.svelte";
import TetrisIcon from "./TetrisIcon.svelte";

/** Games shown in the Games folder. Add a game by adding an entry here. */
export const games: WindowApp[] = [
  {
    kind: "window",
    id: "tetris",
    title: "Tetris",
    icon: TetrisIcon,
    content: Tetris,
    size: { width: 440, height: 580 },
    folder: "games"
  }
];
