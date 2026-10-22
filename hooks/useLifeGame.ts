"use client";
import { recallEnding } from "@/lib/browser/ending-memory";
import { randomCharacterName } from "@/lib/game/names";
import { Life, createGameLife, decodeLife } from "@/lib/game";
import { useEffect, useRef, useState } from "react";
import {
  readAutosavePreference,
  loadLife,
  saveLife,
  readLifeFile,
  downloadLife,
  storyLink,
} from "@/lib/browser/life-storage";
export function useLifeGame() {
  const [life, setLife] = useState<Life | null>(null);
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("นที");
  const [modal, setModal] = useState("");
  const [toast, setToast] = useState("");
  const [shared, setShared] = useState(false);
  const [auto, setAuto] = useState(true);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setName(randomCharacterName());
    let enabled = true;
    try {
      enabled = readAutosavePreference();
      setAuto(enabled);
      const hash = new URLSearchParams(location.hash.slice(1));
      if (hash.has("new")) {
        setLife(null);
      } else if (hash.has("life")) {
        const encoded = hash.get("life") || "";
        const imported = recallEnding(encoded) || decodeLife(encoded);
        if (imported?.version === 8) {
          setLife(imported);
          setShared(true);
        } else setToast("ลิงก์เรื่องราวไม่ถูกต้อง");
      } else if (hash.has("seed")) {
        const seed = Number(hash.get("seed"));
        if (Number.isInteger(seed) && seed >= 0 && seed <= 4294967295)
          setLife(createGameLife(seed));
      } else {
        setLife(loadLife());
      }
    } catch {
      setToast("อ่านข้อมูลในเครื่องไม่ได้ คุณยังเล่นและส่งออกไฟล์ได้");
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready && life && auto && !shared) {
      try {
        saveLife(life);
      } catch {
        setToast("บันทึกอัตโนมัติไม่ได้ กรุณาส่งออกไฟล์สำรอง");
      }
    }
  }, [life, auto, ready, shared]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(id);
  }, [toast]);
  const start = () => {
    setLife(createGameLife(crypto.getRandomValues(new Uint32Array(1))[0], name));
    setShared(false);
    history.replaceState(null, "", location.pathname);
    setModal("");
  };
  function save() {
    if (!life || shared) return;
    try {
      saveLife(life);
      setToast("บันทึกชีวิตลงเครื่องแล้ว");
    } catch {
      setToast("บันทึกไม่ได้ กรุณาส่งออกไฟล์ JSON");
    }
  }
  function download() {
    if (!life) return;
    downloadLife(life);
    setToast("ส่งออกไฟล์ชีวิตแล้ว");
  }
  async function importFile(file?: File) {
    if (!file) return;
    try {
      const data = await readLifeFile(file);
      setLife(data);
      setShared(false);
      history.replaceState(null, "", location.pathname);
      setToast("นำเข้าชีวิตสำเร็จ");
    } catch {
      setToast("ไฟล์ไม่ถูกต้องหรือไม่ใช่ไฟล์บันทึกของเวอร์ชันนี้");
    }
    if (input.current) input.current.value = "";
  }
  function openShare() {
    if (!life) return;
    setShareUrl(storyLink(life));
    setCopied(false);
    setModal("share");
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      setToast("คัดลอกอัตโนมัติไม่ได้ เลือกลิงก์ในช่องเพื่อคัดลอก");
    }
  }

  return {
    life,
    setLife,
    ready,
    name,
    setName,
    modal,
    setModal,
    toast,
    shared,
    setShared,
    auto,
    setAuto,
    shareUrl,
    setShareUrl,
    copied,
    setCopied,
    input,
    start,
    save,
    download,
    importFile,
    openShare,
    copy,
    setToast,
  };
}

export type LifeGameController = ReturnType<typeof useLifeGame>;
