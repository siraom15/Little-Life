import type { Life } from "../game";
export function lifeStage(age: number) {
  if (age < 2) return "ทารก";
  if (age < 6) return "วัยหัดเดิน";
  if (age < 13) return "วัยเด็ก";
  if (age < 20) return "วัยรุ่น";
  if (age < 40) return "วัยผู้ใหญ่";
  if (age < 60) return "วัยกลางคน";
  if (age < 80) return "วัยสูงอายุ";
  return "วัยชรา";
}
export function characterAppearance(life: Life) {
  return {
    age: life.age,
    female: life.simulation?.sex === "female",
    skin: ["#f4ca9f", "#dca77b", "#bd8664"][life.seed % 3],
  };
}
