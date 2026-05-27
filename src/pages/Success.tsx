import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCart';
import { Loader2, CheckCircle2, MessageSquare, Package, Truck, Clock, ShoppingBag } from 'lucide-react';
import { WHATSAPP_NUMBER } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

function normalizeWhatsAppNumber(number: string) {
  const digits = number.replace(/\D/g, '');
  if (digits.startsWith('55')) return digits;
  if (digits.length === 11) return `55${digits}`;
  return digits;
}

const statusSteps = [
  { id: 'Pagamento Pendente', label: 'Pagamento', icon: Clock },
  { id: 'Pedido Confirmado', label: 'Confirmado', icon: CheckCircle2 },
  { id: 'Preparando seu Arranjo', label: 'Preparando', icon: ShoppingBag },
  { id: 'Saiu para Entrega', label: 'Em Trânsito', icon: Truck },
  { id: 'Entregue', label: 'Entregue', icon: Package },
];

export default function Success() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const orderId = searchParams.get('order_id');
  const paymentStatus = searchParams.get('status');
  const clearCart = useCart((state) => state.clearCart);
  const navigate = useNavigate();

  useEffect(() => {
    if (!orderId) {
      navigate('/');
      return;
    }

    const fetchOrder = async () => {
      const { data: orderData, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderData) {
        // If we have a status from MP and it's approved
        if (paymentStatus === 'approved' || !paymentStatus) {
          if (orderData.payment_status === 'pending') {
            await supabase
              .from('orders')
              .update({ payment_status: 'paid', status: 'Pedido Confirmado' })
              .eq('id', orderId);
            
            // Refresh order data
            const { data: updatedOrder } = await supabase
              .from('orders')
              .select('*')
              .eq('id', orderId)
              .single();
              
            setOrder(updatedOrder);
          } else {
            setOrder(orderData);
          }
        } else {
          setOrder(orderData);
        }
      }
      setLoading(false);
    };

    fetchOrder();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          setOrder(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, paymentStatus, navigate]);

  const sendWhatsApp = () => {
    if (!order) return;

    const itemsList = (order.items as any[]).map(i => `${i.quantity}x ${i.title}`).join('\n');
    const isWreath = (order.items as any[]).some(i => i.category === 'Coroas');
    
    const wreathInfo = isWreath ? 
      `*Homenageado:* ${order.wreath_honoree_name}\n` +
      `*Dizeres da Faixa:* ${order.wreath_ribbon_message}\n` +
      `*Horário da Cerimônia:* ${order.wreath_ceremony_time}\n` : '';

    const text = `✨ *Novo Pedido Confirmado!* ✨\n\n` +
      (order.delivery_method === 'pickup' ? `*MÉTODO: RETIRADA NA LOJA*\n\n` : '') +
      wreathInfo +
      `*Comprador/Contato:* ${order.recipient_name}\n` +
      (order.delivery_method === 'pickup' 
        ? `*Endereço de Retirada:* Av. Joaquim Nabuco, 1446 - Centro, Manaus\n` 
        : (isWreath ? `*Local:* ${order.delivery_address}${order.delivery_complement ? ` - ${order.delivery_complement}` : ''}\n` : `*Endereço:* ${order.delivery_address}${order.delivery_complement ? ` - ${order.delivery_complement}` : ''}\n`)
      ) +
      `*Data de Entrega:* ${new Date(order.delivery_date).toLocaleDateString('pt-BR')}\n` +
      `*Horário de Entrega Desejado:* ${order.delivery_time || order.delivery_period}\n` +
      (order.delivery_distance && order.delivery_method !== 'pickup' ? `*Distância:* ${Number(order.delivery_distance).toFixed(1)} km\n` : '') +
      `\n*Itens:* \n${itemsList}\n\n` +
      (!isWreath ? `*Mensagem do Cartão:* \n"${order.gift_message || 'Sem mensagem'}"\n\n` : '') +
      `*Taxa de Entrega:* R$ ${Number(order.delivery_fee).toFixed(2).replace('.', ',')}\n` +
      `*Valor Total:* R$ ${Number(order.total_amount).toFixed(2).replace('.', ',')}`;

    window.open(`https://wa.me/${normalizeWhatsAppNumber(WHATSAPP_NUMBER)}?text=${encodeURIComponent(text)}`, '_blank');
    
    // Clear cart only after clicking WhatsApp as requested
    clearCart();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const currentStatusIndex = statusSteps.findIndex(s => s.id === (order?.status || 'Pagamento Pendente'));

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald/10 text-emerald mb-4">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-sans font-bold uppercase tracking-[0.2em] text-accent">Pedido Recebido!</h1>
          <p className="text-sm text-muted-foreground font-light max-w-md mx-auto">
            Seu pedido #{order?.id?.slice(0, 8)} foi processado. Acompanhe o status abaixo e não esqueça de nos chamar no WhatsApp.
          </p>
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
              {/* Progress Line */}
              <div className="absolute top-5 left-0 w-full h-[2px] bg-muted/20 -z-0" />
              <div 
                className="absolute top-5 left-0 h-[2px] bg-accent transition-all duration-1000 ease-in-out -z-0" 
                style={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Order Details Summary */}
        <Card className="border-accent/10 bg-card/40 overflow-hidden">
          <div className="bg-accent/5 px-6 py-4 border-b border-accent/10 flex justify-between items-center">
            <h3 className="text-[10px] font-sans font-bold uppercase tracking-widest text-accent">Resumo do Pedido</h3>
            <Badge variant="outline" className="text-[9px] uppercase tracking-widest bg-accent text-background border-none">
              {order?.status}
            </Badge>
          </div>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-3">
              {(order?.items as any[])?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-light">
                    {item.quantity}x {item.title}
                  </span>
                  <span className="font-serif italic text-accent">
                    R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-accent/10 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground uppercase tracking-widest">Entrega</span>
                <span className="text-accent">R$ {Number(order?.delivery_fee || 0).toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span className="text-accent uppercase tracking-[0.2em] font-sans">Total</span>
                <span className="text-accent font-serif italic">R$ {Number(order?.total_amount || 0).toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <Button
                onClick={sendWhatsApp}
                className="w-full bg-emerald hover:bg-emerald/80 text-white uppercase tracking-[0.2em] text-[10px] font-bold h-12"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Enviar Pedido ao WhatsApp
              </Button>
              
              <div className="flex flex-col gap-3 items-center">
                <Link 
                  to={`/meu-pedido/${order?.id}`}
                  className="text-[10px] uppercase tracking-widest text-accent hover:underline flex items-center gap-2"
                >
                  <ShoppingBag className="h-3 w-3" />
                  Link Permanente do Pedido
                </Link>
                
                <Button
                  variant="ghost"
                  onClick={() => navigate('/')}
                  className="text-[9px] uppercase tracking-widest text-muted-foreground hover:text-accent"
                >
                  Voltar para o Catálogo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
