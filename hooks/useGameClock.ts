"use client";
import { isImprisoned } from "@/lib/game/journey/police";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { journeyAction, type Life } from "@/lib/game";
export function useGameClock(
  life: Life | null,
  setLife: Dispatch<SetStateAction<Life | null>>,
  blocked: boolean,
  readOnly = false,
) {
  const [speed, setSpeed] = useState(3),
    [running, setRunning] = useState(true),
    [visible, setVisible] = useState(true);
  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem("littlelife.speed.v8"));
      if ([1, 3, 6].includes(saved)) setSpeed(saved);
    } catch {}
    const changed = () => setVisible(!document.hidden);
    changed();
    document.addEventListener("visibilitychange", changed);
    return () => document.removeEventListener("visibilitychange", changed);
  }, []);
  const imprisoned = !!life && isImprisoned(life);
  const awaiting = !!life && (!!life.journey?.pending || !!life.simulation?.notice);
  useEffect(() => {
    if (
      readOnly ||
      !life ||
      life.version !== 8 ||
      life.done ||
      awaiting ||
      (blocked && !imprisoned) ||
      !visible ||
      (!running && !imprisoned)
    )
      return;
    const timer = setTimeout(
      () =>
        setLife((current) =>
          current ? journeyAction(current, { type: "year" }) : current,
        ),
      speed * 1000,
    );
    return () => clearTimeout(timer);
  }, [life, awaiting, blocked, visible, running, speed, setLife, imprisoned, readOnly]);
  const changeSpeed = (value: number) => {
    if (![1, 3, 6].includes(value)) return;
    setSpeed(value);
    try {
      localStorage.setItem("littlelife.speed", String(value));
    } catch {}
  };
  return { speed, running, setRunning, changeSpeed, awaiting, blocked };
}
export type GameClock = ReturnType<typeof useGameClock>;
