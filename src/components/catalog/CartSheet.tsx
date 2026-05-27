import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { useCart } from '@/hooks/useCart';
import { useLogistics } from '@/hooks/useLogistics';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, CalendarIcon, Loader2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { NEIGHBORHOODS } from '@/lib/constants';
import { Search, MapPin } from 'lucide-react';

const ORIGIN = { lat: -3.1281737, lon: -60.0191310 };

export function CartSheet({ children }: { children: React.ReactNode }) {
  const { items, removeItem, updateQuantity, clearCart } = useCart();
  const { data: logistics } = useLogistics();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [deliveryDate, setDeliveryDate] = useState<Date>();
  const [deliveryPeriod, setDeliveryPeriod] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [selectedCoords, setSelectedCoords] = useState<{lat: number, lon: number} | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [calculatingDistance, setCalculatingDistance] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

  const subtotal = useCart((state) => state.items.reduce((acc, item) => acc + item.price * item.quantity, 0));

  const searchAddress = async (query: string) => {
    if (query.length < 3) return;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Manaus, AM')}&limit=5`);
      const data = await response.json();
      setAddressSuggestions(data);
    } catch (err) {
      console.error('Error fetching address suggestions:', err);
    }
  };

  const calculateDistance = async (lat: number, lon: number) => {
    setCalculatingDistance(true);
    try {
      const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${ORIGIN.lon},${ORIGIN.lat};${lon},${lat}?overview=false`);
      const data = await response.json();
      if (data.routes && data.routes[0]) {
        const distKm = data.routes[0].distance / 1000;
        setDistance(distKm);
      }
    } catch (err) {
      console.error('Error calculating distance:', err);
      toast({ title: "Erro ao calcular distância", variant: "destructive" });
    } finally {
      setCalculatingDistance(false);
    }
  };

  const deliveryFee = useMemo(() => {
    if (!logistics) return 0;
    
    // Check if any product is in eligible categories
    const hasEligibleProduct = items.some(item => 
      logistics.eligible_categories.includes(item.category)
    );

    if (hasEligibleProduct && distance !== null) {
      const calculatedFee = distance * Number(logistics.price_per_km);
      return Math.max(calculatedFee, Number(logistics.min_delivery_fee));
    }

    if (!hasEligibleProduct) {
      return Number(logistics.fixed_delivery_fee);
    }

    return 0;
  }, [logistics, items, distance]);

  const total = subtotal + deliveryFee;

  const handleCheckout = async () => {
    if (!recipientName || !deliveryDate || !deliveryPeriod || !deliveryAddress) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os dados de entrega.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // 1. Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          recipient_name: recipientName,
          delivery_date: format(deliveryDate, 'yyyy-MM-dd'),
          delivery_period: deliveryPeriod,
          delivery_address: deliveryAddress,
          delivery_distance: distance,
          gift_message: giftMessage,
          delivery_fee: deliveryFee,
          total_amount: total,
          items: items as any, // Cast to any to avoid Json type mismatch
          payment_status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create Stripe Checkout Session
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          orderId: order.id,
          items: items.map(i => ({
            name: i.title,
            amount: Math.round(i.price * 100),
            quantity: i.quantity,
            image: i.image_url
          })),
          deliveryFee: Math.round(deliveryFee * 100)
        }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast({
        title: "Erro ao processar pedido",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-md bg-background border-l border-accent/10 overflow-y-auto">
        <SheetHeader className="pb-6 border-b border-accent/10">
          <SheetTitle className="text-accent tracking-[0.2em] uppercase text-sm font-sans">Seu Carrinho</SheetTitle>
          <SheetDescription className="sr-only">Visualize seus itens e finalize o pedido</SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <span className="text-4xl block">🌸</span>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-sans">Seu carrinho está vazio</p>
          </div>
        ) : (
          <div className="space-y-8 py-6">
            {/* Items List */}
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="h-16 w-16 shrink-0 rounded-sm bg-muted/20 overflow-hidden border border-accent/5">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xl">🌸</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-[10px] font-sans font-medium uppercase tracking-wider text-foreground truncate">
                      {item.title}
                    </h4>
                    <p className="text-xs text-accent font-serif italic">
                      R$ {item.price.toFixed(2).replace('.', ',')}
                    </p>
                    <div className="flex items-center gap-3 pt-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-accent/40 hover:text-accent">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-[10px] font-sans">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-accent/40 hover:text-accent">
                        <Plus className="h-3 w-3" />
                      </button>
                      <button onClick={() => removeItem(item.id)} className="ml-auto text-destructive/40 hover:text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Form */}
            <div className="space-y-4 pt-6 border-t border-accent/10">
              <h3 className="text-[9px] font-sans font-bold uppercase tracking-[0.25em] text-accent/60">Dados de Entrega</h3>
              
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Nome do Destinatário *</Label>
                <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="bg-muted/10 border-accent/10 text-xs h-9" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Data da Entrega *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal bg-muted/10 border-accent/10 h-9 px-3 text-xs",
                          !deliveryDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {deliveryDate ? format(deliveryDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={deliveryDate}
                        onSelect={setDeliveryDate}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Período *</Label>
                  <Select value={deliveryPeriod} onValueChange={setDeliveryPeriod}>
                    <SelectTrigger className="bg-muted/10 border-accent/10 h-9 text-xs">
                      <SelectValue placeholder="Escolher" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manhã">Manhã</SelectItem>
                      <SelectItem value="Tarde">Tarde</SelectItem>
                      <SelectItem value="Noite">Noite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 relative">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Endereço de Entrega (Manaus) *</Label>
                <div className="relative">
                  <Input 
                    value={deliveryAddress} 
                    onChange={(e) => {
                      setDeliveryAddress(e.target.value);
                      searchAddress(e.target.value);
                    }} 
                    placeholder="Rua, número, bairro..."
                    className="bg-muted/10 border-accent/10 text-xs h-9 pr-8" 
                  />
                  <Search className="absolute right-2 top-2.5 h-4 w-4 text-accent/40" />
                </div>
                
                {addressSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full bg-background border border-accent/10 rounded-sm shadow-xl mt-1 max-h-40 overflow-y-auto">
                    {addressSuggestions.map((s: any) => (
                      <button
                        key={s.place_id}
                        className="w-full text-left px-3 py-2 text-[10px] hover:bg-muted/20 transition-colors border-b border-accent/5 last:border-0"
                        onClick={() => {
                          setDeliveryAddress(s.display_name);
                          setAddressSuggestions([]);
                          const lat = parseFloat(s.lat);
                          const lon = parseFloat(s.lon);
                          setSelectedCoords({ lat, lon });
                          calculateDistance(lat, lon);
                        }}
                      >
                        {s.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Mensagem para o Cartão</Label>
                <Textarea 
                  value={giftMessage} 
                  onChange={(e) => setGiftMessage(e.target.value)} 
                  className="bg-muted/10 border-accent/10 text-xs min-h-[80px]"
                  placeholder="Escreva sua mensagem aqui..."
                />
              </div>
            </div>

            {/* Footer / Total */}
            <div className="space-y-4 pt-6 border-t border-accent/10">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                {distance !== null && (
                  <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground animate-in fade-in slide-in-from-top-1">
                    <span>Distância</span>
                    <span>{distance.toFixed(1)} km</span>
                  </div>
                )}
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                  <span>Entrega</span>
                  <span className={calculatingDistance ? "animate-pulse" : ""}>
                    {calculatingDistance ? "Calculando..." : `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`}
                  </span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-sans font-bold uppercase tracking-widest text-accent">
                  <span>Total</span>
                  <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              <Button 
                onClick={handleCheckout} 
                disabled={loading}
                className="w-full bg-emerald hover:bg-emerald/80 text-accent uppercase tracking-[0.2em] text-[10px] font-bold h-12 rounded-sm transition-all duration-300"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Finalizar e Pagar"}
              </Button>
              
              <p className="text-[8px] text-center text-muted-foreground uppercase tracking-widest font-sans px-4">
                Ao finalizar, você será redirecionado para o pagamento seguro.
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}