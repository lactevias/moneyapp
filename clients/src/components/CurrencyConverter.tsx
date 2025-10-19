import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExchangeRates {
  RUB: number;
  GEL: number;
  USD: number;
  KZT: number;
}

export default function CurrencyConverter() {
  const [amount, setAmount] = useState<string>("100");
  const [fromCurrency, setFromCurrency] = useState<string>("RUB");
  const [toCurrency, setToCurrency] = useState<string>("GEL");
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 3600000); // Update every hour
    return () => clearInterval(interval);
  }, []);

  const fetchRates = async () => {
    try {
      const response = await fetch(
        'https://api.exchangerate.host/latest?base=USD&symbols=RUB,GEL,KZT'
      );
      const data = await response.json();
      
      if (data.success && data.rates) {
        setRates({
          USD: 1,
          RUB: data.rates.RUB,
          GEL: data.rates.GEL,
          KZT: data.rates.KZT,
        });
        setLastUpdate(new Date());
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      // Fallback rates
      setRates({
        USD: 1,
        RUB: 92,
        GEL: 2.65,
        KZT: 450,
      });
      setLoading(false);
    }
  };

  const convert = (): string => {
    if (!rates || !amount) return "0.00";
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return "0.00";

    // Convert to USD first, then to target currency
    const inUSD = numAmount / rates[fromCurrency as keyof ExchangeRates];
    const result = inUSD * rates[toCurrency as keyof ExchangeRates];
    
    return result.toFixed(2);
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const currencies = [
    { value: "RUB", label: "₽ Рубль", symbol: "₽" },
    { value: "GEL", label: "₾ Лари", symbol: "₾" },
    { value: "USD", label: "$ Доллар", symbol: "$" },
    { value: "KZT", label: "₸ Тенге", symbol: "₸" },
  ];

  return (
    <Card data-testid="currency-converter" className="shadow-glow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5 text-primary" />
          Конвертер валют
        </CardTitle>
        {lastUpdate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            {lastUpdate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="text-xs text-muted-foreground mb-1 block">Сумма</label>
            <Input
              data-testid="input-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100"
              className="text-lg"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="text-xs text-muted-foreground mb-1 block">Из</label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger data-testid="select-from-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem key={curr.value} value={curr.value}>
                    {curr.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center md:col-span-1">
            <Button
              data-testid="button-swap-currencies"
              variant="ghost"
              size="icon"
              onClick={swapCurrencies}
              className="mt-auto"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-muted-foreground mb-1 block">В</label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger data-testid="select-to-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem key={curr.value} value={curr.value}>
                    {curr.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
          <div className="text-sm text-muted-foreground mb-1">Результат:</div>
          <div className="text-3xl font-bold text-primary" data-testid="text-conversion-result">
            {loading ? "..." : convert()}{" "}
            <span className="text-xl">
              {currencies.find(c => c.value === toCurrency)?.symbol}
            </span>
          </div>
        </div>

        {rates && !loading && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
            <div className="text-xs">
              <span className="text-muted-foreground">1 USD =</span>{" "}
              <span className="font-medium text-foreground">{rates.RUB.toFixed(2)} ₽</span>
            </div>
            <div className="text-xs">
              <span className="text-muted-foreground">1 USD =</span>{" "}
              <span className="font-medium text-foreground">{rates.GEL.toFixed(2)} ₾</span>
            </div>
            <div className="text-xs">
              <span className="text-muted-foreground">1 USD =</span>{" "}
              <span className="font-medium text-foreground">{rates.KZT.toFixed(2)} ₸</span>
            </div>
            <div className="text-xs">
              <span className="text-muted-foreground">1 RUB =</span>{" "}
              <span className="font-medium text-foreground">{(rates.GEL / rates.RUB).toFixed(4)} ₾</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
