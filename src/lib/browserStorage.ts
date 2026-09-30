/** localStorage when the browser offers it; null on the server or when site data is blocked (access throws). */
export function browserStorage(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}
