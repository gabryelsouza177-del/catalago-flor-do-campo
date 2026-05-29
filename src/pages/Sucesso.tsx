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

export default function Sucesso() {
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
      const { data: orderData } = await supabase
        .from('pedidos')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderData) {
        if (paymentStatus === 'approved' || !paymentStatus) {
          if (orderData.status === 'Pendente') {
            await (supabase
              .from('pedidos')
              .update({ status: 'Pedido Confirmado' } as any)
              .eq('id', orderId) as any);
            
            const { data: updatedOrder } = await supabase
              .from('pedidos')
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

    const channel = supabase
      .channel(`order-${orderId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pedidos', filter: `id=eq.${orderId}` }, (payload) => {
        setOrder(payload.new);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId, paymentStatus, navigate]);

  const sendWhatsApp = () => {
    if (!order) return;

    let itemsArray: any[] = [];
    try {
      itemsArray = typeof order.itens_pedido === 'string' ? JSON.parse(order.itens_pedido) : (order.itens_pedido as any[]);
    } catch (e) {
      console.error('Error parsing items in Success page:', e);
    }

    const itemsList = itemsArray.map(i => `${i.quantity}x ${i.title}`).join('\n');
    const isWreath = itemsArray.some(i => i.category === 'Coroas');
    
    let details = '';
    if (isWreath) {
      try {
        const wreathDetails = order.detalhes_coroa ? JSON.parse(order.detalhes_coroa) : {};
        details = `*HOMENAGEADO:* ${wreathDetails.honoree_name || 'N/A'}\n*FAIXA:* ${wreathDetails.ribbon_message || 'N/A'}\n*LOCAL:* ${wreathDetails.location || 'Não informado'}`;
      } catch (e) {
        details = `*HOMENAGEADO:* N/A\n*FAIXA:* N/A`;
      }
    } else {
      details = `*DESTINATÁRIO:* ${order.nome_destinatario}\n*MENSAGEM:* ${order.mensagem_cartao || 'Sem mensagem'}`;
    }

    const text = `✨ *NOVO PEDIDO: ${order.id.slice(0, 8)}* ✨\n\n` +
      `*PRODUTO:* \n${itemsList}\n\n` +
      (order.tipo_entrega === 'pickup' ? `*MÉTODO: RETIRADA NA LOJA*\n` : `*ENTREGA:* ${order.endereco_entrega}\n`) +
      `${details}\n\n` +
      `*VALOR TOTAL:* R$ ${Number(order.preco_total).toFixed(2).replace('.', ',')}`;


    window.open(`https://wa.me/${normalizeWhatsAppNumber(WHATSAPP_NUMBER)}?text=${encodeURIComponent(text)}`, '_blank');
    clearCart();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>;

  const currentStatusIndex = statusSteps.findIndex(s => s.id === (order?.status || 'Pagamento Pendente'));

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald/10 text-emerald mb-4">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-sans font-bold uppercase tracking-[0.2em] text-accent">Obrigado, {order?.nome_destinatario}!</h1>
          <p className="text-sm text-muted-foreground font-light max-w-md mx-auto">
            Seu pedido foi recebido com sucesso.
          </p>
        </div>

        <Card className="border-accent/10 bg-card/40">
          <CardContent className="p-6">
            <div className="relative flex justify-between">
              {statusSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                return (
                  <div key={step.id} className="flex flex-col items-center gap-2 relative z-10 flex-1">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500", isActive ? "bg-accent text-background" : "bg-muted/20 text-muted-foreground", isCurrent && "ring-4 ring-accent/20 animate-pulse")}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={cn("text-[9px] uppercase tracking-tighter font-bold text-center", isActive ? "text-accent" : "text-muted-foreground")}>{step.label}</span>
                  </div>
                );
              })}
              <div className="absolute top-5 left-0 w-full h-[2px] bg-muted/20 -z-0" />
              <div className="absolute top-5 left-0 h-[2px] bg-accent transition-all duration-1000 ease-in-out -z-0" style={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/10 bg-card/40 overflow-hidden">
          <div className="bg-accent/5 px-6 py-4 border-b border-accent/10 flex justify-between items-center">
            <h3 className="text-[10px] font-sans font-bold uppercase tracking-widest text-accent">Resumo do Pedido</h3>
            <Badge variant="outline" className="text-[9px] uppercase tracking-widest bg-accent text-background border-none">#{order?.id?.slice(0, 8)}</Badge>
          </div>
          <CardContent className="p-6 space-y-6">
            <Button onClick={sendWhatsApp} className="w-full bg-emerald hover:bg-emerald/80 text-white uppercase tracking-[0.2em] text-[11px] font-bold h-14 shadow-lg shadow-emerald/20 animate-pulse">
              <MessageSquare className="mr-2 h-5 w-5" />
              CLIQUE AQUI PARA ENVIAR O PEDIDO AO NOSSO WHATSAPP
            </Button>
            <Button variant="ghost" onClick={() => navigate('/')} className="w-full text-[9px] uppercase tracking-widest text-muted-foreground hover:text-accent">Voltar para o Catálogo</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
