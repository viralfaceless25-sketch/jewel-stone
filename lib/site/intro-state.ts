export const INTRO_SESSION_KEY = "jewel-stone:intro-seen";

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "setItem">;

export function hasSeenIntro(storage: ReadableStorage | null | undefined): boolean {
  try {
    return storage?.getItem(INTRO_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function markIntroSeen(storage: WritableStorage | null | undefined): void {
  try {
    storage?.setItem(INTRO_SESSION_KEY, "1");
  } catch {
    // Storage can be disabled; loader still exits normally.
  }
}
