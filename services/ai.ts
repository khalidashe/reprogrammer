const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

export interface RefinedBehavior {
  title: string;
  message: string;
}

export async function refineBehavior(
  currentTitle: string,
  _currentTrigger: string,
  _currentAction: string,
  currentMessage: string
): Promise<RefinedBehavior> {
  const systemPrompt = `You are a professional assistant that refines behavior descriptions for a habit tracking app.
Return JSON with refined versions. Be direct, specific, and professional.
Avoid motivational phrases or cheesy language. Keep suggestions practical and clear.`;

  const userPrompt = `The user is creating a behavior to track with:
- Title: "${currentTitle}"
- Notification message: "${currentMessage}"

Please refine these MINIMALLY:
1. Improve wording/clarity but keep similar length
2. Use more vivid or precise language, not full sentences
3. No motivational phrases or fluff
4. Title: 2-5 words. Message: 2-5 words or short phrase (under 40 chars)

Return ONLY valid JSON:
{
  "title": "refined title",
  "message": "short refined message"
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-7',
        max_tokens: 300,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    const data = await response.json() as any;
    const responseText = data.content?.[0]?.text?.trim();

    if (responseText) {
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }
        const refined = JSON.parse(jsonMatch[0]);
        return {
          title: refined.title || currentTitle,
          message: refined.message || currentMessage,
        };
      } catch (error) {
        console.error('Failed to parse AI response:', responseText, error);
        throw new Error(`Invalid AI response format: ${responseText}`);
      }
    }

    throw new Error('Empty response from AI');
  } catch (error) {
    console.error('AI refinement error:', error);
    throw error;
  }
}
