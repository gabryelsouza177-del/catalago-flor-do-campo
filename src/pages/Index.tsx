import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CatalogHeader } from '@/components/catalog/CatalogHeader';
import { FeaturedSection } from '@/components/catalog/FeaturedSection';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { useProducts, useRealtimeProducts } from '@/hooks/useProducts';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Settings, Info } from 'lucide-react';

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

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {!isLoading && <FeaturedSection products={featured} />}
        <ProductGrid products={filtered} loading={isLoading} />
      </main>

      <footer className="border-t border-accent/8 py-10 text-center">
        <p className="text-[9px] text-muted-foreground tracking-[0.25em] uppercase font-sans font-light">
          © 2026 Floricultura Flor do Campo
        </p>
        <Link to="/admin" className="inline-flex items-center gap-1.5 mt-3 text-[9px] text-accent/20 hover:text-accent/50 transition-colors duration-200 uppercase tracking-[0.25em] font-sans">
          <Settings className="h-3 w-3" />
          Painel
        </Link>
      </footer>
    </div>
  );
}
