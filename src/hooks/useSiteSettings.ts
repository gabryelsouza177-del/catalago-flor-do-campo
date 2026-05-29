import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useSiteSettings() {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [bouquetsDeliveryEnabled, setBouquetsDeliveryEnabled] = useState<boolean>(true);
  const [onlyPickupMode, setOnlyPickupMode] = useState<boolean>(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();

    const channel = supabase
      .channel(`site_settings_changes_${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'site_settings' },
        (payload) => {
          setIsOpen(payload.new.store_is_open);
          setBouquetsDeliveryEnabled(payload.new.bouquets_delivery_enabled ?? true);
          setOnlyPickupMode(payload.new.only_pickup_mode ?? false);
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
        .select('id, store_is_open, bouquets_delivery_enabled, only_pickup_mode')
        .single();
      
      if (data) {
        setIsOpen(data.store_is_open);
        setBouquetsDeliveryEnabled(data.bouquets_delivery_enabled ?? true);
        setOnlyPickupMode(data.only_pickup_mode ?? false);
        setSettingsId(data.id);
      }
    } catch (err) {
      console.error('Error fetching site settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: { 
    store_is_open?: boolean, 
    bouquets_delivery_enabled?: boolean, 
    only_pickup_mode?: boolean 
  }) => {
    if (!settingsId) return false;
    
    try {
      const { error } = await supabase
        .from('site_settings')
        .update(updates)
        .eq('id', settingsId);
      
      if (error) throw error;
      
      if (updates.store_is_open !== undefined) setIsOpen(updates.store_is_open);
      if (updates.bouquets_delivery_enabled !== undefined) setBouquetsDeliveryEnabled(updates.bouquets_delivery_enabled);
      if (updates.only_pickup_mode !== undefined) setOnlyPickupMode(updates.only_pickup_mode);
      
      return true;
    } catch (err) {
      console.error('Error updating site settings:', err);
      return false;
    }
  };

  return { 
    isOpen, 
    bouquetsDeliveryEnabled, 
    onlyPickupMode, 
    loading, 
    updateSettings,
    toggleStoreStatus: (status: boolean) => updateSettings({ store_is_open: status }) 
  };
}