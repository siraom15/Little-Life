import { Coins, LockKeyhole, ArrowUpRight } from "lucide-react";
import type { Choice } from "@/lib/game";
import { baht } from "@/lib/format";
import GameIcon from "./GameIcon";
export default function ChoiceButton({
  choice,
  onClick,
  locked,
  icon,
}: {
  choice: Choice;
  onClick: () => void;
  locked?: string | null;
  icon?: string;
}) {
  const cost = choice.cost || 0;
  return (
    <button
      className={"choice " + (cost > 0 ? "choice-paid" : "")}
      disabled={!!locked}
      onClick={onClick}
    >
      <span className="choice-number">
        <GameIcon name={choice.icon || icon} />
      </span>
      <span className="choice-body">
        <strong>{choice.label}</strong>
        <small>{choice.detail}</small>
        <span
          className={"money-tag " + (cost > 0 ? "spend" : cost < 0 ? "gain" : "free")}
        >
          <Coins size={13} />
          {cost > 0
            ? "จ่าย ฿" + baht(cost)
            : cost < 0
              ? "รับ ฿" + baht(-cost)
              : "ไม่เสียเงิน"}
        </span>
        {choice.income !== undefined && (
          <span className="income-tag">รายได้ ฿{baht(choice.income)}/ปี</span>
        )}
        {locked && (
          <em>
            <LockKeyhole size={12} /> {locked}
          </em>
        )}
      </span>
      <ArrowUpRight size={17} />
    </button>
  );
}
