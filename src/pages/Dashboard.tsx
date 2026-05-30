import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// useAuth removido para usar login hardcoded conforme solicitado
import { useSales, useExpenses, useDashboardMetrics, type Sale, type Expense } from '@/hooks/useDashboard';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  DollarSign, TrendingUp, Calendar, PiggyBank,
  Flower2, ArrowLeft, Plus, Loader2, Trash2,
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const EXPENSE_CATEGORIES = ['Fornecedores', 'Logística/Combustível', 'Fixos'];
const PIE_COLORS = ['hsl(43, 76%, 52%)', 'hsl(158, 50%, 30%)', 'hsl(340, 45%, 50%)'];

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function Dashboard() {
  // Autenticação gerenciada pelo ProtectedRoute e admin_session localStorage
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: sales, isLoading: salesLoading, refetch: refetchSales } = useSales();
  const { data: expenses, isLoading: expensesLoading, refetch: refetchExpenses } = useExpenses();
  const metrics = useDashboardMetrics(sales, expenses);

  const [saleOpen, setSaleOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sale form
  const [saleTitle, setSaleTitle] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [saleCost, setSaleCost] = useState('');
  const [saleQty, setSaleQty] = useState('1');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);

  // Expense form
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState('Fornecedores');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // Analytics or metrics fetching could go here
  }, []);

  const handleAddSale = async () => {
    if (!saleTitle || !salePrice) {
      toast({ title: 'Preencha título e preço', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('sales').insert({
      product_title: saleTitle,
      sale_price: parseFloat(salePrice),
      cost_price: parseFloat(saleCost || '0'),
      quantity: parseInt(saleQty || '1'),
      sale_date: saleDate,
    });
    setSaving(false);
    if (error) {
      toast({ title: 'Erro ao registrar venda', variant: 'destructive' });
    } else {
      toast({ title: '✨ Venda registrada!', className: 'border-accent bg-accent/10 text-accent' });
      setSaleOpen(false);
      setSaleTitle(''); setSalePrice(''); setSaleCost(''); setSaleQty('1');
      refetchSales();
    }
  };

  const handleAddExpense = async () => {
    if (!expDesc || !expAmount) {
      toast({ title: 'Preencha descrição e valor', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('expenses').insert({
      description: expDesc,
      amount: parseFloat(expAmount),
      category: expCategory,
      expense_date: expDate,
    });
    setSaving(false);
    if (error) {
      toast({ title: 'Erro ao registrar despesa', variant: 'destructive' });
    } else {
      toast({ title: '✨ Despesa registrada!', className: 'border-accent bg-accent/10 text-accent' });
      setExpenseOpen(false);
      setExpDesc(''); setExpAmount('');
      refetchExpenses();
    }
  };

  const handleDeleteSale = async (id: string) => {
    if (!confirm('Excluir esta venda?')) return;
    await supabase.from('sales').delete().eq('id', id);
    refetchSales();
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Excluir esta despesa?')) return;
    await supabase.from('expenses').delete().eq('id', id);
    refetchExpenses();
  };

  const loading = salesLoading || expensesLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 glass border-b border-accent/8">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin">
              <Button variant="ghost" size="icon" className="text-accent/60 hover:text-accent">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Flower2 className="h-5 w-5 text-accent" />
            <span className="font-serif text-lg text-accent tracking-wide">Dashboard Financeiro</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="gold-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-sans">Vendas do Dia</p>
                <p className="text-lg font-serif text-accent font-semibold">{loading ? '...' : formatCurrency(metrics.vendasDia)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="gold-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-sans">Ganhos Líquidos</p>
                <p className="text-lg font-serif text-accent font-semibold">{loading ? '...' : formatCurrency(metrics.ganhosLiquidosDia)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="gold-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-sans">Faturamento Mensal</p>
                <p className="text-lg font-serif text-accent font-semibold">{loading ? '...' : formatCurrency(metrics.faturamentoMensal)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="gold-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald/20 flex items-center justify-center">
                <PiggyBank className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-sans">Lucro Mensal</p>
                <p className={`text-lg font-serif font-semibold ${metrics.lucroMensal >= 0 ? 'text-accent' : 'text-destructive'}`}>
                  {loading ? '...' : formatCurrency(metrics.lucroMensal)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart - Weekly Sales */}
          <Card className="gold-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-serif text-accent tracking-wide">Vendas — Última Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsla(43,20%,16%,0.5)" />
                    <XAxis dataKey="name" tick={{ fill: 'hsl(40,8%,50%)', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'hsl(40,8%,50%)', fontSize: 11 }} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: 'hsl(158,40%,10%)',
                        border: '1px solid hsla(43,76%,52%,0.2)',
                        borderRadius: '8px',
                        color: 'hsl(40,15%,90%)',
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="vendas" fill="hsl(43,76%,52%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Pie Chart - Expense Categories */}
          <Card className="gold-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-serif text-accent tracking-wide">Despesas por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {metrics.expenseCategoryData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    Nenhuma despesa registrada este mês
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics.expenseCategoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                        nameKey="name"
                      >
                        {metrics.expenseCategoryData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: 'hsl(158,40%,10%)',
                          border: '1px solid hsla(43,76%,52%,0.2)',
                          borderRadius: '8px',
                          color: 'hsl(40,15%,90%)',
                          fontSize: 12,
                        }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: 11, color: 'hsl(40,8%,50%)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <Dialog open={saleOpen} onOpenChange={setSaleOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="h-4 w-4 mr-1" /> Registrar Venda
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm" onOpenAutoFocus={e => e.preventDefault()}>
              <DialogHeader><DialogTitle>Nova Venda</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Produto *</Label><Input value={saleTitle} onChange={e => setSaleTitle(e.target.value)} /></div>
                <div><Label>Preço de Venda (R$) *</Label><Input type="number" step="0.01" value={salePrice} onChange={e => setSalePrice(e.target.value)} /></div>
                <div><Label>Custo do Produto (R$)</Label><Input type="number" step="0.01" value={saleCost} onChange={e => setSaleCost(e.target.value)} /></div>
                <div><Label>Quantidade</Label><Input type="number" min="1" value={saleQty} onChange={e => setSaleQty(e.target.value)} /></div>
                <div><Label>Data</Label><Input type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} /></div>
                <Button onClick={handleAddSale} className="w-full" disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />} Salvar Venda
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-accent/20 text-accent hover:bg-accent/10">
                <Plus className="h-4 w-4 mr-1" /> Registrar Despesa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm" onOpenAutoFocus={e => e.preventDefault()}>
              <DialogHeader><DialogTitle>Nova Despesa</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Descrição *</Label><Input value={expDesc} onChange={e => setExpDesc(e.target.value)} /></div>
                <div><Label>Valor (R$) *</Label><Input type="number" step="0.01" value={expAmount} onChange={e => setExpAmount(e.target.value)} /></div>
                <div>
                  <Label>Categoria</Label>
                  <select
                    value={expCategory}
                    onChange={e => setExpCategory(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><Label>Data</Label><Input type="date" value={expDate} onChange={e => setExpDate(e.target.value)} /></div>
                <Button onClick={handleAddExpense} className="w-full" disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />} Salvar Despesa
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Recent Sales Table */}
        <Card className="gold-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-serif text-accent tracking-wide">Vendas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Qtd</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(sales ?? []).slice(0, 10).map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="text-sm">{s.product_title}</TableCell>
                    <TableCell className="text-sm">{s.quantity}</TableCell>
                    <TableCell className="text-sm text-accent">{formatCurrency(Number(s.sale_price) * s.quantity)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(s.sale_date + 'T12:00:00').toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteSale(s.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!sales || sales.length === 0) && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhuma venda registrada</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Expenses Table */}
        <Card className="gold-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-serif text-accent tracking-wide">Despesas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(expenses ?? []).slice(0, 10).map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="text-sm">{e.description}</TableCell>
                    <TableCell className="text-sm">{e.category}</TableCell>
                    <TableCell className="text-sm text-destructive">{formatCurrency(Number(e.amount))}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(e.expense_date + 'T12:00:00').toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteExpense(e.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!expenses || expenses.length === 0) && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhuma despesa registrada</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
