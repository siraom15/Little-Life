"use client";
import { Music2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
export default function ThemeMusic() {
  const [playing, setPlaying] = useState(true),
    [error, setError] = useState(false);
  const engine = useRef<AudioContext | null>(null);
  useEffect(() => {
    if (!playing) return;
    const resume = () => {
      engine.current?.resume().catch(() => setError(true));
    };
    document.addEventListener("pointerdown", resume);
    document.addEventListener("keydown", resume);
    let timer: ReturnType<typeof setInterval> | undefined;
    try {
      const context = new AudioContext();
      engine.current = context;
      const master = context.createGain();
      master.gain.value = 0.025;
      master.connect(context.destination);
      // Original looping pentatonic chiptune: melody plus a quiet bass pulse.
      const melody = [
        72, 76, 79, 76, 74, 72, 67, 69, 72, 76, 81, 79, 76, 74, 72, 0, 67, 72, 74, 76, 79,
        76, 74, 72, 69, 72, 76, 74, 72, 67, 72, 0,
      ];
      let step = 0;
      const tone = (note: number, duration: number, gain: number) => {
        if (!note) return;
        const osc = context.createOscillator(),
          env = context.createGain();
        osc.type = "square";
        osc.frequency.value = 440 * Math.pow(2, (note - 69) / 12);
        env.gain.setValueAtTime(gain, context.currentTime);
        env.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
        osc.connect(env);
        env.connect(master);
        osc.start();
        osc.stop(context.currentTime + duration);
        osc.onended = () => {
          osc.disconnect();
          env.disconnect();
        };
      };
      const tick = () => {
        if (document.hidden || context.state !== "running") return;
        tone(melody[step % melody.length], 0.18, 0.7);
        if (step % 4 === 0) tone([48, 53, 55, 48][Math.floor(step / 8) % 4], 0.35, 0.35);
        step++;
      };
      context.resume().catch(() => {
        setError(true);
        setPlaying(false);
      });
      timer = setInterval(tick, 220);
      tick();
    } catch {
      setError(true);
      setPlaying(false);
    }
    return () => {
      document.removeEventListener("pointerdown", resume);
      document.removeEventListener("keydown", resume);
      if (timer) clearInterval(timer);
      engine.current?.close().catch(() => {});
      engine.current = null;
    };
  }, [playing]);
  return (
    <button
      aria-label={playing ? "ปิดเพลงธีม" : "เปิดเพลงธีม"}
      aria-pressed={playing}
      title={error ? "อุปกรณ์นี้ยังเปิดเสียงไม่ได้" : "เพลงธีม 8-bit"}
      onClick={() => {
        setError(false);
        setPlaying(!playing);
      }}
    >
      {playing ? (
        <Music2 size={19} />
      ) : (
        <span className="muted-music">
          <Music2 size={19} />
          <span aria-hidden="true" />
        </span>
      )}
    </button>
  );
}
