import { useState } from 'react';
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

function formatPrice(price: number) {
  const rounded = Math.round(price);
  return rounded === price ? `R$ ${rounded}` : `R$ ${price.toFixed(2).replace('.', ',')}`;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [imageOpen, setImageOpen] = useState(false);

  return (
    <>
      <div
        className={`group overflow-hidden rounded-lg gold-border glass-card animate-luxury-fade-in transition-all duration-500 hover:gold-glow ${product.sold_out ? 'opacity-50' : ''}`}
        style={{ animationDelay: `${index * 90}ms` }}
      >
        {/* Image */}
        <div
          className="aspect-square overflow-hidden bg-muted/30 cursor-pointer relative rounded-t-lg"
          onClick={() => product.image_url && setImageOpen(true)}
        >
          {product.sold_out && (
            <Badge className="absolute top-3 left-3 z-10 bg-destructive/90 text-destructive-foreground text-[9px] tracking-[0.15em] uppercase font-sans rounded-sm backdrop-blur-sm">
              Esgotado
            </Badge>
          )}
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-cover img-warm transition-transform duration-[1.2s] ease-out group-hover:scale-[1.05]"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-4xl">🌸</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <h3 className="font-serif italic font-medium text-accent text-[11px] tracking-[0.1em] uppercase line-clamp-1">
            {product.title}
          </h3>
          {product.description && (
            <p className="text-[11px] text-muted-foreground line-clamp-2 font-light leading-relaxed">
              {product.description}
            </p>
          )}
          <div className="flex items-center justify-between pt-3 border-t border-accent/10">
            <span className="text-base font-semibold text-accent font-sans tracking-wide">
              {formatPrice(Number(product.price))}
            </span>
            {product.sold_out ? (
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">
                Indisponível
              </span>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="border-accent/30 text-accent hover:bg-accent hover:text-accent-foreground gap-1.5 text-[10px] rounded-sm font-sans uppercase tracking-[0.15em] transition-all duration-500 h-8 px-3 bg-transparent"
                asChild
              >
                <a
                  href={buildWhatsAppLink(product.title, Number(product.price), product.image_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-3 w-3" />
                  Pedir
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {product.image_url && (
        <Dialog open={imageOpen} onOpenChange={setImageOpen}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-2 sm:p-4 flex items-center justify-center bg-background/95 backdrop-blur-xl border border-accent/10">
            <DialogTitle className="sr-only">{product.title}</DialogTitle>
            <img
              src={product.image_url}
              alt={product.title}
              className="max-w-full max-h-[85vh] object-contain rounded-lg img-warm"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
