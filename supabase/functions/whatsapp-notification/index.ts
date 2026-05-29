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
    const body = await req.json();
    console.log('Incoming request body:', JSON.stringify(body));

    let record = body.record;
    if (typeof record === 'string') {
      try {
        record = JSON.parse(record);
      } catch (e) {
        console.error('Error parsing record string:', e);
      }
    }

    if (!record || !record.id) {
      return new Response(JSON.stringify({ error: 'Registro não encontrado' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID || !OWNER_PHONE_NUMBER) {
      console.error('WhatsApp configuration missing');
      return new Response(JSON.stringify({ error: 'Configuração do WhatsApp ausente' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    let items = [];
    try {
      const itemsData = record.itens_pedido || record.items || [];
      items = typeof itemsData === 'string' ? JSON.parse(itemsData) : itemsData;
    } catch (e) {
      console.error('Error parsing items string:', e);
    }

    const firstItem = items[0] || {};
    const deliveryType = record.tipo_entrega || record.delivery_type;
    const isWreath = deliveryType === 'wreath' || items.some((i: any) => i.category === 'Coroas');
    
    let messageBody = `*NOVO PEDIDO RECEBIDO!* 🌸\n\n`;
    messageBody += `*RESUMO:* ${firstItem.title || 'Produtos Diversos'}${items.length > 1 ? ` (+${items.length - 1} itens)` : ''}\n`;
    messageBody += `*TIPO:* ${isWreath ? 'Coroa de Flores' : 'Buquê/Arranjo'}\n`;
    
    if (isWreath) {
      try {
        const detailsData = record.detalhes_coroa || record.wreath_details || {};
        const details = typeof detailsData === 'string' ? JSON.parse(detailsData) : detailsData;
        messageBody += `*DADOS DA FAIXA:* ${details.ribbon_message || 'N/A'}\n`;
        messageBody += `*HOMENAGEADO:* ${details.honoree_name || 'N/A'}\n`;
        messageBody += `*LOCAL:* ${details.location || 'N/A'}\n`;
      } catch (e) {
        messageBody += `*DADOS:* Ver detalhes no painel\n`;
      }
    } else {
      messageBody += `*MENSAGEM DO CARTÃO:* ${record.mensagem_cartao || record.card_message || 'Sem mensagem'}\n`;
      messageBody += `*DESTINATÁRIO:* ${record.nome_destinatario || record.recipient_name || 'N/A'}\n`;
    }

    messageBody += `\n*CLIENTE:* ${record.nome_cliente || record.customer_name}\n`;
    messageBody += `*WHATSAPP:* ${record.whatsapp_cliente || record.customer_phone}\n`;
    messageBody += `*ENTREGA:* ${record.endereco_entrega || record.address || 'N/A'}\n`;
    messageBody += `*VALOR:* R$ ${Number(record.preco_total || record.total_price).toFixed(2).replace('.', ',')}\n`;
    messageBody += `*PAGAMENTO:* ${record.status || 'Pendente'}\n`;

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
    console.log('WhatsApp Text API response:', result);

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
