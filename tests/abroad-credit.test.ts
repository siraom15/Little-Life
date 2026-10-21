import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createGameLife,
  journeyAction,
  replayJourney,
} from "../lib/game/journey/engine.ts";
import { abroadEvent, countryNames } from "../lib/game/journey/abroad.ts";
import { choiceCredit } from "../lib/game/journey/choice-credit.ts";
import { careerIncome } from "../lib/game/journey/catalog.ts";
import { gameConfig } from "../lib/game/journey/config.ts";
import { applyVenture } from "../lib/game/economy.ts";
import { randomAt } from "../lib/game/random.ts";
import { lifeHighlights } from "../lib/game/journey/achievements.ts";
function fixture() {
  const l = createGameLife(42);
  l.age = 30;
  l.simulation!.notice = null;
  l.money = 1000;
  return l;
}
test("three destinations offer higher pay and successful migration applies country job and scene", () => {
  for (const country of countryNames) {
    let l = fixture();
    l.money = 100000;
    l.journey!.pending = abroadEvent(l);
    const choice = l.journey!.pending.choices.find(
      (c) => c.success.location === country,
    )!;
    choice.chance = undefined;
    assert.ok(
      careerIncome(gameConfig.abroad.countries[country].job, 0, country) >
        careerIncome(gameConfig.abroad.countries[country].job, 0),
    );
    l = journeyAction(l, {
      type: "choice",
      index: l.journey!.pending.choices.indexOf(choice),
    });
    assert.equal(l.location, country);
    assert.equal(l.journey!.career!.id, gameConfig.abroad.countries[country].job);
    assert.equal(l.income, careerIncome(l.journey!.career!.id, 0, country));
    assert.equal(l.simulation!.notice!.scene, "travel");
    assert.equal(abroadEvent(l).choices.length, 5);
  }
});
test("borrowing requires explicit confirmation, pays only shortfall, and cannot repeat", () => {
  const l = fixture();
  l.journey!.pending = abroadEvent(l);
  const c = l.journey!.pending.choices[0];
  c.chance = undefined;
  const quote = choiceCredit(l, c)!;
  assert.equal(quote.amount, c.cost! - 1000);
  assert.equal(journeyAction(l, { type: "choice", index: 0 }), l);
  const next = journeyAction(l, { type: "choice", index: 0, borrow: true });
  assert.equal(next.money, 0);
  assert.equal(next.journey!.debt, quote.amount);
  assert.equal(next.history.filter((e) => e.id.startsWith("choice-loan")).length, 1);
  assert.equal(journeyAction(next, { type: "choice", index: 0, borrow: true }), next);
  l.journey!.creditUntil = 40;
  assert.equal(choiceCredit(l, c), null);
  assert.equal(journeyAction(l, { type: "choice", index: 0, borrow: true }), l);
});
test("birth stats are seeded and do not reset after a choice", () => {
  const a = createGameLife(1),
    b = createGameLife(2);
  assert.deepEqual(a.stats, createGameLife(1).stats);
  assert.notDeepEqual(a.stats, b.stats);
  const l = fixture();
  l.stats.health = 42;
  l.journey!.pending = abroadEvent(l);
  const next = journeyAction(l, { type: "choice", index: 4 });
  assert.equal(next.stats.health, 42);
});
test("lottery winner receives eight million less ticket price", () => {
  const l = fixture();
  while (randomAt(l.seed, l.age, 31) >= gameConfig.lottery.chance) l.seed++;
  const before = l.money;
  assert.ok(applyVenture(l, "lottery"));
  assert.equal(l.money - before, 8000000 - 80);
});
test("short film skips routine expenses and keeps important scenes in order", () => {
  const l = fixture();
  l.history = [
    {
      id: "routine",
      age: 10,
      title: "ค่าใช้จ่าย",
      choice: "จ่าย",
      detail: "",
      category: "การเงิน",
      money: 0,
    },
    {
      id: "wedding",
      age: 25,
      title: "แต่งงาน",
      choice: "เริ่มครอบครัว",
      detail: "สำเร็จ",
      category: "ครอบครัว",
      money: 0,
    },
    {
      id: "promotion",
      age: 28,
      title: "เลื่อนตำแหน่ง",
      choice: "รับงาน",
      detail: "สำเร็จ",
      category: "งาน",
      money: 0,
    },
  ];
  assert.deepEqual(
    lifeHighlights(l).map((e) => e.id),
    ["birth", "wedding", "promotion", "death"],
  );
});

test("loan cannot bypass asset age requirements or borrow when already affordable", () => {
  const l = fixture();
  const choice = {
    label: "รถ",
    detail: "",
    cost: 100000,
    success: {},
    assetAction: "car:compact:cash",
  };
  l.age = 12;
  assert.equal(choiceCredit(l, choice), null);
  l.money = 1000000;
  assert.equal(choiceCredit(l, abroadEvent(l).choices[0]), null);
  l.money = 0;
  const expensive = { label: "ค่าใช้จ่าย", detail: "", cost: 1000000, success: {} };
  assert.equal(choiceCredit(l, expensive)!.amount, 1000000);
  assert.equal(choiceCredit(l, expensive)!.bankruptcyRisk, true);
});
test("confirmed education loan survives replay without accepting extra action fields", () => {
  let seed = 0;
  while (createGameLife(seed).money > 20000) seed++;
  let life = createGameLife(seed);
  for (let i = 0; i < 70 && life.age < 7; i++) {
    if (life.simulation!.notice) {
      life = journeyAction(life, { type: "ack" });
      continue;
    }
    const event = life.journey!.pending;
    if (event) {
      const index = event.choices.findIndex((c) => choiceCredit(life, c));
      if (index >= 0) {
        life = journeyAction(life, { type: "choice", index, borrow: true });
        assert.deepEqual(
          replayJourney(life.seed, life.name, life.simulation!.actions),
          life,
        );
        assert.equal(
          replayJourney(life.seed, life.name, [
            ...life.simulation!.actions.slice(0, -1),
            { type: "choice", index, borrow: true, amount: 1 },
          ]),
          null,
        );
        return;
      }
      life = journeyAction(life, { type: "choice", index: 0 });
    } else life = journeyAction(life, { type: "year" });
  }
  assert.fail("Expected an education choice requiring a loan");
});
