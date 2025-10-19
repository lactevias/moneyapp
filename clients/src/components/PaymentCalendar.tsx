import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { SiGooglecalendar } from "react-icons/si";
import type { PlannedPayment } from "@/types";

interface PaymentCalendarProps {
  payments: PlannedPayment[];
  onSyncGoogleCalendar?: () => void;
  onAddPlannedPayment?: () => void;
  onUpdatePayment?: (id: string, updates: Partial<PlannedPayment>) => void;
}

const formatCurrency = (amount: number, currency: string) => {
  const symbols: Record<string, string> = {
    RUB: '₽',
    GEL: '₾',
    USD: '$',
    KZT: '₸',
  };
  return `${amount.toFixed(0)} ${symbols[currency] || currency}`;
};

export default function PaymentCalendar({ payments, onSyncGoogleCalendar, onAddPlannedPayment, onUpdatePayment }: PaymentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7;

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);

  const getPaymentsForDay = (day: number) => {
    return payments.filter(payment => {
      const paymentDate = payment.date;
      return (
        paymentDate.getDate() === day &&
        paymentDate.getMonth() === month &&
        paymentDate.getFullYear() === year
      );
    });
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

  return (
    <Card data-testid="payment-calendar" className="shadow-glow">
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Календарь платежей</CardTitle>
              <CardDescription>Запланированные траты</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onAddPlannedPayment && (
              <Button
                data-testid="button-add-planned-payment"
                variant="default"
                size="sm"
                onClick={onAddPlannedPayment}
              >
                Запланировать
              </Button>
            )}
            {onSyncGoogleCalendar && (
              <Button
                data-testid="button-sync-google-calendar"
                variant="outline"
                size="sm"
                onClick={onSyncGoogleCalendar}
                className="gap-2"
              >
                <SiGooglecalendar className="h-4 w-4" />
                Синхронизировать
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Month navigation */}
          <div className="flex items-center justify-between">
            <Button
              data-testid="button-previous-month"
              variant="ghost"
              size="icon"
              onClick={previousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-semibold">
              {monthNames[month]} {year}
            </h3>
            <Button
              data-testid="button-next-month"
              variant="ghost"
              size="icon"
              onClick={nextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Week day headers */}
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}

            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}

            {/* Calendar days */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const dayPayments = getPaymentsForDay(day);
              const isToday =
                day === new Date().getDate() &&
                month === new Date().getMonth() &&
                year === new Date().getFullYear();

              return (
                <div
                  key={day}
                  data-testid={`calendar-day-${day}`}
                  className={`aspect-square border rounded-md p-1 hover-elevate transition-all ${
                    isToday ? 'border-primary bg-primary/10' : 'border-border'
                  }`}
                >
                  <div className="text-xs font-medium text-foreground mb-1">{day}</div>
                  <div className="space-y-0.5">
                    {dayPayments.slice(0, 2).map((payment) => (
                      <div
                        key={payment.id}
                        className={`text-[10px] px-1 py-0.5 rounded truncate ${
                          payment.status === 'confirmed' 
                            ? 'bg-green-500/20 text-green-700 dark:text-green-400' 
                            : 'bg-accent/20 text-accent-foreground'
                        }`}
                        title={`${payment.title} - ${formatCurrency(payment.amount, payment.currency)} ${payment.status === 'confirmed' ? '✓' : ''}`}
                      >
                        {formatCurrency(payment.amount, payment.currency)}
                      </div>
                    ))}
                    {dayPayments.length > 2 && (
                      <div className="text-[10px] text-muted-foreground">
                        +{dayPayments.length - 2}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Upcoming payments list */}
          <div className="border-t border-border pt-4 mt-4">
            <h4 className="text-sm font-semibold mb-3">Ближайшие платежи</h4>
            <div className="space-y-2">
              {payments
                .filter(p => p.date >= new Date())
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .slice(0, 5)
                .map((payment) => (
                  <div
                    key={payment.id}
                    data-testid={`upcoming-payment-${payment.id}`}
                    className={`flex items-center justify-between p-2 rounded-lg border hover-elevate ${
                      payment.status === 'confirmed' 
                        ? 'border-green-500/50 bg-green-500/5' 
                        : 'border-border'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <div className="font-medium text-sm text-foreground">{payment.title}</div>
                        {payment.status === 'confirmed' && (
                          <Badge variant="default" className="text-xs px-1.5 py-0 bg-green-600">
                            ✓ Подтверждён
                          </Badge>
                        )}
                        {payment.isRequired ? (
                          <Badge variant="destructive" className="text-xs px-1.5 py-0">
                            Обяз.
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0">
                            Необяз.
                          </Badge>
                        )}
                        {payment.recurring && payment.recurrencePattern && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0">
                            {payment.recurrencePattern === 'daily' && '⟳ Ежедневно'}
                            {payment.recurrencePattern === 'weekly' && '⟳ Еженед.'}
                            {payment.recurrencePattern === 'monthly' && '⟳ Ежемес.'}
                            {payment.recurrencePattern === 'yearly' && '⟳ Ежегодно'}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {payment.date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                        {payment.endDate && ` • До ${payment.endDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">
                        {formatCurrency(payment.amount, payment.currency)}
                      </Badge>
                      {onUpdatePayment && payment.status !== 'confirmed' && (
                        <Button
                          data-testid={`button-confirm-payment-${payment.id}`}
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdatePayment(payment.id, { status: 'confirmed' })}
                          className="gap-1"
                        >
                          <Check className="h-3 w-3" />
                          Подтвердить
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
