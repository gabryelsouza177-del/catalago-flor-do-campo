import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useSiteSettings() {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();

    const channel = supabase
      .channel('site_settings_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'site_settings' },
        (payload) => {
          setIsOpen(payload.new.store_is_open);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('store_is_open')
        .single();
      
      if (data) {
        setIsOpen(data.store_is_open);
      }
    } catch (err) {
      console.error('Error fetching site settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStoreStatus = async (status: boolean) => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({ store_is_open: status })
        .eq('id', (await supabase.from('site_settings').select('id').single()).data?.id);
      
      if (error) throw error;
      setIsOpen(status);
      return true;
    } catch (err) {
      console.error('Error toggling store status:', err);
      return false;
    }
  };

  return { isOpen, loading, toggleStoreStatus };
}
