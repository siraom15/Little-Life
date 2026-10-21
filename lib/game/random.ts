/** Seeded randomness: reloads and speed changes never reroll an outcome. */
export function randomAt(seed: number, year: number, channel: number) {
  let value =
    (seed ^ Math.imul(year + 1, 0x9e3779b9) ^ Math.imul(channel + 1, 0x85ebca6b)) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x21f0aaad);
  value = Math.imul(value ^ (value >>> 15), 0x735a2d97);
  return ((value ^ (value >>> 15)) >>> 0) / 4294967296;
}
