import { ProductCard } from './ProductCard';
import type { Product } from '@/hooks/useProducts';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
}

function getBentoSize(product: Product, index: number): 'large' | 'medium' | 'small' {
  // Featured or expensive products get larger cards
  if (product.is_featured || Number(product.price) >= 200) return 'large';
  // Every 5th item gets medium
  if (index % 5 === 2) return 'medium';
  return 'small';
}

export function ProductGrid({ products, loading }: ProductGridProps) {
  if (loading) {
    return (
      <div className="bento-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`bg-muted/20 gold-border rounded-lg animate-pulse ${
              i === 0 ? 'bento-large' : i === 2 ? 'bento-medium' : ''
            }`}
            style={{ minHeight: i === 0 ? 380 : 260 }}
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
    <div className="bento-grid">
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          index={i}
          size={getBentoSize(product, i)}
        />
      ))}
    </div>
  );
}
