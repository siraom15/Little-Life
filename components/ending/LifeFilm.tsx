"use client";
import { useEffect, useMemo, useState } from "react";
import type { Life, SceneKind } from "@/lib/game";
import { lifeHighlights } from "@/lib/game/journey/achievements";
import SceneIllustration from "../scene/SceneIllustration";
export default function LifeFilm({ life, onClose }: { life: Life; onClose: () => void }) {
  const frames = useMemo(() => lifeHighlights(life), [life]);
  const [index, setIndex] = useState(0),
    [playing, setPlaying] = useState(false);
  useEffect(() => {
    setPlaying(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => {
      if (index === frames.length - 1) setPlaying(false);
      else setIndex(index + 1);
    }, 4500);
    return () => clearTimeout(timer);
  }, [index, playing, frames.length]);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);
  const frame = frames[index];
  if (!frame)
    return (
      <section>
        <p>ยังไม่มีบันทึกให้เล่า</p>
        <button onClick={onClose}>กลับ</button>
      </section>
    );
  const scene: SceneKind =
    frame.id === "death"
      ? "death"
      : frame.age === 0
        ? "birth"
        : frame.category === "สุขภาพ"
          ? "hospital"
          : frame.category === "ตำรวจ"
            ? "prison"
            : frame.category === "ต่างประเทศ"
              ? "travel"
              : frame.category === "ความสัมพันธ์" || frame.category === "ครอบครัว"
                ? "festival"
                : "home";
  const illustration = structuredClone(life);
  illustration.age = frame.age;
  illustration.done = scene === "death";
  illustration.money = frame.money;
  illustration.simulation!.notice = null;
  illustration.simulation!.death = scene === "death" ? life.simulation!.death : null;
  illustration.simulation!.economy!.prisonUntil = 0;
  illustration.journey!.health.hospitalUntil = -1;
  illustration.journey!.children = illustration.journey!.children.filter(
    (child) => child.bornAt <= frame.age,
  );
  const text = frame.title + " " + frame.choice;
  if (scene !== "death" && /จากไป|มรดก|เสียชีวิต/.test(text))
    illustration.simulation!.notice = {
      id: "film-grave",
      title: frame.title,
      text: frame.detail,
      scene: "home",
      effects: "",
      visual: "grave",
    };
  else if (/เลื่อนตำแหน่ง|เลื่อนขั้น/.test(text))
    illustration.simulation!.notice = {
      id: "film-promotion",
      title: frame.title,
      text: frame.detail,
      scene: "festival",
      effects: "",
      visual: "level-up",
    };
  else if (/พอร์ต/.test(text))
    illustration.simulation!.notice = {
      id: "film-portfolio",
      title: frame.title,
      text: frame.detail,
      scene: "gift",
      effects: "",
      visual: "portfolio",
      chart: life.journey!.investment.points.filter((p) => p.age <= frame.age),
    };
  illustration.journey!.house = null;
  illustration.journey!.car = null;
  illustration.journey!.extraCars = [];
  return (
    <section className="life-film" aria-label="หนังสั้นชีวิต">
      <header>
        <span>
          MEMORIES • {index + 1}/{frames.length}
        </span>
        <button autoFocus onClick={onClose}>
          กลับสู่การ์ด ✕
        </button>
      </header>
      <div className="film-frame" key={index}>
        <span className="film-age">อายุ {frame.age} ปี</span>
        <SceneIllustration life={illustration} kind={scene} />
        <h1>{frame.title}</h1>
        <p>{frame.choice}</p>
        <small>{frame.detail}</small>
      </div>
      <div className="film-progress">
        {frames.map((f, i) => (
          <button
            key={i}
            aria-label={"ฉาก " + (i + 1) + " " + f.title}
            aria-current={i === index ? "step" : undefined}
            onClick={() => {
              setIndex(i);
              setPlaying(false);
            }}
          />
        ))}
      </div>
      <nav>
        <button
          disabled={index === 0}
          onClick={() => {
            setIndex(index - 1);
            setPlaying(false);
          }}
        >
          ก่อนหน้า
        </button>
        <button
          onClick={() => {
            if (index === frames.length - 1) setIndex(0);
            setPlaying(!playing);
          }}
        >
          {playing ? "พักภาพ" : "▶ เล่น"}
        </button>
        <button
          disabled={index === frames.length - 1}
          onClick={() => {
            setIndex(index + 1);
            setPlaying(false);
          }}
        >
          ถัดไป
        </button>
      </nav>
      <small>ฉากประกอบจากบันทึกจริงของตัวละคร • ยังไม่ใช่ไฟล์วิดีโอ</small>
    </section>
  );
}
