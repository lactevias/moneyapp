import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function getAIFinancialAdvice(messages: Array<{ role: string; content: string }>) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 500,
    });

    return completion.choices[0]?.message?.content || 'Извини, не смогла сформулировать ответ.';
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}
