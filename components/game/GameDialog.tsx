import { decisionCount } from "@/lib/game/summary";
import { writeAutosavePreference, challengeLink } from "@/lib/browser/life-storage";
import { ArrowRight, Check, Download, Link as LinkIcon, Share2, X } from "lucide-react";

import type { LifeGameController } from "@/hooks/useLifeGame";
export default function GameDialog({
  modal,
  setModal,
  life,
  shareUrl,
  copied,
  copy,
  setToast,
  setShareUrl,
  setCopied,
  name,
  setName,
  download,
  start,
  auto,
  setAuto,
}: Pick<
  LifeGameController,
  | "modal"
  | "setModal"
  | "life"
  | "shareUrl"
  | "copied"
  | "copy"
  | "setToast"
  | "setShareUrl"
  | "setCopied"
  | "name"
  | "setName"
  | "download"
  | "start"
  | "auto"
  | "setAuto"
>) {
  return (
    <div className="modal-backdrop" onClick={() => setModal("")}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="modal"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") setModal("");
          if (e.key === "Tab") {
            const nodes = e.currentTarget.querySelectorAll<HTMLElement>(
              "button:not(:disabled),input,textarea,a",
            );
            const first = nodes[0],
              last = nodes[nodes.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last?.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first?.focus();
            }
          }
        }}
      >
        <button
          autoFocus
          className="close icon-button"
          onClick={() => setModal("")}
          aria-label="ปิด"
        >
          <X size={20} />
        </button>
        <div className="eyebrow">YOUR LIFE, YOUR STORY</div>
        <h2 id="modal-title">
          {modal === "share"
            ? "ส่งเรื่องราวให้เพื่อน"
            : modal === "restart"
              ? "พร้อมสำหรับชีวิตใหม่?"
              : "ตั้งค่าการบันทึก"}
        </h2>
        {modal === "share" ? (
          <>
            <p>
              ลิงก์นี้มีชื่อและประวัติการตัดสินใจของคุณ
              ผู้ที่ได้รับลิงก์สามารถอ่านเรื่องราวได้โดยไม่ต้องเข้าสู่ระบบ
            </p>
            <div className="share-preview">
              <span>LITTLE LIFE</span>
              <h3>
                {life?.name} · {life?.age} ปี
              </h3>
              <p>
                {life?.province} → {life?.location}
              </p>
              <strong>{life ? decisionCount(life) : 0} ทางเลือก สู่หนึ่งเรื่องราว</strong>
            </div>
            <label>
              ลิงก์เรื่องราว
              <textarea readOnly value={shareUrl} onFocus={(e) => e.target.select()} />
            </label>
            <div className="modal-actions">
              <button className="button green" onClick={copy}>
                {copied ? <Check size={17} /> : <LinkIcon size={17} />}{" "}
                {copied ? "คัดลอกแล้ว" : "คัดลอกลิงก์"}
              </button>
              <button
                className="button outline"
                onClick={async () => {
                  try {
                    if (navigator.share)
                      await navigator.share({
                        title: "ชีวิตจิ๋ว",
                        text: `เรื่องราวของ${life?.name}`,
                        url: shareUrl,
                      });
                    else await copy();
                  } catch (error) {
                    if ((error as Error).name !== "AbortError")
                      setToast("แชร์ไม่สำเร็จ ลองคัดลอกลิงก์แทน");
                  }
                }}
              >
                <Share2 size={17} /> แชร์
              </button>
            </div>
            <button
              className="text-button"
              onClick={() => {
                if (life) setShareUrl(challengeLink(life));
                setCopied(false);
              }}
            >
              เปลี่ยนเป็นลิงก์ชวนเล่นด้วยจุดเริ่มต้นเดียวกัน
            </button>
            <small>
              การส่งให้เพื่อนต่างเครื่องต้องนำเว็บขึ้นโฮสต์ก่อน ลิงก์ localhost
              เปิดได้เฉพาะเครื่องนี้ หากแอปแชตจำกัดความยาวลิงก์ ให้ส่งไฟล์ชีวิตแทน
            </small>
          </>
        ) : modal === "restart" ? (
          <>
            <p>
              ชีวิตปัจจุบันจะถูกแทนที่เมื่อเปิดบันทึกอัตโนมัติ
              แนะนำให้ส่งออกไฟล์เก็บไว้ก่อน
            </p>
            <label>
              ชื่อของคุณ
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={30}
              />
            </label>
            <div className="modal-actions">
              <button className="button outline" onClick={download}>
                สำรองชีวิตเดิม
              </button>
              <button className="button green" onClick={start}>
                เริ่มชีวิตใหม่ <ArrowRight size={17} />
              </button>
            </div>
          </>
        ) : (
          <>
            <p>
              ประวัติชีวิตเก็บใน localStorage ส่วน cookie จำเฉพาะการตั้งค่าบันทึก
              ไม่ส่งข้อมูลไปยังเซิร์ฟเวอร์
            </p>
            <label className="toggle">
              <input
                type="checkbox"
                checked={auto}
                onChange={(e) => {
                  setAuto(e.target.checked);
                  writeAutosavePreference(e.target.checked);
                }}
              />
              บันทึกอัตโนมัติ
            </label>
            <p>
              หากล้างข้อมูลเบราว์เซอร์หรือใช้โหมดส่วนตัว ข้อมูลอาจหายได้
              ส่งออกไฟล์เพื่อเก็บสำรอง
            </p>
            <button className="button outline" disabled={!life} onClick={download}>
              <Download size={16} /> ส่งออกไฟล์สำรอง
            </button>
          </>
        )}
      </section>
    </div>
  );
}
