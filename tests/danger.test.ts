import {test} from "node:test";
import assert from "node:assert/strict";
import {createGameLife,journeyAction} from "../lib/game/journey/engine.ts";
import {raidChance,agePoliceExposure} from "../lib/game/journey/police.ts";
import {accidentTypes,eligibleAccidents,resolveAccident,yearlyAccident} from "../lib/game/journey/accidents.ts";
import {gameConfig} from "../lib/game/journey/config.ts";
import {randomAt} from "../lib/game/random.ts";
function fixture(){const life=createGameLife(0);life.age=30;life.simulation!.notice=null;life.journey!.pending=null;life.journey!.queue=[];life.money=1000000;life.stats.health=90;return life;}
test("heat 100 guarantees raids; exposure adds risk each year without targeting innocent characters",()=>{
 const l=fixture(),e=l.simulation!.economy!;assert.equal(raidChance(l),0);e.heat=20;const before=raidChance(l);agePoliceExposure(l);assert.ok(Math.abs(raidChance(l)-before-gameConfig.dark.raidIncreasePerYear)<1e-9);
 l.journey!.policeExposureYears=100;assert.ok(raidChance(l)<1);e.heat=100;assert.equal(raidChance(l),1);e.heat=0;agePoliceExposure(l);assert.equal(l.journey!.policeExposureYears,0);assert.equal(raidChance(l),0);
 e.heat=100;e.prisonUntil=40;assert.equal(raidChance(l),0);
});
test("annual engine never skips a heat-100 raid for a surviving free adult",()=>{
 for(let seed=0;seed<50;seed++){const l=fixture();l.seed=seed;l.simulation!.economy!.heat=100;const next=journeyAction(l,{type:"year"});if(!next.done)assert.ok(next.journey!.pending?.id.startsWith("raid-"));}
});
test("all five accidents have severe survival costs, recovery time, history and scene metadata",()=>{
 assert.equal(accidentTypes.length,5);
 for(const kind of accidentTypes){const l=fixture();while(randomAt(l.seed,30,292)<gameConfig.accidents.fatalChance)l.seed++;l.money=500000;l.simulation!.economy!.fund=500000;const before=l.money+l.simulation!.economy!.fund;const result=resolveAccident(l,kind.id);assert.equal(result.fatal,false);assert.equal(result.notice.accident,kind.id);const lost=before-l.money-l.simulation!.economy!.fund;assert.ok(lost>=before*.65 && lost<=before*.9);assert.equal(l.journey!.health.hospitalUntil,32);assert.equal(l.stats.health,45);assert.match(result.notice.effects,/ค่ารักษา/);assert.equal(l.history.at(-1)!.category,"อุบัติเหตุ");assert.equal(l.journey!.investment.withdrawn,500000-l.simulation!.economy!.fund);}
});
test("unaffordable emergency bills create debt, and external accidents never occur in prison or hospital",()=>{
 const l=fixture();while(randomAt(l.seed,30,292)<gameConfig.accidents.fatalChance)l.seed++;l.money=100;resolveAccident(l,"car");assert.equal(l.money,0);assert.equal(l.journey!.debt,gameConfig.accidents.minimumBill-100);assert.equal(yearlyAccident(l),null);l.journey!.health.hospitalUntil=-1;l.simulation!.economy!.prisonUntil=40;assert.equal(yearlyAccident(l),null);l.age=1;assert.equal(eligibleAccidents(l).length,0);
});
test("fatal accidents show their scene before the death summary, with the correct cause",()=>{
 const l=fixture();let next=l;
 for(let seed=0;seed<10000;seed++){if(randomAt(seed,31,290)>=gameConfig.accidents.annualChance || randomAt(seed,31,292)>=gameConfig.accidents.fatalChance)continue;l.seed=seed;next=journeyAction(l,{type:"year"});if(next.simulation!.notice?.accident)break;}
 assert.ok(next.done);assert.ok(next.simulation!.notice?.accident);assert.match(next.simulation!.death!.cause,/เสียชีวิตจาก/);assert.equal(next.journey!.queue[0].id,"death");next=journeyAction(next,{type:"ack"});assert.equal(next.simulation!.notice!.id,"death");next=journeyAction(next,{type:"ack"});assert.equal(next.simulation!.notice,null);
});
test("serious-disease incidence increased across all age bands",()=>{assert.equal(gameConfig.diseases.incidenceYoung,0.006);assert.equal(gameConfig.diseases.incidenceAdult,0.024);assert.equal(gameConfig.diseases.incidenceOlder,0.07);});
