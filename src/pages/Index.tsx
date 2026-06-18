import { useMemo, useState } from 'react';
import Icon from '@/components/ui/icon';

type StatusKey = 'new' | 'progress' | 'done' | 'postponed';

interface Order {
  id: string;
  number: string;
  title: string;
  responsible: string;
  department: string;
  deadline: string;
  priority: 'Высокий' | 'Средний' | 'Низкий';
  status: StatusKey;
}

const STATUS: Record<StatusKey, { label: string; dot: string; chip: string; icon: string }> = {
  new: { label: 'Новое', dot: 'bg-slate-400', chip: 'bg-slate-100 text-slate-700 border-slate-200', icon: 'FileText' },
  progress: { label: 'В процессе', dot: 'bg-sky-500', chip: 'bg-sky-50 text-sky-700 border-sky-200', icon: 'Loader' },
  done: { label: 'Выполнено', dot: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'CheckCircle2' },
  postponed: { label: 'Отложено', dot: 'bg-amber-500', chip: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'PauseCircle' },
};

const ORDERS: Order[] = [
  { id: '1', number: '№ 142-Р', title: 'Подготовить отчёт по итогам II квартала', responsible: 'Соколов А. В.', department: 'Финансы', deadline: '22.06.2026', priority: 'Высокий', status: 'progress' },
  { id: '2', number: '№ 141-Р', title: 'Согласовать договор с подрядчиком ООО «Вектор»', responsible: 'Морозова Е. И.', department: 'Юр. отдел', deadline: '19.06.2026', priority: 'Высокий', status: 'new' },
  { id: '3', number: '№ 138-Р', title: 'Провести инвентаризацию складских остатков', responsible: 'Кузнецов Д. П.', department: 'Логистика', deadline: '15.06.2026', priority: 'Средний', status: 'done' },
  { id: '4', number: '№ 137-Р', title: 'Обновить регламент работы службы поддержки', responsible: 'Васильева О. С.', department: 'Сервис', deadline: '30.06.2026', priority: 'Низкий', status: 'postponed' },
  { id: '5', number: '№ 135-Р', title: 'Закупка офисного оборудования для филиала', responsible: 'Петров И. Н.', department: 'АХО', deadline: '25.06.2026', priority: 'Средний', status: 'progress' },
  { id: '6', number: '№ 130-Р', title: 'Аттестация сотрудников отдела продаж', responsible: 'Смирнова Л. К.', department: 'HR', deadline: '12.06.2026', priority: 'Высокий', status: 'done' },
  { id: '7', number: '№ 128-Р', title: 'Разработать план обучения новых менеджеров', responsible: 'Орлов В. М.', department: 'HR', deadline: '28.06.2026', priority: 'Низкий', status: 'new' },
];

const PRIORITY_COLOR: Record<Order['priority'], string> = {
  Высокий: 'text-destructive',
  Средний: 'text-amber-600',
  Низкий: 'text-muted-foreground',
};

const Index = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StatusKey | 'all'>('all');

  const stats = useMemo(() => {
    const base: Record<StatusKey, number> = { new: 0, progress: 0, done: 0, postponed: 0 };
    ORDERS.forEach((o) => (base[o.status] += 1));
    return base;
  }, []);

  const filtered = useMemo(() => {
    return ORDERS.filter((o) => {
      const matchStatus = filter === 'all' || o.status === filter;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        o.title.toLowerCase().includes(q) ||
        o.number.toLowerCase().includes(q) ||
        o.responsible.toLowerCase().includes(q) ||
        o.department.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [search, filter]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-primary text-primary-foreground">
        <div className="container mx-auto flex items-center justify-between py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-foreground/10 ring-1 ring-primary-foreground/20">
              <Icon name="ClipboardCheck" size={22} />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Контроль распоряжений</h1>
              <p className="text-xs text-primary-foreground/60 font-mono">Система исполнительской дисциплины</p>
            </div>
          </div>
          <button className="flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:opacity-90">
            <Icon name="Plus" size={16} />
            <span className="hidden sm:inline">Новое распоряжение</span>
          </button>
        </div>
      </header>

      <main className="container mx-auto py-8">
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {(Object.keys(STATUS) as StatusKey[]).map((key, i) => {
            const active = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(active ? 'all' : key)}
                style={{ animationDelay: `${i * 60}ms` }}
                className={`animate-fade-in rounded-lg border bg-card p-5 text-left transition hover:shadow-md ${
                  active ? 'border-accent ring-2 ring-accent/30' : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-md border ${STATUS[key].chip}`}>
                    <Icon name={STATUS[key].icon} size={18} />
                  </span>
                  <span className="font-mono text-3xl font-semibold text-foreground">{stats[key]}</span>
                </div>
                <p className="mt-3 text-sm font-medium text-muted-foreground">{STATUS[key].label}</p>
              </button>
            );
          })}
        </section>

        <section className="mt-8 rounded-lg border border-border bg-card">
          <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center md:justify-between">
            <div className="relative md:w-96">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по теме, номеру, исполнителю…"
                className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <FilterChip label="Все" active={filter === 'all'} onClick={() => setFilter('all')} />
              {(Object.keys(STATUS) as StatusKey[]).map((key) => (
                <FilterChip key={key} label={STATUS[key].label} active={filter === key} onClick={() => setFilter(key)} />
              ))}
            </div>
          </div>

          <div className="hidden grid-cols-12 gap-4 border-b border-border bg-muted/40 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">
            <span className="col-span-1">Номер</span>
            <span className="col-span-5">Распоряжение</span>
            <span className="col-span-2">Исполнитель</span>
            <span className="col-span-1">Срок</span>
            <span className="col-span-1">Приоритет</span>
            <span className="col-span-2">Статус</span>
          </div>

          <div className="divide-y divide-border">
            {filtered.map((o, i) => (
              <div
                key={o.id}
                style={{ animationDelay: `${i * 40}ms` }}
                className="animate-fade-in grid grid-cols-1 gap-3 px-4 py-4 transition hover:bg-muted/30 md:grid-cols-12 md:items-center md:gap-4"
              >
                <span className="col-span-1 font-mono text-sm text-muted-foreground">{o.number}</span>
                <div className="col-span-5">
                  <p className="font-medium text-foreground">{o.title}</p>
                  <p className="text-xs text-muted-foreground">{o.department}</p>
                </div>
                <span className="col-span-2 text-sm text-foreground">{o.responsible}</span>
                <span className="col-span-1 font-mono text-sm text-foreground">{o.deadline}</span>
                <span className={`col-span-1 text-sm font-medium ${PRIORITY_COLOR[o.priority]}`}>{o.priority}</span>
                <div className="col-span-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS[o.status].chip}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${STATUS[o.status].dot}`} />
                    {STATUS[o.status].label}
                  </span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
                <Icon name="SearchX" size={32} />
                <p className="text-sm">Распоряжения не найдены</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
            <span>Показано: {filtered.length} из {ORDERS.length}</span>
            <span className="font-mono">Обновлено 18.06.2026</span>
          </div>
        </section>
      </main>
    </div>
  );
};

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md border px-3 py-1.5 text-sm font-medium transition ${
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background text-muted-foreground hover:border-accent hover:text-foreground'
      }`}
    >
      {label}
    </button>
  );
}

export default Index;
