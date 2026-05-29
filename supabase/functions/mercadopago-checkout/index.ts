import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, items, deliveryFee } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if store is open
    const { data: settings } = await supabase.from('site_settings').select('store_is_open').single();
    if (settings && !settings.store_is_open) {
      throw new Error("A loja está fechada no momento. Pedidos não podem ser processados.");
    }

    const accessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");

    if (!accessToken) {
      throw new Error("MERCADO_PAGO_ACCESS_TOKEN not set");
    }

    const mpItems = items.map((item: any) => ({
      title: item.name,
      quantity: item.quantity,
      unit_price: item.amount / 100, // MP uses decimal for unit price
      currency_id: "BRL",
      picture_url: item.image,
    }));

    if (deliveryFee > 0) {
      mpItems.push({
        title: "Taxa de Entrega",
        quantity: 1,
        unit_price: deliveryFee / 100,
        currency_id: "BRL",
      });
    }

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: mpItems,
        back_urls: {
          success: `${req.headers.get("origin")}/sucesso?order_id=${orderId}`,
          failure: `${req.headers.get("origin")}`,
          pending: `${req.headers.get("origin")}/sucesso?order_id=${orderId}`,
        },
        auto_return: "approved",
        external_reference: orderId,
      }),
    });

    const preference = await response.json();

    if (!response.ok) {
      throw new Error(preference.message || "Error creating preference");
    }

    // Update order with preference ID
    await supabase
      .from('pedidos')
      .update({ mercadopago_preference_id: preference.id })
      .eq('id', orderId);

    return new Response(JSON.stringify({ url: preference.init_point }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});