import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
          success: `${req.headers.get("origin")}/success?order_id=${orderId}`,
          failure: `${req.headers.get("origin")}`,
          pending: `${req.headers.get("origin")}`,
        },
        auto_return: "approved",
        external_reference: orderId,
      }),
    });

    const preference = await response.json();

    if (!response.ok) {
      throw new Error(preference.message || "Error creating preference");
    }

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