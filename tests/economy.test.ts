import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createNewLife,
  acknowledgeNotice,
  advanceYear,
  choose,
  available,
  nextEvent,
  validateLife,
  encodeLife,
  decodeLife,
} from "../lib/game.ts";
import { applyAction } from "../lib/game/simulation.ts";
import { events } from "../lib/game/expanded-events.ts";
import { careers } from "../lib/game/careers.ts";
import {
  emptyEconomy,
  settleEconomyYear,
  settleDeathBenefit,
  ventureLockedReason,
} from "../lib/game/economy.ts";
import { noticeChoices } from "../lib/game/notice-choices.ts";
import { randomEvents } from "../lib/game/random-events.ts";
import type { Life } from "../lib/game.ts";
function adult(): Life {
  for (let seed = 0; seed < 100; seed++) {
    let life = createNewLife(seed);
    for (let turn = 0; turn < 100 && !life.done; turn++) {
      if (life.simulation?.notice) {
        life = acknowledgeNotice(life);
        continue;
      }
      const event = nextEvent(life);
      if (event) {
        life = choose(
          life,
          event.choices.findIndex((c) => available(life, c)),
        );
        continue;
      }
      if (life.age >= 24 && life.money > 40000) return life;
      life = advanceYear(life);
    }
  }
  throw new Error("No adult fixture");
}
const venture = (life: Life, id: string) => applyAction(life, { type: "venture", id });
test("all milestones offer five choices and eight distinct careers exist", () => {
  assert.ok(events.every((e) => e.choices.length >= 5));
  assert.ok(careers.length >= 8);
  for (const e of events)
    assert.equal(new Set(e.choices.map((c) => c.label)).size, e.choices.length);
});
test("investment purchase, annual valuation and sale replay without creating money", () => {
  let life = adult(),
    initial = life.money;
  life = venture(life, "fund");
  assert.equal(life.money, initial - 10000);
  assert.equal(life.simulation!.economy!.fund, 10000);
  life = acknowledgeNotice(life);
  assert.equal(venture(life, "fund"), life);
  life = advanceYear(life);
  assert.ok(
    life.simulation!.economy!.fund >= 8800 && life.simulation!.economy!.fund <= 11800,
  );
  if (life.simulation!.notice) life = acknowledgeNotice(life);
  if (nextEvent(life)) life = choose(life, 0);
  const money = life.money,
    holding = life.simulation!.economy!.fund;
  life = venture(life, "sell-fund");
  assert.equal(life.money, money + holding);
  assert.equal(life.simulation!.economy!.fund, 0);
  assert.ok(validateLife(life));
  assert.deepEqual(decodeLife(encodeLife(life)), life);
});
test("lottery is age gated and cannot be bought twice in one year", () => {
  let young = acknowledgeNotice(createNewLife(1));
  assert.equal(venture(young, "lottery"), young);
  let life = adult(),
    money = life.money;
  life = venture(life, "lottery");
  assert.ok([money - 80, money - 80 + 4000].includes(life.money));
  life = acknowledgeNotice(life);
  assert.equal(venture(life, "lottery"), life);
  assert.ok(validateLife(life));
});
test("insurance charges renewal, lapses without money and pays beneficiaries once", () => {
  let life = adult();
  life = venture(life, "basic");
  assert.equal(life.simulation!.economy!.policy, "basic");
  assert.ok(validateLife(life));
  const fixture = structuredClone(life);
  fixture.age++;
  fixture.money = 5000;
  settleEconomyYear(fixture);
  assert.equal(fixture.money, 2000);
  settleDeathBenefit(fixture);
  assert.equal(fixture.simulation!.economy!.beneficiaryPayout, 150000);
  assert.equal(fixture.money, 2000);
  settleDeathBenefit(fixture);
  assert.equal(fixture.simulation!.economy!.beneficiaryPayout, 150000);
  const lapse = structuredClone(life);
  lapse.age++;
  lapse.money = 0;
  settleEconomyYear(lapse);
  assert.equal(lapse.simulation!.economy!.policy, "none");
  settleDeathBenefit(lapse);
  assert.equal(lapse.simulation!.economy!.beneficiaryPayout, 0);
});
test("dark route has enforceable prison and job loss; politics requires reputation", () => {
  let life = adult();
  assert.ok(ventureLockedReason(life, "campaign"));
  assert.ok(ventureLockedReason(life, "corrupt"));
  let arrested = false;
  for (let seed = 0; seed < 100; seed++) {
    const fixture = structuredClone(life);
    fixture.seed = seed;
    fixture.simulation!.economy = { ...emptyEconomy(), heat: 100 };
    settleEconomyYear(fixture);
    if (fixture.simulation!.economy!.prisonUntil > fixture.age) {
      arrested = true;
      assert.equal(fixture.income, 0);
      assert.ok(ventureLockedReason(fixture, "job-rider"));
      assert.equal(fixture.simulation!.notice!.id, "arrest-" + fixture.age);
      break;
    }
  }
  assert.ok(arrested);
});
test("career changes are yearly and investments reject insufficient funds", () => {
  let life = adult();
  life = acknowledgeNotice(venture(life, "job-rider"));
  assert.equal(life.job, "ไรเดอร์");
  assert.equal(life.income, 204000);
  assert.equal(venture(life, "job-creator"), life);
  assert.ok(validateLife(life));
  const broke = structuredClone(life);
  broke.money = 0;
  assert.equal(venture(broke, "fund"), broke);
});
test("every random event has five responses and responses are saved", () => {
  for (const event of randomEvents) {
    const fixture = createNewLife(1);
    fixture.age = event.minAge;
    fixture.simulation!.notice = {
      id: event.id + "-" + fixture.age,
      title: event.title,
      text: event.text,
      scene: event.scene,
      effects: event.effects,
    };
    assert.equal(noticeChoices(fixture).length, 5);
  }
  let life = acknowledgeNotice(createNewLife(1));
  for (let i = 0; i < 100 && !life.done; i++) {
    if (noticeChoices(life).length) {
      life = applyAction(life, { type: "notice-choice", index: 0 });
      assert.equal(life.simulation!.notice, null);
      assert.ok(validateLife(life));
      assert.deepEqual(decodeLife(encodeLife(life)), life);
      return;
    }
    if (life.simulation!.notice) life = acknowledgeNotice(life);
    else if (nextEvent(life)) life = choose(life, 0);
    else life = advanceYear(life);
  }
  assert.fail("Expected a random event");
});
