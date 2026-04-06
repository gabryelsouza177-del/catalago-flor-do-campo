import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { buildWhatsAppLink } from '@/lib/constants';
import type { Product } from '@/hooks/useProducts';

interface FeaturedSectionProps {
  products: Product[];
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
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
          <h2 className="text-lg md:text-xl font-serif text-accent tracking-wide uppercase">
            ✦ Destaques ✦
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        </div>

        <div className="relative group">
          <Card className="overflow-hidden gold-border bg-card gold-glow">
            <div className="md:flex">
              {/* Image */}
              <div
                className="md:w-1/2 aspect-square md:aspect-auto md:min-h-[360px] overflow-hidden bg-muted relative cursor-pointer"
                onClick={() => {
                  setSelectedProduct(product);
                  setImageOpen(true);
                }}
              >
                <Badge className="absolute top-4 left-4 z-10 bg-accent text-accent-foreground text-[10px] tracking-[0.2em] uppercase font-sans rounded-sm px-3 py-1">
                  ✦ Destaque
                </Badge>
                {product.sold_out && (
                  <Badge className="absolute top-4 right-4 z-10 bg-destructive text-destructive-foreground text-[10px] tracking-wider uppercase font-sans rounded-sm">
                    Esgotado
                  </Badge>
                )}
                {product.image_url ? (
                  <img
                    key={product.id}
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-full object-cover animate-luxury-fade-in"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <span className="text-6xl">🌸</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="md:w-1/2 p-6 md:p-10 flex flex-col justify-center space-y-4">
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground tracking-wide">
                  {product.title}
                </h3>
                {product.description && (
                  <p className="text-sm text-muted-foreground font-light leading-relaxed line-clamp-3">
                    {product.description}
                  </p>
                )}
                <p className="text-2xl font-bold text-accent font-sans">
                  R$ {Number(product.price).toFixed(2).replace('.', ',')}
                </p>
                {!product.sold_out && (
                  <Button
                    className="bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 gap-2 rounded-sm font-sans uppercase tracking-wider transition-all duration-300 w-fit"
                    asChild
                  >
                    <a
                      href={buildWhatsAppLink(product.title, Number(product.price), product.image_url)}
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
          </Card>

          {/* Navigation arrows */}
          {products.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full glass flex items-center justify-center text-accent/70 hover:text-accent transition-colors opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full glass flex items-center justify-center text-accent/70 hover:text-accent transition-colors opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Dots */}
          {products.length > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {products.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current ? 'w-6 bg-accent' : 'w-1.5 bg-accent/25'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedProduct?.image_url && (
        <Dialog open={imageOpen} onOpenChange={setImageOpen}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-2 sm:p-4 flex items-center justify-center bg-background/95 backdrop-blur-xl border border-border">
            <DialogTitle className="sr-only">{selectedProduct.title}</DialogTitle>
            <img
              src={selectedProduct.image_url}
              alt={selectedProduct.title}
              className="max-w-full max-h-[85vh] object-contain rounded"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
