"use client";
import { Settings, Share2 } from "lucide-react";

import type { LifeGameController } from "@/hooks/useLifeGame";
export default function GameHeader({
  shared,
  auto,
  setModal,
  openShare,
  life,
}: Pick<LifeGameController, "shared" | "auto" | "setModal" | "openShare" | "life">) {
  return (
    <header>
      <a className="brand" href="/" aria-label="หน้าแรก">
        <span className="brand-icon">✦</span>
        <span>
          ชีวิตจิ๋ว<small>LITTLE LIFE · BIG CHOICES</small>
        </span>
      </a>
      <div className="header-right">
        <span className="local-badge">
          <i />{" "}
          {shared
            ? "กำลังดูชีวิตของเพื่อน"
            : auto
              ? "บันทึกอัตโนมัติในเครื่อง"
              : "บันทึกด้วยตัวเอง"}
        </span>
        <button
          className="icon-button"
          aria-label="ตั้งค่าการบันทึก"
          onClick={() => setModal("settings")}
        >
          <Settings size={19} />
        </button>
        <button className="button dark small" onClick={openShare} disabled={!life}>
          <Share2 size={15} /> แชร์ชีวิต
        </button>
      </div>
    </header>
  );
}
