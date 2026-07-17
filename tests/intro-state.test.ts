import test from "node:test";
import assert from "node:assert/strict";
import { INTRO_SESSION_KEY, hasSeenIntro, markIntroSeen } from "../lib/site/intro-state.ts";
import {
  INTRO_DURATION_MS,
  INTRO_REDUCED_DURATION_MS,
  getIntroDuration,
} from "../lib/site/intro-timing.ts";

class MemoryStorage {
  values = new Map<string, string>();

  getItem = (key: string) => this.values.get(key) ?? null;
  setItem = (key: string, value: string) => { this.values.set(key, value); };
}

test("returns false for a session that has not seen the intro", () => {
  assert.equal(hasSeenIntro(new MemoryStorage()), false);
});

test("records and reads intro completion", () => {
  const storage = new MemoryStorage();
  markIntroSeen(storage);

  assert.equal(storage.getItem(INTRO_SESSION_KEY), "1");
  assert.equal(hasSeenIntro(storage), true);
});

test("treats unavailable storage as an unseen session", () => {
  const unavailable = { getItem: () => { throw new Error("blocked"); } };

  assert.equal(hasSeenIntro(unavailable), false);
});

test("does not throw when completion cannot be stored", () => {
  const unavailable = { setItem: () => { throw new Error("blocked"); } };

  assert.doesNotThrow(() => markIntroSeen(unavailable));
});

test("selects a shorter intro for reduced motion", () => {
  assert.equal(getIntroDuration(false), INTRO_DURATION_MS);
  assert.equal(getIntroDuration(true), INTRO_REDUCED_DURATION_MS);
});
