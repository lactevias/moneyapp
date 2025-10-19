import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

export default function BusinessCalculators() {
  const calculateTax = (amount: number) => amount * 0.06;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calculator className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Калькуляторы для бизнеса</h2>
      </div>

      {/* Quick Calculators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tax Calculator 6% */}
        <Card data-testid="card-tax-calculator" className="hover-elevate">
          <CardHeader>
            <CardTitle className="text-lg">Налог 6% (УСН)</CardTitle>
            <CardDescription>Расчёт налога для самозанятых</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tax-revenue" className="text-sm">Доход (₽)</Label>
                <Input
                  id="tax-revenue"
                  type="number"
                  placeholder="100000"
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    const tax = calculateTax(val);
                    const resultEl = document.getElementById('tax-result');
                    if (resultEl) resultEl.textContent = formatCurrency(tax, 'RUB');
                  }}
                  data-testid="input-tax-revenue"
                />
              </div>
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Налог к уплате:</div>
                <div id="tax-result" className="text-2xl font-bold text-foreground">0 ₽</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Calculator */}
        <Card data-testid="card-pricing-calculator" className="hover-elevate">
          <CardHeader>
            <CardTitle className="text-lg">Цена услуги</CardTitle>
            <CardDescription>Расчёт почасовой ставки</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pricing-income" className="text-sm">Желаемый доход (₽)</Label>
                <Input
                  id="pricing-income"
                  type="number"
                  placeholder="50000"
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    const hoursEl = document.getElementById('pricing-hours') as HTMLInputElement;
                    const hours = Number(hoursEl?.value) || 1;
                    const price = hours > 0 ? val / hours : 0;
                    const resultEl = document.getElementById('pricing-result');
                    if (resultEl) resultEl.textContent = formatCurrency(price, 'RUB');
                  }}
                  data-testid="input-pricing-income"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricing-hours" className="text-sm">Часов работы</Label>
                <Input
                  id="pricing-hours"
                  type="number"
                  placeholder="10"
                  defaultValue="10"
                  onChange={(e) => {
                    const hours = Number(e.target.value) || 1;
                    const incomeEl = document.getElementById('pricing-income') as HTMLInputElement;
                    const val = Number(incomeEl?.value) || 0;
                    const price = hours > 0 ? val / hours : 0;
                    const resultEl = document.getElementById('pricing-result');
                    if (resultEl) resultEl.textContent = formatCurrency(price, 'RUB');
                  }}
                  data-testid="input-pricing-hours"
                />
              </div>
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Ставка в час:</div>
                <div id="pricing-result" className="text-2xl font-bold text-foreground">0 ₽</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Net Profit Calculator */}
        <Card data-testid="card-profit-calculator" className="hover-elevate">
          <CardHeader>
            <CardTitle className="text-lg">Чистая прибыль</CardTitle>
            <CardDescription>Расчёт после вычета расходов и налогов</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profit-revenue" className="text-sm">Доход (₽)</Label>
                <Input
                  id="profit-revenue"
                  type="number"
                  placeholder="200000"
                  onChange={(e) => {
                    const revenue = Number(e.target.value) || 0;
                    const expensesEl = document.getElementById('profit-expenses') as HTMLInputElement;
                    const expenses = Number(expensesEl?.value) || 0;
                    const tax = calculateTax(revenue);
                    const net = revenue - expenses - tax;
                    const resultEl = document.getElementById('profit-result');
                    if (resultEl) resultEl.textContent = formatCurrency(net, 'RUB');
                  }}
                  data-testid="input-profit-revenue"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profit-expenses" className="text-sm">Расходы (₽)</Label>
                <Input
                  id="profit-expenses"
                  type="number"
                  placeholder="50000"
                  onChange={(e) => {
                    const revenueEl = document.getElementById('profit-revenue') as HTMLInputElement;
                    const revenue = Number(revenueEl?.value) || 0;
                    const expenses = Number(e.target.value) || 0;
                    const tax = calculateTax(revenue);
                    const net = revenue - expenses - tax;
                    const resultEl = document.getElementById('profit-result');
                    if (resultEl) resultEl.textContent = formatCurrency(net, 'RUB');
                  }}
                  data-testid="input-profit-expenses"
                />
              </div>
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Чистая прибыль:</div>
                <div id="profit-result" className="text-2xl font-bold text-foreground">0 ₽</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NDFL Calculator for Assistant */}
        <Card data-testid="card-ndfl-calculator" className="hover-elevate">
          <CardHeader>
            <CardTitle className="text-lg">НДФЛ Ассистента</CardTitle>
            <CardDescription>Расчёт налога и затрат на сотрудника</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ndfl-salary" className="text-sm">Зарплата ассистента (₽)</Label>
                <Input
                  id="ndfl-salary"
                  type="number"
                  placeholder="45000"
                  defaultValue="45000"
                  onChange={(e) => {
                    const salary = Number(e.target.value) || 0;
                    const ndfl = salary * 0.13;
                    const totalCost = salary + (salary * 0.302);
                    const ndflEl = document.getElementById('ndfl-result');
                    const totalEl = document.getElementById('ndfl-total');
                    if (ndflEl) ndflEl.textContent = formatCurrency(ndfl, 'RUB');
                    if (totalEl) totalEl.textContent = formatCurrency(totalCost, 'RUB');
                  }}
                  data-testid="input-ndfl-salary"
                />
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground">НДФЛ 13%:</div>
                  <div id="ndfl-result" className="text-lg font-semibold text-foreground">5,850 ₽</div>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <div className="text-xs text-muted-foreground">Полная стоимость (с налогами):</div>
                  <div id="ndfl-total" className="text-lg font-semibold text-foreground">58,590 ₽</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Budget Calculator */}
        <Card data-testid="card-budget-calculator" className="hover-elevate">
          <CardHeader>
            <CardTitle className="text-lg">Месячный бюджет</CardTitle>
            <CardDescription>Планирование расходов на месяц</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="budget-income" className="text-sm">Месячный доход (₽)</Label>
                <Input
                  id="budget-income"
                  type="number"
                  placeholder="100000"
                  onChange={(e) => {
                    const income = Number(e.target.value) || 0;
                    const fixedEl = document.getElementById('budget-fixed') as HTMLInputElement;
                    const variableEl = document.getElementById('budget-variable') as HTMLInputElement;
                    const fixed = Number(fixedEl?.value) || 0;
                    const variable = Number(variableEl?.value) || 0;
                    const remaining = income - fixed - variable;
                    const resultEl = document.getElementById('budget-result');
                    if (resultEl) resultEl.textContent = formatCurrency(remaining, 'RUB');
                  }}
                  data-testid="input-budget-income"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget-fixed" className="text-sm">Постоянные расходы (₽)</Label>
                <Input
                  id="budget-fixed"
                  type="number"
                  placeholder="30000"
                  onChange={(e) => {
                    const incomeEl = document.getElementById('budget-income') as HTMLInputElement;
                    const variableEl = document.getElementById('budget-variable') as HTMLInputElement;
                    const income = Number(incomeEl?.value) || 0;
                    const fixed = Number(e.target.value) || 0;
                    const variable = Number(variableEl?.value) || 0;
                    const remaining = income - fixed - variable;
                    const resultEl = document.getElementById('budget-result');
                    if (resultEl) resultEl.textContent = formatCurrency(remaining, 'RUB');
                  }}
                  data-testid="input-budget-fixed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget-variable" className="text-sm">Переменные расходы (₽)</Label>
                <Input
                  id="budget-variable"
                  type="number"
                  placeholder="20000"
                  onChange={(e) => {
                    const incomeEl = document.getElementById('budget-income') as HTMLInputElement;
                    const fixedEl = document.getElementById('budget-fixed') as HTMLInputElement;
                    const income = Number(incomeEl?.value) || 0;
                    const fixed = Number(fixedEl?.value) || 0;
                    const variable = Number(e.target.value) || 0;
                    const remaining = income - fixed - variable;
                    const resultEl = document.getElementById('budget-result');
                    if (resultEl) resultEl.textContent = formatCurrency(remaining, 'RUB');
                  }}
                  data-testid="input-budget-variable"
                />
              </div>
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Остаток:</div>
                <div id="budget-result" className="text-2xl font-bold text-foreground">0 ₽</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
