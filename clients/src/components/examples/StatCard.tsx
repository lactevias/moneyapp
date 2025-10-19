import StatCard from '../StatCard';

export default function StatCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Всего средств"
        value="226 500 ₽"
        subtitle="+12% за месяц"
        trend="up"
      />
      <StatCard
        title="Доходы"
        value="85 000 ₽"
        subtitle="За текущий месяц"
        trend="neutral"
      />
      <StatCard
        title="Расходы"
        value="32 450 ₽"
        subtitle="-8% к прошлому месяцу"
        trend="up"
      />
      <StatCard
        title="Сбережения"
        value="125 000 ₽"
        subtitle="3 активные цели"
        trend="neutral"
      />
    </div>
  );
}
