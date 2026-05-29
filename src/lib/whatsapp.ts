import { WHATSAPP_NUMBER } from './constants';

function normalizeWhatsAppNumber(number: string) {
  const digits = number.replace(/\D/g, '');
  if (digits.length === 11) return `55${digits}`;
  if (digits.length === 10) return `55${digits.slice(0, 2)}9${digits.slice(2)}`;
  if (digits.startsWith('55')) return digits;
  return `55${digits}`;
}

export function formatOrderWhatsAppMessage(order: any) {
  let itemsArray: any[] = [];
  try {
    itemsArray = typeof order.itens_pedido === 'string' ? JSON.parse(order.itens_pedido) : (order.itens_pedido as any[]);
  } catch (e) {
    console.error('Error parsing items for WhatsApp message:', e);
  }

  const itemsList = itemsArray.map(i => `${i.quantity}x ${i.title}`).join('\n');
  const firstItem = itemsArray[0];
  const photoLink = firstItem?.image_url ? `\n\n📷 *FOTO DO PRODUTO:* ${firstItem.image_url}` : '';
  
  const isWreath = itemsArray.some(i => i.category === 'Coroas');
  
  let details = '';
  if (isWreath) {
    try {
      const wreathDetails = typeof order.detalhes_coroa === 'string' ? JSON.parse(order.detalhes_coroa) : (order.detalhes_coroa || {});
      details = `*HOMENAGEADO:* ${wreathDetails.honoree_name || 'N/A'}\n*FAIXA:* ${wreathDetails.ribbon_message || 'N/A'}\n*LOCAL:* ${wreathDetails.location || 'Não informado'}`;
    } catch (e) {
      details = `*HOMENAGEADO:* N/A\n*FAIXA:* N/A`;
    }
  } else {
    details = `*DESTINATÁRIO:* ${order.nome_destinatario}\n*MENSAGEM:* ${order.mensagem_cartao || 'Sem mensagem'}`;
  }

  const text = `✨ *NOVO PEDIDO: ${order.id.slice(0, 8)}* ✨\n\n` +
    `*COMPRADOR:* ${order.nome_cliente}\n` +
    `*PRODUTO:* \n${itemsList}\n\n` +
    (order.tipo_entrega === 'pickup' ? `*MÉTODO: RETIRADA NA LOJA*\n` : `*ENTREGA:* ${order.endereco_entrega}\n`) +
    `${details}${photoLink}\n\n` +
    (order.valor_frete > 0 ? `*FRETE:* R$ ${Number(order.valor_frete).toFixed(2).replace('.', ',')}\n` : '') +
    `*VALOR TOTAL:* R$ ${Number(order.preco_total).toFixed(2).replace('.', ',')}`;

  return `https://wa.me/${normalizeWhatsAppNumber(WHATSAPP_NUMBER)}?text=${encodeURIComponent(text)}`;
}
