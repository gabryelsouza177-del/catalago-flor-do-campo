import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Sale {
  id: string;
  product_id: string | null;
  product_title: string;
  sale_price: number;
  cost_price: number;
  quantity: number;
  sale_date: string;
  created_at: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  expense_date: string;
  created_at: string;
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function monthStartStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

function lastWeekDates(): string[] {
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

export function useSales() {
  return useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('sale_date', { ascending: false });
      if (error) throw error;
      return data as Sale[];
    },
  });
}

export function useExpenses() {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false });
      if (error) throw error;
      return data as Expense[];
    },
  });
}

export function useDashboardMetrics(sales: Sale[] | undefined, expenses: Expense[] | undefined) {
  const today = todayStr();
  const monthStart = monthStartStr();

  const todaySales = sales?.filter(s => s.sale_date === today) ?? [];
  const monthSales = sales?.filter(s => s.sale_date >= monthStart) ?? [];
  const monthExpenses = expenses?.filter(e => e.expense_date >= monthStart) ?? [];

  const vendasDia = todaySales.reduce((sum, s) => sum + Number(s.sale_price) * s.quantity, 0);
  const custoDia = todaySales.reduce((sum, s) => sum + Number(s.cost_price) * s.quantity, 0);
  const ganhosLiquidosDia = vendasDia - custoDia;

  const faturamentoMensal = monthSales.reduce((sum, s) => sum + Number(s.sale_price) * s.quantity, 0);
  const custoMensal = monthSales.reduce((sum, s) => sum + Number(s.cost_price) * s.quantity, 0);
  const despesasMensal = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const lucroMensal = faturamentoMensal - custoMensal - despesasMensal;

  // Weekly chart data
  const weekDates = lastWeekDates();
  const weeklyData = weekDates.map(date => {
    const daySales = sales?.filter(s => s.sale_date === date) ?? [];
    const total = daySales.reduce((sum, s) => sum + Number(s.sale_price) * s.quantity, 0);
    const dayLabel = new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' });
    return { name: dayLabel, vendas: total };
  });

  // Expense categories for donut
  const expenseByCategory: Record<string, number> = {};
  (expenses ?? []).filter(e => e.expense_date >= monthStart).forEach(e => {
    expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + Number(e.amount);
  });
  const expenseCategoryData = Object.entries(expenseByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  return {
    vendasDia,
    ganhosLiquidosDia,
    faturamentoMensal,
    lucroMensal,
    weeklyData,
    expenseCategoryData,
  };
}
