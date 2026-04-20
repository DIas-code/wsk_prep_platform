/**
 * Russian plural form for "1 / 2-4 / 5+" noun families.
 * Example: pluralize(3, 'урок', 'урока', 'уроков') → 'урока'
 */
export function pluralize(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export const DIFFICULTY_RU: Record<string, string> = {
  easy: "лёгкая",
  medium: "средняя",
  hard: "сложная",
  championship: "чемпионат",
};
