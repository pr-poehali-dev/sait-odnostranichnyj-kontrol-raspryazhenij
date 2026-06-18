import { useEffect, useMemo, useState } from 'react';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type StatusKey = 'new' | 'progress' | 'done' | 'postponed';

interface Order {
  id: string;
  number: string;
  date: string;
  title: string;
  deadline: string;
  rank: string;
  responsible: string;
  priority: 'Высокий' | 'Средний' | 'Низкий';
  status: StatusKey;
}

const STATUS: Record<StatusKey, { label: string; dot: string; chip: string; icon: string }> = {
  new: { label: 'Новое', dot: 'bg-slate-400', chip: 'bg-slate-100 text-slate-700 border-slate-200', icon: 'FileText' },
  progress: { label: 'В процессе', dot: 'bg-sky-500', chip: 'bg-sky-50 text-sky-700 border-sky-200', icon: 'Loader' },
  done: { label: 'Выполнено', dot: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'CheckCircle2' },
  postponed: { label: 'Отложено', dot: 'bg-amber-500', chip: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'PauseCircle' },
};

const RANKS = [
  'Рядовой', 'Ефрейтор', 'Младший сержант', 'Сержант', 'Старший сержант', 'Старшина',
  'Прапорщик', 'Старший прапорщик', 'Младший лейтенант', 'Лейтенант', 'Старший лейтенант',
  'Капитан', 'Майор', 'Подполковник', 'Полковник', 'Генерал-майор',
];

const PRIORITIES: Order['priority'][] = ['Высокий', 'Средний', 'Низкий'];

const PRIORITY_COLOR: Record<Order['priority'], string> = {
  Высокий: 'text-destructive',
  Средний: 'text-amber-600',
  Низкий: 'text-muted-foreground',
};

const STORAGE_KEY = 'orders_v2';

const DEFAULT_ORDERS: Order[] = [
  { id: '1', number: '142-Р', date: '14.06.2026', title: 'Подготовить отчёт по итогам II квартала', deadline: '22.06.2026', rank: 'Майор', responsible: 'Соколов А. В.', priority: 'Высокий', status: 'progress' },
  { id: '2', number: '141-Р', date: '13.06.2026', title: 'Согласовать договор с подрядчиком ООО «Вектор»', deadline: '19.06.2026', rank: 'Капитан', responsible: 'Морозова Е. И.', priority: 'Высокий', status: 'new' },
  { id: '3', number: '138-Р', date: '08.06.2026', title: 'Провести инвентаризацию складских остатков', deadline: '15.06.2026', rank: 'Старшина', responsible: 'Кузнецов Д. П.', priority: 'Средний', status: 'done' },
  { id: '4', number: '137-Р', date: '07.06.2026', title: 'Обновить регламент работы службы поддержки', deadline: '30.06.2026', rank: 'Лейтенант', responsible: 'Васильева О. С.', priority: 'Низкий', status: 'postponed' },
  { id: '5', number: '135-Р', date: '05.06.2026', title: 'Закупка офисного оборудования для филиала', deadline: '25.06.2026', rank: 'Старший лейтенант', responsible: 'Петров И. Н.', priority: 'Средний', status: 'progress' },
];

const emptyForm = (): Order => ({
  id: '', number: '', date: '', title: '', deadline: '', rank: RANKS[0], responsible: '', priority: 'Средний', status: 'new',
});

const inputCls =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20';

const Index = () => {
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Order[]) : DEFAULT_ORDERS;
    } catch {
      return DEFAULT_ORDERS;
    }
  });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StatusKey | 'all'>('all');
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<Order>(emptyForm());
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const stats = useMemo(() => {
    const base: Record<StatusKey, number> = { new: 0, progress: 0, done: 0, postponed: 0 };
    orders.forEach((o) => (base[o.status] += 1));
    return base;
  }, [orders]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = filter === 'all' || o.status === filter;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        o.title.toLowerCase().includes(q) ||
        o.number.toLowerCase().includes(q) ||
        o.responsible.toLowerCase().includes(q) ||
        o.rank.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [orders, search, filter]);

  const openCreate = () => {
    setForm(emptyForm());
    setEditOpen(true);
  };

  const openEdit = (o: Order) => {
    setForm({ ...o });
    setEditOpen(true);
  };

  const saveOrder = () => {
    if (!form.title.trim()) return;
    if (form.id) {
      setOrders((prev) => prev.map((o) => (o.id === form.id ? form : o)));
    } else {
      setOrders((prev) => [{ ...form, id: Date.now().toString() }, ...prev]);
    }
    setEditOpen(false);
  };

  const confirmDelete = () => {
    if (deleteId) setOrders((prev) => prev.filter((o) => o.id !== deleteId));
    setDeleteId(null);
  };

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
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:opacity-90"
          >
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

          <div className="hidden grid-cols-12 gap-3 border-b border-border bg-muted/40 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:grid">
            <span className="col-span-1">Номер</span>
            <span className="col-span-1">Дата</span>
            <span className="col-span-3">Наименование</span>
            <span className="col-span-1">Срок</span>
            <span className="col-span-2">Звание</span>
            <span className="col-span-2">Исполнитель</span>
            <span className="col-span-2 text-right">Статус</span>
          </div>

          <div className="divide-y divide-border">
            {filtered.map((o, i) => (
              <div
                key={o.id}
                style={{ animationDelay: `${i * 40}ms` }}
                className="animate-fade-in group grid grid-cols-1 gap-2 px-4 py-4 transition hover:bg-muted/30 lg:grid-cols-12 lg:items-center lg:gap-3"
              >
                <span className="col-span-1 font-mono text-sm text-muted-foreground">№ {o.number}</span>
                <span className="col-span-1 font-mono text-sm text-foreground">{o.date}</span>
                <div className="col-span-3">
                  <p className="font-medium text-foreground">{o.title}</p>
                  <span className={`mt-1 inline-block text-xs font-medium ${PRIORITY_COLOR[o.priority]}`}>
                    Приоритет: {o.priority}
                  </span>
                </div>
                <span className="col-span-1 font-mono text-sm text-foreground">{o.deadline}</span>
                <span className="col-span-2 text-sm text-muted-foreground">{o.rank}</span>
                <span className="col-span-2 text-sm text-foreground">{o.responsible}</span>
                <div className="col-span-2 flex items-center justify-between gap-2 lg:justify-end">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS[o.status].chip}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${STATUS[o.status].dot}`} />
                    {STATUS[o.status].label}
                  </span>
                  <div className="flex gap-1 opacity-100 lg:opacity-0 lg:transition lg:group-hover:opacity-100">
                    <button
                      onClick={() => openEdit(o)}
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:border-accent hover:text-accent"
                      title="Редактировать"
                    >
                      <Icon name="Pencil" size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteId(o.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:border-destructive hover:text-destructive"
                      title="Удалить"
                    >
                      <Icon name="Trash2" size={15} />
                    </button>
                  </div>
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
            <span>Показано: {filtered.length} из {orders.length}</span>
            <span className="font-mono">Обновлено 18.06.2026</span>
          </div>
        </section>
      </main>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id ? 'Редактирование распоряжения' : 'Новое распоряжение'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <Field label="Номер">
              <input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} placeholder="143-Р" className={inputCls} />
            </Field>
            <Field label="Дата">
              <input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} placeholder="18.06.2026" className={inputCls} />
            </Field>
            <Field label="Наименование" full>
              <textarea value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} rows={2} placeholder="Текст распоряжения" className={inputCls} />
            </Field>
            <Field label="Срок исполнения">
              <input value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} placeholder="25.06.2026" className={inputCls} />
            </Field>
            <Field label="Приоритет">
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Order['priority'] })} className={inputCls}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Звание">
              <select value={form.rank} onChange={(e) => setForm({ ...form, rank: e.target.value })} className={inputCls}>
                {RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Исполнитель">
              <input value={form.responsible} onChange={(e) => setForm({ ...form, responsible: e.target.value })} placeholder="Иванов И. И." className={inputCls} />
            </Field>
            <Field label="Статус" full>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as StatusKey })} className={inputCls}>
                {(Object.keys(STATUS) as StatusKey[]).map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}
              </select>
            </Field>
          </div>
          <DialogFooter>
            <button onClick={() => setEditOpen(false)} className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted">
              Отмена
            </button>
            <button onClick={saveOrder} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90">
              Сохранить
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить распоряжение?</AlertDialogTitle>
            <AlertDialogDescription>Действие нельзя отменить. Запись будет удалена безвозвратно.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? 'col-span-2' : 'col-span-1'}>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

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
