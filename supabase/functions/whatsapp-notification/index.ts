import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const WHATSAPP_ACCESS_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
const OWNER_PHONE_NUMBER = Deno.env.get('OWNER_PHONE_NUMBER');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { record } = await req.json();
    console.log('New order received:', record.id);

    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID || !OWNER_PHONE_NUMBER) {
      console.error('WhatsApp configuration missing (WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, OWNER_PHONE_NUMBER)');
      return new Response(JSON.stringify({ error: 'Configuração do WhatsApp ausente' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const items = record.items || [];
    const firstItem = items[0] || {};
    const isWreath = items.some((i: any) => i.category === 'Coroas');
    
    let messageBody = `*NOVO PEDIDO RECEBIDO!* 🌸\n\n`;
    messageBody += `*RESUMO:* ${firstItem.title || 'Produtos Diversos'}${items.length > 1 ? ` (+${items.length - 1} itens)` : ''}\n`;
    messageBody += `*TIPO:* ${isWreath ? 'Coroa de Flores' : 'Buquê/Arranjo'}\n`;
    
    if (isWreath) {
      messageBody += `*DADOS DA FAIXA:* ${record.wreath_ribbon_message || 'N/A'}\n`;
      messageBody += `*HOMENAGEADO:* ${record.wreath_honoree_name || 'N/A'}\n`;
      messageBody += `*LOCAL:* ${record.wreath_location || 'N/A'}\n`;
    } else {
      messageBody += `*MENSAGEM DO CARTÃO:* ${record.gift_message || 'Sem mensagem'}\n`;
      messageBody += `*DESTINATÁRIO:* ${record.recipient_name || 'N/A'}\n`;
    }

    messageBody += `\n*CLIENTE:* ${record.customer_name}\n`;
    messageBody += `*WHATSAPP:* ${record.customer_phone}\n`;
    messageBody += `*ENTREGA:* ${record.delivery_method === 'pickup' ? 'RETIRADA NA LOJA' : record.delivery_address}\n`;
    messageBody += `*VALOR:* R$ ${Number(record.total_amount).toFixed(2).replace('.', ',')}\n`;
    messageBody += `*PAGAMENTO:* ${record.status === 'Pagamento na Retirada' ? 'PAGAR NA RETIRADA' : 'Mercado Pago (Pendente)'}\n`;

    // Send text message
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: OWNER_PHONE_NUMBER,
          type: "text",
          text: { body: messageBody },
        }),
      }
    );

    const result = await response.json();
    console.log('WhatsApp API response:', result);

    // If there's an image, send it separately (or as a template if configured, but text + image is simpler as two messages)
    if (firstItem.image_url) {
      await fetch(
        `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: OWNER_PHONE_NUMBER,
            type: "image",
            image: { link: firstItem.image_url },
          }),
        }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error processing notification:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})
