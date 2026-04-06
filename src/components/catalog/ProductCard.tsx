import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { MessageCircle } from 'lucide-react';
import { buildWhatsAppLink } from '@/lib/constants';
import type { Product } from '@/hooks/useProducts';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [imageOpen, setImageOpen] = useState(false);

  return (
    <>
      <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300">
        <div
          className="aspect-square overflow-hidden bg-muted cursor-pointer"
          onClick={() => product.image_url && setImageOpen(true)}
        >
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-4xl">🌸</span>
            </div>
          )}
        </div>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold text-foreground text-sm line-clamp-1">{product.title}</h3>
          {product.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
          )}
          <div className="flex items-center justify-between pt-1">
            <span className="text-lg font-bold text-primary">
              R$ {Number(product.price).toFixed(2).replace('.', ',')}
            </span>
            <Button
              size="sm"
              className="bg-[hsl(142,70%,40%)] hover:bg-[hsl(142,70%,35%)] text-white gap-1.5 text-xs"
              asChild
            >
              <a
                href={buildWhatsAppLink(product.title, Number(product.price), product.image_url)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {product.image_url && (
        <Dialog open={imageOpen} onOpenChange={setImageOpen}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-2 sm:p-4 flex items-center justify-center bg-black/90 border-0">
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
