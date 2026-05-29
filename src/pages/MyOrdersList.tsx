import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ShoppingBag, MessageSquare, ChevronRight, User, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function MyOrdersList() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [phone, setPhone] = useState(localStorage.getItem('customer_phone') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('customer_phone'));
  const [inputPhone, setInputPhone] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isLoggedIn && phone) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, phone]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_phone', phone)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      toast({
        title: "Erro ao carregar pedidos",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPhone) return;
    localStorage.setItem('customer_phone', inputPhone);
    setPhone(inputPhone);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('customer_phone');
    setPhone('');
    setIsLoggedIn(false);
    setOrders([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <Card className="w-full max-w-md border-accent/10 bg-card/40">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-2">
              <ShoppingBag className="h-6 w-6 text-accent" />
            </div>
            <CardTitle className="text-xl font-sans font-bold uppercase tracking-widest text-accent">Meus Pedidos</CardTitle>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Digite seu WhatsApp para acompanhar</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[10px] uppercase tracking-widest text-muted-foreground">Número de WhatsApp</Label>
                <div className="relative">
                  <Input 
                    id="phone"
                    value={inputPhone} 
                    onChange={(e) => setInputPhone(e.target.value)} 
                    placeholder="(92) 99999-9999"
                    className="bg-muted/10 border-accent/10 text-xs h-11 pl-10"
                    required
                  />
                  <Phone className="absolute left-3 top-3.5 h-4 w-4 text-accent/40" />
                </div>
              </div>
              <Button type="submit" className="w-full bg-accent text-background uppercase tracking-[0.2em] text-[10px] font-bold h-11">
                Ver Meus Pedidos
              </Button>
              <Button variant="ghost" onClick={() => navigate('/')} className="w-full text-[9px] uppercase tracking-widest text-muted-foreground">
                Voltar ao Catálogo
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-sans font-bold uppercase tracking-[0.2em] text-accent">Meus Pedidos</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Phone className="h-3 w-3" />
              {phone}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="text-[9px] uppercase tracking-widest border-accent/10 text-accent hover:bg-accent/5 h-8">
            Sair
          </Button>
        </div>

        {orders.length === 0 ? (
          <Card className="border-dashed border-accent/10 py-20 text-center space-y-4 bg-transparent">
            <div className="mx-auto w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-serif italic text-muted-foreground">Você ainda não tem pedidos</p>
              <Button asChild variant="link" className="text-accent uppercase tracking-widest text-[10px]">
                <Link to="/">Começar a comprar</Link>
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <Card key={order.id} className="border-accent/10 bg-card/40 hover:bg-card/60 transition-colors duration-200 overflow-hidden group">
                <Link to={`/meu-pedido/${order.id}`}>
                  <CardHeader className="p-4 flex flex-row items-center justify-between bg-muted/10 border-b border-accent/5">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-accent font-bold">Pedido #{order.id.slice(0, 8)}</p>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <Badge className={cn(
                      "text-[9px] uppercase tracking-widest px-2 py-0.5",
                      order.status === 'Entregue' ? "bg-emerald text-accent" : "bg-accent text-background"
                    )}>
                      {order.status}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex gap-1 flex-wrap">
                        {(() => {
                          try {
                            const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items as any[]);
                            return items.map((item: any, i: number) => (
                              <span key={i} className="text-[10px] bg-accent/5 px-2 py-1 rounded-sm text-foreground">
                                {item.quantity}x {item.title}
                              </span>
                            ));
                          } catch (e) {
                            return <span className="text-[10px] text-destructive">Erro ao carregar itens</span>;
                          }
                        })()}

                      </div>
                      <p className="text-lg font-serif italic text-accent">R$ {Number(order.total_price).toFixed(2).replace('.', ',')}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-accent/20 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}

        <div className="flex justify-center pt-8">
          <Button asChild variant="outline" className="text-[10px] uppercase tracking-widest border-accent/10 text-accent">
            <Link to="/">Continuar Comprando</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
