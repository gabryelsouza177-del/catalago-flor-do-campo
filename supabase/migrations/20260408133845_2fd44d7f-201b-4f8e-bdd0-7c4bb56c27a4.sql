
-- Sales table to track each sale
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_title TEXT NOT NULL,
  sale_price NUMERIC NOT NULL DEFAULT 0,
  cost_price NUMERIC NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Expenses table to track fixed/variable costs
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'Fixos',
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can manage sales
CREATE POLICY "Authenticated users can view sales" ON public.sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert sales" ON public.sales FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update sales" ON public.sales FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete sales" ON public.sales FOR DELETE TO authenticated USING (true);

-- Only authenticated users can manage expenses
CREATE POLICY "Authenticated users can view expenses" ON public.expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert expenses" ON public.expenses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update expenses" ON public.expenses FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete expenses" ON public.expenses FOR DELETE TO authenticated USING (true);
