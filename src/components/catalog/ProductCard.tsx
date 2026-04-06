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
        className={`group overflow-hidden rounded-lg gold-border bg-card/60 animate-luxury-fade-in ${product.sold_out ? 'opacity-55' : ''}`}
        style={{ animationDelay: `${index * 80}ms` }}
      >
        {/* Image */}
        <div
          className="aspect-square overflow-hidden bg-muted cursor-pointer relative rounded-t-lg"
          onClick={() => product.image_url && setImageOpen(true)}
        >
          {product.sold_out && (
            <Badge className="absolute top-3 left-3 z-10 bg-destructive/90 text-destructive-foreground text-[9px] tracking-[0.15em] uppercase font-sans rounded-sm backdrop-blur-sm">
              Esgotado
            </Badge>
          )}
          {!product.sold_out && product.is_featured && (
            <div className="absolute top-3 right-3 z-10 h-10 w-10 rounded-full bg-accent/90 backdrop-blur-sm flex items-center justify-center">
              <span className="text-[7px] font-sans font-bold text-accent-foreground tracking-wider uppercase leading-none text-center">Pre<br/>mium</span>
            </div>
          )}
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.06]"
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
          <h3 className="font-serif italic font-medium text-accent text-sm tracking-wide line-clamp-1">
            {product.title}
          </h3>
          {product.description && (
            <p className="text-[11px] text-muted-foreground line-clamp-2 font-light leading-relaxed">
              {product.description}
            </p>
          )}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
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
                className="border-accent/40 text-accent hover:bg-accent hover:text-accent-foreground gap-1.5 text-[10px] rounded-sm font-sans uppercase tracking-[0.15em] transition-all duration-400 h-8 px-3"
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
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-2 sm:p-4 flex items-center justify-center bg-background/95 backdrop-blur-xl border border-border/50">
            <DialogTitle className="sr-only">{product.title}</DialogTitle>
            <img
              src={product.image_url}
              alt={product.title}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}