import type { Life } from "@/lib/game";
export default function HistoryScreen({ life }: { life: Life }) {
  return (
    <section className="simple-card">
      <h2>บันทึกชีวิต</h2>
      <p>{life.history.length} ความทรงจำ</p>
      <ol className="compact-history">
        {[...life.history].reverse().map((e, i) => (
          <li key={e.id + i}>
            <b>
              {e.age} ปี · {e.title}
            </b>
            <p>{e.choice}</p>
            <small>{e.detail}</small>
          </li>
        ))}
      </ol>
    </section>
  );
}
