import { test } from "node:test";
import assert from "node:assert/strict";
import { createGameLife, journeyAction } from "../lib/game/journey/engine.ts";
import { encodeLife, decodeLife } from "../lib/game/serialization.ts";
import { rememberEnding, recallEnding } from "../lib/browser/ending-memory.ts";
import { socialStories } from "../lib/game/journey/events/social-stories.ts";
import { randomStory } from "../lib/game/journey/events/random.ts";
import { gameConfig } from "../lib/game/journey/config.ts";
function store() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) || null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  };
}
function fixture(age = 30) {
  const l = createGameLife(42);
  l.age = age;
  l.simulation!.notice = null;
  return l;
}
test("funeral handoff preserves completed snapshot even when action replay cannot reproduce the ending", () => {
  const l = fixture(80);
  l.done = true;
  l.journey!.funeral = { title: "อำลา", estate: 100, guests: [] };
  l.simulation!.death = { cause: "ชรา", age: 80 };
  l.journey!.balanceRevision = gameConfig.revision - 1;
  const encoded = encodeLife(l),
    memory = store();
  assert.equal(decodeLife(encoded), null);
  rememberEnding(l, encoded, memory);
  assert.deepEqual(recallEnding(encoded, memory), l);
  assert.equal(recallEnding("different-life", memory), null);
  assert.equal(
    decodeLife(encoded),
    null,
    "local snapshot must not weaken shared-link validation",
  );
});
test("ending handoff ignores living games, corrupt storage and unavailable storage", () => {
  const memory = store();
  rememberEnding(fixture(), "x", memory);
  assert.equal(recallEnding("x", memory), null);
  memory.setItem("littlelife.ending-memory.v1", "{");
  assert.equal(recallEnding("x", memory), null);
  assert.equal(
    recallEnding("x", {
      getItem: () => {
        throw Error("blocked");
      },
      setItem: () => {},
    }),
    null,
  );
});
test("age-specific social events and partner eligibility cover all life stages", () => {
  const ids = new Set<string>();
  for (const age of [6, 14, 19, 30, 50, 70]) {
    const l = fixture(age),
      stories = socialStories(l);
    assert.equal(stories.length, 1);
    assert.equal(stories[0].choices.length, 5);
    ids.add(stories[0].id.split("-")[1]);
  }
  assert.equal(ids.size, 6);
  assert.equal(socialStories(fixture(4)).length, 0);
  const l = fixture();
  l.journey!.partner = { name: "แพร", status: "dating", bond: 60, since: 25 };
  assert.equal(socialStories(l).filter((e) => e.id.startsWith("couple-")).length, 3);
  l.journey!.partner.status = "married";
  assert.ok(socialStories(l).some((e) => e.id.startsWith("couple-budget")));
  l.age = 65;
  assert.ok(socialStories(l).some((e) => e.id.startsWith("couple-old-days")));
  l.journey!.partner.deceased = true;
  assert.ok(socialStories(l).every((e) => !e.id.startsWith("couple-")));
  l.journey!.partner.deceased = false;
  l.journey!.partner.status = "separated";
  assert.ok(socialStories(l).every((e) => !e.id.startsWith("couple-")));
});
test("couple choices charge actual money and change bond while social choices improve relationships", () => {
  let l = fixture();
  l.money = 10000;
  l.journey!.partner = { name: "แพร", status: "married", bond: 50, since: 25 };
  l.journey!.pending = socialStories(l).find((e) => e.id.startsWith("couple-date"))!;
  l = journeyAction(l, { type: "choice", index: 0 });
  assert.equal(l.money, 9500);
  assert.equal(l.journey!.partner!.bond, 60);
  assert.ok(l.history.at(-1)!.id.startsWith("couple-date"));
  const child = fixture(10),
    before = child.stats.social;
  child.journey!.pending = socialStories(child)[0];
  const next = journeyAction(child, { type: "choice", index: 0 });
  assert.equal(next.stats.social, Math.min(100, before + 8));
});
test("random pool actually selects both new social and partner events", () => {
  const l = fixture();
  l.journey!.partner = { name: "แพร", status: "married", bond: 80, since: 25 };
  let social = false,
    couple = false;
  for (let seed = 0; seed < 80; seed++) {
    l.seed = seed;
    const e = randomStory(l);
    social ||= e.id.startsWith("social-");
    couple ||= e.id.startsWith("couple-");
  }
  assert.ok(social && couple);
});
