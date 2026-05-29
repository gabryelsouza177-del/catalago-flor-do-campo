import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useProducts, useRealtimeProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import type { Product } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  Flower2, LogOut, Plus, Pencil, Trash2, Loader2, Upload, 
  Package, ToggleLeft, ToggleRight, Star, BarChart3, 
  Truck, Save, MapPin, Settings2, ShoppingBag, 
  CheckCircle, ChevronDown, Filter, Archive, MessageSquare
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES } from '@/lib/constants';

const PRODUCT_CATEGORIES = CATEGORIES.filter((c) => c !== 'Todos');

const STATUS_OPTIONS = [
  'Pagamento Pendente',
  'Pedido Confirmado',
  'Preparando seu Arranjo',
  'Saiu para Entrega',
  'Entregue'
];

export default function Admin() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { isOpen, bouquetsDeliveryEnabled, onlyPickupMode, updateSettings } = useSiteSettings();
  const { data: products, isLoading: productsLoading, refetch: refetchProducts } = useProducts();
  const { data: orders, isLoading: ordersLoading, refetch: refetchOrders } = useOrders();
  const { toast } = useToast();
  
  // UI State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingLogistics, setSavingLogistics] = useState(false);
  const [orderFilter, setOrderFilter] = useState<'pending' | 'archived'>('pending');

  // Logistics state
  const [logistics, setLogistics] = useState({ 
    id: '', 
    local_rate: 0, 
    intermediate_rate: 0, 
    long_distance_rate: 0,
    price_per_km: 2.50,
    min_delivery_fee: 12.00,
    max_delivery_fee: 40.00,
    eligible_categories: ['Buquês'],
    fixed_delivery_fee: 20.00
  });

  // Product Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Buquês');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);

  useRealtimeProducts();

  useEffect(() => {
    fetchLogistics();
    
    // Realtime orders
    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => {
        refetchOrders();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLogistics = async () => {
    const { data, error } = await supabase.from('logistics_settings').select('*').single();
    if (data) {
      setLogistics({
        id: data.id,
        local_rate: Number(data.local_rate),
        intermediate_rate: Number(data.intermediate_rate),
        long_distance_rate: Number(data.long_distance_rate),
        price_per_km: Number(data.price_per_km),
        min_delivery_fee: Number(data.min_delivery_fee),
        max_delivery_fee: Number(data.max_delivery_fee || 40.00),
        eligible_categories: data.eligible_categories || [],
        fixed_delivery_fee: Number(data.fixed_delivery_fee)
      });
    }
  };

  const saveLogistics = async () => {
    setSavingLogistics(true);
    try {
      const { error } = await supabase
        .from('logistics_settings')
        .update({
          local_rate: logistics.local_rate,
          intermediate_rate: logistics.intermediate_rate,
          long_distance_rate: logistics.long_distance_rate,
          price_per_km: logistics.price_per_km,
          min_delivery_fee: logistics.min_delivery_fee,
          max_delivery_fee: logistics.max_delivery_fee,
          eligible_categories: logistics.eligible_categories,
          fixed_delivery_fee: logistics.fixed_delivery_fee,
          updated_at: new Date().toISOString()
        })
        .eq('id', logistics.id);

      if (error) throw error;
      toast({ title: '✨ Taxas de logística atualizadas!' });
    } catch (err: any) {
      toast({ title: 'Erro ao salvar logística', description: err.message, variant: 'destructive' });
    } finally {
      setSavingLogistics(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('pedidos')
      .update({ status: newStatus })
      .eq('id', orderId);
      
    if (error) {
      toast({ title: 'Erro ao atualizar status', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Status atualizado com sucesso!' });
      refetchOrders();
    }
  };

  const concludeOrder = async (orderId: string) => {
    const { error } = await supabase
      .from('pedidos')
      .update({ status: 'Entregue' })
      .eq('id', orderId);
      
    if (error) {
      toast({ title: 'Erro ao concluir pedido', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Pedido entregue e arquivado!' });
      refetchOrders();
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setCategory('Buquês');
    setImageFile(null);
    setPreviewUrl(null);
    setEditing(null);
    setIsFeatured(false);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setTitle(product.title);
    setDescription(product.description || '');
    setPrice(String(product.price));
    setCategory(product.category);
    setPreviewUrl(product.image_url);
    setImageFile(null);
    setIsFeatured(product.is_featured);
    setDialogOpen(true);
  };

  const openNew = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, { contentType: file.type });
    if (error) throw error;
    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!title || !price) {
      toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      let imageUrl = editing?.image_url || null;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const payload = {
        title,
        description: description || null,
        price: parseFloat(price),
        category,
        image_url: imageUrl,
        is_featured: isFeatured,
        updated_at: new Date().toISOString(),
      };

      if (editing) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editing.id);
        if (error) throw error;
        toast({ title: '✨ Produto atualizado!', className: 'border-accent bg-accent/10 text-accent' });
      } else {
        const { error } = await supabase
          .from('products')
          .insert({ ...payload, active: true });
        if (error) throw error;
        toast({ title: '✨ Produto adicionado!', className: 'border-accent bg-accent/10 text-accent' });
      }

      setDialogOpen(false);
      resetForm();
      refetchProducts();
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este produto?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast({ title: 'Erro ao excluir', variant: 'destructive' });
    } else {
      toast({ title: 'Produto excluído' });
      refetchProducts();
    }
  };

  const toggleSoldOut = async (product: Product) => {
    const { error } = await supabase
      .from('products')
      .update({ sold_out: !product.sold_out })
      .eq('id', product.id);
    if (error) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    } else {
      toast({ title: product.sold_out ? 'Disponível' : 'Esgotado' });
      refetchProducts();
    }
  };

  const toggleFeatured = async (product: Product) => {
    const { error } = await supabase
      .from('products')
      .update({ is_featured: !product.is_featured })
      .eq('id', product.id);
    if (error) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    } else {
      toast({ title: product.is_featured ? 'Removido dos destaques' : 'Adicionado aos destaques' });
      refetchProducts();
    }
  };

  const filteredOrders = orders?.filter(o => 
    orderFilter === 'pending' ? o.status !== 'Entregue' : o.status === 'Entregue'
  );

  if (productsLoading || ordersLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Carregando painel...</p>
      </div>
    );
  }

  const handleClearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-primary text-primary-foreground border-b shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flower2 className="h-6 w-6" />
            <span className="font-semibold text-sm md:text-base">Painel Flor do Campo</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/10">
                <BarChart3 className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Relatórios</span>
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/10" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-1" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Logistic Controls at the Top */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className={cn(
            "border-2 transition-all duration-300",
            isOpen ? "border-emerald/20 bg-emerald/5 shadow-sm" : "border-destructive/20 bg-destructive/5"
          )}>
            <CardContent className="p-4 flex flex-col justify-between h-full gap-3">
              <div className="flex items-center justify-between">
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center",
                  isOpen ? "bg-emerald/20 text-emerald" : "bg-destructive/20 text-destructive"
                )}>
                  <Settings2 className="h-4 w-4" />
                </div>
                <Badge className={cn("uppercase tracking-widest text-[8px]", isOpen ? "bg-emerald" : "bg-destructive")}>
                  {isOpen ? "Aberta" : "Fechada"}
                </Badge>
              </div>
              <div>
                <h3 className="text-xs font-sans font-bold uppercase tracking-wider">Status da Loja</h3>
              </div>
              <div className="flex items-center justify-between pt-1">
                <p className="text-[9px] text-muted-foreground uppercase">Receber pedidos</p>
                <Switch checked={isOpen} onCheckedChange={(val) => updateSettings({ store_is_open: val })} />
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            "border-2 transition-all duration-300",
            bouquetsDeliveryEnabled ? "border-accent/20 bg-accent/5 shadow-sm" : "border-amber/20 bg-amber/5"
          )}>
            <CardContent className="p-4 flex flex-col justify-between h-full gap-3">
              <div className="flex items-center justify-between">
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center",
                  bouquetsDeliveryEnabled ? "bg-accent/20 text-accent" : "bg-amber/20 text-amber-600"
                )}>
                  <Truck className="h-4 w-4" />
                </div>
                <Badge className={cn("uppercase tracking-widest text-[8px]", bouquetsDeliveryEnabled ? "bg-accent" : "bg-amber-500")}>
                  {bouquetsDeliveryEnabled ? "Ativo" : "Pausado"}
                </Badge>
              </div>
              <div>
                <h3 className="text-xs font-sans font-bold uppercase tracking-wider">Entregas de Buquês</h3>
              </div>
              <div className="flex items-center justify-between pt-1">
                <p className="text-[9px] text-muted-foreground uppercase">Permitir Frete</p>
                <Switch 
                  checked={bouquetsDeliveryEnabled} 
                  onCheckedChange={(val) => updateSettings({ bouquets_delivery_enabled: val })} 
                />
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            "border-2 transition-all duration-300",
            !onlyPickupMode ? "border-accent/20 bg-accent/5 shadow-sm" : "border-destructive/20 bg-destructive/5"
          )}>
            <CardContent className="p-4 flex flex-col justify-between h-full gap-3">
              <div className="flex items-center justify-between">
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center",
                  !onlyPickupMode ? "bg-accent/20 text-accent" : "bg-destructive/20 text-destructive"
                )}>
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <Badge className={cn("uppercase tracking-widest text-[8px]", !onlyPickupMode ? "bg-accent" : "bg-destructive")}>
                  {!onlyPickupMode ? "Normal" : "Apenas Retirada"}
                </Badge>
              </div>
              <div>
                <h3 className="text-xs font-sans font-bold uppercase tracking-wider">Modo Somente Retirada</h3>
              </div>
              <div className="flex items-center justify-between pt-1">
                <p className="text-[9px] text-muted-foreground uppercase">Bloqueio Geral</p>
                <Switch 
                  checked={onlyPickupMode} 
                  onCheckedChange={(val) => updateSettings({ only_pickup_mode: val })} 
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="bg-muted/50 w-full justify-start p-1 h-auto">
            <TabsTrigger value="orders" className="flex-1 py-3 text-xs uppercase tracking-widest font-bold">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="products" className="flex-1 py-3 text-xs uppercase tracking-widest font-bold">
              <Package className="h-4 w-4 mr-2" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-1 py-3 text-xs uppercase tracking-widest font-bold">
              <Settings2 className="h-4 w-4 mr-2" />
              Ajustes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-sans font-bold uppercase tracking-wider text-accent">Gerenciar Pedidos</h2>
              <div className="flex gap-2">
                <Button 
                  variant={orderFilter === 'pending' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setOrderFilter('pending')}
                  className="text-[10px] uppercase tracking-widest"
                >
                  Pendentes
                </Button>
                <Button 
                  variant={orderFilter === 'archived' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setOrderFilter('archived')}
                  className="text-[10px] uppercase tracking-widest"
                >
                  Arquivados
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {!filteredOrders || filteredOrders.length === 0 ? (
                <Card className="border-dashed py-16 text-center text-muted-foreground flex flex-col items-center gap-4">
                  <div className="bg-muted/50 p-4 rounded-full">
                    <ShoppingBag className="h-8 w-8 opacity-20" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold uppercase tracking-wider text-accent">Nenhum pedido encontrado</p>
                    <p className="text-xs">Não há registros nesta categoria no momento.</p>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" size="sm" onClick={() => refetchOrders()} className="text-[10px] uppercase tracking-widest">
                      Atualizar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleClearCache} className="text-[10px] uppercase tracking-widest text-destructive">
                      Limpar Cache
                    </Button>
                  </div>
                </Card>
              ) : (
                filteredOrders?.map((order) => (
                  <Card key={order.id} className="border-accent/10 overflow-hidden">
                    <CardHeader className="p-4 bg-muted/20 flex flex-row items-center justify-between space-y-0">
                      <div>
                        <CardTitle className="text-sm font-bold uppercase tracking-widest">
                          Pedido #{order.id.slice(0, 8)}
                        </CardTitle>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(order.criado_em).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <Badge className={cn(
                        "text-[9px] uppercase tracking-widest",
                        order.status === 'Entregue' ? "bg-emerald" : "bg-accent"
                      )}>
                        {order.status}
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-3">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">👤 Cliente</p>
                            <p className="text-sm font-bold text-accent">{order.nome_cliente}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">📱 WhatsApp do Cliente</p>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-mono font-bold">{order.whatsapp_cliente}</p>
                              {order.whatsapp_cliente && (
                                <a 
                                  href={`https://wa.me/55${order.whatsapp_cliente.replace(/\D/g, '')}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 bg-emerald text-white px-3 py-1 rounded-sm text-[10px] font-bold hover:bg-emerald/90 transition-colors shadow-sm"
                                >
                                  <MessageSquare className="h-3 w-3" />
                                  Chamar no Zap
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 border-l border-accent/5 pl-6">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">🎁 Destinatário / Local</p>
                            <p className="text-sm font-bold text-primary">{order.nome_destinatario}</p>
                            <p className="text-xs text-muted-foreground leading-tight mt-1">{order.endereco_entrega}</p>
                          </div>
                          {order.observacoes && (
                            <div className="p-2 bg-accent/5 border border-accent/20 rounded-sm">
                              <p className="text-[9px] uppercase tracking-widest text-accent font-bold mb-1">📝 Observação da Entrega</p>
                              <p className="text-xs italic leading-tight">{order.observacoes}</p>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3 border-l border-accent/5 pl-6">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Itens</p>
                          <div className="space-y-1">
                            {(() => {
                              try {
                                const items = typeof order.itens_pedido === 'string' ? JSON.parse(order.itens_pedido) : (order.itens_pedido as any[]);
                                return items.map((item: any, idx: number) => (
                                  <p key={idx} className="text-xs">{item.quantity}x {item.title}</p>
                                ));
                              } catch (e) {
                                return <p className="text-xs text-destructive">Erro ao carregar itens</p>;
                              }
                            })()}
                          </div>
                          <div className="pt-2 border-t border-accent/5">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Total do Pedido</p>
                            {order.valor_frete > 0 && (
                              <p className="text-xs text-muted-foreground">Frete: R$ {Number(order.valor_frete).toFixed(2).replace('.', ',')}</p>
                            )}
                            <p className="text-sm font-bold text-accent">R$ {Number(order.preco_total).toFixed(2).replace('.', ',')}</p>
                          </div>
                        </div>
                      </div>


                      {/* Detail Fields for Wreath/Bouquet */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 bg-muted/10 p-3 rounded-sm">
                        {(() => {
                          try {
                            const details = order.detalhes_coroa ? JSON.parse(order.detalhes_coroa) : null;
                            return (
                              <>
                                {details?.ribbon_message && (
                                  <div className="space-y-1">
                                    <p className="text-[9px] font-bold text-accent uppercase">Faixa</p>
                                    <p className="text-xs italic">"{details.ribbon_message}"</p>
                                  </div>
                                )}
                                {details?.honoree_name && (
                                  <div className="space-y-1">
                                    <p className="text-[9px] font-bold text-accent uppercase">Homenageado</p>
                                    <p className="text-xs">{details.honoree_name}</p>
                                  </div>
                                )}
                              </>
                            );
                          } catch (e) { return null; }
                        })()}
                        {order.mensagem_cartao && (
                          <div className="space-y-1">
                            <p className="text-[9px] font-bold text-accent uppercase">Cartão</p>
                            <p className="text-xs italic">"{order.mensagem_cartao}"</p>
                          </div>
                        )}
                      </div>


                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-accent/5">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <Select 
                            value={order.status} 
                            onValueChange={(val) => updateOrderStatus(order.id, val)}
                          >
                            <SelectTrigger className="h-9 text-xs w-full sm:w-[200px] bg-background">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map(opt => (
                                <SelectItem key={opt} value={opt} className="text-xs">
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          {order.whatsapp_cliente && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 sm:flex-none text-[10px] uppercase tracking-widest border-emerald/20 text-emerald hover:bg-emerald/5"
                              onClick={() => window.open(`https://wa.me/55${order.whatsapp_cliente.replace(/\D/g, '')}`, '_blank')}
                            >
                              <MessageSquare className="h-3 w-3 mr-1" />
                              WhatsApp
                            </Button>
                          )}
                          {order.status !== 'Entregue' && (
                            <Button 
                              size="sm" 
                              className="flex-1 sm:flex-none bg-emerald hover:bg-emerald/80 text-white text-[10px] uppercase tracking-widest"
                              onClick={() => concludeOrder(order.id)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Concluir Pedido
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-sans font-bold uppercase tracking-wider text-accent">Produtos</h2>
              <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
                <DialogTrigger asChild>
                  <Button onClick={openNew} size="sm" className="text-[10px] uppercase tracking-widest">
                    <Plus className="h-4 w-4 mr-1" />
                    Novo Produto
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto pb-8">
                  <DialogHeader>
                    <DialogTitle>{editing ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Título *</Label>
                      <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                    </div>
                    <div className="space-y-2">
                      <Label>Preço (R$) *</Label>
                      <Input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm appearance-auto"
                      >
                        {PRODUCT_CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center justify-between py-2 px-1">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-accent" />
                        <Label>Exibir em Destaque</Label>
                      </div>
                      <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
                    </div>
                    <div className="space-y-2">
                      <Label>Imagem</Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                        {previewUrl ? (
                          <img src={previewUrl} alt="Preview" className="w-full h-40 object-cover rounded mb-2" />
                        ) : (
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        )}
                        <Input type="file" accept="image/*" onChange={handleImageChange} className="text-xs" />
                      </div>
                    </div>
                    <Button onClick={handleSave} className="w-full h-12 text-base" disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      {editing ? 'Salvar Alterações' : 'Adicionar Produto'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-3">
              {products?.map((product) => (
                <Card key={product.id} className={cn("border-accent/10", !product.active && "opacity-50")}>
                  <CardContent className="p-3 flex items-center gap-4">
                    <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🌸</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{product.title}</p>
                        <Badge variant={product.sold_out ? 'destructive' : 'secondary'} className="text-[8px] uppercase">
                          {product.sold_out ? 'Esgotado' : 'Em Estoque'}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase">{product.category}</p>
                      <p className="text-sm font-bold text-accent">R$ {Number(product.price).toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleFeatured(product)}>
                        <Star className={cn("h-4 w-4", product.is_featured ? "text-accent fill-accent" : "text-muted-foreground")} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleSoldOut(product)}>
                        {product.sold_out ? <ToggleLeft className="h-5 w-5" /> : <ToggleRight className="h-5 w-5 text-emerald" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(product)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {/* Store Status and Global Logistics Controls (Duplicate removed as they are now at the top) */}
            <div className="bg-muted/30 p-4 rounded-sm border border-accent/10 mb-6">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-accent mb-2">Resumo de Status</p>
              <div className="flex gap-4">
                <Badge variant={isOpen ? "secondary" : "destructive"}>Loja {isOpen ? "Aberta" : "Fechada"}</Badge>
                <Badge variant={bouquetsDeliveryEnabled ? "secondary" : "outline"}>Entregas {bouquetsDeliveryEnabled ? "Ativas" : "Pausadas"}</Badge>
                <Badge variant={onlyPickupMode ? "destructive" : "outline"}>{onlyPickupMode ? "Apenas Retirada" : "Logística Normal"}</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground mt-4 italic">
                * As chaves de controle principais foram movidas para o topo do painel para facilitar o acesso rápido.
              </p>
            </div>

            {/* Logistics */}
            <Card className="border-accent/10">
              <CardHeader>
                <CardTitle className="text-sm font-sans uppercase tracking-widest flex items-center gap-2">
                  <Truck className="h-4 w-4" /> Logística e Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest">Valor por KM (R$)</Label>
                    <Input 
                      type="number" step="0.10" value={logistics.price_per_km} 
                      onChange={(e) => setLogistics(prev => ({ ...prev, price_per_km: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest">Taxa Mínima (R$)</Label>
                    <Input 
                      type="number" step="1.00" value={logistics.min_delivery_fee} 
                      onChange={(e) => setLogistics(prev => ({ ...prev, min_delivery_fee: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest">Taxa Máxima (R$)</Label>
                    <Input 
                      type="number" step="1.00" value={logistics.max_delivery_fee} 
                      onChange={(e) => setLogistics(prev => ({ ...prev, max_delivery_fee: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase tracking-widest">Categorias para Cálculo Automático</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {PRODUCT_CATEGORIES.map(cat => (
                      <div key={cat} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`cat-${cat}`}
                          checked={logistics.eligible_categories.includes(cat)}
                          onCheckedChange={(checked) => {
                            setLogistics(prev => ({
                              ...prev,
                              eligible_categories: checked 
                                ? [...prev.eligible_categories, cat]
                                : prev.eligible_categories.filter(c => c !== cat)
                            }));
                          }}
                        />
                        <label htmlFor={`cat-${cat}`} className="text-xs">{cat}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={saveLogistics} disabled={savingLogistics} className="w-full">
                  {savingLogistics && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}