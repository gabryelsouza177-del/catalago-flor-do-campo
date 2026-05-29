import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle2, Package, Truck, Clock, ShoppingBag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const statusSteps = [
  { id: 'Pagamento Pendente', label: 'Pagamento', icon: Clock },
  { id: 'Pedido Confirmado', label: 'Confirmado', icon: CheckCircle2 },
  { id: 'Preparando seu Arranjo', label: 'Preparando', icon: ShoppingBag },
  { id: 'Saiu para Entrega', label: 'Em Trânsito', icon: Truck },
  { id: 'Entregue', label: 'Entregue', icon: Package },
];

export default function MyOrder() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }

    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (data) {
        setOrder(data);
      }
      setLoading(false);
    };

    fetchOrder();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`order-view-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setOrder(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-4">
        <p className="text-accent uppercase tracking-widest text-sm">Pedido não encontrado</p>
        <Button onClick={() => navigate('/')} variant="outline" className="text-[10px] uppercase tracking-widest">
          Voltar ao Catálogo
        </Button>
      </div>
    );
  }

  const currentStatusIndex = statusSteps.findIndex(s => s.id === (order.status || 'Pagamento Pendente'));

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-sans font-bold uppercase tracking-[0.2em] text-accent">Status do Pedido</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Pedido #{order.id.slice(0, 8)}</p>
        </div>

        {/* Status Tracker */}
        <Card className="border-accent/10 bg-card/40">
          <CardContent className="p-6">
            <div className="relative flex justify-between">
              {statusSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;

                return (
                  <div key={step.id} className="flex flex-col items-center gap-2 relative z-10 flex-1">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                      isActive ? "bg-accent text-background" : "bg-muted/20 text-muted-foreground",
                      isCurrent && "ring-4 ring-accent/20 animate-pulse"
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={cn(
                      "text-[9px] uppercase tracking-tighter font-bold text-center",
                      isActive ? "text-accent" : "text-muted-foreground"
                    )}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
              <div className="absolute top-5 left-0 w-full h-[2px] bg-muted/20 -z-0" />
              <div 
                className="absolute top-5 left-0 h-[2px] bg-accent transition-all duration-1000 ease-in-out -z-0" 
                style={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card className="border-accent/10 bg-card/40">
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-8 text-[10px] uppercase tracking-widest">
              <div className="space-y-1">
                <p className="text-muted-foreground">Destinatário</p>
                <p className="text-accent font-bold">{order.recipient_name}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-muted-foreground">Data prevista</p>
                <p className="text-accent font-bold">{new Date(order.delivery_date).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-accent/10 space-y-4">
              <h4 className="text-[9px] font-sans font-bold uppercase tracking-widest text-accent">Itens do Pedido</h4>
              <div className="space-y-3">
                {(() => {
                  try {
                    const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items as any[]);
                    return items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm font-light">
                        <span className="text-muted-foreground">{item.quantity}x {item.title}</span>
                        <span className="text-accent italic font-serif">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                      </div>
                    ));
                  } catch (e) {
                    return <p className="text-xs text-destructive">Erro ao carregar itens</p>;
                  }
                })()}
              </div>

            </div>

            <div className="pt-6 border-t border-accent/10 flex justify-between items-center">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Valor Total</div>
              <div className="text-xl font-serif italic text-accent">R$ {Number(order.total_price).toFixed(2).replace('.', ',')}</div>
            </div>


            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="w-full text-[9px] uppercase tracking-widest text-muted-foreground hover:text-accent"
            >
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}