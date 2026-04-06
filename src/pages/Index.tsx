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
    <div className="min-h-screen bg-background">
      <CatalogHeader
        search={search}
        onSearchChange={setSearch}
        activeCategory={category}
        onCategoryChange={setCategory}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {!isLoading && <FeaturedSection products={featured} />}
        <ProductGrid products={filtered} loading={isLoading} />
      </main>

      <footer className="border-t border-border mt-16 py-8 text-center">
        <p className="text-xs text-muted-foreground tracking-[0.15em] uppercase font-sans">
          © 2026 Floricultura Flor do Campo · Todos os direitos reservados
        </p>
        <Link to="/admin" className="inline-flex items-center gap-1.5 mt-3 text-xs text-accent/50 hover:text-accent transition-colors duration-300 uppercase tracking-wider font-sans">
          <Settings className="h-3 w-3" />
          Painel
        </Link>
      </footer>
    </div>
  );
}
