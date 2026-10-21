"use client";
import MoneyChange from "./MoneyChange";
import { gameConfig } from "@/lib/game/journey/config";
import { useState } from "react";
import type { Life } from "@/lib/game";
import { journeyAction } from "@/lib/game";
import {
  allCars,
  assetCatalog,
  assetLocked,
  quoteAsset,
  type AssetKind,
} from "@/lib/game/journey/assets";
import { baht } from "@/lib/format";
import { Home, Car } from "lucide-react";
export default function AssetShop({
  life,
  setLife,
  shared,
}: {
  life: Life;
  setLife: React.Dispatch<React.SetStateAction<Life | null>>;
  shared: boolean;
}) {
  const [kind, setKind] = useState<AssetKind>("house"),
    [review, setReview] = useState<string | null>(null);
  const owned = life.journey![kind],
    model = owned ? assetCatalog[kind].find((m) => m.id === owned.id) : null;
  const execute = (id: string) => {
    setLife((current) =>
      current ? journeyAction(current, { type: "venture", id }) : current,
    );
    setReview(null);
  };
  const [reviewKind, reviewKey, reviewMode] = (review || "").split(":") as [
    AssetKind,
    string,
    string,
  ];
  const reviewModel =
    review && reviewKey !== "sell"
      ? assetCatalog[reviewKind].find((m) => m.id === reviewKey)
      : null;
  const quote = reviewModel ? quoteAsset(reviewKind, reviewModel) : null;
  return (
    <details className="simple-details asset-shop">
      <summary>
        บ้านและรถ <span>สร้างชีวิตในแบบคุณ</span>
      </summary>
      <div className="shop-tabs">
        <button
          aria-pressed={kind === "house"}
          onClick={() => {
            setKind("house");
            setReview(null);
          }}
        >
          <Home size={16} /> บ้าน
        </button>
        <button
          aria-pressed={kind === "car"}
          onClick={() => {
            setKind("car");
            setReview(null);
          }}
        >
          <Car size={16} /> รถ
        </button>
      </div>
      <p className="muted">
        ทุกปี: สุขภาพ +{gameConfig.assets[kind].health} · ความสุข +
        {gameConfig.assets[kind].happy} (หยุดโบนัสระหว่างจำคุก) ·
        อาจมีเหตุเสียหายและค่าซ่อม
      </p>
      {kind === "car" && (
        <div className="garage-list">
          <strong>โรงรถ {allCars(life).length}/3 คัน</strong>
          {allCars(life).map((car, index) => (
            <div key={index}>
              <span>
                {assetCatalog.car.find((m) => m.id === car.id)?.name} · ยอดผ่อน ฿
                {baht(car.balance)}
              </span>
              <button
                disabled={shared || !!assetLocked(life, "car:sell:" + index)}
                onClick={() => execute("car:sell:" + index)}
              >
                ขายคันนี้{" "}
                <MoneyChange amount={Math.floor(car.price * 0.6) - car.balance} />
              </button>
            </div>
          ))}
        </div>
      )}
      {kind === "house" && owned && model ? (
        <div className="owned-asset">
          <strong>✦ {model.name}</strong>
          <p>
            {owned.balance
              ? "ยอดผ่อนคงเหลือ ฿" +
                baht(owned.balance) +
                " · ปีละ ฿" +
                baht(owned.annualPayment)
              : "เป็นเจ้าของเต็มตัว"}
          </p>
          <p>
            ค่าดูแล ฿
            {baht(Math.round(model.price * gameConfig.assets[kind].maintenanceRate))}/ปี
            {kind === "house" ? " · ลดค่าที่พัก 36,000/ปี" : ""}
          </p>
          <button
            className="finance-action"
            disabled={shared || !!assetLocked(life, kind + ":sell")}
            onClick={() => setReview(kind + ":sell")}
          >
            ขายเพื่อเปลี่ยนรุ่น
            <small>
              {assetLocked(life, kind + ":sell") ||
                "ราคาขาย 60% ของราคาซื้อ หักยอดผ่อนก่อนรับเงิน"}
            </small>
          </button>
        </div>
      ) : (
        <div className="asset-grid">
          {assetCatalog[kind].map((item, index) => {
            const terms = quoteAsset(kind, item);
            return (
              <article
                className="asset-card"
                key={item.id}
                style={{ borderTopColor: item.color }}
              >
                <span className="asset-tier">
                  {kind === "house" ? <Home size={25} /> : <Car size={25} />}{" "}
                  {"★".repeat(index + 1)}
                </span>
                <strong>{item.name}</strong>
                <MoneyChange amount={-item.price} />
                <small>{item.detail}</small>
                <small>
                  ดาวน์ ฿{baht(terms.down)} · ฿{baht(terms.annual)}/ปี
                </small>
                <div>
                  {["cash", "finance"].map((mode) => {
                    const id = kind + ":" + item.id + ":" + mode;
                    return (
                      <button
                        key={mode}
                        disabled={shared || !!assetLocked(life, id)}
                        title={assetLocked(life, id) || undefined}
                        onClick={() => setReview(id)}
                      >
                        {mode === "cash" ? "จ่ายสด" : "ผ่อน"}
                      </button>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      )}
      {review && (
        <div className="asset-confirm" role="alert">
          <strong>
            {reviewKey === "sell"
              ? "ยืนยันขายทรัพย์สิน?"
              : "ยืนยันซื้อ " + reviewModel!.name + "?"}
          </strong>
          {quote && reviewModel ? (
            <>
              <p>
                {reviewMode === "cash"
                  ? "จ่ายสด ฿" + baht(reviewModel.price)
                  : "ดาวน์ ฿" +
                    baht(quote.down) +
                    " · ผ่อน " +
                    quote.years +
                    " ปี · ดอกเบี้ย " +
                    quote.rate * 100 +
                    "% ต่อปี"}
              </p>
              {reviewMode === "finance" && (
                <p>
                  ค่างวด ฿{baht(quote.annual)}/ปี · รวมไม่เกิน ฿{baht(quote.total)} ·
                  ขาดส่ง 3 ปีถูกยึด
                </p>
              )}
              <p>
                ค่าดูแล ฿
                {baht(
                  Math.round(
                    reviewModel.price * gameConfig.assets[reviewKind].maintenanceRate,
                  ),
                )}
                /ปี
              </p>
            </>
          ) : (
            <p>ขายที่ 60% ของราคาซื้อ หักยอดผ่อนคงเหลือ หากยอดไม่พอต้องจ่ายส่วนต่าง</p>
          )}
          <MoneyChange
            amount={
              reviewKey === "sell"
                ? Math.floor((life.journey![reviewKind]?.price || 0) * 0.6) -
                  (life.journey![reviewKind]?.balance || 0)
                : -(reviewMode === "cash" ? reviewModel!.price : quote!.down)
            }
          />
          <button
            className="primary-action"
            disabled={shared || !!assetLocked(life, review)}
            onClick={() => execute(review)}
          >
            ยืนยัน
          </button>
          <button className="finance-action" onClick={() => setReview(null)}>
            ยังไม่ซื้อขาย
          </button>
        </div>
      )}
    </details>
  );
}
