// Months of the year for A1 EFL quiz (English ↔ Korean)
export const MONTHS = [
  { en: "January", kr: "일월" },
  { en: "February", kr: "이월" },
  { en: "March", kr: "삼월" },
  { en: "April", kr: "사월" },
  { en: "May", kr: "오월" },
  { en: "June", kr: "유월" },
  { en: "July", kr: "칠월" },
  { en: "August", kr: "팔월" },
  { en: "September", kr: "구월" },
  { en: "October", kr: "시월" },
  { en: "November", kr: "십일월" },
  { en: "December", kr: "십이월" },
] as const;

export type MonthPair = (typeof MONTHS)[number];

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export type QuizQuestion = {
  id: number;
  prompt: string; // e.g. "What is 삼월 in English?"
  correctEn: string;
  correctKr: string;
  direction: "kr-to-en" | "en-to-kr"; // prompt language
};

export function buildQuiz(count: number = 12): QuizQuestion[] {
  const shuffled = shuffle([...MONTHS]);
  return shuffled.slice(0, count).map((m, i) => {
    const isKrToEn = Math.random() > 0.5;
    const prompt = isKrToEn
      ? `What is "${m.kr}" in English?`
      : `What is "${m.en}" in Korean?`;
    return {
      id: i,
      prompt,
      correctEn: m.en,
      correctKr: m.kr,
      direction: isKrToEn ? "kr-to-en" : "en-to-kr",
    };
  });
}

export function getWrongChoices(
  correctEn: string,
  correctKr: string,
  direction: "kr-to-en" | "en-to-kr",
  count: number
): string[] {
  const pool =
    direction === "kr-to-en"
      ? MONTHS.map((m) => m.en).filter((en) => en !== correctEn)
      : MONTHS.map((m) => m.kr).filter((kr) => kr !== correctKr);
  const shuffled = shuffle(pool);
  return shuffled.slice(0, count);
}
