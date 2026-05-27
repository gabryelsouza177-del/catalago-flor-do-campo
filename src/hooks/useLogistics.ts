import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LogisticsSettings {
  id: string;
  local_rate: number;
  intermediate_rate: number;
  long_distance_rate: number;
}

export function useLogistics() {
  return useQuery({
    queryKey: ['logistics-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('logistics_settings')
        .select('*')
        .single();
      
      if (error) throw error;
      return data as LogisticsSettings;
    },
  });
}
