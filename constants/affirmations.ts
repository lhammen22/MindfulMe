export const FALLBACK_AFFIRMATIONS = [
  "You are doing better than you think.",
  "Small steps forward are still progress.",
  "Your feelings are valid. You are enough.",
  "Today is a new opportunity to grow.",
  "Be gentle with yourself — you are learning.",
  "You have the strength to handle whatever comes today.",
  "Every breath is a fresh start.",
  "You deserve the same kindness you give others.",
  "Progress, not perfection.",
  "You are capable of more than you know.",
  "Your presence matters.",
  "It's okay to take things one moment at a time.",
];

export function getDailyFallback(): string {
  const index = new Date().getDate() % FALLBACK_AFFIRMATIONS.length;
  return FALLBACK_AFFIRMATIONS[index];
}
