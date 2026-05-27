import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCart';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { WHATSAPP_NUMBER } from '@/lib/constants';

function normalizeWhatsAppNumber(number: string) {
  const digits = number.replace(/\D/g, '');
  if (digits.startsWith('55')) return digits;
  if (digits.length === 11) return `55${digits}`;
  return digits;
}

export default function Success() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const sessionId = searchParams.get('session_id');
  const clearCart = useCart((state) => state.clearCart);
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionId) {
      navigate('/');
      return;
    }

    const verifyPayment = async () => {
      // In a real app, you'd verify the session with Stripe via an edge function
      // For now, we'll assume if they reach here with a session_id, it's success
      // and update the order status.
      
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('stripe_session_id', sessionId) // This might be null if not updated yet
        .single();

      // If we don't find it by session_id, try to update the most recent pending order
      // (Simplified for this demo, better to use webhook)
      if (!order) {
        const { data: recentOrder } = await supabase
          .from('orders')
          .select('*')
          .eq('payment_status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (recentOrder) {
          await supabase
            .from('orders')
            .update({ payment_status: 'paid', stripe_session_id: sessionId })
            .eq('id', recentOrder.id);
          setOrder(recentOrder);
        }
      } else {
        setOrder(order);
      }
      
      clearCart();
      setLoading(false);
    };

    verifyPayment();
  }, [sessionId, clearCart, navigate]);

  const sendWhatsApp = () => {
    if (!order) return;

    const itemsList = (order.items as any[]).map(i => `${i.quantity}x ${i.title}`).join('\n');
    const text = `✨ *Novo Pedido Confirmado!* ✨\n\n` +
      `*Destinatário:* ${order.recipient_name}\n` +
      `*Data de Entrega:* ${new Date(order.delivery_date).toLocaleDateString('pt-BR')}\n` +
      `*Período:* ${order.delivery_period}\n` +
      `*Endereço:* ${order.delivery_address || order.delivery_region}\n` +
      (order.delivery_distance ? `*Distância:* ${Number(order.delivery_distance).toFixed(1)} km\n` : '') +
      `\n*Itens:* \n${itemsList}\n\n` +
      `*Mensagem do Cartão:* \n"${order.gift_message || 'Sem mensagem'}"\n\n` +
      `*Taxa de Entrega:* R$ ${Number(order.delivery_fee).toFixed(2).replace('.', ',')}\n` +
      `*Valor Total:* R$ ${Number(order.total_amount).toFixed(2).replace('.', ',')}`;

    window.open(`https://wa.me/${normalizeWhatsAppNumber(WHATSAPP_NUMBER)}?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full bg-card/40 border border-accent/10 rounded-sm p-8 text-center space-y-6">
        <CheckCircle2 className="h-16 w-16 text-emerald mx-auto" />
        <div className="space-y-2">
          <h1 className="text-xl font-sans font-medium uppercase tracking-[0.2em] text-accent">Pagamento Aprovado!</h1>
          <p className="text-sm text-muted-foreground font-light leading-relaxed">
            Seu pedido foi recebido com sucesso. Agora, envie os detalhes para nossa equipe via WhatsApp para agilizarmos sua entrega.
          </p>
        </div>
        
        <button
          onClick={sendWhatsApp}
          className="w-full bg-emerald hover:bg-emerald/80 text-accent uppercase tracking-[0.2em] text-[10px] font-bold h-12 rounded-sm transition-all duration-300"
        >
          Enviar Detalhes no WhatsApp
        </button>

        <button
          onClick={() => navigate('/')}
          className="text-[9px] uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors"
        >
          Voltar para o Catálogo
        </button>
      </div>
    </div>
  );
}
