type ScoreStorage = Pick<Storage, "getItem" | "setItem">;

/** Best score saved under `key` in this browser; 0 when missing, invalid or unreadable. */
export function loadBestScore(storage: ScoreStorage | null, key: string): number {
  try {
    const saved = Number.parseInt(storage?.getItem(key) ?? "", 10);
    return Number.isFinite(saved) && saved > 0 ? saved : 0;
  } catch {
    return 0;
  }
}

/** Saves `score` if it beats the stored best and returns the (possibly new) best. */
export function saveBestScore(storage: ScoreStorage | null, key: string, score: number): number {
  const best = Math.max(loadBestScore(storage, key), score);
  try {
    storage?.setItem(key, String(best));
  } catch {
    // Not persisting is fine: the best score still shows for this visit.
  }
  return best;
}
