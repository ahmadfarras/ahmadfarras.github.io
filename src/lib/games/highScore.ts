export const BEST_SCORE_KEY = "tetris-best-score";

type ScoreStorage = Pick<Storage, "getItem" | "setItem">;

/** Best score saved in this browser; 0 when missing, invalid or unreadable. */
export function loadBestScore(storage: ScoreStorage | null): number {
  try {
    const saved = Number.parseInt(storage?.getItem(BEST_SCORE_KEY) ?? "", 10);
    return Number.isFinite(saved) && saved > 0 ? saved : 0;
  } catch {
    return 0;
  }
}

/** Saves `score` if it beats the stored best and returns the (possibly new) best. */
export function saveBestScore(storage: ScoreStorage | null, score: number): number {
  const best = Math.max(loadBestScore(storage), score);
  try {
    storage?.setItem(BEST_SCORE_KEY, String(best));
  } catch {
    // Not persisting is fine: the best score still shows for this visit.
  }
  return best;
}
