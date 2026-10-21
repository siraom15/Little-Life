export const characterNames = [
  "นที",
  "มะลิ",
  "ต้นกล้า",
  "พลอย",
  "ภูผา",
  "น้ำฝน",
  "ข้าวหอม",
  "ปัน",
  "อิงฟ้า",
  "ธันวา",
  "ใบบัว",
  "วายุ",
  "อุ่นใจ",
  "ดาวเหนือ",
  "ภัทร",
  "เมฆ",
  "แพรว",
  "ตะวัน",
  "สายรุ้ง",
  "กันต์",
];
export function randomCharacterName() {
  return characterNames[
    crypto.getRandomValues(new Uint32Array(1))[0] % characterNames.length
  ];
}
