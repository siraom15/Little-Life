"use client";
import { useEffect, useState } from "react";
import { encodeLife, decodeLife, type Life } from "@/lib/game";
import { loadLife, storyLink } from "@/lib/browser/life-storage";
import { endingAchievements } from "@/lib/game/journey/achievements";
import { endingCardSvg } from "@/lib/game/journey/ending-card";
import EndingDetails from "./EndingDetails";
import LifeFilm from "./LifeFilm";
export default function EndingPage() {
  const [life, setLife] = useState<Life | null>(null),
    [ready, setReady] = useState(false),
    [film, setFilm] = useState(false),
    [details, setDetails] = useState(false),
    [message, setMessage] = useState(""),
    [url, setUrl] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    try {
      const hash = new URLSearchParams(location.hash.slice(1));
      const value = hash.has("life") ? decodeLife(hash.get("life") || "") : loadLife();
      if (value?.done) setLife(value);
    } catch {
      setMessage("อ่านบทสรุปนี้ไม่ได้");
    }
    setReady(true);
  }, []);
  if (!ready) return <main className="ending-page">กำลังเปิดสมุดความทรงจำ…</main>;
  if (!life)
    return (
      <main className="ending-page">
        <h1>ยังไม่มีบทสรุปชีวิต</h1>
        <p>{message || "เล่นจนจบชีวิต แล้วกลับมาพบกันที่นี่"}</p>
        <a href="/">กลับไปเล่น</a>
      </main>
    );
  const svg = endingCardSvg(life),
    source = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  async function share() {
    try {
      const link = storyLink(life!);
      setUrl(link);
      if (navigator.share)
        await navigator.share({
          title: "ชีวิตจิ๋ว: " + life!.name,
          text: "หนึ่งชีวิต หลายความทรงจำ",
          url: link,
        });
      else {
        await navigator.clipboard.writeText(link);
        setMessage("คัดลอกลิงก์แล้ว ส่งให้เพื่อนได้เลย");
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError")
        setMessage("คัดลอกลิงก์จากช่องด้านล่างได้เลย");
    }
  }
  async function saveImage() {
    setBusy(true);
    try {
      await document.fonts.ready;
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = source;
      });
      const canvas = document.createElement("canvas");
      canvas.width = 960;
      canvas.height = 1440;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw Error("canvas");
      ctx.drawImage(img, 0, 0, 960, 1440);
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(Error("image"))), "image/png"),
      );
      const href = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = href;
      a.download = "little-life-" + life!.seed + ".png";
      a.click();
      setTimeout(() => URL.revokeObjectURL(href), 1000);
      setMessage("บันทึกการ์ดแล้ว");
    } catch {
      setMessage("บันทึกภาพไม่ได้ สามารถแคปการ์ดบนหน้าจอแทนได้");
    } finally {
      setBusy(false);
    }
  }
  if (film)
    return (
      <main className="ending-page">
        <LifeFilm life={life} onClose={() => setFilm(false)} />
      </main>
    );
  return (
    <main className="ending-page">
      <figure className="ending-card">
        <img
          src={source}
          alt={
            "บทสรุปชีวิต " +
            life.name +
            " อายุ " +
            life.age +
            " ปี พร้อมถ้วยรางวัล 6 หมวด"
          }
        />
      </figure>
      <nav className="ending-actions" aria-label="จัดการบทสรุป">
        <button onClick={share}>↗ แชร์เพื่อน</button>
        <button disabled={busy} onClick={saveImage}>
          {busy ? "กำลังสร้าง…" : "↓ บันทึกภาพ"}
        </button>
        <button onClick={() => setFilm(true)}>▶ หนังสั้น</button>
        <button onClick={() => setDetails(!details)}>ถ้วย / รายละเอียด</button>
        <a href={"/#life=" + encodeURIComponent(encodeLife(life))}>← กลับไปงานศพ</a>
        <a href="/#new=1">เริ่มชีวิตใหม่</a>
      </nav>
      {message && (
        <p className="ending-toast" role="status" onClick={() => setMessage("")}>
          {message}
        </p>
      )}
      {details && (
        <EndingDetails onClose={() => setDetails(false)}>
          <h2>
            {life.name} • {life.age} ปี
          </h2>
          <p>สาเหตุการเสียชีวิต: {life.simulation?.death?.cause}</p>
          <p>
            มรดกสุทธิ ฿{life.journey!.funeral?.estate.toLocaleString("th-TH")} ·
            ประกันให้คนข้างหลัง ฿
            {(life.simulation?.economy?.beneficiaryPayout || 0).toLocaleString("th-TH")}
          </p>
          {endingAchievements(life).map((a) => (
            <article key={a.id}>
              <strong>
                {a.title} • {a.tier?.toUpperCase() || "ยังไม่ปลดล็อก"}
              </strong>
              <p>
                {a.value.toLocaleString("th-TH")} {a.unit}
              </p>
              <small>
                Bronze / Gold / Plat:{" "}
                {a.thresholds.map((n) => n.toLocaleString("th-TH")).join(" / ")}
              </small>
            </article>
          ))}
          <p>สุขภาพดี = ปีที่สุขภาพ ≥70 และไม่มีโรคร้าย</p>
          <h3>ผู้มาร่วมอำลา</h3>
          <p>
            {life
              .journey!.funeral?.guests.map((g) => g.name + " (" + g.role + ")")
              .join(" · ") || "พิธีเล็ก ๆ ในความทรงจำ"}
          </p>
        </EndingDetails>
      )}
      {url && (
        <div className="ending-share">
          <label>
            ลิงก์ให้เพื่อน
            <input readOnly value={url} onFocus={(e) => e.target.select()} />
          </label>
          <button onClick={() => setUrl("")}>ปิด</button>
        </div>
      )}
    </main>
  );
}
