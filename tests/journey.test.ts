import { storyChoiceLocked } from "../lib/game/journey/asset-stories.ts";
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createGameLife,
  journeyAction,
  validateLife,
  encodeLife,
  decodeLife,
} from "../lib/game.ts";
import { successChance } from "../lib/game/journey/chance.ts";
import { familyIncome, ageFamily } from "../lib/game/journey/family.ts";
import {
  annualExpenses,
  debtPayment,
  yearlyFinance,
  financeLocked,
} from "../lib/game/journey/finance.ts";
import {
  careerOffer,
  promotionEvent,
  relationshipEvent,
  milestoneEvent,
  randomStory,
} from "../lib/game/journey/events.ts";
import { replayJourney } from "../lib/game/journey/engine.ts";
import type { Life } from "../lib/game.ts";
function resolve(life: Life, prefer = 0): Life {
  if (life.simulation!.notice) return journeyAction(life, { type: "ack" });
  const event = life.journey!.pending;
  if (event) {
    let index = prefer % event.choices.length;
    if (storyChoiceLocked(life, event.choices[index]))
      index = event.choices.findIndex((c) => !storyChoiceLocked(life, c));
    assert.ok(index >= 0);
    return journeyAction(life, { type: "choice", index });
  }
  return journeyAction(life, { type: "year" });
}
function adult(): Life {
  for (let seed = 0; seed < 100; seed++) {
    let life = createGameLife(seed);
    for (let i = 0; i < 150 && !life.done; i++) {
      if (
        life.age >= 23 &&
        !life.simulation!.notice &&
        !life.journey!.pending &&
        life.money > 10000
      )
        return life;
      life = resolve(life);
    }
  }
  throw Error("No adult");
}
test("new rules auto years need no daily action; stage summary pauses before school", () => {
  let life = journeyAction(createGameLife(42), { type: "ack" });
  assert.equal(life.age, 0);
  for (let i = 0; i < 40 && life.age < 6; i++) life = resolve(life);
  assert.equal(life.age, 6);
  assert.equal(life.simulation!.notice!.id, "stage-6");
  assert.equal(life.journey!.pending!.id, "school");
  assert.equal(journeyAction(life, { type: "year" }), life);
  life = journeyAction(life, { type: "ack" });
  assert.equal(life.journey!.pending!.choices.length, 5);
  life = journeyAction(life, { type: "choice", index: 0 });
  assert.equal(life.journey!.school, "โรงเรียนรัฐบาล");
  assert.equal(journeyAction(life, { type: "activity", activity: "learn" }), life);
  assert.ok(validateLife(life));
});
test("100 new lifetimes have affordable choices, bounded skills, family changes and valid replay", () => {
  let parentsLost = 0,
    children = 0,
    promotions = 0,
    randomChoices = 0;
  for (let seed = 0; seed < 100; seed++) {
    let life = createGameLife(seed);
    for (let turn = 0; turn < 450 && !life.done; turn++) {
      const prior = life;
      life = resolve(life, seed % 5);
      assert.notEqual(life, prior);
      assert.ok(life.age >= prior.age && life.age - prior.age <= 1);
      assert.ok(life.money >= 0);
      assert.ok(life.journey!.debt >= 0);
      assert.ok(life.journey!.luck >= 0 && life.journey!.luck <= 100);
      for (const value of Object.values(life.journey!.skills))
        assert.ok(value >= 0 && value <= 100);
      if (life.journey!.pending) {
        assert.ok(life.journey!.pending.choices.length >= 5);
        randomChoices++;
      }
      if ((life.journey!.career?.rank || 0) > 0) promotions++;
    }
    assert.ok(life.done);
    assert.ok(life.age <= 110);
    assert.ok(validateLife(life));
    assert.deepEqual(decodeLife(encodeLife(life)), life);
    parentsLost += Object.values(life.journey!.parents).filter((p) => !p.alive).length;
    children += life.journey!.children.length;
  }
  assert.ok(parentsLost > 0);
  assert.ok(children > 0);
  assert.ok(promotions > 0);
  assert.ok(randomChoices > 100);
});
test("skill, status and luck increase displayed success probability and guaranteed choices stay certain", () => {
  const life = adult(),
    choice = careerOffer(life).choices[0];
  const low = structuredClone(life);
  low.journey!.skills.tech = 0;
  low.journey!.luck = 0;
  low.stats.social = 0;
  const high = structuredClone(low);
  high.journey!.skills.tech = 100;
  high.journey!.luck = 100;
  high.stats.social = 100;
  assert.ok(successChance(high, choice) > successChance(low, choice));
  assert.ok(successChance(high, choice) <= 95);
  const school = structuredClone(life);
  school.age = 6;
  assert.equal(successChance(school, milestoneEvent(school)!.choices[0]), 100);
});
test("career cannot be changed using old arbitrary job actions and promotion raises rank", () => {
  const life = adult();
  assert.equal(journeyAction(life, { type: "venture", id: "job-rider" }), life);
  for (let seed = 0; seed < 100; seed++) {
    const candidate = structuredClone(life);
    candidate.simulation!.notice = null;
    candidate.seed = seed;
    candidate.journey!.career = { id: "developer", rank: 0, since: 22 };
    candidate.journey!.skills.tech = 100;
    candidate.journey!.luck = 100;
    candidate.journey!.pending = promotionEvent(candidate);
    const next = journeyAction(candidate, { type: "choice", index: 0 });
    if (next.journey!.career!.rank === 1) {
      assert.equal(next.income, 405000);
      return;
    }
  }
  assert.fail("Expected a promotion");
});
test("loans disclose correct payments, accrue interest, and unpaid debt causes bankruptcy", () => {
  let life = adult();
  life.journey!.debt = 0;
  life.journey!.creditUntil = 0;
  life = journeyAction(life, { type: "venture", id: "loan" });
  assert.equal(life.journey!.debt, 50000);
  assert.equal(debtPayment(50000), 11800);
  life = journeyAction(life, { type: "ack" });
  assert.equal(journeyAction(life, { type: "venture", id: "loan" }), life);
  const broke = structuredClone(life);
  broke.money = 0;
  broke.income = 0;
  broke.journey!.arrears = 2;
  broke.journey!.children = [];
  broke.simulation!.economy!.fund = 10000;
  yearlyFinance(broke);
  assert.equal(broke.journey!.debt, 0);
  assert.equal(broke.simulation!.economy!.fund, 0);
  assert.equal(broke.journey!.creditUntil, broke.age + 8);
  assert.ok(financeLocked(broke, "loan"));
});
test("parents stop earning after death and children add annual costs", () => {
  const life = createGameLife(4);
  const initial = familyIncome(life);
  life.age = life.journey!.parents.father.deathAt;
  ageFamily(life);
  assert.equal(life.journey!.parents.father.alive, false);
  assert.ok(familyIncome(life) < initial);
  const count = life.journey!.queue.length;
  ageFamily(life);
  assert.equal(life.journey!.queue.length, count);
  life.age = 35;
  life.journey!.hasWorked = true;
  const cost = annualExpenses(life);
  life.journey!.children.push({ name: "ลูก", bornAt: 35 });
  assert.equal(annualExpenses(life), cost + 36000);
});
test("relationship decisions persist dating, marriage, children and separation", () => {
  let life = adult();
  life.journey!.luck = 100;
  life.journey!.skills.communication = 100;
  life.stats.social = 100;
  life.stats.health = 100;
  life.money = 200000;
  for (const kind of ["meet", "marry", "child"] as const) {
    let succeeded = false;
    for (let seed = 0; seed < 100; seed++) {
      const candidate = structuredClone(life);
      candidate.seed = seed;
      candidate.journey!.pending = relationshipEvent(candidate, kind);
      const next = journeyAction(candidate, { type: "choice", index: 0 });
      if (
        kind === "meet"
          ? !!next.journey!.partner
          : kind === "marry"
            ? next.journey!.partner?.status === "married"
            : next.journey!.children.length > 0
      ) {
        life = next;
        succeeded = true;
        break;
      }
    }
    assert.ok(succeeded);
  }
  while (life.simulation!.notice) life = journeyAction(life, { type: "ack" });
  life.journey!.pending = relationshipEvent(life, "breakup");
  life = journeyAction(life, { type: "choice", index: 3 });
  assert.equal(life.journey!.partner!.status, "separated");
  assert.equal(life.journey!.children.length, 1);
});
test("random stories have unique, event-specific choices and forged action recipes are rejected", () => {
  const life = adult(),
    ids = new Set<string>(),
    labels = new Set<string>();
  for (let seed = 0; seed < 100; seed++) {
    life.seed = seed;
    const e = randomStory(life);
    ids.add(e.id.split("-")[0]);
    assert.ok(e.choices.length >= 5);
    for (const c of e.choices) labels.add(c.label);
  }
  assert.ok(ids.size >= 6);
  assert.ok(labels.size >= 25);
  assert.equal(replayJourney(1, "Test", [{ type: "venture", id: "job-rider" }]), null);
  assert.equal(replayJourney(1, "Test", [{ type: "ack", extra: true }]), null);
});

test("new finance transactions preserve replay and shared state without result popups", () => {
  let life = adult();
  for (const id of ["fund", "sell-fund", "basic"]) {
    if (financeLocked(life, id)) continue;
    life = journeyAction(life, { type: "venture", id });
    assert.equal(life.simulation!.notice, null);
    assert.ok(validateLife(life));
    assert.deepEqual(decodeLife(encodeLife(life)), life);
  }
});
