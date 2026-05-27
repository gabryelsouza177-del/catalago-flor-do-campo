import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Share2, ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { buildWhatsAppLink, WHATSAPP_NUMBER } from '@/lib/constants';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import type { Product } from '@/hooks/useProducts';

interface ProductCardProps {
  product: Product;
  index?: number;
}

function formatPrice(price: number) {
  const rounded = Math.round(price);
  return rounded === price ? `R$ ${rounded}` : `R$ ${price.toFixed(2).replace('.', ',')}`;
}

function buildShareLink(product: Product) {
  const text = `Olha que lindo! *${product.title}* — ${formatPrice(Number(product.price))}${product.image_url ? `\n\n📷 ${product.image_url}` : ''}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [imageOpen, setImageOpen] = useState(false);
  const addItem = useCart((state) => state.addItem);
  const setModalOpen = useCart((state) => state.setModalOpen);
  const { toast } = useToast();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAddToCart = () => {
    setIsAnimating(true);
    addItem(product);
    
    // Show modal after a short delay for animation
    setTimeout(() => {
      setModalOpen(true);
      setIsAnimating(false);
    }, 600);
    
    toast({
      title: "Adicionado ao carrinho",
      description: `${product.title} foi adicionado.`,
      className: "bg-emerald text-accent border-accent/20"
    });
  };

  return (
    <>
      <div
        className={`group overflow-hidden rounded-sm bg-card/40 border-t border-accent/15 transition-colors duration-200 hover:bg-card/60 ${product.sold_out ? 'opacity-50' : ''}`}
        style={{ animationDelay: `${index * 40}ms` }}
      >
        {/* Image */}
        <div
          className="overflow-hidden bg-muted/20 cursor-pointer relative aspect-square"
          onClick={() => product.image_url && setImageOpen(true)}
        >
          {product.sold_out && (
            <Badge className="absolute top-2 left-2 z-10 bg-destructive/90 text-destructive-foreground text-[8px] tracking-[0.15em] uppercase font-sans rounded-sm">
              Esgotado
            </Badge>
          )}
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-4xl">🌸</span>
            </div>
          )}

          {/* Share button */}
          <a
            href={buildShareLink(product)}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full bg-background/60 flex items-center justify-center text-accent/50 hover:text-accent transition-colors duration-200 opacity-0 group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
            title="Compartilhar"
          >
            <Share2 className="h-3 w-3" />
          </a>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <h3 className="font-sans font-medium text-foreground tracking-[0.12em] uppercase text-[10px] md:text-[11px] line-clamp-1">
            {product.title}
          </h3>
          {product.description && (
            <p className="text-[10px] text-muted-foreground line-clamp-2 font-light leading-relaxed">
              {product.description}
            </p>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-accent/8">
            <span className="font-serif italic text-accent text-sm md:text-base tracking-wide">
              {formatPrice(Number(product.price))}
            </span>
            {product.sold_out ? (
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-sans">
                Indisponível
              </span>
            ) : (
              <div className="flex gap-2">
                <a
                  href={buildWhatsAppLink(product.title, Number(product.price), product.image_url, product.description)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-accent/5 text-accent/60 text-[9px] font-sans uppercase tracking-[0.12em] font-medium hover:bg-accent/10 transition-colors duration-200"
                >
                  <MessageCircle className="h-3 w-3" />
                  Dúvida
                </a>
                <Button
                  onClick={handleAddToCart}
                  className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-emerald/60 text-accent text-[9px] font-sans uppercase tracking-[0.12em] font-medium hover:bg-emerald/80 transition-all duration-300 h-auto border-0 ${isAnimating ? 'emerald-glow-strong scale-95' : ''}`}
                >
                  <ShoppingCart className={`h-3 w-3 ${isAnimating ? 'animate-bounce' : ''}`} />
                  Carrinho
                  {isAnimating && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="h-4 w-4 bg-accent rounded-full animate-fly" />
                    </div>
                  )}
                </Button>
              </div>
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
              className="max-w-full max-h-[85vh] object-contain rounded-sm"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
