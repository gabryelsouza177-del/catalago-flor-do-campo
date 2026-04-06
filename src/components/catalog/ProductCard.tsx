import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { MessageCircle } from 'lucide-react';
import { buildWhatsAppLink } from '@/lib/constants';
import type { Product } from '@/hooks/useProducts';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [imageOpen, setImageOpen] = useState(false);

  return (
    <>
      <Card
        className={`group overflow-hidden gold-border bg-card shadow-none hover:gold-glow transition-all duration-500 animate-luxury-fade-in ${product.sold_out ? 'opacity-60' : ''}`}
        style={{ animationDelay: `${index * 80}ms` }}
      >
        <div
          className="aspect-square overflow-hidden bg-muted cursor-pointer relative"
          onClick={() => product.image_url && setImageOpen(true)}
        >
          {product.sold_out && (
            <Badge className="absolute top-3 left-3 z-10 bg-destructive text-destructive-foreground text-[10px] tracking-wider uppercase font-sans rounded-sm">
              Esgotado
            </Badge>
          )}
          {!product.sold_out && (
            <Badge className="absolute top-3 left-3 z-10 bg-emerald text-emerald-foreground text-[10px] tracking-wider uppercase font-sans rounded-sm">
              Disponível
            </Badge>
          )}
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-4xl">🌸</span>
            </div>
          )}
        </div>
        <CardContent className="p-5 space-y-3">
          <h3 className="font-serif font-semibold text-foreground text-sm line-clamp-1 tracking-wide">{product.title}</h3>
          {product.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 font-light leading-relaxed">{product.description}</p>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-lg font-bold text-accent font-sans">
              R$ {Number(product.price).toFixed(2).replace('.', ',')}
            </span>
            {product.sold_out ? (
              <Button
                size="sm"
                className="bg-muted text-muted-foreground gap-1.5 text-xs cursor-not-allowed rounded-sm font-sans uppercase tracking-wider"
                disabled
              >
                Esgotado
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 gap-1.5 text-xs rounded-sm font-sans uppercase tracking-wider transition-all duration-300"
                asChild
              >
                <a
                  href={buildWhatsAppLink(product.title, Number(product.price), product.image_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Pedir
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {product.image_url && (
        <Dialog open={imageOpen} onOpenChange={setImageOpen}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-2 sm:p-4 flex items-center justify-center bg-background/95 backdrop-blur-xl border border-border">
            <DialogTitle className="sr-only">{product.title}</DialogTitle>
            <img
              src={product.image_url}
              alt={product.title}
              className="max-w-full max-h-[85vh] object-contain rounded"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
