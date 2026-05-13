export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { habits } = req.body;

  const habitContext = Array.isArray(habits) && habits.length > 0
    ? habits.map((h: any) => {
        const parts: string[] = [`Date: ${h.date}`];
        if (h.mood != null) parts.push(`Mood: ${h.mood}/5`);
        if (h.sleep != null) parts.push(`Sleep: ${h.sleep}h`);
        if (h.exercise != null) parts.push(`Exercise: ${h.exercise ? 'yes' : 'no'}`);
        if (h.gratitude) parts.push(`Gratitude note: "${h.gratitude}"`);
        return parts.join(', ');
      }).join('\n')
    : 'No habit data yet — this is their first day.';

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
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

    if (!text) {
      return res.status(500).json({ error: 'No response from Claude' });
    }

    return res.json({ affirmation: text.trim() });
  } catch {
    return res.status(500).json({ error: 'Failed to generate affirmation' });
  }
}
