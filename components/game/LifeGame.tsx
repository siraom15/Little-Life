"use client";
import ThemeMusic from "./ThemeMusic";
import { randomCharacterName } from "@/lib/game/names";
import MoneyChange from "../journey/MoneyChange";
import SelfScreen from "../journey/SelfScreen";
import { isImprisoned } from "@/lib/game/journey/police";
import { useState, useEffect } from "react";
import { useLifeGame } from "@/hooks/useLifeGame";
import { useGameClock } from "@/hooks/useGameClock";
import { journeyAction } from "@/lib/game";
import { baht } from "@/lib/format";
import {
  UserRound,
  Users,
  Wallet,
  Settings,
  Share2,
  RotateCcw,
  Upload,
  Gamepad2,
} from "lucide-react";
import TimeBar from "./TimeBar";
import GameDialog from "./GameDialog";
import StoryNotice from "../journey/StoryNotice";
import LifeScene from "../LifeScene";
import LifeScreen from "../journey/LifeScreen";
import FamilyScreen from "../journey/FamilyScreen";
import FinanceScreen from "../journey/FinanceScreen";
export default function LifeGame() {
  const game = useLifeGame(),
    { life, setLife, shared, modal, setModal, input, ready, name, setName, start } = game;
  const [tab, setTab] = useState<"life" | "family" | "money" | "self">("life");
  const imprisoned = !!life && isImprisoned(life);
  const clock = useGameClock(life, setLife, shared || !!modal || tab !== "life", shared);
  useEffect(() => {
    setTab("life");
    clock.setRunning(true);
  }, [life?.seed]);
  useEffect(() => {
    if (imprisoned) {
      setTab("life");
      clock.setRunning(true);
    }
  }, [imprisoned]);
  return (
    <div className="journey-app">
      <header className="compact-header">
        <ThemeMusic />
        <strong>
          ชีวิตจิ๋ว <small>หนึ่งชีวิต หลายทางเลือก</small>
        </strong>
        <div>
          <button
            aria-label="แชร์ชีวิต"
            disabled={!life || imprisoned}
            onClick={game.openShare}
          >
            <Share2 size={19} />
          </button>
          <button
            aria-label="ตัวฉันและตั้งค่า"
            disabled={imprisoned}
            onClick={() => (life ? setTab("self") : setModal("settings"))}
          >
            <Settings size={19} />
          </button>
          <button
            aria-label="เริ่มชีวิตใหม่"
            disabled={imprisoned}
            onClick={() => setModal("restart")}
          >
            <RotateCcw size={19} />
          </button>
        </div>
      </header>
      {!ready ? (
        <main className="start-screen">กำลังเปิดเรื่องราว…</main>
      ) : !life ? (
        <main className="start-screen">
          <div className="start-mark">✦</div>
          <h1>
            ปล่อยชีวิตเดิน
            <br />
            เลือกเมื่อถึงเวลาของคุณ
          </h1>
          <p>
            เริ่มจากทารก เรียน ทำงาน พบคนรัก
            <br />
            ทักษะช่วยเปิดทาง ดวงช่วยพลิกชีวิต
          </p>
          <label>
            ชื่อของคุณ
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
            />
          </label>
          <button
            className="finance-action"
            onClick={() => setName(randomCharacterName())}
          >
            🎲 สุ่มชื่อใหม่
          </button>
          <button className="primary-action" onClick={start}>
            เริ่มชีวิตใหม่
          </button>
          <button className="finance-action" onClick={() => input.current?.click()}>
            <Upload size={16} /> นำเข้าไฟล์ชีวิต
          </button>
          <small>กติกาใหม่ · การเงินท้าทาย · เวลาเดินอัตโนมัติ</small>
        </main>
      ) : (
        <>
          <section className="compact-hud">
            <div className="identity-row">
              <strong>
                {life.name} <span>{life.age} ปี</span>
              </strong>
              <b>
                ฿{baht(life.money)}{" "}
                <MoneyChange amount={life.journey!.moneyChange || 0} />
              </b>
            </div>
            <div className="status-grid">
              {[
                { label: "สุขภาพ", value: life.stats.health, color: "#6bcfa8" },
                { label: "ความสุข", value: life.stats.happy, color: "#ecc777" },
                { label: "สัมพันธ์", value: life.stats.social, color: "#75afd2" },
                { label: "ดวงปีนี้", value: life.journey!.luck, color: "#8ec7ff" },
              ].map((stat) => (
                <div key={stat.label}>
                  <span>
                    {stat.label}
                    <b>{stat.value}</b>
                  </span>
                  <div className="status-track">
                    <i style={{ width: stat.value + "%", background: stat.color }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
          <TimeBar life={life} clock={clock} shared={shared} />
          <main className={"journey-main tab-" + tab}>
            {tab === "life" ? (
              <>
                <LifeScene life={life} />
                <div className="journey-scroll">
                  <LifeScreen
                    life={life}
                    setLife={setLife}
                    shared={shared}
                    restart={() => setModal("restart")}
                  />
                </div>
              </>
            ) : (
              <div className="journey-scroll">
                {tab === "family" ? (
                  <FamilyScreen life={life} />
                ) : tab === "self" ? (
                  <SelfScreen
                    life={life}
                    auto={game.auto}
                    shared={shared}
                    onSettings={() => setModal("settings")}
                    onRestart={() => setModal("restart")}
                    onImport={() => input.current?.click()}
                    onExport={game.download}
                  />
                ) : (
                  <FinanceScreen life={life} setLife={setLife} shared={shared} />
                )}
              </div>
            )}
          </main>
          <nav className="bottom-nav" aria-label="ส่วนต่าง ๆ ของชีวิต">
            {[
              { id: "life", label: "ชีวิต", Icon: Gamepad2 },
              { id: "family", label: "คนรอบตัว", Icon: Users },
              { id: "money", label: "การเงิน", Icon: Wallet },
              { id: "self", label: "ตัวฉัน", Icon: UserRound },
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                disabled={imprisoned && !shared && id !== "life"}
                aria-current={tab === id ? "page" : undefined}
                onClick={() => setTab(id as typeof tab)}
              >
                <Icon size={21} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </>
      )}
      <input
        hidden
        type="file"
        ref={input}
        accept=".json,application/json"
        onChange={(e) => game.importFile(e.target.files?.[0])}
      />
      {game.toast && (
        <div className="toast" role="status">
          {game.toast}
        </div>
      )}
      {life?.simulation?.notice && !shared && !modal && (
        <StoryNotice
          life={life}
          onContinue={() =>
            setLife((current) =>
              current ? journeyAction(current, { type: "ack" }) : current,
            )
          }
        />
      )}
      {modal && <GameDialog {...game} />}
    </div>
  );
}
