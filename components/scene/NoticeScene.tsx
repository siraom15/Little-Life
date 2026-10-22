import type { Life } from "@/lib/game";
import { noticeVisual, portfolioChart } from "@/lib/game/journey/notice-visual";
export default function NoticeScene({ life }: { life: Life }) {
  const n = life.simulation?.notice,
    v = noticeVisual(n);
  if (!n || !v) return null;
  const chart = portfolioChart(n.chart || []),
    gold = "#ffdb72";
  return (
    <svg
      viewBox="0 0 400 200"
      role="img"
      aria-label={n.title}
      shapeRendering="crispEdges"
    >
      <rect width="400" height="200" fill="#10283e" />
      {v === "lottery" && (
        <g className="pixel-celebrate">
          <path d="M70 50h260v100H70z" fill="#ffdc59" />
          <path d="M85 65h230v70H85z" fill="#244b74" />
          <text x="200" y="110" textAnchor="middle" fontSize="28" fill="#fff3a6">
            8,000,000
          </text>
          <path
            d="M40 25h8v8h-8zM340 40h8v8h-8zM55 165h8v8h-8zM325 165h8v8h-8z"
            fill="#5ff5d1"
          />
          <text x="200" y="180" textAnchor="middle" fontSize="15" fill="#fff3a6">
            วันที่ดวงเปลี่ยนชีวิต
          </text>
        </g>
      )}
      {v === "red-envelope" && (
        <g className="pixel-celebrate">
          <rect x="145" y="45" width="110" height="120" fill="#d7444a" />
          <path d="M145 45h110l-55 35z" fill="#f05b57" />
          <rect x="184" y="94" width="32" height="32" fill="#ffda71" />
          <path d="M197 98h6v24h-6zM188 107h24v6h-24z" fill="#c73a45" />
          <text x="200" y="190" textAnchor="middle" fill="#ffda71" fontSize="15">
            อั่งเปาเข้ากระเป๋าเรา
          </text>
        </g>
      )}
      {v === "grave" && (
        <g>
          <path d="M0 160h400v40H0z" fill="#244a42" />
          <path d="M150 160v-80h10V65h80v15h10v80z" fill="#99acb9" />
          <rect x="162" y="84" width="76" height="54" fill="#627789" />
          <path d="M188 93h24v4h-24zM180 104h40v4h-40z" fill="#d9e8ee" />
          <text x="200" y="128" textAnchor="middle" fill="white" fontSize="13">
            {n.subject}
          </text>
          <path d="M130 160v-20M270 160v-20" stroke="#73bc8b" strokeWidth="4" />
          <path d="M122 134h16v10h-16zM262 134h16v10h-16z" fill="#f2d88c" />
          <text x="200" y="35" textAnchor="middle" fill="#dbeaf2" fontSize="14">
            อยู่ในความทรงจำเสมอ
          </text>
        </g>
      )}
      {(v === "level-up" || v === "review") && (
        <g className={v === "level-up" ? "pixel-celebrate" : ""}>
          <text x="200" y="45" textAnchor="middle" fill={gold} fontSize="24">
            {v === "level-up" ? "LEVEL UP!" : "NEXT CHANCE"}
          </text>
          <path
            d="M165 70h70v45h-70zM178 115h44v12h-44zM192 127h16v15h-16zM175 142h50v10h-50z"
            fill={v === "level-up" ? gold : "#829bb0"}
          />
          <path d="M150 75h15v30h-15zM235 75h15v30h-15z" fill="#c08c3e" />
          <text x="200" y="180" textAnchor="middle" fill="white" fontSize="12">
            {life.job}
          </text>
        </g>
      )}
      {v === "portfolio" && (
        <g>
          <text x="200" y="25" textAnchor="middle" fontSize="14" fill="white">
            กำไร / ขาดทุนสะสมจริง
          </text>
          <path d="M40 45v110h320" stroke="#7192aa" strokeWidth="2" fill="none" />
          <path d={"M40 " + chart.zero + "H360"} stroke="#567185" strokeDasharray="4 4" />
          <path
            d={chart.path}
            stroke={chart.profit >= 0 ? "#65e5a1" : "#ff7b85"}
            strokeWidth="4"
            fill="none"
          />
          <text
            x="200"
            y="180"
            textAnchor="middle"
            fontSize="15"
            fill={chart.profit >= 0 ? "#65e5a1" : "#ff7b85"}
          >
            {chart.profit >= 0 ? "+" : "-"}฿
            {Math.abs(chart.profit).toLocaleString("th-TH")}
          </text>
          <text x="45" y="167" fontSize="9" fill="white">
            อายุ {n.chart?.[0]?.age}
          </text>
          <text x="320" y="167" fontSize="9" fill="white">
            {n.chart?.at(-1)?.age} ปี
          </text>
        </g>
      )}
      {v === "fire" && (
        <g>
          <path d="M90 90h220v80H90z" fill="#71889c" />
          <path
            d="M70 80h260v15H70zM100 60h200v20H100zM130 40h140v20H130z"
            fill="#975b57"
          />
          <rect x="120" y="110" width="45" height="60" fill="#26364b" />
          {[175, 215, 255].map((x, i) => (
            <g key={x} className="pixel-fire" style={{ animationDelay: i * 0.12 + "s" }}>
              <path
                d={"M" + x + " 155v-35h-8v-25h10V65h10v35h12v20h8v35z"}
                fill="#ed663c"
              />
              <path d={"M" + (x + 7) + " 155v-35h5v-16h6v35h8v16z"} fill="#ffe077" />
            </g>
          ))}
          <text x="200" y="190" textAnchor="middle" fontSize="13" fill="white">
            ไฟไหม้บางส่วน · เลือกวิธีจัดการ
          </text>
        </g>
      )}
      {v === "repair" && (
        <g>
          <path d="M90 115h220v40H90zM130 85h130v30H130z" fill="#57a4ca" />
          <path d="M120 148h30v20h-30zM250 148h30v20h-30z" fill="#080f1a" />
          <text x="200" y="65" textAnchor="middle" fill={gold} fontSize="30">
            ⚒
          </text>
          <text x="200" y="190" textAnchor="middle" fill="white" fontSize="13">
            ต้องซ่อมก่อนเดินทางต่อ
          </text>
        </g>
      )}
      {v === "layoff" && (
        <g>
          <rect x="140" y="55" width="120" height="90" fill="#dbe6ea" />
          <path d="M155 75h90v5h-90zM155 90h70v5h-70z" fill="#6c859b" />
          <path d="M165 110l70 20M235 110l-70 20" stroke="#e66375" strokeWidth="6" />
          <text x="200" y="180" textAnchor="middle" fill="#ff9ea8" fontSize="18">
            สัญญาจ้างสิ้นสุด
          </text>
        </g>
      )}
    </svg>
  );
}
