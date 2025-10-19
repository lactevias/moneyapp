import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getAIFinancialAdvice } from "./ai";
import { z } from "zod";

// Validation schemas
const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(5000),
});

const userContextSchema = z.object({
  totalBalance: z.number().finite(),
  income: z.number().finite(),
  expenses: z.number().finite(),
  savings: z.number().finite(),
  currentSpace: z.enum(['personal', 'business']),
}).optional();

// Rate limiting storage
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export async function registerRoutes(app: Express): Promise<Server> {
  // AI Assistant endpoint with security
  app.post('/api/ai-assistant', async (req, res) => {
    try {
      const { messages, userContext } = req.body;
      
      // Validate messages array
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Invalid messages format' });
      }

      // Validate each message
      const validatedMessages = [];
      for (const msg of messages) {
        const result = messageSchema.safeParse(msg);
        if (!result.success) {
          return res.status(400).json({ error: 'Invalid message structure', details: result.error.errors });
        }
        validatedMessages.push(result.data);
      }

      // Validate userContext (optional)
      let validatedContext = null;
      if (userContext) {
        const contextResult = userContextSchema.safeParse(userContext);
        if (!contextResult.success) {
          return res.status(400).json({ error: 'Invalid user context', details: contextResult.error.errors });
        }
        validatedContext = contextResult.data;
      }

      // Rate limiting: 20 requests per hour per IP
      const sessionId = req.ip || 'anonymous';
      const now = Date.now();
      const limit = rateLimitMap.get(sessionId);
      
      if (limit) {
        if (now < limit.resetTime) {
          if (limit.count >= 20) {
            return res.status(429).json({ error: 'Too many requests. Please try again later.' });
          }
          limit.count++;
        } else {
          rateLimitMap.set(sessionId, { count: 1, resetTime: now + 3600000 });
        }
      } else {
        rateLimitMap.set(sessionId, { count: 1, resetTime: now + 3600000 });
      }

      // Keep only last 10 messages to manage token usage
      const recentMessages = validatedMessages.slice(-10);

      // Build system prompt server-side with validated context
      const contextInfo = validatedContext ? `
Текущий контекст финансов Нины:
- Общий баланс: ${validatedContext.totalBalance.toFixed(0)} ₽
- Доходы за месяц: ${validatedContext.income.toFixed(0)} ₽
- Расходы за месяц: ${validatedContext.expenses.toFixed(0)} ₽
- Сбережения: ${validatedContext.savings.toFixed(0)} ₽
- Пространство: ${validatedContext.currentSpace === 'personal' ? 'Личные финансы' : 'Бизнес'}
` : '';

      const systemPrompt = {
        role: 'system' as const,
        content: `Ты финансовый помощник для Нины, 25-летней специалистки по образованию и фрилансера. Она верит в эзотерику и воспринимает деньги как энергию. Работаешь с несколькими валютами (RUB, GEL, USD, KZT). Давай практичные, персонализированные советы на русском языке. Будь дружелюбным, поддерживающим и используй метафоры энергии там, где уместно.${contextInfo}`
      };

      // All messages are already validated and filtered (no system role allowed in messageSchema)
      const finalMessages = [systemPrompt, ...recentMessages];

      const response = await getAIFinancialAdvice(finalMessages);
      res.json({ message: response });
    } catch (error) {
      console.error('AI Assistant error:', error);
      res.status(500).json({ error: 'Failed to get AI response' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
