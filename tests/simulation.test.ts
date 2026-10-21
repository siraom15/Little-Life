import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createLife,
  createNewLife,
  choose,
  nextEvent,
  available,
  advanceYear,
  acknowledgeNotice,
  doActivity,
  skipToMoment,
  validateLife,
  encodeLife,
  decodeLife,
} from "../lib/game.ts";
import { randomAt } from "../lib/game/random.ts";
import type { Life } from "../lib/game.ts";
function resolve(life: Life): Life {
  if (life.simulation?.notice) return acknowledgeNotice(life);
  const event = nextEvent(life);
  if (event) {
    const index = event.choices.findIndex((choice) => available(life, choice));
    assert.ok(index >= 0);
    return choose(life, index);
  }
  return advanceYear(life);
}

test("new life starts as newborn and cannot skip an unread birth notice", () => {
  const newborn = createNewLife(42, "ฟ้า");
  assert.equal(newborn.age, 0);
  assert.equal(newborn.simulation?.notice?.scene, "birth");
  assert.equal(advanceYear(newborn), newborn);
  assert.equal(choose(newborn, 0), newborn);
  const year1 = advanceYear(acknowledgeNotice(newborn));
  assert.equal(year1.age, 1);
  assert.ok(validateLife(year1));
});
test("birth traits and sex are varied but reproducible", () => {
  const sex = new Set(),
    traits = new Set();
  for (let seed = 0; seed < 100; seed++) {
    const life = createNewLife(seed);
    sex.add(life.simulation?.sex);
    traits.add(life.simulation?.birthTrait);
    assert.deepEqual(createNewLife(seed), life);
  }
  assert.equal(sex.size, 2);
  assert.equal(traits.size, 3);
});
test("life stops at decisions and free activities are limited to one per year", () => {
  let life = createNewLife(7);
  while (life.age < 6 || life.simulation?.notice) life = resolve(life);
  assert.equal(nextEvent(life)?.id, "school");
  assert.equal(advanceYear(life), life);
  life = choose(life, 0);
  const active = doActivity(life, "rest");
  assert.notEqual(active, life);
  assert.equal(doActivity(active, "learn"), active);
  assert.ok(validateLife(active));
});
test("choice-only mode stops at same moment as advancing year by year", () => {
  for (let seed = 0; seed < 100; seed++) {
    const initial = acknowledgeNotice(createNewLife(seed));
    let yearly = initial;
    while (!yearly.done && !yearly.simulation?.notice && !nextEvent(yearly))
      yearly = advanceYear(yearly);
    assert.deepEqual(skipToMoment(initial), yearly);
  }
});
test("legacy save upgrades without losing money/history and remains replayable", () => {
  let old = choose(createLife(2), 0);
  old = choose(old, 0);
  const upgraded = createNewLife(old.seed, old.name, old);
  assert.equal(upgraded.version, 2);
  assert.equal(upgraded.age, old.age);
  assert.equal(upgraded.money, old.money);
  assert.deepEqual(upgraded.history, old.history);
  assert.ok(validateLife(upgraded));
  assert.deepEqual(decodeLife(encodeLife(upgraded)), upgraded);
  assert.equal(old.version, 1);
});
test("v2 birth and midlife share roundtrip; tampered state is rejected", () => {
  let life = createNewLife(8, "อรุณ");
  for (let i = 0; i < 25 && !life.done; i++) life = resolve(life);
  assert.ok(validateLife(life));
  assert.deepEqual(decodeLife(encodeLife(life)), life);
  assert.equal(validateLife({ ...life, age: 150 }), false);
  assert.equal(validateLife({ ...life, money: 1e12 }), false);
  assert.equal(decodeLife("nonsense"), null);
});
test("500 v2 lifetimes finish, include premature deaths and valid random event scenes", () => {
  let earlyDeaths = 0,
    randomCount = 0;
  for (let seed = 0; seed < 500; seed++) {
    let life = createNewLife(seed);
    for (let turn = 0; turn < 350 && !life.done; turn++) {
      const prior = life;
      life = resolve(life);
      assert.notEqual(life, prior);
      assert.ok(life.age >= prior.age && life.age - prior.age <= 1);
      for (const value of Object.values(life.stats))
        assert.ok(value >= 0 && value <= 100);
      if (life.simulation?.notice?.scene && life.simulation.notice.id !== "birth")
        randomCount++;
    }
    assert.ok(life.done);
    assert.ok(life.age <= 100);
    assert.ok(life.simulation?.death);
    assert.equal(life.simulation?.notice?.scene, "death");
    assert.equal(advanceYear(life), life);
    assert.equal(choose(life, 0), life);
    assert.ok(validateLife(life));
    assert.deepEqual(decodeLife(encodeLife(life)), life);
    if (life.age < 60) earlyDeaths++;
    const summary = acknowledgeNotice(life);
    assert.ok(summary.done);
    assert.equal(advanceYear(summary), summary);
  }
  assert.ok(earlyDeaths > 0);
  assert.ok(randomCount > 500);
});
test("seeded RNG stays bounded and stable", () => {
  assert.equal(randomAt(5, 8, 3), randomAt(5, 8, 3));
  for (let i = 0; i < 500; i++) {
    const roll = randomAt(i, i % 100, 4);
    assert.ok(roll >= 0 && roll < 1);
  }
});

test("import replay rejects malformed action payloads", async () => {
  const { replayLife } = await import("../lib/game/validation.ts");
  for (const action of [
    { type: "activity", activity: "toString" },
    { type: "choice", index: -1 },
    { type: "choice", index: 1.5 },
    { type: "ack", extra: true },
    { type: "unknown" },
  ])
    assert.equal(replayLife(42, "Test", [action as never]), null);
});
