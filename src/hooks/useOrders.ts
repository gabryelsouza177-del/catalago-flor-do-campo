import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useOrders = () => {
  return useQuery({
    queryKey: ['pedidos'],
    queryFn: async () => {
      console.log('Fetching pedidos...');
      const { data, error } = await supabase
        .from('pedidos')
        .select('id, criado_em, nome_cliente, whatsapp_cliente, nome_destinatario, itens_pedido, preco_total, status, metodo_pagamento, endereco_entrega, mensagem_cartao, detalhes_coroa, valor_frete, numero_endereco, observacoes, data_entrega, horario_entrega, tipo_entrega')
        .order('criado_em', { ascending: false });
      
      if (error) {
        console.error('Error fetching pedidos:', error);
        throw error;
      }
      console.log('Fetched pedidos:', data?.length);
      return data;
    },
    retry: 1,
  });
};