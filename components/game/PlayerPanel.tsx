import { baht } from "@/lib/format";
import { Life, Stat, expense, labels } from "@/lib/game";
import { BookOpen, Heart, MapPin, Sparkles, Users, Wallet } from "lucide-react";

export default function PlayerPanel({ life }: { life: Life }) {
  const icons = [Heart, Sparkles, BookOpen, Users];
  return (
    <aside className="profile card">
      <div className="profile-cover">
        <span className="sun" />
        <div className="mountain one" />
        <div className="mountain two" />
        <div className="little-house">
          <i />
          <b />
        </div>
        <span className="tree">♣</span>
        <span className="cover-caption">A LIFE WORTH LIVING</span>
      </div>
      <div className="profile-body">
        <div className="avatar">{life.name.slice(0, 1)}</div>
        <span className="chapter">บทที่ {life.history.length + 1} ของชีวิต</span>
        <h2>{life.name}</h2>
        <p className="location">
          <MapPin size={14} />
          {life.location === "ประเทศไทย" ? life.province : life.location}
        </p>
        <div className="age-row">
          <strong>
            {life.age}
            <small>ปี</small>
          </strong>
          <span>
            {life.done
              ? "เรื่องราวที่น่าจดจำ"
              : life.age < 18
                ? "วัยแห่งการเรียนรู้"
                : life.age < 60
                  ? "วัยแห่งการเติบโต"
                  : "วัยแห่งความทรงจำ"}
          </span>
        </div>
        <div className="divider" />
        <div className="stats">
          {(Object.keys(labels) as Stat[]).map((k, i) => {
            const Icon = icons[i];
            return (
              <div className={`stat stat-${k}`} key={k}>
                <div>
                  <span>
                    <Icon size={15} />
                    {labels[k]}
                  </span>
                  <b>
                    {life.stats[k]}
                    <small>/100</small>
                  </b>
                </div>
                <div className="bar">
                  <i style={{ width: `${life.stats[k]}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="wallet">
          <div>
            <Wallet size={17} />
            <span>{life.money < 0 ? "ยอดขาดดุลสะสม" : "เงินสะสม"}</span>
          </div>
          <strong>฿{baht(life.money)}</strong>
          <small>รายได้ ฿{baht(life.income)} / ปี</small>
        </div>
        <div className="profile-detail">
          {life.simulation && (
            <>
              <span>
                เพศ<b>{life.simulation.sex === "female" ? "หญิง" : "ชาย"}</b>
              </span>
              <span>
                ของขวัญแรกเกิด<b>{life.simulation.birthTrait}</b>
              </span>
            </>
          )}
          <span>
            อาชีพ<b>{life.job}</b>
          </span>
          <span>
            จุดเริ่มต้น<b>{life.background}</b>
          </span>
          <span>
            ค่าครองชีพ / ปี<b>฿{baht(expense(life))}</b>
          </span>
        </div>
      </div>
      <div className="profile-bottom">
        <span className="tiny-dot" /> PLAYER 01 · นี่แหละตัวคุณ
      </div>
    </aside>
  );
}
