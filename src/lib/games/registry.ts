import type { WindowApp } from "$lib/desktop/apps";
import Snake from "./Snake.svelte";
import SnakeIcon from "./SnakeIcon.svelte";
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
  },
  {
    kind: "window",
    id: "snake",
    title: "Snake",
    icon: SnakeIcon,
    content: Snake,
    size: { width: 480, height: 430 },
    folder: "games"
  }
];
