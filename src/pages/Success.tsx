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
  const orderId = searchParams.get('order_id');
  const paymentStatus = searchParams.get('status');
  const clearCart = useCart((state) => state.clearCart);
  const navigate = useNavigate();

  useEffect(() => {
    if (!orderId) {
      navigate('/');
      return;
    }

    const verifyPayment = async () => {
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (order) {
        // If we have a status from MP and it's approved
        if (paymentStatus === 'approved' || !paymentStatus) {
          await supabase
            .from('orders')
            .update({ payment_status: 'paid' })
            .eq('id', orderId);
          
          // Refresh order data
          const { data: updatedOrder } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();
            
          setOrder(updatedOrder);
        } else {
          setOrder(order);
        }
      }
      
      clearCart();
      setLoading(false);
    };

    verifyPayment();
  }, [orderId, paymentStatus, clearCart, navigate]);

  const sendWhatsApp = () => {
    if (!order) return;

    const itemsList = (order.items as any[]).map(i => `${i.quantity}x ${i.title}`).join('\n');
    const isWreath = (order.items as any[]).some(i => i.category === 'Coroas');
    
    const wreathInfo = isWreath ? 
      `*Homenageado:* ${order.wreath_honoree_name}\n` +
      `*Dizeres da Faixa:* ${order.wreath_ribbon_message}\n` +
      `*Horário da Cerimônia:* ${order.wreath_ceremony_time}\n` : '';

    const text = `✨ *Novo Pedido Confirmado!* ✨\n\n` +
      wreathInfo +
      `*Comprador/Contato:* ${order.recipient_name}\n` +
      (isWreath ? `*Local:* ${order.delivery_address}${order.delivery_complement ? ` - ${order.delivery_complement}` : ''}\n` : `*Endereço:* ${order.delivery_address}${order.delivery_complement ? ` - ${order.delivery_complement}` : ''}\n`) +
      `*Data de Entrega:* ${new Date(order.delivery_date).toLocaleDateString('pt-BR')}\n` +
      `*Período:* ${order.delivery_period}\n` +
      (order.delivery_distance ? `*Distância:* ${Number(order.delivery_distance).toFixed(1)} km\n` : '') +
      `\n*Itens:* \n${itemsList}\n\n` +
      (!isWreath ? `*Mensagem do Cartão:* \n"${order.gift_message || 'Sem mensagem'}"\n\n` : '') +
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
