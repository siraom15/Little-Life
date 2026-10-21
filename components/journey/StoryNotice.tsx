"use client";
import { useEffect, useRef } from "react";
import type { Life } from "@/lib/game";
import SceneIllustration from "../scene/SceneIllustration";
export default function StoryNotice({
  life,
  onContinue,
}: {
  life: Life;
  onContinue: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    notice = life.simulation?.notice;
  useEffect(() => {
    const node = dialog.current;
    if (node && !node.open) node.showModal();
    return () => {
      if (node?.open) node.close();
    };
  }, [notice?.id]);
  if (!notice) return null;
  const stage = notice.id.startsWith("stage-");
  return (
    <dialog
      ref={dialog}
      className="event-dialog"
      aria-labelledby="story-notice-title"
      onCancel={(event) => event.preventDefault()}
    >
      <div className="notice-label">
        <span>
          {notice.id === "birth"
            ? "เริ่มต้นชีวิต"
            : notice.id === "death"
              ? "บทสรุปชีวิต"
              : stage
                ? "สรุปช่วงวัย"
                : "เรื่องสำคัญของชีวิต"}
        </span>
        <span>{life.age} ปี</span>
      </div>
      <div className="notice-scene">
        <SceneIllustration life={life} kind={notice.scene} />
      </div>
      <div className="notice-content">
        <h2 id="story-notice-title">{notice.title}</h2>
        <p>{notice.text}</p>
        <div className="notice-effects">{notice.effects}</div>
        <button autoFocus className="button" onClick={onContinue}>
          {notice.id === "death"
            ? "ดูเรื่องราวของฉัน"
            : notice.id === "birth"
              ? "เริ่มชีวิต"
              : "เดินทางต่อ"}
        </button>
        <small>เวลาหยุดระหว่างอ่าน · กดต่อแล้วชีวิตจะเดินเอง</small>
      </div>
    </dialog>
  );
}
