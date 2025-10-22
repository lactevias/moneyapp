import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils"; // Мы импортируем твою утилиту для стилей

interface LoadingSpinnerProps {
  text?: string;
  className?: string;
}

/**
 * Красивый лоадер в стиле твоего приложения.
 * Использует Tailwind-анимации (animate-spin, animate-pulse) и цвет 'primary'.
 */
export const LoadingSpinner = ({ text = "Загрузка данных...", className }: LoadingSpinnerProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <Sparkles className="h-12 w-12 animate-spin text-primary" />
      <p className="text-lg text-muted-foreground animate-pulse">
        {text}
      </p>
    </div>
  );
};
