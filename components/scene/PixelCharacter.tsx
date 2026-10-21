export default function PixelCharacter({
  x,
  y,
  scale = 1,
  shirt = "#8063e9",
  age = 25,
  female = false,
  skin = "#f4ca9f",
  sad = false,
  torn = false,
}: {
  x: number;
  y: number;
  scale?: number;
  shirt?: string;
  age?: number;
  female?: boolean;
  skin?: string;
  sad?: boolean;
  torn?: boolean;
}) {
  const elder = age >= 60,
    middle = age >= 40,
    child = age < 13;
  const hair = age >= 80 ? "#ede5de" : elder ? "#bcb6c5" : middle ? "#76657a" : "#40344e";
  if (age < 2)
    return (
      <g transform={`translate(${x} ${y}) scale(${scale})`} aria-label="ทารกนอนในเปล">
        <path d="M-25 -18h50v19h-50zM-22 1h5v9h-5zM17 1h5v9h-5z" fill="#a77865" />
        <path d="M-23 -24h46v15h-46z" fill="#f5e4b8" />
        <g className="baby-breathe">
          <path d="M-18 -22h36v15h-36z" fill="#bdacd9" />
          <path d="M-17 -28h13v13h-13z" fill={skin} />
          <path d="M-15 -28h10v3h-10z" fill={hair} />
          <path d="M-14 -22h2v1h-2zM-8 -22h2v1h-2z" fill="#4a3554" />
          <path d="M-1 -20h13v2H-1zM-1 -15h13v2H-1z" fill="#dfd3ef" />
        </g>
      </g>
    );
  const proportion = age < 6 ? 0.64 : child ? 0.82 : age < 20 ? 1 : 1.12;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale * proportion})`}>
      <path d="M-12 0h24v3h-24z" fill="#4a3f58" opacity=".2" />
      <g className="sprite-idle">
        {female && <path d="M-10 -39h20v22h-20z" fill={hair} />}
        <path d="M-6 -12h5v12h-7v-4h2zM2 -12h5v12H1v-4h1z" fill="#353958" />
        <path d="M-9 -27H9v16H-9z" fill={shirt} />
        {torn && <path d="M-7 -22h5v4h-5zM3 -16h6v5H3z" fill={skin} />}
        <path d="M-12 -25h4v15h-4zM8 -25h4v15H8z" fill={skin} />
        <path d="M-8 -42H7v4h3v13H6v3H-6v-3h-4v-13h2z" fill={skin} />
        <path d="M-8 -42H7v4h3v6H6v-5H-4v4h-6v-5h2z" fill={hair} />
        {female && <path d="M-12 -37h4v15h-4zM8 -37h4v15H8z" fill={hair} />}
        <path d="M-5 -32h2v2h-2zM3 -32h2v2H3z" fill="#3b344b" />
        <path d={sad ? "M-2 -26h4v1h-4z" : "M-2 -28h4v2h-4z"} fill="#bf7a71" />
        {age >= 13 && age < 20 && (
          <path
            d="M-12 -35v-6h24v6M-12 -35v7M12 -35v7"
            fill="none"
            stroke="#e9bb61"
            strokeWidth="3"
          />
        )}
        {middle && (
          <path
            d="M-7 -33h6v4h-6zM1 -33h6v4H1zM-1 -31h2"
            fill="none"
            stroke="#766580"
            strokeWidth="1"
          />
        )}
        {!child && <path d="M-1 -26h2v10h-2z" fill="#fff" opacity=".6" />}
        {age >= 80 && <path d="M12 -17h3V1h-2v-16h-1z" fill="#805d52" />}
      </g>
    </g>
  );
}
