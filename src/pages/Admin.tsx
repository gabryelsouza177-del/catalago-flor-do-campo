import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProducts, useRealtimeProducts } from '@/hooks/useProducts';
import type { Product } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Flower2, LogOut, Plus, Pencil, Trash2, Loader2, Upload, Package } from 'lucide-react';
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

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Buquês');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useRealtimeProducts();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setCategory('Buquês');
    setImageFile(null);
    setPreviewUrl(null);
    setEditing(null);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setTitle(product.title);
    setDescription(product.description || '');
    setPrice(String(product.price));
    setCategory(product.category);
    setPreviewUrl(product.image_url);
    setImageFile(null);
    setDialogOpen(true);
  };

  const openNew = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Convert to JPEG if not already jpg/png/webp
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
        updated_at: new Date().toISOString(),
      };

      if (editing) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editing.id);
        if (error) throw error;
        toast({ title: 'Produto atualizado!' });
      } else {
        const { error } = await supabase
          .from('products')
          .insert({ ...payload, active: true });
        if (error) throw error;
        toast({ title: 'Produto adicionado!' });
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
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
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
        </div>

        {/* Add button */}
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <Button onClick={handleSave} className="w-full" disabled={saving}>
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
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🌸</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.title}</p>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                    <p className="text-sm font-bold text-primary">R$ {Number(product.price).toFixed(2).replace('.', ',')}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
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
