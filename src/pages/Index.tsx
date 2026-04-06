import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CatalogHeader } from '@/components/catalog/CatalogHeader';
import { FeaturedSection } from '@/components/catalog/FeaturedSection';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { useProducts, useRealtimeProducts } from '@/hooks/useProducts';
import { Settings } from 'lucide-react';

export default function Index() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const { data: products, isLoading } = useProducts();

  useRealtimeProducts();

  const featured = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => p.active && !p.sold_out && p.is_featured);
  }, [products]);

  const filtered = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      if (!p.active) return false;
      const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.description?.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = category === 'Todos' || p.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  return (
    <div className="min-h-screen linen-texture">
      <CatalogHeader
        search={search}
        onSearchChange={setSearch}
        activeCategory={category}
        onCategoryChange={setCategory}
      />

      <main className="max-w-7xl mx-auto px-6 py-10">
        {!isLoading && <FeaturedSection products={featured} />}
        <ProductGrid products={filtered} loading={isLoading} />
      </main>

      <footer className="border-t border-border/30 mt-20 py-10 text-center">
        <p className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase font-sans font-light">
          © 2026 Floricultura Flor do Campo
        </p>
        <Link to="/admin" className="inline-flex items-center gap-1.5 mt-3 text-[10px] text-accent/30 hover:text-accent/60 transition-colors duration-300 uppercase tracking-[0.2em] font-sans">
          <Settings className="h-3 w-3" />
          Painel
        </Link>
      </footer>
    </div>
  );
}