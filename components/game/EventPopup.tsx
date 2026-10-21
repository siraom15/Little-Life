"use client";
import { noticeChoices } from "@/lib/game/notice-choices";
import ChoiceButton from "./ChoiceButton";
import { useEffect, useRef } from "react";
import type { Life } from "@/lib/game";
import SceneIllustration from "../scene/SceneIllustration";
export default function EventPopup({
  life,
  onContinue,
  onChoice,
}: {
  life: Life;
  onContinue: () => void;
  onChoice: (index: number) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const notice = life.simulation?.notice;
  useEffect(() => {
    const element = dialog.current;
    if (element && !element.open) element.showModal();
    return () => {
      if (element?.open) element.close();
    };
  }, [notice?.id]);
  if (!notice) return null;
  return (
    <dialog
      ref={dialog}
      className={`event-dialog ${notice.scene === "death" ? "is-death" : ""}`}
      aria-labelledby="notice-title"
      onCancel={(e) => e.preventDefault()}
    >
      <div className="notice-label">
        {notice.scene === "death"
          ? "END OF A LITTLE LIFE"
          : notice.id === "birth"
            ? "NEW PLAYER BORN"
            : "SURPRISE EVENT"}
        <span>อายุ {life.age} ปี</span>
      </div>
      <div className="notice-scene">
        <SceneIllustration life={life} kind={notice.scene} />
      </div>
      <div className="notice-content">
        <h2 id="notice-title">{notice.title}</h2>
        <p>{notice.text}</p>
        <div className="notice-effects">{notice.effects}</div>
        {noticeChoices(life).length > 0 && (
          <div className="choices notice-choices">
            {noticeChoices(life).map((choice, index) => (
              <ChoiceButton
                key={index}
                choice={choice}
                locked={
                  (choice.cost || 0) > 0 && (choice.cost || 0) > life.money
                    ? "เงินไม่พอ"
                    : null
                }
                onClick={() => onChoice(index)}
              />
            ))}
          </div>
        )}
        {noticeChoices(life).length === 0 && (
          <button autoFocus className="button green" onClick={onContinue}>
            {notice.scene === "death"
              ? "ดูบทสรุปชีวิต"
              : notice.id === "birth"
                ? "เริ่มการผจญภัย"
                : "รับรู้แล้ว · ไปต่อ"}{" "}
            ▸
          </button>
        )}
        <small>เวลาหยุดอยู่ระหว่างอ่านเหตุการณ์</small>
      </div>
    </dialog>
  );
}
