import { Coins } from "lucide-react";
import { baht } from "@/lib/format";
export default function MoneyChange({ amount }: { amount: number }) {
  if (!amount) return null;
  return (
    <span className={"money-change " + (amount < 0 ? "money-out" : "money-in")}>
      <Coins size={15} />
      {amount < 0 ? "-" : "+"}฿{baht(Math.abs(amount))}
    </span>
  );
}
