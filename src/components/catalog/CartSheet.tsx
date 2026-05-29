import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { useCart } from '@/hooks/useCart';
import { useLogistics } from '@/hooks/useLogistics';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, CalendarIcon, Loader2, Truck, Store, User, Phone, Search, MapPin, AlertCircle, Hash } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatOrderWhatsAppMessage } from '@/lib/whatsapp';

const ORIGIN = { lat: -3.1287, lon: -60.0215 };
const MANAUS_BBOX = "-60.10,-3.20,-59.85,-2.95";

export function CartSheet({ children, open, onOpenChange }: { children: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) {
  const { items, removeItem, updateQuantity, clearCart } = useCart();
  const { isOpen } = useSiteSettings();
  const { data: logistics } = useLogistics();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState(localStorage.getItem('customer_name') || '');
  const [customerPhone, setCustomerPhone] = useState(localStorage.getItem('customer_phone') || '');
  const [recipientName, setRecipientName] = useState('');
  const [deliveryDate, setDeliveryDate] = useState<Date>();
  const [deliveryTime, setDeliveryTime] = useState<string>('');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
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
  const [deliveryObservations, setDeliveryObservations] = useState('');
  const [paymentOption, setPaymentOption] = useState<'online' | 'pickup_payment'>('online');

  
  // Wreath specific fields
  const [wreathRibbonMessage, setWreathRibbonMessage] = useState('');
  const [wreathHonoreeName, setWreathHonoreeName] = useState('');
  const [wreathCeremonyTime, setWreathCeremonyTime] = useState('');
  const [wreathLocation, setWreathLocation] = useState('');

  const isWreathOrder = useMemo(() => items.some(item => item.category === 'Coroas'), [items]);
  const subtotal = useCart((state) => state.items.reduce((acc, item) => acc + item.price * item.quantity, 0));

  const searchAddress = async (query: string) => {
    if (query.length < 3) return;
    try {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=${ORIGIN.lat}&lon=${ORIGIN.lon}&bbox=${MANAUS_BBOX}&limit=5`;
      const response = await fetch(url);
      const data = await response.json();
      const suggestions = data.features.map((f: any) => ({
        id: f.properties.osm_id || Math.random(),
        display_name: [f.properties.street || f.properties.name, f.properties.district, f.properties.city].filter(Boolean).join(', '),
        street: f.properties.street || f.properties.name,
        district: f.properties.district,
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0]
      }));
      setAddressSuggestions(suggestions);
    } catch (err) { console.error('Error fetching address:', err); }
  };

  const calculateDistance = async (lat: number, lon: number) => {
    setCalculatingDistance(true);
    setCalculationError(false);
    try {
      const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${ORIGIN.lon},${ORIGIN.lat};${lon},${lat}?overview=false`);
      const data = await response.json();
      if (data.routes && data.routes[0]) {
        setDistance(data.routes[0].distance / 1000);
      } else throw new Error("Rota não encontrada");
    } catch (err) { setCalculationError(true); } finally { setCalculatingDistance(false); }
  };

  const deliveryFee = useMemo(() => {
    if (deliveryMethod === 'pickup') return 0;
    if (!logistics) return 0;
    const hasEligibleProduct = items.some(item => logistics.eligible_categories.includes(item.category) || item.category === 'Coroas');
    if (hasEligibleProduct && distance !== null) {
      const calculatedFee = distance * Number(logistics.price_per_km);
      return Math.min(Math.max(calculatedFee, Number(logistics.min_delivery_fee)), Number(logistics.max_delivery_fee));
    }
    return Number(logistics.fixed_delivery_fee);
  }, [logistics, items, distance, deliveryMethod]);

  const total = subtotal + deliveryFee;

  const handleCheckout = async () => {
    if (!isOpen) { toast({ title: "Loja Fechada", variant: "destructive" }); return; }
    
    const isTimeValid = () => {
      if (isWreathOrder) return !!deliveryTime;
      if (!deliveryTime) return false;
      const [hours] = deliveryTime.split(':').map(Number);
      return hours >= 8 && hours < 17;
    };

    const isFormValid = customerName && customerPhone && deliveryDate && isTimeValid() && (
      deliveryMethod === 'pickup' ? (recipientName || customerName) : deliveryAddress
    ) && (isWreathOrder ? (wreathRibbonMessage && wreathHonoreeName && wreathCeremonyTime && deliveryAddress) : (recipientName || customerName));



    if (!isFormValid) {
      toast({ 
        title: "Dados incompletos", 
        description: "Preencha todos os campos obrigatórios (Nome, WhatsApp, Destinatário/Homenageado e Endereço).", 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    try {
      // Auto-registration
      await supabase.from('customers').upsert({ full_name: customerName, phone: customerPhone }, { onConflict: 'phone' });
      localStorage.setItem('customer_name', customerName);
      localStorage.setItem('customer_phone', customerPhone);

      const orderData = {
        nome_cliente: customerName,
        whatsapp_cliente: customerPhone,
        nome_destinatario: isWreathOrder ? wreathHonoreeName : (recipientName || customerName),
        itens_pedido: JSON.stringify(items),
        preco_total: deliveryMethod === 'pickup' ? subtotal : total,
        valor_frete: deliveryFee,
        status: paymentOption === 'pickup_payment' ? 'Pagamento na Retirada' : 'Pendente',
        metodo_pagamento: paymentOption === 'pickup_payment' ? 'Pagar na Loja' : 'Mercado Pago',
        tipo_entrega: deliveryMethod,
        endereco_entrega: deliveryMethod === 'pickup' ? 'Retirada na Loja' : (selectedStreet ? `${selectedStreet}${houseNumber ? `, ${houseNumber}` : ''}, ${selectedDistrict}${addressComplement ? ` - ${addressComplement}` : ''}` : `${deliveryAddress}${houseNumber ? `, ${houseNumber}` : ''}${addressComplement ? ` - ${addressComplement}` : ''}`),
        numero_endereco: houseNumber,
        mensagem_cartao: isWreathOrder ? null : giftMessage,
        observacoes: deliveryObservations,
        detalhes_coroa: isWreathOrder ? JSON.stringify({
          ribbon_message: wreathRibbonMessage,
          honoree_name: wreathHonoreeName,
          ceremony_time: wreathCeremonyTime,
          location: deliveryAddress
        }) : null
      };

      const { data: order, error: orderError } = await supabase
        .from('pedidos')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // Abrir WhatsApp automaticamente após salvamento bem-sucedido
      const whatsappLink = formatOrderWhatsAppMessage(order);
      window.open(whatsappLink, '_blank');

      if (paymentOption === 'pickup_payment' || order.metodo_pagamento === 'Pagar na Loja') {
        toast({ title: "Pedido Confirmado!", description: "Seu pedido foi recebido. Pague ao retirar na loja." });
        window.location.href = `/pedido-confirmado?order_id=${order.id}`;
        return;
      }

      const { data } = await supabase.functions.invoke('mercadopago-checkout', {
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

      if (data?.url) window.location.href = data.url;

    } catch (err: any) { toast({ title: "Erro ao processar", description: err.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-md bg-background border-l border-accent/10 overflow-y-auto">
        <SheetHeader className="pb-6 border-b border-accent/10">
          <SheetTitle className="text-accent tracking-[0.2em] uppercase text-sm font-sans">Seu Carrinho</SheetTitle>
          <SheetDescription className="text-[10px] uppercase tracking-wider">Finalize seu pedido com segurança</SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="py-20 text-center"><span className="text-4xl block">🌸</span><p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-4">Vazio</p></div>
        ) : (
          <div className="space-y-8 py-6">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="h-16 w-16 shrink-0 rounded-sm bg-muted/20 overflow-hidden border border-accent/5">
                    {item.image_url ? <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center">🌸</div>}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-[10px] font-sans font-medium uppercase tracking-wider truncate">{item.title}</h4>
                    <p className="text-xs text-accent font-serif italic">R$ {item.price.toFixed(2).replace('.', ',')}</p>
                    <div className="flex items-center gap-3 pt-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-accent/40 hover:text-accent"><Minus className="h-3 w-3" /></button>
                      <span className="text-[10px] font-sans">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-accent/40 hover:text-accent"><Plus className="h-3 w-3" /></button>
                      <button onClick={() => removeItem(item.id)} className="ml-auto text-destructive/40 hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-6 border-t border-accent/10">
              <h3 className="text-[9px] font-sans font-bold uppercase tracking-[0.25em] text-accent/60 flex items-center gap-2"><User className="h-3 w-3" /> Seus Dados (Comprador)</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Seu Nome Completo *</Label>
                  <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="bg-muted/10 border-accent/10 text-xs h-9" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Seu WhatsApp *</Label>
                  <div className="relative">
                    <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="(92) 99999-9999" className="bg-muted/10 border-accent/10 text-xs h-9 pl-8" />
                    <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-accent/40" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-accent/10">
              <h3 className="text-[9px] font-sans font-bold uppercase tracking-[0.25em] text-accent/60 flex items-center gap-2">
                <Truck className="h-3 w-3" /> {deliveryMethod === 'delivery' ? 'Dados de Entrega (Destinatário)' : 'Dados da Retirada'}
              </h3>
              
              <div className="flex gap-2 p-1 bg-muted/10 rounded-sm border border-accent/10">
                <button type="button" onClick={() => setDeliveryMethod('delivery')} className={cn("flex-1 py-2 text-[10px] uppercase tracking-widest font-bold rounded-sm", deliveryMethod === 'delivery' ? "bg-accent text-background shadow-lg" : "text-accent/40 hover:text-accent/60")}>Entrega</button>
                <button type="button" onClick={() => setDeliveryMethod('pickup')} className={cn("flex-1 py-2 text-[10px] uppercase tracking-widest font-bold rounded-sm", deliveryMethod === 'pickup' ? "bg-accent text-background shadow-lg" : "text-accent/40 hover:text-accent/60")}>Retirada</button>
              </div>

              {deliveryMethod === 'delivery' ? (
                <div className="space-y-4">
                  {!isWreathOrder && (
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Nome do Destinatário *</Label>
                      <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Quem vai receber?" className="bg-muted/10 border-accent/10 text-xs h-9" />
                    </div>
                  )}

                  {isWreathOrder && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-2"><Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Nome do Homenageado *</Label><Input value={wreathHonoreeName} onChange={(e) => setWreathHonoreeName(e.target.value)} placeholder="Nome completo" className="bg-muted/10 border-accent/10 text-xs h-9" /></div>
                      <div className="space-y-2"><Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Dizeres da Faixa *</Label><Textarea value={wreathRibbonMessage} onChange={(e) => setWreathRibbonMessage(e.target.value)} placeholder="Saudades eternas..." className="bg-muted/10 border-accent/10 text-xs min-h-[60px]" /></div>
                    </div>
                  )}
                  
                  <div className="space-y-2 relative">
                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {isWreathOrder ? "Endereço do Velório / Cemitério *" : "Buscar Endereço *"}
                    </Label>
                    <div className="relative">
                      <Input 
                        value={deliveryAddress} 
                        onChange={(e) => { 
                          setDeliveryAddress(e.target.value); 
                          searchAddress(e.target.value); 
                          setDistance(null); 
                        }} 
                        placeholder={isWreathOrder ? "Nome da Funerária ou Endereço" : "Digite a rua..."} 
                        className="bg-muted/10 border-accent/10 text-xs h-9" 
                      />
                      {addressSuggestions.length > 0 && (
                        <div className="absolute z-50 w-full bg-background border border-accent/10 rounded-sm shadow-xl mt-1 max-h-40 overflow-y-auto">
                          {addressSuggestions.map((s) => (
                            <button key={s.id} className="w-full text-left px-3 py-2 text-[10px] hover:bg-muted/20 border-b border-accent/5 last:border-0" onClick={() => { setDeliveryAddress(s.display_name); setSelectedStreet(s.street || ''); setSelectedDistrict(s.district || ''); setAddressSuggestions([]); calculateDistance(s.lat, s.lon); }}>{s.display_name}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Número (Opcional)</Label><Input value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} placeholder="123" className="bg-muted/10 border-accent/10 text-xs h-9" /></div>
                    <div className="space-y-2"><Label className="text-[10px] uppercase tracking-widest text-muted-foreground">{isWreathOrder ? "Ponto de Ref. / Comp." : "Complemento"}</Label><Input value={addressComplement} onChange={(e) => setAddressComplement(e.target.value)} placeholder="Apto, Sala" className="bg-muted/10 border-accent/10 text-xs h-9" /></div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Observações da Entrega</Label>
                    <Textarea 
                      value={deliveryObservations} 
                      onChange={(e) => setDeliveryObservations(e.target.value)} 
                      placeholder="Ex: Entregar para a recepcionista, local de difícil acesso..." 
                      className="bg-muted/10 border-accent/10 text-xs min-h-[80px]" 
                    />
                  </div>

                  {isWreathOrder && (
                    <div className="space-y-2 animate-in fade-in">
                      <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Horário da Cerimônia *</Label>
                      <Input type="time" value={wreathCeremonyTime} onChange={(e) => setWreathCeremonyTime(e.target.value)} className="bg-muted/10 border-accent/10 text-xs h-9" />
                    </div>
                  )}
                </div>

              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-accent/5 rounded-sm border border-dashed border-accent/20 flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-accent mt-0.5" /><div className="space-y-1"><h4 className="text-[10px] font-sans font-bold uppercase tracking-widest text-accent">Loja Flor do Campo</h4><p className="text-xs text-muted-foreground leading-relaxed">Av. Joaquim Nabuco, 1446 - Centro</p></div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Quem vai retirar? (Se não for você)</Label>
                    <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Nome de quem vai buscar" className="bg-muted/10 border-accent/10 text-xs h-9" />
                  </div>
                </div>
              )}

              {deliveryMethod === 'pickup' && (
                <div className="space-y-4 pt-4 border-t border-accent/10 animate-in fade-in slide-in-from-top-2">
                  <h3 className="text-[9px] font-sans font-bold uppercase tracking-[0.25em] text-accent/60 flex items-center gap-2">
                    <Hash className="h-3 w-3" /> Opção de Pagamento
                  </h3>
                  <div className="flex gap-2 p-1 bg-muted/10 rounded-sm border border-accent/10">
                    <button 
                      type="button" 
                      onClick={() => setPaymentOption('online')} 
                      className={cn("flex-1 py-2 text-[10px] uppercase tracking-widest font-bold rounded-sm transition-all", paymentOption === 'online' ? "bg-accent text-background shadow-lg" : "text-accent/40 hover:text-accent/60")}
                    >
                      Online (Pix/Cartão)
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setPaymentOption('pickup_payment')} 
                      className={cn("flex-1 py-2 text-[10px] uppercase tracking-widest font-bold rounded-sm transition-all", paymentOption === 'pickup_payment' ? "bg-accent text-background shadow-lg" : "text-accent/40 hover:text-accent/60")}
                    >
                      Na Loja
                    </button>
                  </div>
                  {paymentOption === 'pickup_payment' && (
                    <p className="text-[9px] text-accent/60 uppercase text-center font-medium italic animate-pulse">
                      Pague na retirada (Dinheiro, Pix ou Cartão)
                    </p>
                  )}
                </div>
              )}


              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Data *</Label>
                  <Popover><PopoverTrigger asChild><Button variant="outline" className="w-full justify-start bg-muted/10 border-accent/10 h-9 text-xs">{deliveryDate ? format(deliveryDate, "dd/MM/yyyy") : "Selecionar"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={deliveryDate} onSelect={setDeliveryDate} locale={ptBR} /></PopoverContent></Popover>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Horário *</Label>
                  <Input type="time" value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} className="bg-muted/10 border-accent/10 h-9 text-xs" />
                  <p className="text-[8px] text-accent/60 uppercase font-medium">{isWreathOrder ? "Prioridade 24h" : "Comercial (08h-17h)"}</p>
                </div>
              </div>

              {!isWreathOrder && (
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Mensagem para o Cartão</Label>
                  <Textarea value={giftMessage} onChange={(e) => setGiftMessage(e.target.value)} className="bg-muted/10 border-accent/10 text-xs min-h-[80px]" placeholder="Sua mensagem aqui..." />
                </div>
              )}
            </div>

            <div className="space-y-4 pt-6 border-t border-accent/10">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground"><span>Subtotal</span><span>R$ {subtotal.toFixed(2).replace('.', ',')}</span></div>
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground"><span>Entrega</span><span>{calculatingDistance ? "Calculando..." : `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`}</span></div>
                <div className="flex justify-between pt-2 text-sm font-sans font-bold uppercase tracking-widest text-accent"><span>Total</span><span>R$ {total.toFixed(2).replace('.', ',')}</span></div>
              </div>
              <Button onClick={handleCheckout} disabled={loading} className="w-full bg-emerald hover:bg-emerald/80 text-accent uppercase tracking-[0.2em] text-[10px] font-bold h-12">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : (paymentOption === 'pickup_payment' ? "Confirmar Pedido" : "Finalizar e Pagar")}
              </Button>

            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
