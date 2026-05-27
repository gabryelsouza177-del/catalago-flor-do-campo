import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProducts, useRealtimeProducts } from '@/hooks/useProducts';
import type { Product } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Flower2, LogOut, Plus, Pencil, Trash2, Loader2, Upload, Package, ToggleLeft, ToggleRight, Star, BarChart3, Truck, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CATEGORIES } from '@/lib/constants';

const PRODUCT_CATEGORIES = CATEGORIES.filter((c) => c !== 'Todos');

export default function Admin() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: products, isLoading, refetch } = useProducts();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [logistics, setLogistics] = useState({ id: '', local_rate: 0, intermediate_rate: 0, long_distance_rate: 0 });
  const [savingLogistics, setSavingLogistics] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Buquês');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);

  useRealtimeProducts();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
    fetchLogistics();
  }, [user, authLoading, navigate]);

  const fetchLogistics = async () => {
    const { data, error } = await supabase.from('logistics_settings').select('*').single();
    if (data) {
      setLogistics({
        id: data.id,
        local_rate: Number(data.local_rate),
        intermediate_rate: Number(data.intermediate_rate),
        long_distance_rate: Number(data.long_distance_rate)
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
      const convertToJpeg = (srcFile: File): Promise<File> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Canvas not supported'));
            ctx.drawImage(img, 0, 0);
            canvas.toBlob(
              (blob) => {
                if (!blob) return reject(new Error('Conversion failed'));
                resolve(new File([blob], 'image.jpg', { type: 'image/jpeg' }));
              },
              'image/jpeg',
              0.85
            );
          };
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = URL.createObjectURL(srcFile);
        });
      };

      const isWebSafe = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      const processFile = isWebSafe ? Promise.resolve(file) : convertToJpeg(file);
      processFile.then((processed) => {
        setImageFile(processed);
        setPreviewUrl(URL.createObjectURL(processed));
      }).catch(() => {
        toast({ title: 'Formato de imagem não suportado', variant: 'destructive' });
      });
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
        toast({ title: '✨ Produto atualizado com sucesso!', className: 'border-accent bg-accent/10 text-accent' });
      } else {
        const { error } = await supabase
          .from('products')
          .insert({ ...payload, active: true });
        if (error) throw error;
        toast({ title: '✨ Produto adicionado com sucesso!', className: 'border-accent bg-accent/10 text-accent' });
      }

      setDialogOpen(false);
      resetForm();
      refetch();
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
      refetch();
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
      toast({ title: product.sold_out ? 'Produto marcado como disponível' : 'Produto marcado como esgotado' });
      refetch();
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
      refetch();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-primary text-primary-foreground border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flower2 className="h-6 w-6" />
            <span className="font-semibold text-sm md:text-base">Admin · Flor do Campo</span>
          </div>
          <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary/80" onClick={signOut}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Sair</span>
          </Button>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary/80">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Financeiro</span>
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{products?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Produtos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Package className="h-8 w-8 text-floral" />
              <div>
                <p className="text-2xl font-bold">{products?.filter(p => p.active).length || 0}</p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Star className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">{products?.filter(p => p.is_featured).length || 0}</p>
                <p className="text-xs text-muted-foreground">Destaques</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logistics Settings */}
        <Card className="border-accent/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6 text-accent">
              <Truck className="h-5 w-5" />
              <h2 className="text-sm font-sans uppercase tracking-[0.2em] font-medium">Configurações de Logística</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-sans">Taxa de Entrega Local (R$)</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  value={logistics.local_rate} 
                  onChange={(e) => setLogistics(prev => ({ ...prev, local_rate: parseFloat(e.target.value) || 0 }))}
                  className="bg-card/30 border-accent/10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-sans">Taxa Intermediária (R$)</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  value={logistics.intermediate_rate} 
                  onChange={(e) => setLogistics(prev => ({ ...prev, intermediate_rate: parseFloat(e.target.value) || 0 }))}
                  className="bg-card/30 border-accent/10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-sans">Taxa Grande Distância (R$)</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  value={logistics.long_distance_rate} 
                  onChange={(e) => setLogistics(prev => ({ ...prev, long_distance_rate: parseFloat(e.target.value) || 0 }))}
                  className="bg-card/30 border-accent/10"
                />
              </div>
            </div>

            <Button onClick={saveLogistics} disabled={savingLogistics} className="w-full md:w-auto min-w-[200px]">
              {savingLogistics ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Salvar Taxas
            </Button>
          </CardContent>
        </Card>

        {/* Add button */}
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto pb-8" onOpenAutoFocus={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
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
                  className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-auto"
                >
                  {PRODUCT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between py-2 px-1">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-accent" />
                  <Label className="cursor-pointer">Exibir em Destaque</Label>
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
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="text-xs"
                  />
                </div>
              </div>
              <Button onClick={handleSave} className="w-full min-h-[48px] text-base" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editing ? 'Salvar Alterações' : 'Adicionar Produto'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Product list */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {products?.map((product) => (
              <Card key={product.id} className={!product.active ? 'opacity-50' : ''}>
                <CardContent className="p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
                    {product.is_featured && (
                      <div className="absolute top-0.5 right-0.5 z-10">
                        <Star className="h-3.5 w-3.5 text-accent fill-accent" />
                      </div>
                    )}
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🌸</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{product.title}</p>
                      <Badge variant={product.sold_out ? 'destructive' : 'default'} className={`text-[10px] ${!product.sold_out ? 'bg-emerald' : ''}`}>
                        {product.sold_out ? 'Esgotado' : 'Disponível'}
                      </Badge>
                      {product.is_featured && (
                        <Badge className="text-[10px] bg-accent text-accent-foreground">
                          Destaque
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                    <p className="text-sm font-bold text-primary">R$ {Number(product.price).toFixed(2).replace('.', ',')}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]" onClick={() => toggleFeatured(product)} title={product.is_featured ? 'Remover destaque' : 'Destacar'}>
                      <Star className={`h-5 w-5 ${product.is_featured ? 'text-accent fill-accent' : 'text-muted-foreground'}`} />
                    </Button>
                    <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]" onClick={() => toggleSoldOut(product)} title={product.sold_out ? 'Marcar disponível' : 'Marcar esgotado'}>
                      {product.sold_out ? <ToggleLeft className="h-5 w-5 text-muted-foreground" /> : <ToggleRight className="h-5 w-5 text-emerald" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]" onClick={() => openEdit(product)}>
                      <Pencil className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
