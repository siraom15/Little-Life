import type { Life } from "../types.ts";
import { gameConfig } from "./config.ts";
const paths: [string, string[], string[]][] = [
  ["แพทยศาสตร์", ["doctor"], ["nurse"]],
  ["วิศวกรรม", ["engineer"], ["developer", "technician", "pilot"]],
  ["นิติศาสตร์", ["lawyer"], ["detective", "politician"]],
  ["บริหารธุรกิจ", ["merchant", "sales"], ["politician", "underground"]],
  ["ออกแบบ", ["designer"], ["actor", "streamer"]],
  ["นิเทศศาสตร์", ["streamer", "actor"], ["sales", "politician"]],
  ["ครุศาสตร์", ["teacher"], ["nurse"]],
  ["เทคโนโลยี", ["developer", "technician"], ["engineer"]],
  ["ศิลปะ", ["designer"], ["chef", "actor"]],
];
export function educationBonus(life: Life, career: string) {
  career =
    (
      {
        "japan-tech": "technician",
        "australia-care": "nurse",
        "germany-engineer": "engineer",
      } as Record<string, string>
    )[career] || career;
  const path = paths.find(([name]) => life.journey!.school.includes(name));
  return !path
    ? 0
    : path[1].includes(career)
      ? gameConfig.education.matchingCareerBonus
      : path[2].includes(career)
        ? gameConfig.education.relatedCareerBonus
        : 0;
}
