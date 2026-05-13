import { getDailyFallback } from '../constants/affirmations';

export type HabitSummary = {
  mood?: number;
  sleep?: number;
  exercise?: boolean;
  gratitude?: string;
  date: string;
};

export async function generateAffirmation(recentHabits: HabitSummary[]): Promise<string> {
  // On deployed web, route through the server-side proxy so the API key stays secret.
  // On localhost (dev) or native, call Anthropic directly using the local env key.
  const isDeployedWeb =
    typeof window !== 'undefined' && window.location.hostname !== 'localhost';

  try {
    return isDeployedWeb
      ? await generateViaProxy(recentHabits)
      : await generateDirect(recentHabits);
  } catch {
    return getDailyFallback();
  }
}

async function generateViaProxy(habits: HabitSummary[]): Promise<string> {
  const response = await fetch('/api/affirmation', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ habits }),
  });
  const data = await response.json();
  return data.affirmation ?? getDailyFallback();
}

async function generateDirect(habits: HabitSummary[]): Promise<string> {
  const habitContext = habits.length > 0
    ? habits.map(h => {
        const parts: string[] = [`Date: ${h.date}`];
        if (h.mood != null) parts.push(`Mood: ${h.mood}/5`);
        if (h.sleep != null) parts.push(`Sleep: ${h.sleep}h`);
        if (h.exercise != null) parts.push(`Exercise: ${h.exercise ? 'yes' : 'no'}`);
        if (h.gratitude) parts.push(`Gratitude note: "${h.gratitude}"`);
        return parts.join(', ');
      }).join('\n')
    : 'No habit data yet — this is their first day.';

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '',
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 120,
      messages: [{
        role: 'user',
        content: `You are a warm, supportive mental wellness companion. Based on this person's recent habits, write a single short personalized affirmation (1-2 sentences max). Make it specific to their patterns — acknowledge effort, encourage gently where needed. No preamble, just the affirmation itself.\n\nRecent habit data:\n${habitContext}`,
      }],
    }),
  });

  const data = await response.json();
  const text = data?.content?.[0]?.text;
  return text?.trim() ?? getDailyFallback();
}
