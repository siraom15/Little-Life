import assert from "node:assert/strict";
import { test } from "node:test";
import {
  available,
  choose,
  createLife,
  decodeLife,
  encodeLife,
  nextEvent,
  validateLife,
} from "../lib/game.ts";
test("language scholarship leads to migration and linked timeline", () => {
  let s = createLife(2);
  s = choose(s, 0);
  s = choose(s, 0);
  s = choose(s, 1);
  assert.equal(s.location, "ญี่ปุ่น");
  assert.equal(nextEvent(s)?.id, "settle");
  s = choose(s, 0);
  assert.equal(s.income, 540000);
  assert.equal(s.history.at(-1)?.cause, "study");
  s = choose(s, 1);
  assert.equal(s.location, "ประเทศไทย");
  assert.equal(s.income, 330000);
  assert.ok(validateLife(s));
});
test("share roundtrip and corrupted payload rejection", () => {
  let s = choose(createLife(10, "น้ำฝน"), 1);
  assert.deepEqual(decodeLife(encodeLife(s)), s);
  assert.equal(decodeLife("bad-data"), null);
  assert.equal(validateLife({ ...s, money: 999999999 }), false);
  assert.equal(validateLife({ ...s, history: [{ id: "legacy" }] }), false);
});
test("all simulated lives finish without dead ends and remain valid", () => {
  for (let seed = 0; seed < 500; seed++) {
    let s = createLife(seed);
    for (let step = 0; step < 30 && !s.done; step++) {
      const e = nextEvent(s);
      assert.ok(e);
      const choices = e.choices
        .map((c, i) => (available(s, c) ? i : -1))
        .filter((i) => i >= 0);
      assert.ok(choices.length, `dead end ${seed}:${e.id}`);
      s = choose(s, choices[(seed + step) % choices.length]);
      assert.ok(validateLife(s));
      for (const v of Object.values(s.stats)) assert.ok(v >= 0 && v <= 100);
    }
    assert.ok(s.done);
    assert.equal(s.age, 70);
  }
});
test("locked choices cannot be forced and free choices remain possible in deficit", () => {
  let s = createLife(0);
  s = choose(s, 1);
  s = choose(s, 2);
  assert.equal(choose(s, 1), s);
  const poor = { ...s, money: -100000 };
  assert.ok(available(poor, nextEvent(poor)!.choices[2]));
});
