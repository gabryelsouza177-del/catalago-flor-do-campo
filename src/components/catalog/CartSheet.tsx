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
import { Search, MapPin, AlertCircle, Hash } from 'lucide-react';

const ORIGIN = { lat: -3.1287, lon: -60.0215 };
const MANAUS_BBOX = "-60.10,-3.20,-59.85,-2.95"; // Strict urban Manaus bbox

export function CartSheet({ children, open, onOpenChange }: { children: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) {
  const { items, removeItem, updateQuantity, clearCart } = useCart();
  const { data: logistics } = useLogistics();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [deliveryDate, setDeliveryDate] = useState<Date>();
  const [deliveryPeriod, setDeliveryPeriod] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [selectedStreet, setSelectedStreet] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCoords, setSelectedCoords] = useState<{lat: number, lon: number} | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [calculatingDistance, setCalculatingDistance] = useState(false);
  const [calculationError, setCalculationError] = useState(false);
  const [houseNumber, setHouseNumber] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [addressComplement, setAddressComplement] = useState('');
  
  // Wreath specific fields
  const [wreathRibbonMessage, setWreathRibbonMessage] = useState('');
  const [wreathHonoreeName, setWreathHonoreeName] = useState('');
  const [wreathLocation, setWreathLocation] = useState('');
  const [wreathCeremonyTime, setWreathCeremonyTime] = useState('');

  const isWreathOrder = useMemo(() => 
    items.some(item => item.category === 'Coroas'),
    [items]
  );

  const isGiftOrder = useMemo(() => 
    items.some(item => item.category === 'Buquê' || item.category === 'Arranjo'),
    [items]
  );

  const subtotal = useCart((state) => state.items.reduce((acc, item) => acc + item.price * item.quantity, 0));

  const searchAddress = async (query: string) => {
    if (query.length < 3) return;
    try {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=${ORIGIN.lat}&lon=${ORIGIN.lon}&bbox=${MANAUS_BBOX}&limit=5`;
      const response = await fetch(url);
      const data = await response.json();
      
      const suggestions = data.features.map((f: any) => ({
        id: f.properties.osm_id || Math.random(),
        display_name: [
          f.properties.street || f.properties.name,
          f.properties.district,
          f.properties.city
        ].filter(Boolean).join(', '),
        street: f.properties.street || f.properties.name,
        district: f.properties.district,
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0]
      }));
      
      setAddressSuggestions(suggestions);
    } catch (err) {
      console.error('Error fetching address suggestions:', err);
    }
  };

  const calculateDistance = async (lat: number, lon: number, addressWithNum?: string) => {
    setCalculatingDistance(true);
    setCalculationError(false);
    
    // If a manual number was provided, we might want to try and geocode again for more precision
    // But OSRM just needs the coords we already have.
    // If we have a house number, we use the specific coords from geocoding.
    
    try {
      const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${ORIGIN.lon},${ORIGIN.lat};${lon},${lat}?overview=false`);
      const data = await response.json();
      
      if (data.routes && data.routes[0]) {
        const distKm = data.routes[0].distance / 1000;
        
        if (distKm < 0.1 || distKm > 50) {
          console.warn(`[Logística] Distância suspeita: ${distKm.toFixed(2)}km`);
          toast({ 
            title: "Aviso de Localização", 
            description: "Verifique se o endereço selecionado está correto.",
            variant: "destructive" 
          });
        }
        
        setDistance(distKm);
      } else {
        throw new Error("Não foi possível calcular a rota");
      }
    } catch (err) {
      console.error('Error calculating distance:', err);
      setCalculationError(true);
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

    if (hasEligibleProduct) {
      if (distance !== null) {
        const calculatedFee = distance * Number(logistics.price_per_km);
        const cappedFee = Math.min(
          Math.max(calculatedFee, Number(logistics.min_delivery_fee)),
          Number(logistics.max_delivery_fee)
        );
        return cappedFee;
      }
      // If distance is not yet calculated but address is being searched, we don't have a fee yet
      if (calculationError) {
        return Number(logistics.fixed_delivery_fee);
      }
    }

    return Number(logistics.fixed_delivery_fee);
  }, [logistics, items, distance, calculationError]);

  const total = subtotal + deliveryFee;

  const handleCheckout = async () => {
    const isFormValid = isWreathOrder 
      ? (recipientName && deliveryDate && deliveryPeriod && deliveryAddress && houseNumber && wreathRibbonMessage && wreathHonoreeName && wreathLocation && wreathCeremonyTime)
      : (recipientName && deliveryDate && deliveryPeriod && deliveryAddress && houseNumber);

    if (!isFormValid) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os dados obrigatórios.",
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
          delivery_address: selectedStreet ? `${selectedStreet}, ${houseNumber}${selectedDistrict ? `, ${selectedDistrict}` : ''}` : `${deliveryAddress}, ${houseNumber}`,
          house_number: houseNumber,
          delivery_complement: addressComplement,
          delivery_distance: distance,
          gift_message: giftMessage,
          delivery_fee: deliveryFee,
          total_amount: total,
          items: items as any, // Cast to any to avoid Json type mismatch
          payment_status: 'pending',
          wreath_ribbon_message: isWreathOrder ? wreathRibbonMessage : null,
          wreath_honoree_name: isWreathOrder ? wreathHonoreeName : null,
          wreath_location: isWreathOrder ? (selectedStreet || deliveryAddress) : null,
          wreath_ceremony_time: isWreathOrder ? wreathCeremonyTime : null
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create Mercado Pago Checkout Preference
      const { data, error } = await supabase.functions.invoke('mercadopago-checkout', {
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
    <Sheet open={open} onOpenChange={onOpenChange}>
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
              
              {isWreathOrder && (
                <div className="space-y-4 p-3 bg-accent/5 rounded-sm border border-accent/10 animate-in fade-in slide-in-from-top-2">
                  <h4 className="text-[8px] font-sans font-bold uppercase tracking-[0.2em] text-accent/80 mb-2">Informações da Coroa</h4>
                  
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Nome do Homenageado *</Label>
                    <Input 
                      value={wreathHonoreeName} 
                      onChange={(e) => setWreathHonoreeName(e.target.value)} 
                      placeholder="Ex: João da Silva"
                      className="bg-background border-accent/10 text-xs h-9" 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Dizeres da Faixa *</Label>
                    <Textarea 
                      value={wreathRibbonMessage} 
                      onChange={(e) => setWreathRibbonMessage(e.target.value)} 
                      placeholder="Ex: Saudades eternas da família..."
                      className="bg-background border-accent/10 text-xs min-h-[60px]" 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Horário da Cerimônia *</Label>
                    <Input 
                      type="time"
                      value={wreathCeremonyTime} 
                      onChange={(e) => setWreathCeremonyTime(e.target.value)} 
                      className="bg-background border-accent/10 text-xs h-9 w-full" 
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Nome do Comprador/Contato *</Label>
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
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {isWreathOrder ? "Local do Velório / Funerária (Buscar no Mapa) *" : "Rua e Bairro (Buscar no Mapa) *"}
                </Label>
                <div className="relative">
                  <Input 
                    value={deliveryAddress} 
                    onChange={(e) => {
                      setDeliveryAddress(e.target.value);
                      searchAddress(e.target.value);
                      setDistance(null);
                      setCalculationError(false);
                      setSelectedStreet('');
                      setSelectedDistrict('');
                    }} 
                    placeholder="Digite o nome da rua..."
                    className="bg-muted/10 border-accent/10 text-xs h-9 pr-8" 
                  />
                  <Search className="absolute right-2 top-2.5 h-4 w-4 text-accent/40" />
                </div>
                
                {addressSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full bg-background border border-accent/10 rounded-sm shadow-xl mt-1 max-h-40 overflow-y-auto">
                    {addressSuggestions.map((s: any) => (
                      <button
                        key={s.id}
                        className="w-full text-left px-3 py-2 text-[10px] hover:bg-muted/20 transition-colors border-b border-accent/5 last:border-0"
                        onClick={() => {
                          setDeliveryAddress(s.display_name);
                          setSelectedStreet(s.street || '');
                          setSelectedDistrict(s.district || '');
                          setAddressSuggestions([]);
                          
                          const lat = parseFloat(s.lat);
                          const lon = parseFloat(s.lon);
                          setSelectedCoords({ lat, lon });
                          calculateDistance(lat, lon);
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <MapPin className="h-3 w-3 mt-0.5 text-accent/40" />
                          <div className="flex flex-col">
                            <span className="font-medium">{s.display_name}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Número da Residência *</Label>
                    <div className="relative">
                      <Input 
                        value={houseNumber} 
                        onChange={(e) => setHouseNumber(e.target.value)} 
                        placeholder="Ex: 1446"
                        className="bg-muted/10 border-accent/10 text-xs h-9 pr-8" 
                      />
                      <Hash className="absolute right-2 top-2.5 h-3 w-3 text-accent/40" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Complemento</Label>
                    <Input 
                      value={addressComplement} 
                      onChange={(e) => setAddressComplement(e.target.value)} 
                      placeholder="Apto, Sala, etc"
                      className="bg-muted/10 border-accent/10 text-xs h-9" 
                    />
                  </div>
                </div>
                
                {calculationError && (
                  <div className="mt-2 p-2 bg-destructive/10 rounded-sm border border-destructive/20 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-[9px] text-destructive uppercase tracking-widest font-bold">
                      <AlertCircle className="h-3 w-3" />
                      Falha no cálculo automático
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-[8px] uppercase tracking-widest border-destructive/20 text-destructive hover:bg-destructive/5"
                      onClick={() => {
                        if (selectedCoords) {
                          calculateDistance(selectedCoords.lat, selectedCoords.lon);
                        } else {
                          toast({ title: "Selecione um endereço primeiro", variant: "destructive" });
                        }
                      }}
                    >
                      Tentar calcular frete manualmente
                    </Button>
                  </div>
                )}
              </div>

              {isGiftOrder && !isWreathOrder && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Mensagem para o Cartão</Label>
                  <Textarea 
                    value={giftMessage} 
                    onChange={(e) => setGiftMessage(e.target.value)} 
                    className="bg-muted/10 border-accent/10 text-xs min-h-[80px]"
                    placeholder="Escreva sua mensagem aqui..."
                  />
                </div>
              )}
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