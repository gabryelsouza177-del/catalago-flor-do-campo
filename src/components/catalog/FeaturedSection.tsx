import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { buildWhatsAppLink } from '@/lib/constants';
import type { Product } from '@/hooks/useProducts';

interface FeaturedSectionProps {
  products: Product[];
}

function formatPrice(price: number) {
  const rounded = Math.round(price);
  return rounded === price ? `R$ ${rounded}` : `R$ ${price.toFixed(2).replace('.', ',')}`;
}

export function FeaturedSection({ products }: FeaturedSectionProps) {
  const [current, setCurrent] = useState(0);
  const [imageOpen, setImageOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const next = useCallback(() => setCurrent((c) => (c + 1) % products.length), [products.length]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + products.length) % products.length), [products.length]);

  useEffect(() => {
    if (products.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, products.length]);

  if (products.length === 0) return null;

  const product = products[current];

  return (
    <>
      <section className="mb-14">
        <div className="flex items-center gap-4 mb-10">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent/15 to-transparent" />
          <h2 className="text-base md:text-lg font-serif italic text-accent tracking-[0.25em] uppercase">
            Destaques
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent/15 to-transparent" />
        </div>

        <div className="relative group">
          <div className="overflow-hidden rounded-lg gold-border glass-card emerald-glow">
            <div className="md:flex">
              {/* Image */}
              <div
                className="md:w-1/2 aspect-square md:aspect-auto md:min-h-[420px] overflow-hidden bg-muted/20 relative cursor-pointer"
                onClick={() => {
                  setSelectedProduct(product);
                  setImageOpen(true);
                }}
              >
                {product.sold_out && (
                  <Badge className="absolute top-5 right-5 z-10 bg-destructive/90 text-destructive-foreground text-[10px] tracking-[0.15em] uppercase font-sans rounded-sm backdrop-blur-sm">
                    Esgotado
                  </Badge>
                )}

                {/* Coleção Exclusiva badge */}

                {product.image_url ? (
                  <img
                    key={product.id}
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-full object-cover animate-luxury-fade-in img-warm"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <span className="text-6xl">🌸</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="md:w-1/2 p-8 md:p-14 flex flex-col justify-center space-y-6">
                <h3 className="text-2xl md:text-3xl font-serif italic font-medium text-accent tracking-[0.08em]">
                  {product.title}
                </h3>
                {product.description && (
                  <p className="text-sm text-muted-foreground font-light leading-relaxed line-clamp-3">
                    {product.description}
                  </p>
                )}
                <p className="text-2xl font-semibold text-accent font-sans tracking-wide">
                  {formatPrice(Number(product.price))}
                </p>
                {!product.sold_out && (
                  <Button
                    variant="outline"
                    className="border-accent/30 text-accent hover:bg-accent hover:text-accent-foreground gap-2 rounded-sm font-sans uppercase tracking-[0.15em] transition-all duration-500 w-fit text-xs bg-transparent"
                    asChild
                  >
                    <a
                      href={buildWhatsAppLink(product.title, Number(product.price), product.image_url, product.description)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Pedir via WhatsApp
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Navigation arrows */}
          {products.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full glass flex items-center justify-center text-accent/50 hover:text-accent transition-colors opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full glass flex items-center justify-center text-accent/50 hover:text-accent transition-colors opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Dots */}
          {products.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {products.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    i === current ? 'w-8 bg-accent' : 'w-1.5 bg-accent/15'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedProduct?.image_url && (
        <Dialog open={imageOpen} onOpenChange={setImageOpen}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-2 sm:p-4 flex items-center justify-center bg-background/95 backdrop-blur-xl border border-accent/10">
            <DialogTitle className="sr-only">{selectedProduct.title}</DialogTitle>
            <img
              src={selectedProduct.image_url}
              alt={selectedProduct.title}
              className="max-w-full max-h-[85vh] object-contain rounded-lg img-warm"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
