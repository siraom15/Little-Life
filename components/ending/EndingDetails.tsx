"use client";
import { useEffect, useRef, type ReactNode } from "react";
export default function EndingDetails({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="ending-details"
      aria-label="รายละเอียดบทสรุป"
      onCancel={onClose}
    >
      <button autoFocus onClick={onClose}>
        ปิด ✕
      </button>
      {children}
    </dialog>
  );
}
