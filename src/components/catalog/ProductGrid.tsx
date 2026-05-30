import { ProductCard } from './ProductCard';
import type { Product } from '@/hooks/useProducts';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
}

export function ProductGrid({ products, loading }: ProductGridProps) {
  if (loading) {
    return (
      <div className=\"grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 lg:gap-6\">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-muted/10 border-t border-accent/15 rounded-sm animate-pulse aspect-[3/4]"
          />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <span className="text-5xl block mb-4">🌿</span>
        <p className="text-lg font-serif italic">Nenhum produto encontrado</p>
      </div>
    );
  }

  return (
    <div className=\"grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 lg:gap-6\">
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} index={i} />
      ))}
    </div>
  );
}
