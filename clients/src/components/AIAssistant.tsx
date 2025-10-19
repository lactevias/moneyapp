import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIAssistantProps {
  userContext?: {
    totalBalance: number;
    income: number;
    expenses: number;
    savings: number;
    currentSpace: 'personal' | 'business';
  };
}

export default function AIAssistant({ userContext }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Привет, Нина! Я твой личный финансовый помощник. Могу помочь с планированием, оптимизацией расходов и достижением финансовых целей. О чём хочешь поговорить?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Send only user messages (system prompt built server-side)
      const userMessages = [...messages, userMessage].filter(m => m.role !== 'system');
      
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: userMessages,
          userContext
        })
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Assistant error:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось получить ответ. Попробуй снова.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    "Как мне лучше распределить бюджет этого месяца?",
    "Помоги оптимизировать мои расходы",
    "Какие финансовые цели мне стоит поставить?",
    "Как увеличить доход от фриланса?",
  ];

  return (
    <Card data-testid="ai-assistant" className="shadow-glow h-full flex flex-col">
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          AI Финансовый Помощник
        </CardTitle>
        <CardDescription>
          Персональные рекомендации для твоих финансов
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`rounded-lg px-4 py-3 max-w-[80%] ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                </div>
                <div className="rounded-lg px-4 py-3 bg-muted">
                  <p className="text-sm text-muted-foreground">Думаю...</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {messages.length === 1 && (
          <div className="px-4 pb-4">
            <p className="text-xs text-muted-foreground mb-2">Попробуй спросить:</p>
            <div className="grid grid-cols-1 gap-2">
              {suggestedQuestions.map((question, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="justify-start text-left h-auto py-2"
                  onClick={() => setInput(question)}
                  data-testid={`suggested-question-${idx}`}
                >
                  <span className="text-xs">{question}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Textarea
              data-testid="input-ai-message"
              placeholder="Спроси меня о финансах..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="resize-none min-h-[60px]"
              disabled={loading}
            />
            <Button
              data-testid="button-send-message"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              size="icon"
              className="self-end"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
